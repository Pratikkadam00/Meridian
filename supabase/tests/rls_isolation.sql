begin;

insert into auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-0000000000a1',
    'authenticated',
    'authenticated',
    'broker-a@example.test',
    '',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-0000000000b2',
    'authenticated',
    'authenticated',
    'broker-b@example.test',
    '',
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

create temp table meridian_rls_test_state (
  key text primary key,
  value uuid not null
) on commit drop;

set local role authenticated;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000a1","email":"broker-a@example.test","role":"authenticated"}',
  true
);

select public.create_workspace_after_signup(
  'Broker A',
  'Broker A Org',
  '{"role":"solo_broker","market":"dubai"}'::jsonb,
  array['Emaar']
);

insert into meridian_rls_test_state (key, value)
values ('org_a', public.current_org_id());

insert into public.deals (
  org_id,
  created_by,
  developer_id,
  project_name,
  unit,
  buyer_name,
  total_value_aed
)
select
  public.current_org_id(),
  auth.uid(),
  d.id,
  'Marina Vista',
  '2BR',
  'Buyer A',
  3200000
from public.developers d
where d.org_id = public.current_org_id()
limit 1;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000b2', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-0000000000b2","email":"broker-b@example.test","role":"authenticated"}',
  true
);

select public.create_workspace_after_signup(
  'Broker B',
  'Broker B Org',
  '{"role":"solo_broker","market":"dubai"}'::jsonb,
  array['Sobha']
);

insert into public.deals (
  org_id,
  created_by,
  developer_id,
  project_name,
  unit,
  buyer_name,
  total_value_aed
)
select
  public.current_org_id(),
  auth.uid(),
  d.id,
  'Creek Vista',
  '1BR',
  'Buyer B',
  1800000
from public.developers d
where d.org_id = public.current_org_id()
limit 1;

do $$
declare
  v_count integer;
begin
  select count(*) into v_count from public.deals;
  if v_count <> 1 then
    raise exception 'expected broker B to see 1 own deal, saw %', v_count;
  end if;

  select count(*) into v_count from public.deals where buyer_name = 'Buyer A';
  if v_count <> 0 then
    raise exception 'broker B can see broker A deal';
  end if;
end;
$$;

do $$
declare
  v_org_a uuid;
begin
  select value into v_org_a from meridian_rls_test_state where key = 'org_a';

  begin
    insert into public.deals (
      org_id,
      created_by,
      project_name,
      unit,
      buyer_name,
      total_value_aed
    )
    values (
      v_org_a,
      auth.uid(),
      'Cross Tenant Attempt',
      'PH',
      'Blocked Buyer',
      1
    );

    raise exception 'cross-tenant insert unexpectedly succeeded';
  exception
    when insufficient_privilege or check_violation or foreign_key_violation then
      null;
  end;
end;
$$;

rollback;
