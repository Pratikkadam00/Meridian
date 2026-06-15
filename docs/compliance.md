# Meridian — Legal & Data-Protection Compliance

> ⚠️ **Not legal advice.** This is an engineering compliance posture, written to
> make the product defensible and to give a lawyer a clear map. **Have a
> qualified UAE / DIFC data-protection lawyer review the privacy policy, terms,
> and a Data Processing Agreement before launch.** Nothing here is a guarantee
> against legal risk; it is the technical groundwork that reduces it.

## 0. TL;DR — Meridian's actual risk profile

- **Meridian is B2B for licensed adult real-estate brokers** — not a consumer or
  kids product. The "under-13 / COPPA" stories you read about are consumer apps
  (games, social) with no age gate. **That risk is low here**, and we close it
  explicitly (18+ requirement, not directed at children, no knowing collection).
- **The real exposure is two things:**
  1. **UAE PDPL** (Federal Decree-Law No. 45/2021) — personal data of brokers.
  2. **Sensitive third-party data** — uploaded **SPA PDFs contain buyers'
     passport / Emirates-ID / financial details.** Here the broker is the data
     **controller** and Meridian is a **processor** — this needs a DPA, data
     minimization, retention limits, and strong security (most already in place).
- Plus the standard **app-store + website** requirements (privacy policy,
  account deletion, data-safety labels, cookie/analytics disclosure).

## 1. Children / minors (the specific worry)

- Meridian is **not directed at children** and is marketed only to professional
  brokers. We do **not knowingly collect data from anyone under 18.**
- **Controls:**
  - Terms require users to be **18+** and using the service in a professional
    capacity; sign-up records acceptance of the Terms + Privacy Policy.
  - The privacy policy states the service is not intended for under-18s and that
    we delete any such data if discovered.
  - The marketing **waitlist** page carries the same 18+ statement.
- **COPPA (US):** not applicable — not a US-child-directed service and no knowing
  collection from under-13s. **UAE PDPL / GDPR-minors:** processing a minor's
  data needs guardian consent; we avoid this by design (adults only).

## 2. Applicable frameworks

| Framework | Relevance |
|---|---|
| **UAE PDPL** (FDL 45/2021) | Primary — personal data of UAE-based brokers + buyers. |
| **DIFC DP Law 2020 / ADGM** | If incorporated in / operating from a free zone — confirm with counsel. |
| **GDPR** | Only if you process EU residents' data; good-practice baseline regardless. |
| **Apple App Store / Google Play** | Privacy policy URL, data-safety/nutrition labels, **in-app account deletion**, age rating. |
| **Dubai RERA / DLD** | Meridian is a *tracking* tool, not a broker-dealer/escrow — limited direct obligation, but it handles regulated transaction data. |
| **AML/KYC** | Not a financial institution; no funds move through Meridian → no direct AML duty, but don't add payment processing without re-assessing. |

## 3. Data inventory

| Data | From whom | Why (lawful basis) | Where | Retention |
|---|---|---|---|---|
| Broker email, name, role, persona, org | The broker (user) | Contract — to provide the service | Supabase `profiles`/`orgs` (RLS) | Until account deletion |
| Deal data: project, buyer **name/email**, value, milestones | The broker (about their deal/buyer) | Broker's lawful basis as controller; Meridian = processor | Supabase `deals`/`milestones` (RLS) | Until broker deletes the deal / account |
| **SPA PDFs** (may contain **passport, Emirates ID, financial** data) | Uploaded by the broker | Processor on the broker's instruction | **Private** org-scoped Storage bucket | Until deletion (see §6 — add retention/cleanup) |
| Push tokens | Device | Consent (notifications opt-in) | Supabase `push_tokens` | Until logout / token rotation |
| Telemetry: Sentry errors, analytics events | Automatic | Legitimate interest (reliability) — **PII-redacted** | Sentry / PostHog | Per provider policy |
| Waitlist email/name/brokerage (website) | Visitor | Consent (early-access contact) | Supabase `waitlist` (anon-insert-only) | Until launch / unsubscribe |

## 4. Controller vs processor

- **Broker account data:** Meridian is the **controller**.
- **Buyer data inside deals/SPAs:** the **broker/brokerage is the controller**;
  **Meridian is the processor**, acting only on their instruction. → Provide a
  **Data Processing Agreement (DPA)** in the Terms / a separate addendum (lawyer
  to draft), covering: processing only on instruction, confidentiality,
  security, sub-processors (Supabase, Groq, Expo, Sentry, Resend), breach
  notification, deletion/return on termination.

## 5. Data-subject rights (PDPL) — how we honor them

| Right | Implementation |
|---|---|
| **Access / portability** | Export the user's org data (JSON) — *to build.* |
| **Rectification** | Edit profile/deals in-app. |
| **Erasure** | **In-app "Delete account & data"** → cascade-deletes org, profiles, deals, milestones, documents, reminders, storage objects, and the auth user. *(Implemented — see Settings.)* Also satisfies **Apple/Google's mandatory account-deletion** rule. |
| **Restriction / objection** | Disable notifications; contact route in privacy policy. |
| **Withdraw consent** | Notifications toggle; waitlist unsubscribe link. |

## 6. Data minimization & retention (the sensitive-PII piece)

- SPA PDFs hold regulated PII — minimize and time-bound:
  - Bucket is **private + org-scoped**; only the owning org can read.
  - **Add:** a scheduled cleanup of **orphaned** storage objects (uploads with no
    saved deal) after N hours, and deletion of a deal's documents when the deal
    or account is deleted. *(Cascade on account delete done; orphan-sweep TODO.)*
  - Don't log SPA contents; don't put any PII in URLs (enforced).
  - Consider not retaining the raw PDF after extraction if the broker doesn't
    need it — store the extracted plan, drop the file (policy decision for you).

## 7. Security controls (in place)

- **RLS tenant isolation** on every table (verified live: cross-org access blocked).
- **TLS** enforced (HTTPS + host allowlist); Supabase encrypts at rest.
- **Secrets server-only** (service-role, Groq) — never in the app; app crashes if
  a service-role key is mis-prefixed `EXPO_PUBLIC_`.
- **PII redaction** in logs/Sentry (emails, tokens, names, buyer/phone fields).
- **Private storage**, org/deal-scoped paths.
- **AI guardrails** (`docs/ai-constitution.md`) — prompt-injection-tested.
- **Pending (pre-launch):** certificate pinning + device attestation
  (`docs/security-hardening.md`); breach-response runbook.

## 8. Disclosures (must publish before launch)

- **Privacy Policy** (app + site) — data collected, purposes, lawful basis,
  processors/sub-processors, retention, rights + how to exercise, contact,
  18+/no-children statement, international transfer note (Supabase region:
  ap-southeast-2 / Sydney — disclose cross-border transfer for UAE users).
- **Terms of Service** — 18+/professional use, acceptable use, IP, "as-is",
  liability limit, the controller/processor + DPA terms.
- **Cookie/analytics notice** — use cookieless analytics where possible.
- The website spec (`meridian-WEBSITE.md` §9) already scaffolds these as
  **lawyer-review templates**.

## 9. App-store specifics

- **In-app account deletion** — *implemented* (required by Apple 5.1.1(v) & Google).
- **Privacy nutrition labels (Apple) / Data safety (Google)** — declare: email,
  name, user content (PDFs), identifiers (push token), diagnostics. Mark data
  encrypted in transit; deletion available.
- **Age rating:** 17+/Business (not for children).
- **Privacy policy URL** in both store listings.

## 10. International data transfer

Supabase project is in **Sydney (ap-southeast-2)** and Groq/Expo/Sentry are US-based.
For UAE/PDPL, **cross-border transfer must be disclosed** and have an adequate
basis (consent/contractual safeguards). Options: disclose + consent in the
privacy policy (simplest), or move the Supabase project to a UAE/closer region.
**Lawyer to confirm the basis.**

## 11. Compliance checklist

**Done (engineering):**
- ✅ RLS tenant isolation, encryption in transit, private buckets, secret hygiene, PII redaction.
- ✅ **In-app account & data deletion** (erasure) + cascade.
- ✅ **18+ / Terms + Privacy acceptance** captured at sign-up.
- ✅ AI guardrails + injection testing.

**To build (engineering):**
- ⬜ Orphaned-SPA storage sweep (data minimization).
- ⬜ Data export (portability).
- ⬜ Cert pinning + device attestation (pre-launch).
- ⬜ Breach-response runbook.

**Needs you / a lawyer (cannot be done in code):**
- ⬜ **Privacy Policy + Terms + DPA** drafted/reviewed by a UAE/DIFC lawyer.
- ⬜ Cross-border-transfer basis confirmed (or move region).
- ⬜ App-store data-safety/nutrition forms filled at submission.
- ⬜ Decide raw-PDF retention policy (keep vs drop-after-extract).
- ⬜ Appoint a data-protection point of contact; breach-notification process.

## 12. If a breach happens

PDPL requires notifying the regulator (and affected people where high-risk)
without undue delay. Keep: an incident log, the ability to identify affected
orgs (RLS scoping helps), and a templated notice. Build the runbook before launch.
