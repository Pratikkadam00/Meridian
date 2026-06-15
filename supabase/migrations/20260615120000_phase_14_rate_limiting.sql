-- Phase 14 — server-side rate limiting for abuse/cost control on the edge
-- functions (esp. the AI extractor, which costs Groq tokens). A small event
-- log + an atomic consume function; callable only by the service role.

create table public.rate_limit_events (
  id bigint generated always as identity primary key,
  bucket text not null,
  created_at timestamptz not null default now()
);

create index rate_limit_events_bucket_time_idx on public.rate_limit_events (bucket, created_at desc);

alter table public.rate_limit_events enable row level security;
-- No policies → no anon/authenticated access. Only the service role (which
-- bypasses RLS) and the SECURITY DEFINER function below touch it.
revoke all on table public.rate_limit_events from anon, authenticated;

-- Returns true if the action is allowed (and records it), false if the bucket
-- has hit p_max within p_window. Self-cleans expired rows for the bucket.
create or replace function public.consume_rate_limit(p_bucket text, p_max integer, p_window interval)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
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
