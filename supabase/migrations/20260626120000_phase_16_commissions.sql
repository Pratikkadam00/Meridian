-- Phase 16 — broker commission tracking (the broker's OWN money).
-- Off-plan commission is itself a construction-linked, multi-tranche receivable:
-- a developer pays 3-7% of unit price, released in tranches as the buyer's
-- instalments clear, with clawback windows if the buyer cancels. Brokers lose
-- income because they "lose track of where each deal stands". This models that
-- as editable, broker-entered data (rate + tranches are developer-specific — we
-- never hardcode a split), mirroring the milestone engine.
-- Forward-only; apply with `supabase db push`.

-- Broker's commission rate on this deal (percent of unit price). Nullable until set.
alter table public.deals
  add column if not exists commission_percent numeric(6, 3)
  check (commission_percent is null or (commission_percent >= 0 and commission_percent <= 100));

create table public.commission_tranches (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null,
  org_id uuid not null references public.orgs(id) on delete cascade,
  seq integer not null check (seq > 0),
  label text not null check (length(btrim(label)) > 0 and length(label) <= 120),
  percent numeric(6, 3) not null check (percent >= 0 and percent <= 100), -- % of total commission
  amount_aed numeric(14, 2) not null check (amount_aed >= 0),
  status text not null default 'pending',
  expected_date date,
  received_date date,
  unique (id, org_id),
  unique (deal_id, seq),
  constraint commission_tranches_deal_org_fkey foreign key (deal_id, org_id)
    references public.deals(id, org_id) on delete cascade,
  constraint commission_tranches_status_check
    check (status in ('pending', 'invoiced', 'received'))
);

create index commission_tranches_deal_id_idx on public.commission_tranches (deal_id);
create index commission_tranches_org_status_idx on public.commission_tranches (org_id, status);

alter table public.commission_tranches enable row level security;

-- Clients may read their org's tranches and UPDATE a tranche's status/received_date
-- (mark invoiced/received). Creation/replacement goes through the RPC below
-- (SECURITY DEFINER), so direct INSERT/DELETE is revoked — same posture as reminders.
create policy commission_tranches_read_org on public.commission_tranches
  for select to authenticated
  using (org_id = (select public.current_org_id()));

create policy commission_tranches_update_org on public.commission_tranches
  for update to authenticated
  using (org_id = (select public.current_org_id()))
  with check (org_id = (select public.current_org_id()));

revoke all on table public.commission_tranches from anon;
grant select, update on public.commission_tranches to authenticated;

-- Direct UPDATE (above) is only meant for the narrow "mark a tranche
-- invoiced/received" action, which touches status/received_date and nothing
-- else. The RLS policy can't tell that apart from a raw PostgREST PATCH that
-- rewrites amount_aed/percent/label directly, bypassing the reconciliation
-- check that only set_deal_commission enforces. Guard it with a trigger:
-- set_deal_commission flips a transaction-local flag while it rewrites the
-- schedule; any UPDATE that touches schedule columns without that flag set
-- is rejected outright.
create or replace function public.commission_tranches_guard_update()
returns trigger
language plpgsql
as $$
begin
  if current_setting('meridian.commission_schedule_edit', true) = 'on' then
    return new;
  end if;

  if new.deal_id is distinct from old.deal_id
    or new.org_id is distinct from old.org_id
    or new.seq is distinct from old.seq
    or new.label is distinct from old.label
    or new.percent is distinct from old.percent
    or new.amount_aed is distinct from old.amount_aed
    or new.expected_date is distinct from old.expected_date
  then
    raise exception 'Only status and received_date can be changed directly; edit the schedule from the commission editor.';
  end if;

  return new;
end;
$$;

create trigger commission_tranches_guard_update
  before update on public.commission_tranches
  for each row
  execute function public.commission_tranches_guard_update();

-- Atomically set a deal's commission rate + reconcile its tranche schedule
-- against the broker's edits. Tranches are matched by id: an incoming
-- tranche whose id matches an existing row updates that row's schedule
-- fields ONLY (label/percent/amount_aed/expected_date) — status and
-- received_date are left untouched, because they represent real-world
-- money already collected and must never be silently reset by an unrelated
-- rate/schedule edit. An incoming tranche with no matching id is a new
-- tranche the broker added, and always starts pending/unreceived. Any
-- existing tranche not present in the payload was removed in the editor.
-- Tranche percents must reconcile to 100% of the commission (mirrors the
-- payment-plan reconciliation). Runs in one tx so a bad schedule rolls back.
create or replace function public.set_deal_commission(
  p_deal_id uuid,
  p_commission_percent numeric,
  p_tranches jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_org_id uuid;
  v_tranche jsonb;
  v_seq integer := 0;
  v_percent_sum numeric := 0;
  v_tranche_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'set_deal_commission requires an authenticated user';
  end if;

  v_org_id := public.current_org_id();
  if v_org_id is null then
    raise exception 'No organization for the authenticated user';
  end if;

  -- Ownership: the deal must belong to the caller's org.
  if not exists (select 1 from public.deals d where d.id = p_deal_id and d.org_id = v_org_id) then
    raise exception 'Deal not found in this organization';
  end if;

  if p_commission_percent is not null and (p_commission_percent < 0 or p_commission_percent > 100) then
    raise exception 'Commission percent must be between 0 and 100';
  end if;

  update public.deals
  set commission_percent = p_commission_percent
  where id = p_deal_id and org_id = v_org_id;

  -- This transaction's schedule writes are trusted; the guard trigger lets
  -- them through regardless of which columns change.
  perform set_config('meridian.commission_schedule_edit', 'on', true);

  if p_tranches is null or jsonb_typeof(p_tranches) <> 'array' then
    -- No schedule supplied at all: clear it. Distinct from an edit that
    -- merely omits status on individual tranches (handled below).
    delete from public.commission_tranches where deal_id = p_deal_id and org_id = v_org_id;
    return p_deal_id;
  end if;

  if jsonb_array_length(p_tranches) > 30 then
    raise exception 'Too many commission tranches (max 30)';
  end if;

  -- Move this deal's existing rows out of the 1..30 seq range first, so the
  -- per-row updates below can never collide with the (deal_id, seq) unique
  -- constraint no matter how tranches were added/removed/reordered.
  update public.commission_tranches
  set seq = seq + 1000
  where deal_id = p_deal_id and org_id = v_org_id;

  for v_tranche in select * from jsonb_array_elements(p_tranches) loop
    v_seq := v_seq + 1;
    v_percent_sum := v_percent_sum + coalesce((v_tranche ->> 'percent')::numeric, 0);
    v_tranche_id := nullif(v_tranche ->> 'id', '')::uuid;

    if v_tranche_id is not null and exists (
      select 1 from public.commission_tranches
      where id = v_tranche_id and deal_id = p_deal_id and org_id = v_org_id
    ) then
      update public.commission_tranches
      set seq = v_seq,
          label = v_tranche ->> 'label',
          percent = coalesce((v_tranche ->> 'percent')::numeric, 0),
          amount_aed = coalesce((v_tranche ->> 'amount_aed')::numeric, 0),
          expected_date = nullif(v_tranche ->> 'expected_date', '')::date
      where id = v_tranche_id and deal_id = p_deal_id and org_id = v_org_id;
    else
      insert into public.commission_tranches (
        deal_id, org_id, seq, label, percent, amount_aed, status, expected_date, received_date
      ) values (
        p_deal_id, v_org_id, v_seq,
        v_tranche ->> 'label',
        coalesce((v_tranche ->> 'percent')::numeric, 0),
        coalesce((v_tranche ->> 'amount_aed')::numeric, 0),
        'pending',
        nullif(v_tranche ->> 'expected_date', '')::date,
        null
      );
    end if;
  end loop;

  -- Reconcile tranche percents to 100 (±1), like the payment-plan check.
  if v_seq > 0 and abs(v_percent_sum - 100) > 1 then
    raise exception 'Commission tranche percentages (%) must sum to 100', v_percent_sum;
  end if;

  -- Anything still parked at the offset wasn't in this payload — the broker
  -- removed it in the editor.
  delete from public.commission_tranches
  where deal_id = p_deal_id and org_id = v_org_id and seq > 1000;

  return p_deal_id;
end;
$$;

revoke all on function public.set_deal_commission(uuid, numeric, jsonb) from public, anon;
grant execute on function public.set_deal_commission(uuid, numeric, jsonb) to authenticated;
