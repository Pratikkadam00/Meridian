-- Phase 20 — shareable, read-only client portal (the design system's
-- "ClientPortal" screen). Buyers don't install the broker's app, so this is a
-- WEB page (web/app/shared/[token]) rendered from data an edge function
-- serves — never a direct anon RLS grant on deals/milestones. The token is
-- server-generated (never client-supplied) and revocable.
-- Forward-only; apply with `supabase db push`.

alter table public.deals
  add column if not exists share_token uuid unique;

create index if not exists deals_share_token_idx on public.deals (share_token) where share_token is not null;

create or replace function public.get_or_create_deal_share_token(p_deal_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_org_id uuid;
  v_token uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'get_or_create_deal_share_token requires an authenticated user';
  end if;

  v_org_id := public.current_org_id();
  if v_org_id is null then
    raise exception 'No organization for the authenticated user';
  end if;

  select share_token into v_token from public.deals where id = p_deal_id and org_id = v_org_id;

  if not found then
    raise exception 'Deal not found in this organization';
  end if;

  if v_token is not null then
    return v_token;
  end if;

  v_token := gen_random_uuid();

  update public.deals set share_token = v_token where id = p_deal_id and org_id = v_org_id;

  return v_token;
end;
$$;

revoke all on function public.get_or_create_deal_share_token(uuid) from public, anon;
grant execute on function public.get_or_create_deal_share_token(uuid) to authenticated;

create or replace function public.revoke_deal_share_token(p_deal_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_org_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'revoke_deal_share_token requires an authenticated user';
  end if;

  v_org_id := public.current_org_id();
  if v_org_id is null then
    raise exception 'No organization for the authenticated user';
  end if;

  update public.deals set share_token = null where id = p_deal_id and org_id = v_org_id;
end;
$$;

revoke all on function public.revoke_deal_share_token(uuid) from public, anon;
grant execute on function public.revoke_deal_share_token(uuid) to authenticated;
