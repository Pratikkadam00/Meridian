# Meridian Security Notes

## Client network policy

The mobile client rejects non-HTTPS Supabase URLs outside local development and routes Supabase traffic through a host allowlist derived from `EXPO_PUBLIC_SUPABASE_URL`.

Do not add `EXPO_PUBLIC_*` variables for service-role keys. The app fails fast if common public service-role key names are present.

## Logging and telemetry

Console output and Sentry events are redacted for emails, bearer tokens, JWTs, Expo push tokens, passwords, buyer names, full names, and similar sensitive fields before they leave the app process.

## Native controls

True certificate pinning and Play Integrity/App Attest/DeviceCheck require native code plus a server attestation verifier. This Expo managed build reports those controls as unavailable by default. Production builds can set:

```text
EXPO_PUBLIC_SECURITY_ENFORCEMENT_MODE=block
EXPO_PUBLIC_NATIVE_CERT_PINNING_REQUIRED=true
EXPO_PUBLIC_DEVICE_INTEGRITY_REQUIRED=true
```

With those flags, unsupported native security controls block app access instead of silently continuing.
