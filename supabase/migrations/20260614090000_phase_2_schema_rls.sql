create extension if not exists pgcrypto with schema extensions;

create table public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) > 0),
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid not null references public.orgs(id) on delete cascade,
  full_name text,
  email text not null,
  role text,
  onboarding_complete boolean not null default false,
  persona jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, org_id),
  check (jsonb_typeof(persona) = 'object')
);

create table public.developers (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  name text not null check (length(btrim(name)) > 0),
  created_at timestamptz not null default now(),
  unique (id, org_id)
);

create unique index developers_org_name_unique
  on public.developers (org_id, lower(name));

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  created_by uuid not null,
  developer_id uuid,
  project_name text not null check (length(btrim(project_name)) > 0),
  unit text not null check (length(btrim(unit)) > 0),
  buyer_name text not null check (length(btrim(buyer_name)) > 0),
  buyer_email text,
  total_value_aed numeric(14, 2) not null check (total_value_aed >= 0),
  spa_number text,
  handover_estimate date,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, org_id),
  constraint deals_status_check check (status in ('active', 'completed', 'cancelled')),
  constraint deals_created_by_org_fkey foreign key (created_by, org_id)
    references public.profiles(id, org_id) on delete restrict,
  constraint deals_developer_org_fkey foreign key (developer_id, org_id)
    references public.developers(id, org_id) on delete set null
);

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null,
  org_id uuid not null references public.orgs(id) on delete cascade,
  seq integer not null check (seq > 0),
  label text not null check (length(btrim(label)) > 0),
  trigger_type text not null,
  trigger_value text,
  percent numeric(6, 3) not null check (percent >= 0 and percent <= 100),
  amount_aed numeric(14, 2) not null check (amount_aed >= 0),
  due_date date,
  paid_date date,
  status text not null,
  source text not null default 'manual',
  unique (id, org_id),
  unique (deal_id, seq),
  constraint milestones_deal_org_fkey foreign key (deal_id, org_id)
    references public.deals(id, org_id) on delete cascade,
  constraint milestones_trigger_type_check
    check (trigger_type in ('booking', 'registration', 'construction', 'handover')),
  constraint milestones_status_check
    check (status in ('paid', 'due', 'upcoming', 'overdue')),
  constraint milestones_source_check
    check (source in ('manual', 'spa_extracted'))
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null,
  org_id uuid not null references public.orgs(id) on delete cascade,
  name text not null check (length(btrim(name)) > 0),
  storage_path text not null,
  kind text not null,
  uploaded_at timestamptz not null default now(),
  constraint documents_deal_org_fkey foreign key (deal_id, org_id)
    references public.deals(id, org_id) on delete cascade,
  constraint documents_storage_path_org_check
    check (storage_path like org_id::text || '/%')
);

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  milestone_id uuid not null,
  org_id uuid not null references public.orgs(id) on delete cascade,
  channel text not null,
  send_at timestamptz not null,
  sent_at timestamptz,
  status text not null default 'pending',
  constraint reminders_milestone_org_fkey foreign key (milestone_id, org_id)
    references public.milestones(id, org_id) on delete cascade,
  constraint reminders_channel_check check (channel in ('push', 'email')),
  constraint reminders_status_check check (status in ('pending', 'sent', 'failed', 'cancelled'))
);

create index profiles_org_id_idx on public.profiles (org_id);
create index developers_org_id_idx on public.developers (org_id);
create index deals_org_status_idx on public.deals (org_id, status);
create index deals_created_by_idx on public.deals (created_by);
create index deals_developer_id_idx on public.deals (developer_id);
create index milestones_org_due_date_idx on public.milestones (org_id, due_date);
create index milestones_deal_seq_idx on public.milestones (deal_id, seq);
create index documents_deal_id_idx on public.documents (deal_id);
create index documents_org_id_idx on public.documents (org_id);
create index reminders_status_send_at_idx on public.reminders (status, send_at);
create index reminders_org_id_idx on public.reminders (org_id);
create index reminders_milestone_id_idx on public.reminders (milestone_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

create trigger deals_touch_updated_at
  before update on public.deals
  for each row execute function public.touch_updated_at();

create or replace function public.current_org_id()
returns uuid
language sql
stable
security definer
set search_path = public, auth
as $$
  select p.org_id
  from public.profiles p
  where p.id = (select auth.uid())
  limit 1
$$;

revoke all on function public.current_org_id() from public;
grant execute on function public.current_org_id() to authenticated;

create or replace function public.create_workspace_after_signup(
  p_full_name text,
  p_org_name text,
  p_persona jsonb default '{}'::jsonb,
  p_developer_names text[] default array[]::text[]
)
returns public.profiles
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text := nullif(auth.jwt() ->> 'email', '');
  v_org_id uuid;
  v_profile public.profiles;
  v_developer_name text;
begin
  if v_user_id is null then
    raise exception 'create_workspace_after_signup requires an authenticated user';
  end if;

  select *
  into v_profile
  from public.profiles
  where id = v_user_id;

  if found then
    return v_profile;
  end if;

  if v_email is null then
    select email
    into v_email
    from auth.users
    where id = v_user_id;
  end if;

  if v_email is null or length(btrim(v_email)) = 0 then
    raise exception 'authenticated user email is required';
  end if;

  if p_persona is null or jsonb_typeof(p_persona) <> 'object' then
    raise exception 'persona must be a JSON object';
  end if;

  insert into public.orgs (name)
  values (coalesce(nullif(btrim(p_org_name), ''), split_part(v_email, '@', 1) || ' workspace'))
  returning id into v_org_id;

  insert into public.profiles (
    id,
    org_id,
    full_name,
    email,
    role,
    onboarding_complete,
    persona
  )
  values (
    v_user_id,
    v_org_id,
    nullif(btrim(p_full_name), ''),
    v_email,
    nullif(p_persona ->> 'role', ''),
    false,
    p_persona
  )
  returning * into v_profile;

  foreach v_developer_name in array coalesce(p_developer_names, array[]::text[]) loop
    if length(btrim(v_developer_name)) > 0 then
      insert into public.developers (org_id, name)
      values (v_org_id, btrim(v_developer_name))
      on conflict do nothing;
    end if;
  end loop;

  return v_profile;
end;
$$;

revoke all on function public.create_workspace_after_signup(text, text, jsonb, text[]) from public;
grant execute on function public.create_workspace_after_signup(text, text, jsonb, text[]) to authenticated;

alter table public.orgs enable row level security;
alter table public.profiles enable row level security;
alter table public.developers enable row level security;
alter table public.deals enable row level security;
alter table public.milestones enable row level security;
alter table public.documents enable row level security;
alter table public.reminders enable row level security;

create policy orgs_read_own on public.orgs
  for select to authenticated
  using (id = (select public.current_org_id()));

create policy orgs_update_own on public.orgs
  for update to authenticated
  using (id = (select public.current_org_id()))
  with check (id = (select public.current_org_id()));

create policy profiles_read_org on public.profiles
  for select to authenticated
  using (org_id = (select public.current_org_id()));

create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) and org_id = (select public.current_org_id()))
  with check (id = (select auth.uid()) and org_id = (select public.current_org_id()));

create policy developers_manage_org on public.developers
  for all to authenticated
  using (org_id = (select public.current_org_id()))
  with check (org_id = (select public.current_org_id()));

create policy deals_manage_org on public.deals
  for all to authenticated
  using (org_id = (select public.current_org_id()))
  with check (org_id = (select public.current_org_id()));

create policy milestones_manage_org on public.milestones
  for all to authenticated
  using (org_id = (select public.current_org_id()))
  with check (org_id = (select public.current_org_id()));

create policy documents_manage_org on public.documents
  for all to authenticated
  using (org_id = (select public.current_org_id()))
  with check (org_id = (select public.current_org_id()));

create policy reminders_manage_org on public.reminders
  for all to authenticated
  using (org_id = (select public.current_org_id()))
  with check (org_id = (select public.current_org_id()));

revoke all on table
  public.orgs,
  public.profiles,
  public.developers,
  public.deals,
  public.milestones,
  public.documents,
  public.reminders
from anon;

grant select, update on public.orgs, public.profiles to authenticated;
grant select, insert, update, delete on
  public.developers,
  public.deals,
  public.milestones,
  public.documents,
  public.reminders
to authenticated;

insert into storage.buckets (id, name, public)
values ('deal-documents', 'deal-documents', false)
on conflict (id) do update set public = false;

create policy deal_documents_storage_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'deal-documents'
    and (storage.foldername(name))[1] = (select public.current_org_id())::text
  );

create policy deal_documents_storage_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'deal-documents'
    and (storage.foldername(name))[1] = (select public.current_org_id())::text
  );

create policy deal_documents_storage_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'deal-documents'
    and (storage.foldername(name))[1] = (select public.current_org_id())::text
  )
  with check (
    bucket_id = 'deal-documents'
    and (storage.foldername(name))[1] = (select public.current_org_id())::text
  );

create policy deal_documents_storage_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'deal-documents'
    and (storage.foldername(name))[1] = (select public.current_org_id())::text
  );
