# Meridian — Code Review & Roadmap to 10/10
**Date:** 2026-06-14 · **Method:** 45-agent audit; every spec doc (PRD/BUILD/DESIGN) and the implementation read line-by-line, dimension by dimension; every high/critical finding adversarially re-verified against the actual files (33 high/critical claims: 21 confirmed, 12 severity-corrected, 0 refuted).

## Verdict: 6.25 / 10 overall

Most of the spec is genuinely built — more complete and disciplined than a typical from-scratch build. The architecture, RLS, the SPA→AI flow, the Midnight token system, and the deck/tower motion are real and good. But several of the product's **headline promises are broken or faked**, and the cross-platform / accessibility / observability claims don't hold up.

### Scorecard

| # | Dimension | Score | Headline gap |
|---|-----------|:----:|--------------|
| 1 | Security & RLS | 7.5 | Phase 11 (cert pinning / device integrity / root-jailbreak) is a report-only placeholder |
| 2 | Data model & repositories | 8.0 | `createDeal` non-atomic (orphan deals); `as unknown as` casts defeat type safety; no money/RLS tests |
| 3 | Auth & onboarding | 6.5 | Analytics no-op; onboarding screens not localized; biometric flag written but never enforced |
| 4 | New deal + SPA + AI | 7.0 | AI output not Zod-checked client-side; non-atomic save; zero tests for money/date |
| 5 | Reminders & notifications | 5.0 | Never scheduled (no cron); push broken (no EAS projectId); no tap-routing |
| 6 | Dashboard Deck + Deal tower | 6.0 | Milestone status never re-derived vs today; shared-element transition is dead code; 2 metrics not 3 |
| 7 | Design fidelity & motion | 7.0 | Android blur disabled (`"none"`); inline Pressables bypass `/shared/ui`; no input focus state |
| 8 | Code quality & architecture | 6.0 | No route-level error boundaries; Zod only at the form; analytics stub; dev routes ship to prod |
| 9 | Performance & New Arch | 7.5 | Skia splash not lazy-loaded; iOS New-Arch not declared; un-memoized hot path |
| 10 | Testing / CI / OTA / observability | 5.0 | Coverage-theatre; RLS test exists but not run in CI; Maestro/snapshots absent; OTA docs-only |
| 11 | Accessibility, i18n & RTL | 3.0 | Arabic skeletal (3 of ~10 screens); only 2 screens call `t()`; RTL is faked (JS `direction`, no native mirror) |
| 12 | PRD & phase compliance | 6.5 | Phases 9 & 11 stubbed; no Settings/Profile screen (PRD §6 core); analytics no-op; OTA docs-only |

**Finding counts:** 6 critical · 27 high · 42 medium · 50 low.

---

## What's genuinely strong (keep)

- **RLS is real and well-built.** Org-scoped `USING` *and* `WITH CHECK` on every table via a `SECURITY DEFINER current_org_id()` with locked `search_path`; composite `(id, org_id)` FKs structurally prevent cross-tenant row-stitching; private storage bucket with org-scoped paths; no leaked keys in the built bundle.
- **Signup is one atomic transaction** (`create_workspace_after_signup` RPC); tokens only in `expo-secure-store`; Sentry/console redacted.
- **The SPA→AI edge function** derives org from the caller's JWT, authorizes the storage path, Zod-validates Claude's output, never auto-saves, degrades to manual entry.
- **New Architecture + Hermes actually on** (`android/gradle.properties`); FlashList v2 used correctly; money is `numeric` + `decimal.js` end-to-end, never a float.
- **Midnight design system is the single source of truth** — a `#hex` grep finds only `tokens.ts`. The floating glass capsule is a true detached capsule with a springing gold indicator — never a flush tab bar.

---

## Cross-cutting root causes (highest leverage)

### 1. Milestone status is stored once and never re-derived against today's date
*dashboard-deal (verified), reminders, data-model, prd-compliance.* `statusForDueDate` runs only at deal creation (`src/features/new-deal/newDealSchema.ts:103`); the read path `mapSupabaseDetail` (`src/shared/data/repositories/dealsRepository.ts:857`) returns the stored value verbatim. An "upcoming" milestone whose due date passes **never becomes due/overdue**; deck gold-glow and the "due/overdue" glance figures go stale; marking one paid doesn't promote the next. **This breaks G2 "zero missed milestones" — the entire product promise.** Fix: re-derive non-paid status from `due_date` vs today on read + a nightly scheduled recompute.

### 2. The "scheduled" reminder function is never scheduled
*reminders (CRITICAL, confirmed), prd-compliance.* No `pg_cron`, no `config.toml` schedule, no CI cron invokes `send-due-reminders`; reminders sit `pending` forever. Push registration also **throws on device** (no `extra.eas.projectId` in `app.json`; `src/features/reminders/notificationRegistration.ts:28`), and there's **no `setNotificationHandler` and no tap-response listener**, so foreground pushes don't show and tapping routes nowhere.

### 3. Phase 11 security hardening is a placeholder
*security (verified), prd-compliance (CRITICAL).* `securityPosture.ts` only *reports* that cert pinning, Play Integrity / App Attest / DeviceCheck, and root/jailbreak detection are "unavailable," defaulting to non-blocking `"report"` mode. SPAs carry passport / Emirates ID / financial PII. Either implement real controls and flip production to `block`, or formally descope and stop implying it's done.

### 4. i18n / RTL is faked (lowest score, 3/10)
*a11y-i18n (3 CRITICALs), auth-onboarding, dashboard-deal, code-quality, prd-compliance.* Only 2 screens call `t()`; Arabic covers 3 of ~10 screens; RTL is a JS `direction:'rtl'` style that **does not mirror** row layouts, margins, the tower node (`left:-11`), or the nav indicator. `forceRTL` only fires on a manual toggle needing a reload that never happens. Decide: truly implement (forceRTL + reload, logical `start/end` props, full Arabic, `t()` everywhere, lint rule) or descope Arabic for v1.

### 5. Multi-step writes aren't atomic
*data-model, ai-spa, prd-compliance.* `createDeal` does 4+ round-trips with no transaction (`src/shared/data/repositories/dealsRepository.ts:562`); a mid-flow failure leaves an orphan deal with no plan and an orphaned PII PDF in storage (PDPL liability). Wrap in one `SECURITY DEFINER` RPC.

### 6. Analytics is a literal no-op
*auth-onboarding, code-quality, testing, prd-compliance.* `trackAnalyticsEvent` is `return undefined` (`src/shared/observability/analytics.ts:9`). PostHog is a paid dep, unused. Success criterion "onboarding completion ≥ 70%" is unmeasurable.

### 7. The Profile/Settings screen (PRD §6 core) doesn't exist
*prd-compliance (HIGH, verified).* No way to sign out, change notification prefs, or manage the biometric lock after onboarding; nav has only 3 destinations.

---

## High-severity findings (verified)

- **No route-level error boundaries** — only root `app/_layout.tsx` exports one; a screen crash blanks the whole app. Add `ErrorBoundary` to `(app)/_layout.tsx` and `(onboarding)/_layout.tsx`. *(PRD §9 / BUILD §2)*
- **Zod only at the new-deal form**, not at data/network/AI client boundaries (`dealsRepository.ts:539,559,651`). *(BUILD §3)*
- **Mark-paid doesn't promote the next milestone** to "due."
- **Shared-element deck→detail transition is dead code** — `sharedTransitionTag` set but Reanimated 4.3.1 dropped legacy shared transitions; it hard-cuts. Implement a measured matched-geometry entrance or remove the props. *(BUILD Phase 7)*
- **Deck card has no accessibility semantics** — not discoverable as tappable/swipeable.
- **Reminder timezone drift** — SQL 09:00 Asia/Dubai vs client 09:00 UTC (4h / a day off). Centralize one constant.
- **Android floating-nav blur disabled** (`blurMethod="none"`, `src/shared/ui/FloatingNav.tsx:81`). Use `dimezisBlurView`/`continuous`. *(BUILD Phase 5)*
- **Tests are coverage-theatre** (3 suites / 6 tests) — money/date/status rollup untested; **RLS isolation test never run in CI**; Maestro E2E and visual snapshots not wired in.

## Medium-severity findings (selected)

- Reminder queue drained without atomic claim → double-send; past-dated reminders fire as a burst; email fans out to whole org (ignores `buyer_email`/deal owner); `send-due-reminders` auth is optional (fail closed).
- Edge fn doesn't bound `percent ≤ 100`; helpers throw uncaught → bare 500 instead of friendly 422; document picker not wrapped in try/catch.
- No validation that milestone amounts/percents sum to the total; `paidPercent` can exceed 100%.
- Self-service profile UPDATE can mutate `role`/`onboarding_complete` outside the validated RPC.
- Dev routes ship to production (`meridian://dev/force-error`, `…/control-preview`) — gate behind `__DEV__`.
- Glance shows 2 metrics, not the required 3 (in escrow / due this week / overdue).
- Inline-styled Pressables across feature screens bypass `/shared/ui`; mark-paid press runs on JS thread.
- Input has no gold focus state; touch targets below 44pt (back 32, mark-paid 28).
- iOS New-Arch/Hermes not declared; Skia splash statically imported into cold-start path; OTA rollout + kill-switch docs-only.

## Low-severity findings (themes)

Splash width-clip not stroke draw-in & mark ≠ §6.0; splash→Welcome hard cut not crossfade; background deck cards don't spring during drag; deck advance snaps instead of flinging; `formatAedCompact` shows `AED 1000K`; `documents.storage_path` CHECK enforces only the org segment; redaction misses `Authorization`/`apikey`/phone values; password min length 6 + email confirmations off; pervasive `as unknown as` casts; dead `App.tsx`/`index.ts`; decorative `ThemeProvider`; `isSupabaseConfigured` hardcoded `true`; committed `dist/`; `react-native-skottie` named but not installed; `expo-image` used only for prefetch; unordered milestone embed.

---

## Roadmap to 10/10

### P0 — Production blockers (core promises must actually work)
1. Re-derive milestone status from `due_date` on read + nightly recompute. *(G2/G3)*
2. Schedule the reminder dispatcher (`pg_cron` + `pg_net`); add `extra.eas.projectId`; add `setNotificationHandler` + tap→`/deal/[dealId]` routing. *(Phase 9)*
3. Make `createDeal` atomic via one transactional RPC; clean up orphaned SPA uploads.
4. Add the Settings/Profile screen (sign-out, notifications, biometric toggle). *(PRD §6)*
5. Decide i18n/RTL: fully implement, or descope Arabic for v1 and update the specs.
6. Decide Phase 11 security: implement real pinning + attestation + root/jailbreak (recommended given PII), or formally descope and set enforcement honestly.

### P1 — Correctness, reliability, observability
- Wire real analytics (PostHog/Statsig) for the onboarding funnel.
- Route-level error boundaries; wrap every async handler; Zod at network + AI client boundaries.
- Mark-paid promotes next milestone; reminder atomic claim + skip past-dated + target deal owner + receipt reconciliation; `send-due-reminders` fail-closed.
- Edge fn: bound `percent ≤ 100`, wrap throws → 422; validate plan sums to total.
- Restrict profile self-UPDATE columns; gate dev routes behind `__DEV__`; unify the 09:00-GST constant.
- Real tests for rollup/status/paid-percent + mark-paid rollback; run RLS test + Maestro + visual snapshots in CI as blocking gates.

### P2 — Design fidelity, performance & hygiene
- Android blur (`dimezisBlurView`); real or removed shared-element transition; 3 glance metrics; deck fly-off + background spring; splash crossfade/mark/radial glow.
- Input focus state; 44pt touch targets; font-scaling policy in `Text`.
- Inline Pressables → `/shared/ui`; lazy-load Skia splash; declare iOS New-Arch.
- Remove `as unknown as` casts; delete dead `App.tsx`/`index.ts`/decorative `ThemeProvider`; `.gitignore dist/`; fix `isSupabaseConfigured`; Skottie decision; in-app OTA kill-switch + Sentry release health; storage_path full-segment CHECK; redaction patterns; password policy.

---

## Spec-vs-code mismatches to reconcile
- BUILD names **`react-native-skottie`** (not installed) and **Reanimated legacy shared transitions** (unavailable in 4.3.1). Pick the real approach and write it back into BUILD/DESIGN so spec and code agree.
