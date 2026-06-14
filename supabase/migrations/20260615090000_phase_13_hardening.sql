-- Phase 13 — reliability & security hardening (atomic deal create, status
-- recompute, atomic reminder claim, scheduler past-date skip, profile column
-- lock, storage path tightening). Apply with `supabase db push` / migrations.

-- 1. Allow an in-flight "sending" state so reminder dispatch can claim atomically.
alter table public.reminders drop constraint reminders_status_check;
alter table public.reminders
  add constraint reminders_status_check
  check (status in ('pending', 'sending', 'sent', 'failed', 'cancelled'));

-- 2. Tighten the document storage path to the full org_id/deal_id/ contract.
alter table public.documents drop constraint documents_storage_path_org_check;
alter table public.documents
  add constraint documents_storage_path_deal_check
  check (storage_path like org_id::text || '/' || deal_id::text || '/%');

-- 3. Lock down self-service profile updates to the only column a user may edit;
--    role / onboarding_complete / persona / org_id change only via the SECURITY
--    DEFINER onboarding RPCs (which bypass this column grant).
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

-- 4. Atomic deal + plan + reminders (+ optional document) creation in one tx.
create or replace function public.create_deal_with_plan(
  p_deal_id uuid,
  p_developer_name text,
  p_project_name text,
  p_unit text,
  p_buyer_name text,
  p_buyer_email text,
  p_total_value_aed numeric,
  p_spa_number text,
  p_handover_estimate date,
  p_milestones jsonb,
  p_document jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_org_id uuid;
  v_developer_id uuid;
  v_deal_id uuid := coalesce(p_deal_id, gen_random_uuid());
  v_milestone jsonb;
  v_seq integer := 0;
  v_milestone_id uuid;
  v_due text;
  v_status text;
begin
  if v_user_id is null then
    raise exception 'create_deal_with_plan requires an authenticated user';
  end if;

  v_org_id := public.current_org_id();

  if v_org_id is null then
    raise exception 'No organization for the authenticated user';
  end if;

  if p_milestones is null or jsonb_typeof(p_milestones) <> 'array' or jsonb_array_length(p_milestones) = 0 then
    raise exception 'At least one milestone is required';
  end if;

  if length(btrim(coalesce(p_developer_name, ''))) > 0 then
    select id into v_developer_id
    from public.developers
    where org_id = v_org_id and lower(name) = lower(btrim(p_developer_name))
    limit 1;

    if v_developer_id is null then
      insert into public.developers (org_id, name)
      values (v_org_id, btrim(p_developer_name))
      returning id into v_developer_id;
    end if;
  end if;

  insert into public.deals (
    id, org_id, created_by, developer_id, project_name, unit, buyer_name,
    buyer_email, total_value_aed, spa_number, handover_estimate
  ) values (
    v_deal_id, v_org_id, v_user_id, v_developer_id, p_project_name, p_unit, p_buyer_name,
    nullif(btrim(coalesce(p_buyer_email, '')), ''), p_total_value_aed,
    nullif(btrim(coalesce(p_spa_number, '')), ''), p_handover_estimate
  );

  for v_milestone in select * from jsonb_array_elements(p_milestones) loop
    v_seq := v_seq + 1;
    v_due := nullif(v_milestone ->> 'due_date', '');
    v_status := coalesce(nullif(v_milestone ->> 'status', ''), 'upcoming');

    insert into public.milestones (
      id, deal_id, org_id, seq, label, trigger_type, trigger_value,
      percent, amount_aed, due_date, status, source
    ) values (
      gen_random_uuid(), v_deal_id, v_org_id, v_seq,
      v_milestone ->> 'label',
      v_milestone ->> 'trigger_type',
      nullif(v_milestone ->> 'trigger_value', ''),
      (v_milestone ->> 'percent')::numeric,
      (v_milestone ->> 'amount_aed')::numeric,
      v_due::date,
      v_status,
      coalesce(nullif(v_milestone ->> 'source', ''), 'manual')
    ) returning id into v_milestone_id;

    if v_due is not null and v_status <> 'paid' then
      perform public.schedule_milestone_reminders(v_milestone_id);
    end if;
  end loop;

  if p_document is not null and jsonb_typeof(p_document) = 'object' then
    insert into public.documents (org_id, deal_id, name, storage_path, kind)
    values (
      v_org_id, v_deal_id,
      p_document ->> 'name',
      p_document ->> 'storage_path',
      coalesce(nullif(p_document ->> 'kind', ''), 'spa')
    );
  end if;

  return v_deal_id;
end;
$$;

revoke all on function public.create_deal_with_plan(uuid, text, text, text, text, text, numeric, text, date, jsonb, jsonb) from public, anon;
grant execute on function public.create_deal_with_plan(uuid, text, text, text, text, text, numeric, text, date, jsonb, jsonb) to authenticated;

-- 5. Skip reminder offsets that would resolve to the past (avoids a burst of
--    backdated reminders all firing at once on the next dispatch).
create or replace function public.schedule_milestone_reminders(
  p_milestone_id uuid,
  p_offsets integer[] default array[7, 3, 1]
)
returns setof public.reminders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_milestone public.milestones;
  v_offset integer;
  v_send_at timestamptz;
begin
  if (select auth.uid()) is null then
    raise exception 'schedule_milestone_reminders requires an authenticated user';
  end if;

  select *
  into v_milestone
  from public.milestones
  where id = p_milestone_id
    and org_id = (select public.current_org_id())
    and due_date is not null
    and status <> 'paid';

  if v_milestone.id is null then
    return;
  end if;

  foreach v_offset in array coalesce(p_offsets, array[7, 3, 1]) loop
    if v_offset is null or v_offset < 0 then
      continue;
    end if;

    v_send_at := (((v_milestone.due_date - v_offset)::timestamp + time '09:00') at time zone 'Asia/Dubai');

    if v_send_at <= now() then
      continue; -- don't schedule a reminder in the past
    end if;

    return query
      insert into public.reminders (milestone_id, org_id, channel, send_at, status)
      select v_milestone.id, v_milestone.org_id, channel_name, v_send_at, 'pending'
      from unnest(array['push', 'email']::text[]) as channel_name
      on conflict (milestone_id, channel, send_at) do nothing
      returning *;
  end loop;
end;
$$;

revoke all on function public.schedule_milestone_reminders(uuid, integer[]) from public;
grant execute on function public.schedule_milestone_reminders(uuid, integer[]) to authenticated;

-- 6. Nightly recompute of stored milestone status from due_date (Dubai date),
--    so reminders/glance metrics stay accurate even between app reads.
create or replace function public.recompute_milestone_statuses()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := (now() at time zone 'Asia/Dubai')::date;
  v_count integer;
begin
  with updated as (
    update public.milestones m
    set status = case
      when m.due_date is null then 'upcoming'
      when m.due_date < v_today then 'overdue'
      when m.due_date <= v_today + 7 then 'due'
      else 'upcoming'
    end
    where m.status <> 'paid'
      and m.status is distinct from (case
        when m.due_date is null then 'upcoming'
        when m.due_date < v_today then 'overdue'
        when m.due_date <= v_today + 7 then 'due'
        else 'upcoming'
      end)
    returning 1
  )
  select count(*) into v_count from updated;

  return v_count;
end;
$$;

revoke all on function public.recompute_milestone_statuses() from public, anon, authenticated;
grant execute on function public.recompute_milestone_statuses() to service_role;

-- 7. Atomic claim for the reminder dispatcher: marks pending+due rows as
--    'sending' under FOR UPDATE SKIP LOCKED so concurrent runs never double-send,
--    and reclaims rows stuck 'sending' from a crashed run.
create or replace function public.claim_due_reminders(p_limit integer default 50)
returns setof public.reminders
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.reminders
  set status = 'pending'
  where status = 'sending'
    and send_at <= now() - interval '15 minutes';

  return query
    update public.reminders r
    set status = 'sending'
    where r.id in (
      select id
      from public.reminders
      where status = 'pending'
        and send_at <= now()
      order by send_at asc
      limit greatest(1, least(coalesce(p_limit, 50), 100))
      for update skip locked
    )
    returning r.*;
end;
$$;

revoke all on function public.claim_due_reminders(integer) from public, anon, authenticated;
grant execute on function public.claim_due_reminders(integer) to service_role;
