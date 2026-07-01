-- Phase 15 — security hardening from the 2026-06-26 whole-codebase audit.
-- Forward-only; apply with `supabase db push`.
--   M1  reminders write-amplification (lock down direct INSERT; clients may only read + cancel)
--   M3  consume_rate_limit TOCTOU race (serialize per bucket with an advisory lock)
--   M4  on-read scheduler abuse (rate-limit the org-wide re-scan; client call removed separately)
--   M6  unbounded RPC inputs (milestone-count, developer-array, push-token caps)
--   M7  storage MIME / per-object size on deal-documents
--   M10 server-side payment-plan reconciliation in create_deal_with_plan
--   L5  mark-paid audit trail (marked_paid_by)
--   L7  max-length CHECKs on user/AI text
--   L2  waitlist length CHECKs (authoritative, since the web zod caps are bypassable)
-- NOTE: RLS is intentionally NOT switched to FORCE — the profiles policy calls
-- current_org_id(), which selects from profiles, so FORCE would recurse and break
-- auth. The model already relies on enabled RLS + SECURITY DEFINER helpers.

-- ── M1. Reminders: read + cancel only for clients ───────────────────────────
-- A direct authenticated INSERT of thousands of due 'pending' rows turns the
-- dispatcher into an email/push fan-out billed to the owner. All legitimate
-- creation flows through the SECURITY DEFINER schedulers (which run as owner and
-- are unaffected by these client grants). The one direct write the client makes
-- is cancelPendingReminderRows (status -> 'cancelled'), preserved below.
revoke insert, delete on public.reminders from authenticated;

drop policy if exists reminders_manage_org on public.reminders;

create policy reminders_read_org on public.reminders
  for select to authenticated
  using (org_id = (select public.current_org_id()));

create policy reminders_cancel_org on public.reminders
  for update to authenticated
  using (org_id = (select public.current_org_id()))
  with check (org_id = (select public.current_org_id()) and status = 'cancelled');

-- ── M3. Atomic rate limiter ─────────────────────────────────────────────────
create or replace function public.consume_rate_limit(p_bucket text, p_max integer, p_window interval)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  -- Serialize concurrent callers on the same bucket so count-then-insert can't
  -- race past p_max. Transaction-scoped: auto-released at commit/rollback.
  perform pg_advisory_xact_lock(hashtext(p_bucket));

  delete from public.rate_limit_events
  where bucket = p_bucket and created_at < now() - p_window;

  select count(*) into v_count
  from public.rate_limit_events
  where bucket = p_bucket and created_at > now() - p_window;

  if v_count >= greatest(1, p_max) then
    return false;
  end if;

  insert into public.rate_limit_events (bucket) values (p_bucket);
  return true;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, interval) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, interval) to service_role;

-- ── M4. Bound the org-wide reminder re-scan ─────────────────────────────────
-- Reminders are already scheduled at deal creation; this catch-up re-scan no
-- longer runs on every screen load (client call removed). Gate any remaining
-- caller per org so it can't be hammered into a DB-CPU sink.
create or replace function public.schedule_due_milestone_reminders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_milestone_id uuid;
  v_scheduled_count integer := 0;
begin
  if (select auth.uid()) is null then
    raise exception 'schedule_due_milestone_reminders requires an authenticated user';
  end if;

  v_org_id := public.current_org_id();

  if not public.consume_rate_limit('schedule_reminders:' || coalesce(v_org_id::text, 'none'), 6, interval '1 minute') then
    raise exception 'Reminder refresh is rate limited; try again shortly';
  end if;

  for v_milestone_id in
    select id
    from public.milestones
    where org_id = v_org_id
      and due_date is not null
      and status <> 'paid'
  loop
    perform *
    from public.schedule_milestone_reminders(v_milestone_id);
    v_scheduled_count := v_scheduled_count + 1;
  end loop;

  return v_scheduled_count;
end;
$$;

revoke all on function public.schedule_due_milestone_reminders() from public;
grant execute on function public.schedule_due_milestone_reminders() to authenticated;

-- ── M6 + M10. create_deal_with_plan: input cap + server-side reconciliation ──
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
  v_amount_sum numeric := 0;
  v_percent_sum numeric := 0;
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

  if jsonb_array_length(p_milestones) > 60 then
    raise exception 'Too many milestones (max 60)';
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
    v_amount_sum := v_amount_sum + coalesce((v_milestone ->> 'amount_aed')::numeric, 0);
    v_percent_sum := v_percent_sum + coalesce((v_milestone ->> 'percent')::numeric, 0);

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

  -- Reconciliation invariant (mirrors the client Zod superRefine): for a real
  -- deal total, milestone amounts must sum to it (0.5% tolerance, min 1 AED) and
  -- percents must sum to 100 (±1). Blocks a direct-RPC bypass of the form.
  if p_total_value_aed > 0 then
    if abs(v_amount_sum - p_total_value_aed) > greatest(1, p_total_value_aed * 0.005) then
      raise exception 'Milestone amounts (%) must reconcile to the deal total (%)', v_amount_sum, p_total_value_aed;
    end if;
    if abs(v_percent_sum - 100) > 1 then
      raise exception 'Milestone percentages (%) must sum to 100', v_percent_sum;
    end if;
  end if;

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

-- ── M6. Bound the onboarding developer-name array ───────────────────────────
create or replace function public.save_onboarding_personalization(
  p_role text,
  p_market text,
  p_volume text,
  p_developer_names text[]
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
  v_developer_name text;
begin
  if (select auth.uid()) is null then
    raise exception 'save_onboarding_personalization requires an authenticated user';
  end if;

  if p_role not in ('solo_broker', 'brokerage') then
    raise exception 'Invalid broker role';
  end if;

  if p_market <> 'dubai' then
    raise exception 'Invalid market';
  end if;

  if p_volume not in ('1-5', '6-15', '16+') then
    raise exception 'Invalid deal volume';
  end if;

  if coalesce(array_length(p_developer_names, 1), 0) > 50 then
    raise exception 'Too many developers (max 50)';
  end if;

  update public.profiles
  set
    role = p_role,
    persona = jsonb_build_object(
      'role', p_role,
      'market', p_market,
      'volume', p_volume,
      'developers', coalesce(p_developer_names, array[]::text[])
    ),
    updated_at = now()
  where id = (select auth.uid())
  returning * into v_profile;

  if v_profile.id is null then
    raise exception 'Profile not found for authenticated user';
  end if;

  foreach v_developer_name in array coalesce(p_developer_names, array[]::text[]) loop
    if length(btrim(v_developer_name)) > 0 then
      insert into public.developers (org_id, name)
      values (v_profile.org_id, btrim(v_developer_name))
      on conflict do nothing;
    end if;
  end loop;

  return v_profile;
end;
$$;

revoke all on function public.save_onboarding_personalization(text, text, text, text[]) from public;
grant execute on function public.save_onboarding_personalization(text, text, text, text[]) to authenticated;

-- ── M6. Cap distinct push tokens per profile ────────────────────────────────
create or replace function public.enforce_push_token_limit()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if (select count(*) from public.push_tokens where profile_id = new.profile_id) >= 10 then
    raise exception 'Too many registered devices for this profile';
  end if;
  return new;
end;
$$;

create trigger push_tokens_limit_per_profile
  before insert on public.push_tokens
  for each row execute function public.enforce_push_token_limit();

-- ── M7. Lock the SPA bucket to PDF-only and a sane per-object size ───────────
update storage.buckets
set allowed_mime_types = array['application/pdf'], file_size_limit = 10485760
where id = 'deal-documents';

-- ── L5. Mark-paid audit trail (intra-org shared management is intentional) ───
alter table public.milestones add column if not exists marked_paid_by uuid;

create or replace function public.stamp_milestone_paid_by()
returns trigger
language plpgsql
set search_path = public, auth
as $$
begin
  if new.status = 'paid' and (old.status is distinct from 'paid') then
    new.marked_paid_by := (select auth.uid());
  end if;
  return new;
end;
$$;

create trigger milestones_stamp_paid_by
  before update on public.milestones
  for each row execute function public.stamp_milestone_paid_by();

-- ── L7. Max-length CHECKs on user/AI text (DB is the authoritative gate) ─────
alter table public.deals
  add constraint deals_project_name_len check (length(project_name) <= 200),
  add constraint deals_unit_len check (length(unit) <= 120),
  add constraint deals_buyer_name_len check (length(buyer_name) <= 200);

alter table public.milestones
  add constraint milestones_label_len check (length(label) <= 200),
  add constraint milestones_trigger_value_len check (trigger_value is null or length(trigger_value) <= 120);

alter table public.developers
  add constraint developers_name_len check (length(name) <= 200);

alter table public.orgs
  add constraint orgs_name_len check (length(name) <= 200);

-- ── L2. Waitlist length CHECKs (web zod caps are bypassable via direct REST) ─
alter table public.waitlist
  add constraint waitlist_email_len check (length(email) <= 320),
  add constraint waitlist_full_name_len check (full_name is null or length(full_name) <= 120),
  add constraint waitlist_brokerage_len check (brokerage is null or length(brokerage) <= 120),
  add constraint waitlist_source_len check (source is null or length(source) <= 60);
