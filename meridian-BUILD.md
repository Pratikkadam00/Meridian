# Meridian — Codex Build Pack (iOS + Android · from scratch)

**Feed Codex:** this file + `meridian-PRD.md` + `meridian-DESIGN.md`.
Work the phases in §4 **in order**, one at a time, passing each acceptance check before the next. Small steps + the exact design (`meridian-DESIGN.md` §6) + the guardrails (§5) = the agent stops drifting.

---

## 0. Prime directive
> Build a **production, cross-platform** app (iOS + Android, one codebase) that feels **award-winning, never generic**. Visual identity = **Midnight** (`meridian-DESIGN.md`); reproduce every screen's reference HTML/CSS faithfully. Motion = the **Motion Contract** (`meridian-DESIGN.md` §5) — don't improvise. Navigation = the **floating glass capsule**, never a flush tab bar. Onboarding = the stepped flow in `meridian-PRD.md` §5, never a generic 3-slide carousel. Backend, data model, and RLS are in `meridian-PRD.md`.

## 1. Stack (latest stable; no RCs)
React Native + **Expo** (SDK 55+/56, RN 0.85+, React 19) · **New Architecture always on** · **Hermes v1**. Routing: **Expo Router**. Data: **Supabase** (Postgres + Auth + Storage). Secure storage: **expo-secure-store**. Biometrics: **expo-local-authentication**. Notifications: **expo-notifications**. Lists: **FlashList**. Images: **expo-image**. Forms: **react-hook-form + Zod**. Server state: **TanStack Query**. Client state: **Zustand**. Observability: **Sentry**. CI/CD: **EAS Build + Submit + Update**. Flags: **Statsig/PostHog**. i18n + **RTL** (English + Arabic).

**Animation stack (won't break; all New-Arch compatible — verify via `expo-doctor`):**
- **Reanimated** (UI-thread) — transitions, deck swipe, nav-indicator spring, micro-interactions.
- **Gesture Handler** — the deck drag, sheets.
- **Moti** — declarative entrances/staggers (onboarding, list reveals).
- **react-native-skottie** (Lottie on Skia/GPU) — the splash brand animation + onboarding illustrations. Fallback: `lottie-react-native`.
- **@shopify/react-native-skia** — custom visuals (gold-mark draw) where a Lottie isn't right.
- **expo-splash-screen** — native pre-splash, held until fonts/session resolve.

## 2. Architecture & layers
Feature-based modules, clean unidirectional (MVI) flow.
```
/app  (Expo Router routes: (onboarding)/*, (app)/*, thin)
/src/features/{onboarding,auth,dashboard,deal,new-deal,reminders}
/src/shared/{ui, theme, lib, data, observability}
```
1. **Presentation** — screens + `/shared/ui` (match `meridian-DESIGN.md` §6), animations only. 2. **State** — TanStack Query (server) + Zustand (UI). 3. **Domain** — use-cases in plain TS, Zod-validated. 4. **Data** — repositories over Supabase + secure storage + network (cert pinning). DI via React providers.

## 3. Engineering standards (every file)
TS strict, no `any`; Zod at every boundary (incl. AI output); RLS is the source of truth, service-role key server-only, tokens/PII only in expo-secure-store; error boundaries + every async wrapped (no silent failures, no white screens); never auto-commit AI output (human confirms, manual always works); animations on the UI thread; tokens are the single source of truth (no hardcoded hex outside `/shared/theme`); FlashList + expo-image + lazy `import()`; a11y + RTL on every screen; money is `numeric` never float; tests for money/date logic + RLS isolation; small reversible commits.

---

## 4. Phased build prompts (paste in order; verify acceptance)

**Phase 0 — Foundation.** Scaffold Expo (latest SDK, TS strict, New Arch on, Hermes v1) + Expo Router + the §2 structure. Install/configure the full stack in §1 incl. the animation stack. Build `/shared/theme` from `meridian-DESIGN.md` §1 (Midnight tokens, fonts Bricolage Grotesque / Inter / JetBrains Mono, motion presets). Run `expo-doctor`; reject any non-New-Arch dep. **Acceptance:** boots on iOS + Android with the Midnight theme and a clean route skeleton split into `(onboarding)` and `(app)` groups.

**Phase 1 — Architecture, providers, error handling.** Implement the §2 layers: `/shared/data` repository layer over Supabase via context (DI). App/route error boundaries with typed fallbacks; theme + i18n/RTL providers; Sentry at root. **Acceptance:** a forced error renders the fallback (no white screen) + reports to Sentry; language toggle flips to correct RTL.

**Phase 2 — Auth + secure session + data model + RLS.** Create the schema in `meridian-PRD.md` §7 with `org_id` on every table; enable **RLS** + tenant-isolation policies (row visible iff `org_id` = caller's org via profiles); add indexes. Supabase email auth; session in **expo-secure-store** only; on first sign-up create `org` + `profile` in one transaction (with `onboarding_complete=false`, `persona` jsonb). **Acceptance:** two users in two orgs see only their own rows (tested); service-role key absent from any client bundle.

**Phase 3 — Splash (animated) + routing.** Use **expo-splash-screen** for the native pre-splash held until fonts + session resolve, then an animated brand reveal matching `meridian-DESIGN.md` §6.0 — gold mark draws in (Skottie Lottie **or** Skia + Reanimated) + wordmark fades up (~1.2s) → crossfade out. Route: signed-in + onboarding_complete → `(app)/home`; signed-in + not complete → resume onboarding; new → `(onboarding)/welcome`. **Acceptance:** no white flash; splash < 2s; correct routing for each state; skipped on subsequent launches.

**Phase 4 — Onboarding flow.** Build the stepped flow (`meridian-PRD.md` §5), matching `meridian-DESIGN.md` §6.1–6.5: **Welcome** (swipeable value carousel + CTAs) → **Account Setup** (6.2, wired to Phase 2 auth) → **Personalization** (6.3 — role, developer multi-select, volume → save to `profiles.persona`, seed `developers`) → **Permissions** (6.4 — value-framed, request expo-notifications push, offer biometric lock; skippable) → **Core Education** (6.5 → "Add your first deal" / "Skip to dashboard"). Slim **progress indicator** on steps; horizontal slide+fade transitions (Moti/Reanimated, §5); persist current step (resume if app closed); on finish set `onboarding_complete=true`; analytics event per step. **Acceptance:** flow runs end to end, no dead ends, back works, state persists across kill, persona + developers saved, push permission requested with rationale.

**Phase 5 — Floating navigation (signature).** Build the **floating glass capsule** from `meridian-DESIGN.md` §6 — `BlurView` body, gold hairline, three destinations + the elevated gold FAB, the gold indicator that **springs** under the active icon (Reanimated `withSpring{damping:16,stiffness:180}`), safe-area inset offset, light-impact haptic on switch, FAB → New deal. **Acceptance:** matches the reference on both platforms (Android blur via `experimentalBlurMethod`); indicator springs; FAB protrudes; never a full-width flush bar.

**Phase 6 — Home / Deck.** Build the swipeable Deck home matching `meridian-DESIGN.md` §6.6: header + glance metrics + the card stack with depth (background cards scaled/offset; due card gold-glow). Data via TanStack Query. Swipe via **Gesture Handler** → release past ~90px advances; spring per §5. Dots indicator; first-run empty state ("Add your first deal"); entrance stagger (Moti). **Acceptance:** matches reference, 60fps swipe on a production build, depth + spring correct, RTL correct.

**Phase 7 — Deal detail + tower.** Build the detail screen matching `meridian-DESIGN.md` §6.7: paid-to-date + the payment **tower** (done/now/upcoming). Open via a shared-element transition from the deck card. Fetch deal + milestones in one query (no N+1). Mark-paid (swipe or tap) → node pop spring + animated progress + **success haptic**; optimistic update + rollback. **Acceptance:** transition smooth/reversible, tower per reference, mark-paid instant and reconciles.

**Phase 8 — New deal + SPA upload + AI.** Build matching `meridian-DESIGN.md` §6.8. Manual path always works (react-hook-form + Zod + milestone editor). AI path: pick PDF (expo-document-picker) → upload to a **private** Supabase bucket `org_id/deal_id/file` → server action calls Claude → Zod-validated milestone array **pre-fills the editor for confirmation before save** (never auto-save); failure → clear message, manual editor still works. **Acceptance:** deal creatable fully by hand; AI pre-fills + requires confirm; bucket private; no PII in any URL.

**Phase 9 — Reminders & notifications.** Compute reminder times before each due date; expo-notifications push + a scheduled Supabase function (push + email, mark sent/failed); "Share to WhatsApp" prefilled `wa.me` deep link. **Acceptance:** a due milestone fires push + email; WhatsApp link opens prefilled.

**Phase 10 — Performance hardening.** Verify New Arch + Hermes v1 in release; tune FlashList; confirm all animations on the UI thread; expo-image caching; lazy-load heavy screens (esp. Skia/Skottie splash assets, AI). Sentry traces for "open → home" and "new-deal → saved". **Acceptance:** cold start < 2.5s on mid-tier Android production build; journeys traced; no dropped frames on deck/tower/onboarding.

**Phase 11 — Security hardening.** Certificate pinning; audit tokens/PII in expo-secure-store, never logged; device integrity — Play Integrity (Android) + App Attest/DeviceCheck (iOS) + jailbreak/root detection (graceful). **Acceptance:** mismatched cert rejected; integrity flags rooted/jailbroken; no secret in logs/bundle.

**Phase 12 — QA / DevOps / observability.** Jest + RN Testing Library (money/date logic + core components) + Maestro E2E (onboarding → create deal → mark paid) + visual snapshots (home, deal, key onboarding steps). GitHub Actions: lint + typecheck + tests + EAS Build on every PR, blocking merge on failure. Feature flags (Statsig/PostHog) wrap new features; EAS Update channels for staged OTA (1%→10%→100%) + kill-switch. Sentry: fatals, **non-fatals** (e.g. "SPA extraction failed but app continued"), release health. **Acceptance:** failing test blocks merge; flag toggles remotely; OTA rolls out + back; a non-fatal appears in Sentry with context.

---

## 5. Guardrails (never violate)
- **Design fidelity:** match `meridian-DESIGN.md` §6 exactly; the nav is the floating capsule — never a flush tab bar; onboarding is the stepped flow — never a generic carousel.
- **New Architecture only** — verify every dep (expo-doctor / RN Directory).
- **Motion on the UI thread** (Reanimated/Gesture Handler); splash via Skottie/Skia; honor reduced-motion.
- **Security:** never bypass RLS; service-role key server-only; tokens/PII only in expo-secure-store; private buckets; no PII in URLs/logs.
- **Never auto-commit AI output** — human confirms; manual entry always works.
- **No hardcoded design values** outside `/shared/theme`. **Money is never a float.**
- **No silent failures, no white screens.** **RTL on every screen.** **Onboarding never dead-ends.**
