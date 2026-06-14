# Scheduling: reminder dispatch + nightly status recompute

The reminder *sending* and the nightly milestone-status *recompute* must be
scheduled in your Supabase project. This is intentionally **not** a migration:
the HTTP dispatch needs your project URL and a secret, which must live in Vault,
not in source control.

Run this once in the Supabase SQL editor (or via `psql`) for each environment.

## 1. Enable the scheduler extensions

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;
```

## 2. Nightly status recompute (no secrets needed)

Flips stored `due` / `upcoming` / `overdue` from `due_date` at 01:05 UTC (~05:05
Asia/Dubai), so reminders and dashboard metrics stay accurate between app reads.

```sql
select cron.schedule(
  'meridian-recompute-milestone-statuses',
  '5 1 * * *',
  $$ select public.recompute_milestone_statuses(); $$
);
```

## 3. Reminder dispatch every 15 minutes

Store the function secret in Vault and POST it as the `x-reminder-secret` header.
`REMINDER_FUNCTION_SECRET` (edge function env) must equal this value — the
function now **fails closed** if the secret is unset or mismatched.

```sql
-- one-time: store the secret
select vault.create_secret('<your-strong-secret>', 'reminder_function_secret');

select cron.schedule(
  'meridian-send-due-reminders',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://<YOUR-PROJECT-REF>.supabase.co/functions/v1/send-due-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-reminder-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'reminder_function_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);
```

## 4. Edge function env (set via `supabase secrets set`)

```
REMINDER_FUNCTION_SECRET=<same strong secret as Vault>
RESEND_API_KEY=<resend key>
REMINDER_EMAIL_FROM=Meridian <reminders@yourdomain.ae>
```

## Inspect / remove

```sql
select * from cron.job;
select cron.unschedule('meridian-send-due-reminders');
select cron.unschedule('meridian-recompute-milestone-statuses');
```
