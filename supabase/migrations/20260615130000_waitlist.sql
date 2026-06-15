-- Marketing-site waitlist. Lives in the same Supabase project as the app and is
-- written by the website's Server Action using the public anon key. RLS allows
-- anon to INSERT only — never SELECT — so a visitor can join but can never read
-- the list. The service role (dashboard/admin) bypasses RLS for export.

create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text,
  brokerage text,
  source text,
  created_at timestamptz not null default now(),
  unique (email)
);

alter table public.waitlist enable row level security;

-- Anon may insert (join) and nothing else. No select/update/delete policy => denied.
revoke all on table public.waitlist from anon, authenticated;
grant insert on table public.waitlist to anon;

create policy "anon can join waitlist" on public.waitlist
  for insert to anon
  with check (true);
