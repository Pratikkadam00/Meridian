# OTA Rollout

Meridian uses EAS Build channels from `eas.json`: `development`, `preview`, and `production`. `app.json` pins updates to the app version runtime, so incompatible native changes require a new build.

## First-Time Setup

Run `npx eas update:configure` after the Expo project is linked. That command writes the project-specific update URL and EAS project id into `app.json`; do not hand-write a placeholder id.

## Staged Production Rollout

1. Publish the update to production at 1%.
   `npx eas update --channel production --message "production 1% rollout" --rollout-percentage 1`
2. Watch Sentry fatal/non-fatal rates and core funnel events.
3. Increase to 10%.
   `npx eas update --channel production --message "production 10% rollout" --rollout-percentage 10`
4. Promote to 100% when error rates stay within the release threshold.
   `npx eas update --channel production --message "production 100% rollout" --rollout-percentage 100`

## Rollback And Kill Switch

Use Statsig gates as the first kill switch for feature-level issues:

- `ai_spa_extraction`
- `push_reminders`
- `whatsapp_reminders`

For a bad bundle, roll back the production branch in EAS Dashboard or republish the last known-good update to the `production` channel. Keep `EXPO_PUBLIC_SENTRY_DSN` enabled during rollback validation so non-fatals such as `spa_extraction_failed_but_app_continued` remain visible.
