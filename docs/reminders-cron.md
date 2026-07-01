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

## 5. Verifying dispatch is actually running

`phase_17_dispatch_observability.sql` adds a `dispatch_runs` log the edge
function writes to on every invocation (success or failure) — no secrets
involved, so it's a normal migration. Two ways to check:

```sql
-- Raw history (service role / SQL editor only)
select * from public.dispatch_runs order by started_at desc limit 20;

-- Summary status, callable by any authenticated app user
select * from public.reminder_dispatch_health();
```

The app itself calls `reminder_dispatch_health()` on the Reminders screen and
shows a warning banner if the last run is more than 45 minutes old (the cron
interval is 15 minutes, so this catches a genuinely broken/unscheduled
dispatcher, not just normal jitter). Until step 3 above is run for the first
time, this will correctly show as stale.

Optionally prune old rows periodically:

```sql
select cron.schedule(
  'meridian-prune-dispatch-runs',
  '0 3 * * 0',
  $$ select public.prune_dispatch_runs(interval '30 days'); $$
);
```
