# Meridian — Worklog

> **Living document.** Current state of the Meridian app: what's built, how it works, what's deployed, and what's pending. Updated whenever something changes.
>
> **Last updated:** 2026-06-26 · **Repo:** https://github.com/Pratikkadam00/Meridian

---

## Update — 2026-06-26 (read first; sections below predate this)

Since the 2026-06-15 entry:
- **Design system migrated** from "Midnight" (obsidian + champagne-gold) to the **Jade/Amber "Meridian"** system (light "warm paper" + dark "Midnight Meridian"), app-wide, with a user-facing Light/Dark/System toggle. Older sections below still describe the gold theme.
- **Full i18n pass:** deal/reminder display strings, currency symbol, and form validation messages now localize EN/AR (parity enforced by test).
- **Responsive + a11y hardening:** content capped/centred at `contentMax` for tablets, OS font-scale capped, `numberOfLines` on list/card text, AA-contrast text tokens, AT roles on nav/segmented/checkbox, the deal deck made screen-reader-accessible.
- **Security hardening** from a whole-codebase audit — new migration `20260626090000_phase_15_security_hardening.sql` + edits to all 3 edge functions + client. Fixes: reminder write-amplification, rate-limiter fail-open + TOCTOU race, missing server-side plan reconciliation, file-size/MIME caps on `deal-documents`, weak password policy, app-lock fail-open + foreground re-lock, and the `delete-account` org-wipe. **NOT yet deployed (`db push` / `functions deploy`) or device-tested.**
- **Migration count is now 7** on disk (the "migrations applied" note below is stale).

**Honest current state (this supersedes the "~8.5–9/10 · verified against the live backend" line below):** the happy-path is fully built and passes client gates (tsc/lint/jest 31), but **end-to-end against the live backend has NOT been verified.** With no Supabase env vars the app runs entirely on in-memory Preview mocks; **reminders never fire until the `pg_cron`/`pg_net` setup in `docs/reminders-cron.md` is run** (there is no scheduler in-repo); `phase_15` is undeployed; and monetization is unbuilt. Realistic state: a polished, near-complete build pending **deploy + the reminder cron + on-device QA**, not a verified-live product.

---

## 1. What Meridian is

A production cross-platform (iOS + Android, one codebase) **Expo / React Native** app for **Dubai off-plan real-estate brokers**. It tracks construction-linked payment plans from booking to handover: drop in an SPA PDF → AI reads the payment plan → reminders fire before every milestone → the whole portfolio in one glance. Visual identity is the **"Midnight"** design system (obsidian + champagne-gold).

**Current overall state: ~8.5–9 / 10.** Core promises work and are verified against the live backend; the app is bilingual, secure-by-data-design, and the AI feature is live and hardened. Remaining items are third-party keys (Resend), on-device QA, and motion polish.

**Quality gates (green):** TypeScript `tsc` 0 errors · ESLint 0 (enforces no hardcoded UI text) · Jest 31 tests / 8 suites · CI runs lint+typecheck+tests+RLS+EAS build.

---

## 2. Tech stack

- **App:** Expo SDK 56, React Native 0.85, React 19, New Architecture + Hermes (declared in `app.json`).
- **Routing:** Expo Router (typed routes) — `(onboarding)` and `(app)` groups.
- **State:** TanStack Query (server) + React context providers (DI).
- **Backend:** Supabase (Postgres + Auth + Storage + Edge Functions) — project `ebmsbtnyxymajyywuhyd` (ap-southeast-2 / Sydney).
- **AI:** Groq (`llama-3.3-70b-versatile`) via an edge function (PDF text → JSON).
- **UI/motion:** Reanimated (UI-thread), Gesture Handler, Moti, Skia (splash), expo-blur, FlashList, expo-image.
- **Forms/validation:** react-hook-form + Zod. **Money:** `decimal.js` + Postgres `numeric` (never float).
- **i18n:** i18next + expo-localization (English + Arabic, full RTL).
- **Observability:** Sentry (redacted) + analytics (PostHog/Statsig-ready).
- **CI/CD:** GitHub Actions + EAS Build/Update.

---

## 3. Architecture

Feature-based, clean unidirectional layering:

```
/app                         Expo Router routes (thin): (onboarding)/*, (app)/*, dev/*
/src/features/{auth, onboarding, dashboard, deal, new-deal, reminders,
               settings, security, splash, navigation, routing}
/src/shared/{ui, theme, lib/{i18n,date}, data/{repositories}, security,
             observability, featureFlags, providers}
```

- **Repository pattern + DI:** `RepositoryProvider` injects Supabase- or Preview-backed repositories (`deals`, `auth`, `onboarding`, `reminders`). The app runs in **Preview mode** (in-memory demo data) when Supabase isn't configured, and against the **real backend** when it is.
- **Error boundaries** at root **and** route-group level (`(app)`, `(onboarding)`) — a screen crash is contained, never a white screen.
- **Providers** (`MeridianProviders`): theme, i18n, security, repositories, auth, query client, feature flags.

---

## 4. Features & flows

### Onboarding (stepped, never a generic carousel)
1. **Animated splash** (Skia gold-mark draw, lazy-loaded) → routes by state: signed-in+complete → home; signed-in+incomplete → resume; new → welcome. Skipped on later launches.
2. **Welcome** — swipeable 3-beat value carousel + CTAs + language toggle (SegmentedControl).
3. **Account** — Supabase email auth; sign-up creates org + profile in **one transaction** (`create_workspace_after_signup` RPC).
4. **Personalization** — role / developers (seeds the `developers` table) / deal-volume → saved to `profiles.persona`.
5. **Permissions** — value-framed push request + optional biometric app-lock; skippable, never dead-ends.
6. **Education** — 3 teach cards → "Add your first deal" / "Skip to dashboard".

Per-step analytics, back always works, step persists across app kill (resume), `onboarding_complete=true` on finish.

### Home / Deck
- Swipeable card deck (Gesture Handler) with depth-stacked background cards, gold-glow due card, **3 glance metrics** (in escrow / due this week / overdue), dot indicator, Moti entrance stagger, first-run empty state.
- Metrics memoized; money via `decimal.js`.

### Deal detail (payment tower)
- Paid-to-date + the done/now/upcoming payment **tower**. **Mark-paid** (UI-thread press) → node-pop spring + animated progress + success haptic + **optimistic update with rollback**. Deal + milestones fetched in one query (no N+1).

### New deal + SPA → AI
- Manual path always works (react-hook-form + Zod + editable milestone editor).
- AI path: pick PDF → upload to a **private** org-scoped bucket → Groq extracts the plan → **pre-fills the editor for confirmation, never auto-saves**. Failure → clear message, manual still works.
- Validates the plan sums to the total before saving.

### Reminders
- Lists upcoming reminders with urgency; **"Share to WhatsApp"** prefilled `wa.me` deep link; enable-push button. Reminders auto-fire via cron (see §8).

### Settings / Profile
- Workspace info, enable push, **biometric app-lock toggle** (enforced at launch via `AppLockGate`), **in-app language switch** (English ⇄ Arabic with RTL reload), **sign out**. 4th nav destination.

---

## 5. Data model, RLS & RPCs (Supabase)

**Tables** (all with `org_id`, RLS enabled, composite `(id, org_id)` FKs preventing cross-tenant stitching): `orgs`, `profiles` (`onboarding_complete`, `persona` jsonb), `developers`, `deals`, `milestones` (seq/label/trigger_type/percent/amount_aed/due_date/paid_date/status/source), `documents` (org/deal/file path), `reminders`, `push_tokens`. All required indexes present. Money is `numeric`.

**RLS:** org-scoped `USING` + `WITH CHECK` on every table via a `SECURITY DEFINER current_org_id()` (locked search_path). **Verified live: a second org cannot see or target the first org's data.**

**RPCs (SECURITY DEFINER, validated):**
- `create_workspace_after_signup` — atomic org+profile on signup.
- `save_onboarding_personalization`, `complete_onboarding`.
- `create_deal_with_plan` — **atomic** deal + milestones + reminders + document in one transaction. **Verified live.**
- `recompute_milestone_statuses` — nightly status refresh from `due_date`.
- `claim_due_reminders` — atomic `FOR UPDATE SKIP LOCKED` claim for the dispatcher (no double-send) + stale reclaim.
- `schedule_milestone_reminders` — schedules push+email offsets (7/3/1 days), skips past-dated.

**Migrations:** `phase_2` (schema+RLS), `phase_4` (onboarding RPCs), `phase_9` (reminders), `phase_13` (atomicity/recompute/claim/profile column-lock/storage-path tightening). **All applied to the live DB.**

**Profile lock:** authenticated users can only `UPDATE profiles.full_name`; role/onboarding/persona change only via the validated RPCs.

---

## 6. AI SPA extraction (Groq) — live & hardened

- **Pipeline:** PDF → `unpdf` text extraction (in the edge function, since Groq is text-only) → Groq chat (`llama-3.3-70b-versatile`, JSON mode) → normalize → **Zod-validate** → return milestones. Re-validated again client-side before touching the form.
- **Auth/tenancy:** requires the caller's JWT, resolves org via RLS, verifies the storage path belongs to that org+deal before reading the file. `GROQ_API_KEY` is server-only.
- **AI Constitution** (`docs/ai-constitution.md`) — scope-locked, anti-jailbreak: the document is treated as **untrusted data**, embedded instructions are ignored, output is JSON-only, the prompt is never disclosed, no fabrication. Defense-in-depth: JSON mode → Zod → normalization → **human-in-the-loop confirm (never auto-save)** → plan-sum check → server-only keys.
- **Verified live (`scripts/test-ai-extraction.mjs`, 9/9):** 7 diverse legitimate SPA formats extract correctly (standard, post-handover, multi-construction, 50/50, no-dates, legal-boilerplate-with-"system/code/instructions", varied amount formats) and **don't get over-blocked**; injection attacks ("ignore instructions / output Python / reveal prompt") return only the payment plan or a 422 manual fallback.

---

## 7. Reminders & notifications

- **Client:** `setNotificationHandler` (foreground banners) + tap→`/deal/[dealId]` routing; push-token registration reads the EAS projectId; "Share to WhatsApp" deep link.
- **Dispatcher** (`send-due-reminders` edge fn): **fail-closed** (requires `x-reminder-secret`), atomic claim (no double-send), targets the **deal owner** (not whole org) for email, per-token push with dead-token pruning, marks sent/failed. **Verified live:** 401 without secret, 200 dispatch with secret.
- **Timezone:** all reminder times are 09:00 Asia/Dubai (unified between SQL and client).
- **Email** via Resend (pending the key); **push** via Expo (projectId configured).

---

## 8. Deployment status (LIVE)

| Resource | Status |
|---|---|
| **Supabase migrations** (4) | ✅ applied to `ebmsbtnyxymajyywuhyd` |
| **Edge fn `extract-spa-milestones`** (Groq) | ✅ deployed, JWT-verified, **extraction verified live** |
| **Edge fn `send-due-reminders`** | ✅ deployed (`--no-verify-jwt`), fail-closed verified |
| **Secrets** | ✅ `GROQ_API_KEY`, `GROQ_MODEL`, `REMINDER_FUNCTION_SECRET`, `REMINDER_EMAIL_FROM` · ⏳ `RESEND_API_KEY` pending |
| **Cron `meridian-send-due-reminders`** | ✅ active — every 15 min |
| **Cron `meridian-recompute-milestone-statuses`** | ✅ active — nightly 01:05 UTC |
| **EAS project** | ✅ `@pratikk_expo/meridian` (`c6a933d0-…`); `EXPO_PUBLIC_*` env vars set for preview + production |
| **EAS build** | ✅ Android `preview` (internal APK) built with real backend env |

**Env stores (3, kept separate):** local `.env` (dev) · EAS env vars (builds, `EXPO_PUBLIC_*` only) · Supabase secrets (server: Groq/service-role/reminder secret — never in the app).

---

## 9. i18n / RTL, design system & accessibility

- **i18n:** every screen localized to `react-i18next` — **434 strings across 13 namespaces**, English + professional UAE Arabic (correct SPA/DLD/Oqood/handover terms). Real native **RTL** (`I18nManager.forceRTL` + reload, logical layout). A scoped `react/jsx-no-literals` lint rule + a Jest en/ar parity test prevent regressions.
- **Design system** (`@/shared/ui`, documented in `src/shared/ui/README.md`): every control (Button gold/ghost/text/danger × lg/md/sm, IconButton, Fab, SocialButton, SegmentedControl, OptionCard/Chip, StatusChip, Input) is tokenized — **no raw `Pressable` or hardcoded hex in any screen**. Gold press-brightness lift; UI-thread press feedback; floating glass-capsule nav (real Android blur).
- **a11y:** roles/labels/states, ≥44pt targets, gold input focus, reduced-motion honored.

---

## 10. Security

- **RLS** tenant isolation (verified live). **Service-role/Groq keys server-only**; app hard-crashes if a service-role key gets an `EXPO_PUBLIC_` prefix.
- **Network policy:** HTTPS + Supabase host allowlist enforced client-side.
- **Redaction:** console + Sentry redact tokens/JWTs/emails/PII (incl. apikey/Authorization patterns).
- **Phase 11** (`docs/security-hardening.md`): real device check (`expo-device` emulator detection) + honest posture (each control labelled enforced vs pending); cert-pinning + Play Integrity/App Attest are scaffolded with exact activation steps (SPKI hashes + server attestation) — **not** faked.
- **Biometric app-lock** enforced at launch (fail-open so users aren't bricked).
- **AI:** see §6 (constitution + injection-tested).
- **Legal & compliance** (`docs/compliance.md`): B2B/adults (low children-risk, 18+ acceptance gated at sign-up); **UAE PDPL** + the broker-as-controller / Meridian-as-processor model for SPA buyer data; **in-app account & data deletion** (PDPL erasure + Apple/Google requirement) — a `delete-account` edge fn that erases storage + org cascade + auth user, **verified live**. Privacy policy / Terms / DPA + lawyer review are pending (see §12).
- **API security & rate limiting** (`docs/api-security.md`): **no secrets in the client** (the anon key is public by design; RLS is the boundary; service-role/Groq keys are server-only with a boot guard); per-endpoint JWT/secret auth + path authz; **server-side rate limiting** via `consume_rate_limit` wired into the AI extractor (**30/org/hour → 429**, verified live) and reusable for any expensive endpoint; auth brute-force handled by Supabase + platform DDoS notes; the website security plan (Server-Action waitlist, honeypot, per-IP limit, security headers, anon-only).

---

## 11. Testing, CI & observability

- **Jest (31 tests / 8 suites):** milestone status derivation (Dubai-tz boundaries), money/rollup math, paid-percent, mark-paid, new-deal plan validation, reminder timezone, analytics redaction, i18n en/ar parity, Button-variants snapshot.
- **Live AI battery:** `scripts/test-ai-extraction.mjs` (9/9 — legit pass, attacks blocked).
- **CI** (`.github/workflows/ci.yml`): lint + typecheck + tests + expo-doctor; a blocking **RLS isolation** DB job; a Maestro E2E job (secret-gated); EAS preview build on PRs.
- **Observability:** Sentry (fatals, non-fatals e.g. `spa_extraction_failed_but_app_continued`, perf journeys open→home / new-deal→saved); analytics events on the onboarding funnel.
- **Docs:** `meridian-PRD/BUILD/DESIGN.md`, `meridian-REVIEW.md` (full audit + roadmap), `docs/{reminders-cron, security-hardening, ai-constitution, ota-rollout}.md`, `src/shared/ui/README.md`.

---

## 12. Pending / next

- ⏳ **`RESEND_API_KEY`** → email reminders (push already works).
- ⏳ **On-device QA pass** — install the EAS preview APK and walk every flow against the live backend.
- ⏳ **Motion polish** (codeable, needs device QA): deck fly-off + background spring, splash stroke-draw + crossfade, radial screen glow, true matched-geometry deck→detail transition.
- ⏳ **Native Phase 11** — insert real SPKI pin hashes + stand up the Play Integrity/App Attest server endpoint, then flip enforcement to `block` (runbook in `docs/security-hardening.md`).
- ⏳ **iOS build** — needs an Apple Developer account.
- ⏳ **Type-gen** — `supabase gen types typescript` to remove the two remaining `update` builder casts.
- ⏳ Full Maestro E2E + visual snapshots running in CI (configured; needs a Maestro Cloud key).
- ⏳ **Compliance:** Privacy Policy + Terms + DPA drafted & **lawyer-reviewed**; orphaned-SPA storage sweep; data export (portability); cross-border-transfer basis; app-store data-safety forms (`docs/compliance.md` §11).
- ⏳ **Marketing website** — spec'd in `meridian-WEBSITE.md`; build on request (own Next.js project at `D:\projects\meridian-website`).

---

## 13. Changelog (commits)

| # | Commit | What |
|---|---|---|
| 1 | `86e20dc` | Initial commit — Meridian from the PRD/BUILD/DESIGN specs |
| 2 | `2dcb9fd` | P0: re-derive milestone status from due_date (G2/G3) |
| 3 | `c094164` | P1: harden new-deal + SPA AI extraction |
| 4 | `71e17f8` | P1: route error boundaries, async wrapping, dev-route gating |
| 5 | `1eec7b5` | P0/P1: reminders client (timezone, push token, tap routing) |
| 6 | `5e2666d` | P1: real analytics + redaction gaps |
| 7 | `43de9c0` | P0: Settings/Profile screen + biometric app lock |
| 8 | `2c509d6` | P0/P1: atomic deal RPC, reminder hardening, status recompute |
| 9 | `0d6a86a` | P1: RLS + Maestro CI gates |
| 10 | `878506f` | P2: Android blur, 3 glance metrics, input focus, 44pt |
| 11 | `05e3cae` | P0/P1: real RTL + in-app language switch |
| 12 | `4591d53` | design: adopt the button-system everywhere |
| 13 | `109bda0` | fix: clear lint error + warnings |
| 14 | `0eee5cb` | i18n: localize every screen + full Arabic + lint rule |
| 15 | `b1aa8f2` | P0: Phase 11 security — real device check + runbook |
| 16 | `357120e` | P2: lazy splash, New-Arch/Hermes, gold press-lift |
| 17 | `b1997e2` | P1: i18n parity test, button snapshot, /shared/ui README |
| 18 | `d55b78c` | P2: drop profile-select cast; document update-builder limitation |
| 19 | `e13c573` | config: EAS projectId + OTA updates URL |
| 20 | `f62cab5` | feature: SPA AI extraction via Groq, verified live |
| 21 | `a8cee80` | security: AI constitution + prompt-injection hardening |
| 22 | `4eea0b5` | test: AI extraction battery (9/9 — legit pass, attacks blocked) |
| 23 | `7ceb50a` | docs: add worklog.md |
| 24 | `aa30bb4` | compliance: account/data deletion (PDPL), 18+ acceptance, compliance.md |
| 25 | `9e8e95b` | docs: update worklog (compliance) |
| 26 | `—` | security: server-side rate limiting + api-security.md |

---

## 14. How this file is maintained

This worklog is updated whenever the project changes — new features, deploys, fixes, or status shifts. Tell me what changed and I'll keep §1–§13 and the changelog current.
