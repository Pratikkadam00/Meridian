# Meridian — App UI kit

A high-fidelity, click-through recreation of the redesigned Meridian mobile app, built
entirely from this design system's tokens + components.

## Run it
Open `index.html`. A screen-picker rail sits beside the phone; the **EN / عربى** and
**Light / Dark** toggles re-render the whole app (full RTL mirroring + Midnight Meridian theme).

## Screens
| File | Screens |
|---|---|
| `screens-core.jsx` | **Portfolio "What's due" home** (signature), **Deal detail**, mark-paid sheet |
| `screens-ai.jsx` | **AI SPA review/confirm** (signature — PDF source highlighting, per-field confidence, explicit money/date confirm), SPA upload + scan state, manual fallback |
| `screens-misc.jsx` | Passwordless auth, age+terms gate, onboarding context question, add-deal chooser, notification primer (soft-ask), nudge composer (EN/AR templates), settings |
| `app-data.jsx` | Sample portfolio, `Icon` (Lucide) helper, AED formatter, EN/AR strings |
| `index.html` | Phone frame, router, picker rail, EN/AR + light/dark toggles |

## Signature moments
- **What's due home** — hero "due this week" total on an ink panel with the meridian-line
  motif, an at-risk early-warning banner, and one-tap *Mark paid* / *Nudge* on every row.
- **AI SPA review** — the source PDF stays pinned at the top; tapping a field slides an amber
  highlight onto its origin in the document; money & low-confidence fields require an explicit
  confirm; a validation banner reconciles installments to 100% / total price; the CTA stays
  disabled until everything's confirmed.

## States represented
Sample-data badge, overdue, in-grace, at-risk, low-confidence AI (terracotta), not-found field
(manual fallback), scanning/loading, success toasts, empty milestone fallback, RTL, dark.

## Notes
These are cosmetic recreations: data is static, the "PDF" is a styled stand-in, and timers fake
the scan. All visuals come from the real tokens + bundle components — nothing is re-implemented
locally. Lucide icons load from CDN.
