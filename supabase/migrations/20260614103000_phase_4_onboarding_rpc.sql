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

create or replace function public.complete_onboarding()
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
begin
  if (select auth.uid()) is null then
    raise exception 'complete_onboarding requires an authenticated user';
  end if;

  update public.profiles
  set
    onboarding_complete = true,
    updated_at = now()
  where id = (select auth.uid())
  returning * into v_profile;

  if v_profile.id is null then
    raise exception 'Profile not found for authenticated user';
  end if;

  return v_profile;
end;
$$;

revoke all on function public.complete_onboarding() from public;
grant execute on function public.complete_onboarding() to authenticated;
