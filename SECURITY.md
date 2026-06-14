# Meridian Security Notes

## Client network policy

The mobile client rejects non-HTTPS Supabase URLs outside local development and routes Supabase traffic through a host allowlist derived from `EXPO_PUBLIC_SUPABASE_URL`.

Do not add `EXPO_PUBLIC_*` variables for service-role keys. The app fails fast if common public service-role key names are present.

## Logging and telemetry

Console output and Sentry events are redacted for emails, bearer tokens, JWTs, Expo push tokens, passwords, buyer names, full names, and similar sensitive fields before they leave the app process.

## Device & transport controls

`securityPosture.ts` reports honestly which controls are live:

- **Enforced now:** HTTPS + Supabase host allowlist (network policy), and
  physical-device detection via `expo-device` (emulator/simulator is flagged).
- **Requires a standalone native build + your input (pre-launch):** certificate
  pinning, Play Integrity / App Attest / DeviceCheck attestation, and
  root/jailbreak detection. These are **not** faked as "available" — they are
  reported as pending with the exact activation steps in
  [`docs/security-hardening.md`](docs/security-hardening.md).

To make unmet controls **block** the app (instead of report-and-continue) once
the real controls are active, set in the EAS production profile:

```text
EXPO_PUBLIC_SECURITY_ENFORCEMENT_MODE=block
EXPO_PUBLIC_NATIVE_CERT_PINNING_REQUIRED=true
EXPO_PUBLIC_DEVICE_INTEGRITY_REQUIRED=true
```

Do not set these before the native controls are live, or the app will refuse to run.
