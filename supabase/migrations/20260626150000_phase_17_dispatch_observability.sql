-- Phase 17 — reminder-dispatch observability.
-- The scheduler itself (docs/reminders-cron.md) is intentionally NOT a migration
-- — it embeds the project URL and a Vault secret, which must never live in
-- source control. But logging that the dispatcher actually ran has no secrets
-- in it, so it belongs here. Without this, "reminders fire on time" is an
-- unverifiable claim; with it, both an operator (SQL) and the app itself
-- (last_dispatch_status RPC) can see whether dispatch is healthy.
-- Forward-only; apply with `supabase db push`.

create table public.dispatch_runs (
  id bigint generated always as identity primary key,
  function_name text not null,
  started_at timestamptz not null,
  finished_at timestamptz,
  inspected integer not null default 0,
  sent integer not null default 0,
  failed integer not null default 0,
  cancelled integer not null default 0,
  error text
);

create index dispatch_runs_function_started_idx on public.dispatch_runs (function_name, started_at desc);

alter table public.dispatch_runs enable row level security;
-- No policies -> denied to anon/authenticated directly. Only the service role
-- (the dispatcher, bypasses RLS) writes rows; app reads happen through the
-- SECURITY DEFINER function below, which returns only a status summary, never
-- raw rows (keeps this table from becoming a second place to leak org data).
revoke all on table public.dispatch_runs from anon, authenticated;

-- Lets the dispatcher (service_role) record one row per run without needing
-- an app-side org context — the run is global infrastructure, not tenant data.
create or replace function public.log_dispatch_run(
  p_function_name text,
  p_started_at timestamptz,
  p_finished_at timestamptz,
  p_inspected integer,
  p_sent integer,
  p_failed integer,
  p_cancelled integer,
  p_error text default null
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.dispatch_runs (
    function_name, started_at, finished_at, inspected, sent, failed, cancelled, error
  ) values (
    p_function_name, p_started_at, p_finished_at, p_inspected, p_sent, p_failed, p_cancelled, p_error
  );
$$;

revoke all on function public.log_dispatch_run(text, timestamptz, timestamptz, integer, integer, integer, integer, text) from public, anon, authenticated;
grant execute on function public.log_dispatch_run(text, timestamptz, timestamptz, integer, integer, integer, integer, text) to service_role;

-- A broker-facing health signal: "are reminders actually being dispatched, and
-- when did that last happen". No raw dispatch rows are exposed — just a status.
-- staleAfterMinutes should exceed the cron interval (docs: */15) with margin.
create or replace function public.reminder_dispatch_health()
returns table (
  last_run_at timestamptz,
  last_run_ok boolean,
  minutes_since_last_run numeric,
  is_stale boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.finished_at as last_run_at,
    (r.error is null) as last_run_ok,
    round(extract(epoch from (now() - r.finished_at)) / 60, 1) as minutes_since_last_run,
    (r.finished_at is null or r.finished_at < now() - interval '45 minutes') as is_stale
  from public.dispatch_runs r
  where r.function_name = 'send-due-reminders'
  order by r.started_at desc
  limit 1;
$$;

revoke all on function public.reminder_dispatch_health() from public, anon;
grant execute on function public.reminder_dispatch_health() to authenticated;

-- Keep the log bounded — service_role only, not scheduled here (no secrets
-- needed to call it, but scheduling it is an operator choice like the rest of
-- docs/reminders-cron.md). Safe to call ad hoc or add a third cron.schedule line.
create or replace function public.prune_dispatch_runs(p_older_than interval default interval '30 days')
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  with deleted as (
    delete from public.dispatch_runs
    where started_at < now() - p_older_than
    returning 1
  )
  select count(*) into v_count from deleted;

  return v_count;
end;
$$;

revoke all on function public.prune_dispatch_runs(interval) from public, anon, authenticated;
grant execute on function public.prune_dispatch_runs(interval) to service_role;
