# Meridian — Product Requirements Document
**Version:** 1.0 (from scratch) · **Platform:** iOS + Android (one codebase) · **Design:** Midnight (see `meridian-DESIGN.md`)

> Production product, built fresh. Every requirement is a build constraint. Read with `meridian-DESIGN.md` (visual system + every screen's HTML/CSS) and `meridian-BUILD.md` (stack, animation, phased prompts).

---

## 1. Summary
Meridian is the deal manager for **Dubai off-plan real-estate brokers**. It tracks each deal's construction-linked payment plan from booking to handover — against the DLD schedule — so a broker never misses a payment, an Oqood registration, or a handover deadline. The wedge no generic CRM or US transaction tool covers: the Gulf off-plan payment structure (booking → DLD/Oqood → construction milestones → handover).

## 2. Target user
Solo and small-team Dubai brokers selling off-plan units (Emaar, Damac, Sobha, Binghatti, Nakheel…). Mobile-first, on the move, juggling 5–30 live deals. Scale path: brokerage back-office and other GCC off-plan markets on the same engine.

## 3. Goals
- **G1 Fast setup** — a deal + its full payment plan created in < 3 minutes.
- **G2 Zero missed milestones** — proactive reminders before every due date.
- **G3 One-glance control** — what's due, overdue, and in escrow, instantly.
- **G4 Production-grade** — secure multi-tenant, scalable, resilient, cross-platform.
- **G5 A premium first run** — onboarding that earns trust and gets the first deal in, fast.

## 4. Non-goals (v1)
CRM/lead-gen, marketing, listing portals, WhatsApp Business API automation, e-signature, accounting. Tracked for later.

---

## 5. Onboarding flow (a stepped, professional first run — NOT a generic 3-slide carousel)
A guided flow with a slim progress indicator ("levels"). Each step earns its place; the user can never get stuck, and an existing user skips straight to Home.

**Step 0 · Splash** — animated brand reveal on the Midnight canvas (gold mark draws in, wordmark settles). Holds only while fonts/session load (< 2s), then routes: signed-in → Home; new → Welcome.

**Step 1 · Welcome** — one strong value statement ("Off-plan deals, handled") + a 3-beat swipeable value carousel (track every milestone · drop the SPA, we read it · never miss a handover). CTAs: *Get started* / *I already have an account*.

**Step 2 · Account Setup** — email sign-up or sign-in (Supabase Auth). On first sign-up, create the user's `org` + `profile` in one transaction. Tokens stored only in secure storage.

**Step 3 · Personalization** — tailors the app and seeds smart defaults:
- Role — *Solo broker* / *Part of a brokerage*.
- Primary market — Dubai (default), room for other GCC later.
- Developers you work with — multi-select (Emaar, Damac, Sobha, Binghatti, Nakheel, Meraas…) → pre-seeds the developer list.
- Typical deal volume — a quick band (1–5 / 6–15 / 16+).

**Step 4 · Permissions & Notifications** — value-framed, not a raw OS prompt: explain *why* ("we'll remind you before every payment is due") then request push (expo-notifications). Offer optional biometric app-lock (expo-local-authentication). Each is skippable; nothing blocks progress.

**Step 5 · Core Education** — three quick teach cards showing the actual value: (1) the payment-plan timeline, (2) SPA upload → auto-filled plan, (3) reminders + portfolio glance. Ends on a single CTA: *Add your first deal* (or *Skip to dashboard*).

**Step 6 · Home / Dashboard** — the Midnight Deck. First-time empty state invites the first deal.

**Flow rules:** progress indicator on steps 1–5; back always available; state persists if the app is closed mid-flow; analytics event per step (drop-off tracking); reduced-motion honored throughout.

---

## 6. Core app (v1 scope)
- **Home / Dashboard** — swipeable Deck of deals + glance metrics (in escrow, due this week, overdue).
- **Deal detail** — the payment-plan "tower" (paid / due / upcoming / overdue), paid-to-date, documents; mark-paid.
- **New deal** — manual entry (always works) **and** AI SPA import: upload SPA PDF → server parses → milestone editor pre-filled → broker confirms before save (never auto-saves; manual fallback on failure).
- **Reminders** — push + email before each milestone; "Share to WhatsApp" prefilled link.
- **Profile/settings** — org, notifications, biometric lock, sign-out.

## 7. Data model (Postgres / Supabase) — `org_id` + RLS on every table
- **orgs** (id, name, created_at)
- **profiles** (id = auth.uid, org_id, full_name, email, role, **onboarding_complete bool**, **persona jsonb** — role/market/volume)
- **developers** (id, org_id, name) — seeded from Personalization
- **deals** (id, org_id, created_by, developer_id, project_name, unit, buyer_name, buyer_email, total_value_aed numeric, spa_number, handover_estimate, status, created_at, updated_at)
- **milestones** (id, deal_id, org_id, seq, label, trigger_type [booking|registration|construction|handover], trigger_value, percent, amount_aed, due_date, paid_date, status [paid|due|upcoming|overdue], source [manual|spa_extracted])
- **documents** (id, deal_id, org_id, name, storage_path `org_id/deal_id/file`, kind, uploaded_at)
- **reminders** (id, milestone_id, org_id, channel, send_at, sent_at, status)

**Indexes:** deals(org_id,status) · milestones(org_id,due_date) · milestones(deal_id,seq) · documents(deal_id) · reminders(status,send_at).

## 8. Security (non-negotiable)
- Tenant isolation via Postgres **RLS** on every table (row visible only when `org_id` = caller's org) — enforced at the database, not the UI.
- **Managed auth** (Supabase) — never hand-rolled. Tokens/PII only in **expo-secure-store**; never AsyncStorage; never in URLs/logs.
- Documents in a **private** bucket, org-scoped paths (SPAs carry passport / Emirates ID / financial data).
- Service-role key server-only; all mutations server-side, Zod-validated (including AI output).

## 9. Reliability — "the top level must not break"
Error boundaries at app + route level with typed fallbacks; every async wrapped; failures surface as clear in-app messages — no silent failures, no white screens. AI extraction degrades to manual entry. Optimistic updates with rollback.

## 10. Scalability & performance — "no lag"
Serverless (Supabase Edge functions) + managed pooled Postgres auto-scale. New Architecture + Hermes; FlashList for lists; animations on the UI thread; lazy-load heavy screens/SDKs; cold start < 2.5s on mid-tier Android.

## 11. Compliance (horizon, not a v1 blocker)
UAE PDPL: storing Emirates ID / passport / financial data may raise data-residency questions at scale — don't architect anything painful to region-move later.

## 12. Success criteria
5 paying Dubai brokers on live deals · onboarding completion ≥ 70% · deal setup < 3 min · zero missed-milestone incidents among active users.
