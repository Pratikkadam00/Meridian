# Meridian — API & Application Security

How every API/endpoint is protected, what's rate-limited, how keys are handled,
and the website security plan. Defense-in-depth: no single layer is trusted.

## 1. "Can someone find keys in the frontend?" — No secrets ship to the client

The **only** key in the mobile app is the **Supabase anon key**, which is
**designed to be public** — it identifies the project but grants **nothing** on
its own, because **Row-Level Security (RLS) is the actual boundary** (a user only
ever sees/writes their own org's rows; verified live that a second org sees
nothing). Also public and harmless: the Sentry DSN and feature flags.

**Secrets never reach the app:** the `service-role key`, `GROQ_API_KEY`,
`REMINDER_FUNCTION_SECRET`, and `RESEND_API_KEY` live **only** in Supabase
secrets (server-side edge functions). The app even **refuses to boot** if a
service-role key is ever mis-prefixed `EXPO_PUBLIC_` (`assertNoPublicServiceRoleKey`).
The built web bundle was grep-checked — no JWTs/keys leaked. EAS build env holds
**only** `EXPO_PUBLIC_*` (public) values.

## 2. Defense-in-depth per endpoint

| Endpoint | Layers |
|---|---|
| **PostgREST data API** (deals/milestones/…) | TLS → anon key (project gate) → **JWT auth** → **RLS tenant isolation** (per-org `USING`+`WITH CHECK`) → composite FKs (no cross-tenant stitching) → Zod at the app boundary. A user physically cannot read another org's rows. |
| **Auth** (sign-up/in) | TLS → Supabase GoTrue **built-in rate limits** (brute-force/credential-stuffing) → email confirmation (configurable) → 18+/Terms acceptance gate. |
| **`extract-spa-milestones`** (AI) | TLS → **JWT-verified** → resolves org via RLS → **storage-path authz** (must be the caller's org+deal) → **rate limit 30/org/hour → 429** → service-role used only to read the file → Groq **JSON-only** + **AI constitution** (injection-tested) → **Zod** → re-validated client-side. |
| **`send-due-reminders`** | TLS → **`--no-verify-jwt` + mandatory `x-reminder-secret` (fail-closed 401)** → atomic claim (no double-send) → only the cron (with the Vault secret) can invoke it. |
| **`delete-account`** | TLS → **JWT-verified** → erases only the caller's org + auth user → idempotent (self-limiting). |
| **Storage** (SPA PDFs) | **Private bucket**, org-scoped paths, RLS storage policies; edge fn verifies the path before reading; no PII in URLs. |

## 3. Rate limiting / abuse control

- **App-level (implemented):** `consume_rate_limit(bucket, max, window)` — an
  atomic, self-cleaning DB limiter callable only by the service role. Wired into
  the **AI extractor (30/org/hour → 429)**, the one endpoint with real $ cost.
  Verified live (3rd call past max=2 → blocked).
- **To extend:** the same limiter can guard any future expensive endpoint by
  passing a new bucket key — cheap to add.
- **Auth brute-force:** Supabase GoTrue rate-limits sign-in/sign-up/OTP. **Action:
  verify the limits in Supabase → Authentication → Rate Limits** (set sensible
  per-IP/per-hour caps; enable CAPTCHA there if you want extra protection).
- **Platform DDoS / volumetric:** handled by Supabase's infrastructure. For an
  extra layer, put **Cloudflare** (or Supabase's edge) in front and/or enable a
  **WAF**; the data API stays safe under load because RLS scopes every query.

## 4. Other controls in place

- **HTTPS-only** + Supabase **host allowlist** on the client (`networkSecurity`).
- **Input validation (Zod)** at every server + client boundary.
- **PII redaction** in logs/Sentry (tokens, JWTs, emails, names, apikey/auth headers).
- **No PII in URLs.** Money is `numeric`/`decimal.js`.
- **AI** — scope-locked constitution, injection-tested (`docs/ai-constitution.md`).
- **Native transport/device** (cert pinning, Play Integrity/App Attest) — scaffolded with activation steps in `docs/security-hardening.md` (pre-launch).
- **PDPL/erasure/age** — `docs/compliance.md` (account deletion verified live).

## 5. Website security (Next.js marketing site — apply when built)

The site is spec'd in `meridian-WEBSITE.md`; its security requirements:

- **Waitlist Server Action / Route Handler only** — never expose the DB from the
  client. **Anon key client-side only; service-role key never shipped.**
- **RLS:** `waitlist` table is **insert-only for `anon`, never selectable** — a
  visitor can join but cannot read the list.
- **Bot/abuse:** server-side **Zod** validation, a **honeypot** field, and a
  **per-IP rate limit** on submit (Upstash Redis or a DB-backed limiter); optional
  **CAPTCHA/Turnstile** if spam appears. Graceful duplicate handling. **Email
  never in a URL.**
- **Security headers** (via `next.config` / middleware): **CSP**, **HSTS**,
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, a locked-down
  `Permissions-Policy`.
- **Cookieless, privacy-first analytics**; minimal/no cookie banner.
- **Vercel** provides platform DDoS protection (+ optional WAF / firewall rules).
- Same secret rules: env vars for the anon URL/key only; no service-role in the
  client; legal pages flagged for lawyer review.

## 6. Checklist

**Done (verified):**
- ✅ No secrets in the client; service-role/Groq server-only + boot guard.
- ✅ RLS tenant isolation (cross-org read/write blocked).
- ✅ Per-endpoint JWT/secret auth + path authz on functions.
- ✅ **Rate limiting** on the AI extractor (cost-abuse) — live.
- ✅ Zod validation, redaction, private storage, AI injection defense.
- ✅ Account deletion (erasure), HTTPS + host allowlist.

**Config (you / dashboard):**
- ⬜ Verify Supabase **Auth rate limits** + optionally enable CAPTCHA.
- ⬜ (Optional) Cloudflare/WAF in front of Supabase + Vercel firewall for the site.

**Pre-launch (engineering):**
- ⬜ Native cert pinning + device attestation (`docs/security-hardening.md`).
- ⬜ Website: security headers + waitlist honeypot/rate-limit/CAPTCHA (when built).
- ⬜ Orphaned-SPA storage sweep (data minimization).
