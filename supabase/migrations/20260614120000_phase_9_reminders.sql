create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  token text not null check (length(btrim(token)) > 0),
  platform text not null default 'expo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, profile_id, token)
);

create index push_tokens_org_id_idx on public.push_tokens (org_id);
create index push_tokens_profile_id_idx on public.push_tokens (profile_id);

create trigger push_tokens_touch_updated_at
  before update on public.push_tokens
  for each row execute function public.touch_updated_at();

create unique index reminders_milestone_channel_send_unique
  on public.reminders (milestone_id, channel, send_at);

alter table public.push_tokens enable row level security;

create policy push_tokens_manage_self on public.push_tokens
  for all to authenticated
  using (
    org_id = (select public.current_org_id())
    and profile_id = (select auth.uid())
  )
  with check (
    org_id = (select public.current_org_id())
    and profile_id = (select auth.uid())
  );

revoke all on table public.push_tokens from anon;
grant select, insert, update, delete on public.push_tokens to authenticated;

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

create or replace function public.schedule_due_milestone_reminders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_milestone_id uuid;
  v_scheduled_count integer := 0;
begin
  if (select auth.uid()) is null then
    raise exception 'schedule_due_milestone_reminders requires an authenticated user';
  end if;

  for v_milestone_id in
    select id
    from public.milestones
    where org_id = (select public.current_org_id())
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
