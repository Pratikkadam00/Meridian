-- Phase 19 — team / multi-broker invites. The schema was already org-ready
-- (org_id everywhere, create_workspace_after_signup, the delete-account
-- sole-vs-shared-org branch) but there was no way to JOIN an existing org —
-- every signup unconditionally created a new one. This adds a short-lived,
-- single-use invite code an existing member generates, and a join RPC a new
-- signup redeems INSTEAD of creating its own org (never a post-hoc org
-- switch, which would strand a user's future deals in the wrong org).
-- Any org member may invite (mirrors the uniform org-wide RLS already used
-- for deals/milestones/reminders/commission — this codebase treats org
-- members as peers, not owner/member roles).
-- Forward-only; apply with `supabase db push`.

create table public.org_invites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  code text not null unique,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  redeemed_by uuid references public.profiles(id) on delete set null,
  redeemed_at timestamptz
);

create index org_invites_org_id_idx on public.org_invites (org_id);
create index org_invites_code_idx on public.org_invites (code);

alter table public.org_invites enable row level security;

-- Members can see their own org's invites (e.g. "invite pending"); all
-- mutation goes through the two SECURITY DEFINER RPCs below, never direct
-- client writes — code generation must be server-random, not client-supplied.
create policy org_invites_read_own_org on public.org_invites
  for select to authenticated
  using (org_id = (select public.current_org_id()));

revoke all on table public.org_invites from anon, authenticated;
grant select on public.org_invites to authenticated;

create or replace function public.create_org_invite()
returns table (code text, expires_at timestamptz)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_org_id uuid;
  v_code text;
begin
  if (select auth.uid()) is null then
    raise exception 'create_org_invite requires an authenticated user';
  end if;

  v_org_id := public.current_org_id();
  if v_org_id is null then
    raise exception 'No organization for the authenticated user';
  end if;

  if not public.consume_rate_limit('create_invite:' || v_org_id::text, 20, interval '1 hour') then
    raise exception 'Too many invites created recently; try again later';
  end if;

  -- 8 chars from a 32-symbol, unambiguous alphabet (no 0/O/1/I/L) — easy to
  -- read aloud or retype. ~1.1e12 combinations; the unique constraint below
  -- catches the astronomically unlikely collision.
  v_code := (
    select string_agg(substr('ABCDEFGHJKMNPQRSTUVWXYZ23456789', (random() * 31)::int + 1, 1), '')
    from generate_series(1, 8)
  );

  insert into public.org_invites (org_id, code, created_by, expires_at)
  values (v_org_id, v_code, (select auth.uid()), now() + interval '7 days');

  return query select v_code, now() + interval '7 days';
end;
$$;

revoke all on function public.create_org_invite() from public, anon;
grant execute on function public.create_org_invite() to authenticated;

create or replace function public.redeem_org_invite(
  p_code text,
  p_full_name text,
  p_persona jsonb default '{}'::jsonb
)
returns public.profiles
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text := nullif(auth.jwt() ->> 'email', '');
  v_invite public.org_invites;
  v_profile public.profiles;
begin
  if v_user_id is null then
    raise exception 'redeem_org_invite requires an authenticated user';
  end if;

  select * into v_profile from public.profiles where id = v_user_id;
  if found then
    -- Idempotent no-op, matching create_workspace_after_signup's behavior
    -- for a retried call after the profile already exists.
    return v_profile;
  end if;

  if not public.consume_rate_limit('redeem_invite:' || coalesce(v_user_id::text, 'none'), 10, interval '1 hour') then
    raise exception 'Too many invite attempts; try again later';
  end if;

  select *
  into v_invite
  from public.org_invites
  where code = upper(btrim(p_code))
    and redeemed_at is null
    and expires_at > now()
  for update;

  if v_invite.id is null then
    raise exception 'This invite code is invalid or has expired';
  end if;

  if v_email is null then
    select email into v_email from auth.users where id = v_user_id;
  end if;

  if v_email is null or length(btrim(v_email)) = 0 then
    raise exception 'authenticated user email is required';
  end if;

  if p_persona is null or jsonb_typeof(p_persona) <> 'object' then
    raise exception 'persona must be a JSON object';
  end if;

  insert into public.profiles (id, org_id, full_name, email, role, onboarding_complete, persona)
  values (v_user_id, v_invite.org_id, nullif(btrim(p_full_name), ''), v_email, null, false, p_persona)
  returning * into v_profile;

  update public.org_invites set redeemed_by = v_user_id, redeemed_at = now() where id = v_invite.id;

  return v_profile;
end;
$$;

revoke all on function public.redeem_org_invite(text, text, jsonb) from public, anon;
grant execute on function public.redeem_org_invite(text, text, jsonb) to authenticated;
