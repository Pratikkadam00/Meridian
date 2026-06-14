# Security hardening (Phase 11) — runbook

Meridian handles SPA PDFs containing passport / Emirates-ID / financial data, so
the transport- and device-level controls below are required for a production
release. This document is the activation runbook; the app's `securityPosture`
already reports honestly which controls are live vs pending.

## What is enforced in code today
- **Network policy** — `networkSecurity.ts` rejects non-HTTPS requests and any
  host outside the Supabase allowlist; the client refuses to boot if a
  service-role key is exposed with an `EXPO_PUBLIC_` prefix.
- **Physical-device check** — `securityPosture.ts` uses `expo-device`
  (`Device.isDevice`) to detect an emulator/simulator.
- **Redaction** — console + Sentry are PII-redacted.

## What requires a standalone native build + your input (activate before launch)

### 1. Certificate pinning

Get the leaf **and** intermediate SPKI SHA-256 pins (pin two, so cert rotation
doesn't brick the app):

```bash
# leaf
openssl s_client -servername ebmsbtnyxymajyywuhyd.supabase.co -connect ebmsbtnyxymajyywuhyd.supabase.co:443 </dev/null 2>/dev/null \
  | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der \
  | openssl dgst -sha256 -binary | openssl enc -base64
# repeat against the intermediate CA cert in the chain for the backup pin
```

**Android** — commit this as `android/app/src/main/res/xml/network_security_config.xml`
(android/ is gitignored; add via an Expo config plugin or `expo prebuild` then
keep it) and reference it in the manifest (`android:networkSecurityConfig`):

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <domain-config cleartextTrafficPermitted="false">
    <domain includeSubdomains="true">supabase.co</domain>
    <pin-set>
      <pin digest="SHA-256">REPLACE_WITH_LEAF_SPKI_PIN=</pin>
      <pin digest="SHA-256">REPLACE_WITH_INTERMEDIATE_SPKI_PIN=</pin>
    </pin-set>
  </domain-config>
</network-security-config>
```

**iOS** — add to `app.json` › `expo.ios.infoPlist` (only with REAL pins — wrong
pins block all traffic):

```json
"NSAppTransportSecurity": {
  "NSPinnedDomains": {
    "supabase.co": {
      "NSIncludesSubdomains": true,
      "NSPinnedCAIdentities": [
        { "SPKI-SHA256-BASE64": "REPLACE_WITH_INTERMEDIATE_SPKI_PIN=" }
      ]
    }
  }
}
```

### 2. Device integrity / attestation
- **Android Play Integrity** — request an integrity token on launch, POST it to a
  server endpoint (Supabase edge function) that verifies it with Google's API,
  and gate a trust flag.
- **iOS App Attest / DeviceCheck** — generate an `DCAppAttestService` assertion,
  verify server-side.
- Feed the verified result into `evaluateSecurityPosture()` (replace the
  "not configured" finding) so `device_integrity` is only non-critical when the
  server confirms attestation.

### 3. Root / jailbreak detection
Add a maintained native module (e.g. `jail-monkey` or `freeRASP`) and push a
`device_authenticity` critical finding when it reports a rooted/jailbroken or
hooked environment. Keep it graceful (don't hard-crash).

### 4. Flip enforcement to `block` (the final step)
Once the above are live and verified on a release build, set in the EAS
production profile (`eas.json` › `build.production.env`):

```
EXPO_PUBLIC_SECURITY_ENFORCEMENT_MODE=block
EXPO_PUBLIC_NATIVE_CERT_PINNING_REQUIRED=true
EXPO_PUBLIC_DEVICE_INTEGRITY_REQUIRED=true
```

With these, any unmet control becomes a `critical` finding and the
`SecurityProvider` blocks app access instead of continuing. **Do not set these
until the real controls are active**, or the app will refuse to run.
