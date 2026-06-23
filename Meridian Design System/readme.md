# Meridian — Design System

**Meridian is the off-plan deal OS for Dubai real-estate brokers.** Every competing tool
(Reelly, Property Finder, Bayut, PropSpace) stops at the sale. Meridian owns the part nobody
else does: the 2–4 year, construction-linked **payment-plan lifecycle** from SPA → booking
deposit → DLD/Oqood → construction milestones → handover → resale. It reads the SPA, builds
the payment plan, never lets a milestone slip, protects the broker's commission, and keeps the
client relationship warm through handover.

This repository is the **design system** behind the full Meridian mobile redesign — the visual
language, tokens, reusable components, and high-fidelity UI-kit screens. The visual direction
here is **original and owned by this design system** (no prior brand, palette, or codebase was
provided); it was authored from the product brief.

> **Audience of this doc:** a designer or agent building Meridian screens, marketing, or decks.
> Read this, then explore the foundation cards (Design System tab), `components/`, and
> `ui_kits/meridian-app/`.

---

## Sources & provenance

- **No external codebase, Figma, or brand kit was provided.** The brief described the *product*
  (users, flows, screens, states, UX bar) and explicitly handed over 100% of the visual design.
- All visual decisions — color, type, spacing, motion, iconography, logo, illustration approach —
  originate here and are documented below so they stay consistent as the product grows.
- Domain language is real Dubai off-plan terminology (SPA, DLD, Oqood, escrow, RERA, handover,
  assignment, Article 11) — used precisely, never decoratively.

---

## The idea behind the look — "Instrument grade"

A broker is flying a 3-year instrument approach with no autopilot. Meridian is the cockpit.
The aesthetic is **precise, calm, and warm** — an instrument you trust with money and dates,
not a flashy consumer app. Three commitments:

1. **Warm paper, not cold grey.** The surface is a warm off-white (`--paper`) so long timelines
   feel like a well-kept ledger, not a spreadsheet. A deep **jade-ink** dark theme ("Midnight
   Meridian") is the considered version of the old dark baseline.
2. **Money lives in green; time is amber.** Jade is the brand *and* "paid" — the product is
   money-positive. **Meridian Amber** (sun at its meridian) is the single spark, reserved for
   "due / act now" moments. This keeps status reading instant.
3. **The meridian line.** The signature motif is a thin horizontal rule with a marker dot — a
   deal's multi-year arc with a "you are here." It recurs in the logo, timelines, and progress.

---

## CONTENT FUNDAMENTALS — how Meridian writes

**Voice: broker-to-broker.** Confident, calm, concrete. The app talks like a sharp colleague who
has done a thousand deals, not like a bank or a legal team. It never panics, never hedges, never
upsells.

- **Person.** Address the broker as **"you"**; the app refers to itself rarely and never as "I".
  Buyers/clients are "your buyer", "the client", named where known ("Khalid's payment").
- **Casing.** **Sentence case everywhere** — buttons, titles, menus ("Mark as paid", "What's due").
  Reserve UPPERCASE for short eyebrows/overlines only (`AED`, `DUE THIS WEEK`, section labels),
  tracked out (`--tracking-caps`). Never Title Case headings.
- **Tense & length.** Present tense, active voice, short. Labels are 1–3 words
  ("Add deal", "Nudge buyer", "Mark paid"). Sentences rarely exceed ~12 words.
- **Numbers & money.** Always **AED** with thousands separators and tabular figures
  (`AED 1,250,000`). Percentages are whole or one-decimal (`20%`, `4%`). Dates are
  `12 Aug 2026` (never US format). Construction-linked dates that aren't known yet read
  **"on 60% build"** or **"~Q3 2026 (est.)"** — never a fake date.
- **Status is always a word + an icon, never color alone.** "Overdue", "Due in 3 days",
  "In grace — 4 days left", "Paid 12 Aug". AI confidence is "High / Med / Low", never a bare %.
- **Compliance = guardrails, not law.** Frame as help: "Oqood registration is due within 90 days
  of the SPA — 41 days left." Always add a quiet "Not legal advice" where a real obligation is
  surfaced.
- **Empty/first-run never blank.** "Nothing due today — you're ahead." "This is a sample deal so
  you can see how Meridian works. Add your own when you're ready."
- **Errors are recoverable & specific.** "Couldn't read this page of the SPA. Enter these
  fields manually — the PDF stays open beside you." Never "Something went wrong."
- **No emoji. No exclamation marks** beyond the rare genuine win ("Plan built. 9 milestones
  tracked."). No marketing fluff inside the product.

**Microcopy examples**
| Context | Copy |
|---|---|
| Primary CTA, first run | `Add your first deal — upload the SPA` |
| AI review header | `Check what we read. Tap any field to see its source.` |
| Money field confirm | `Confirm amount` · `AED 250,000` |
| Low confidence field | `Low confidence — please verify` |
| Overdue milestone | `Overdue by 6 days · DLD 4% fee` |
| Construction-linked | `Due on 60% build · est. Q3 2026` |
| Notification soft-ask | `Want a heads-up before each milestone? We'll only ping you when money or dates move.` |
| At-risk early warning | `Act now — assignment is still possible before a default notice.` |
| Arabic (RTL) example | `مستحق خلال ٣ أيام` (digits stay Eastern-Arabic-or-Latin per locale, never reversed) |

---

## VISUAL FOUNDATIONS

### Color
- **Theme:** warm-paper **light** is primary; **dark** ("Midnight Meridian", deep jade-ink) is a
  first-class peer via `[data-theme="dark"]`. Both pass WCAG-AA for text and status.
- **Brand / action / paid:** **Jade** `--jade-500 #0E6E5C` (hover `--jade-600`, press `--jade-700`).
  Money-positive — "paid" reuses the jade family.
- **Signature accent:** **Meridian Amber** `--amber-500 #E0922F`, used *sparingly* — "due soon",
  the active timeline marker, one highlight per screen. Amber-on-light text uses `--amber-600`.
- **Deep ink:** `--jade-800 #0A2E2A` for hero panels in light mode and the dark base.
- **Status ramps**, each `{solid, text, bg}`: paid (jade), due (amber), upcoming (slate
  `#41607A`), overdue (terracotta `#C0432B`), critical/at-risk (deep red `#A3231B`, always
  paired with a hatch pattern + icon — never color alone).
- **Neutrals are warm** (greige), not blue-grey: `--paper`, `--sand`, `--line-100`, `--ink-900…300`.
- **Never** introduce blue-purple gradients or new hues — extend via `color-mix`/oklch off the
  jade & amber ramps.

### Typography
- **Display — Bricolage Grotesque** (700/800): hero numerics (the "what's due" total), screen
  titles. Tight tracking (`-0.02em`).
- **UI / body — Hanken Grotesk** (400/500/600): every functional element. Neutral, legible at
  small sizes.
- **Data — JetBrains Mono** (500/600), tabular: AED amounts, IBANs, DLD project numbers, Oqood
  certs — anything you'd verify digit-by-digit.
- **Arabic — IBM Plex Sans Arabic**: full RTL. Layout allows **~25% text expansion**; never mirror
  digits; currency stays `AED`.
- Scale lives in `tokens/typography.css` (`--fs-display 34 → --fs-micro 11`). 24px text is the
  comfortable title; 16px body; never below 11px.

### Spacing, radii, sizing
- **4px grid** (`--sp-1 … --sp-16`); 16–20px is the default screen/gutter rhythm.
- **Radii:** chips `--r-xs 6`, inputs `--r-sm 10`, buttons/rows `--r-md 14`, cards `--r-lg 18`,
  sheets `--r-xl 24 → --r-2xl 32`, pills `999`. Moderate and consistent — precise, not bubbly.
- **Touch:** every interactive target ≥ `--tap-min 44px`; primary CTAs are `--ctrl-lg 56px`.
  Core actions are 1–2 taps.

### Backgrounds & surfaces
- Flat warm paper. **No photographic backgrounds, no noisy gradients.** The only gradients are
  functional **scrim** fades (`--scrim-top/bottom`) under sticky headers and the bottom nav so
  content dissolves cleanly. Hero panels use solid `--surface-ink` with a faint meridian-line
  motif, never a decorative gradient.

### Cards & elevation
- A card = **hairline border (`--border-hair`) + soft warm shadow**. Shadows are tinted with the
  jade-ink (`--shadow-color`), never pure black, so they sit naturally on paper.
- Elevation ladder: `--shadow-xs` (chips) → `sm` (resting cards) → `md` (raised/active) →
  `lg` (popovers) → `sheet` (bottom sheets). Dark theme deepens the tint.

### Borders & dividers
- 1px hairlines (`--line-100`), strong borders (`--line-200`) for inputs/segmented controls.
  List rows are divided by faint `--line-50` insets, not full-width hard rules.

### Transparency & blur
- Reserved for **chrome**: sticky headers and the bottom nav use `--blur-bar`
  (`saturate(1.4) blur(18px)`) over a translucent paper fill. Content surfaces stay opaque for
  legibility. Overlays/scrims use `--overlay` (jade-ink at 55%).

### Motion
- **Calm, quick, no bounce.** `--dur-1 120ms` (press/toggle) → `--dur-4 360ms` (large surfaces);
  arrivals use `--ease-out`, exits `--ease-in`. Rows/sheets **fade-up** (`mer-fade-up`).
- **Confirming money** triggers one `mer-confirm-pulse` jade ring — a single, satisfying beat,
  never a loop. Skeletons **shimmer** while loading. Everything respects
  `prefers-reduced-motion`.

### Interaction states
- **Hover** (pointer/desktop preview): surfaces lift one shadow step + 4% darken; links/icons go
  to `--action-hover`.
- **Press:** scale to `0.98` + move to `--action-press` / `--surface-sunk`. Fast (`--dur-1`).
- **Focus:** `--ring` (3px jade tint halo) on `:focus-visible`. Always visible, never removed.
- **Disabled:** `--ink-300` text, no shadow, `cursor: not-allowed`, 60% opacity on fills.
- **Selected/active:** jade text + a 2px jade underline or left-rule; bottom-nav active item
  fills with `--jade-50` pill + jade icon.

### Layout rules
- Mobile canvas `--content-max 440px`. Fixed: a **blurred status/title header** (top) and a
  **bottom tab bar** (`--bottom-nav-h 64px` + safe-area). Primary actions dock bottom-right
  (FAB) or as a full-width bottom CTA. Content scrolls between the two fixed chrome zones.
- **RTL:** mirror the entire layout, nav order, directional icons (chevrons, progress, back),
  and timeline direction. Use logical properties / `[dir="rtl"]` overrides; never hard-code
  left/right for directional UI.

---

## ICONOGRAPHY

- **Library: [Lucide](https://lucide.dev)** (loaded from CDN — `lucide@latest`). Chosen for its
  even **2px stroke**, rounded line caps, and geometric clarity, which match the
  instrument-grade, hairline aesthetic. No solid/filled icon set is used for line icons; fills
  appear only inside status dots and the logo.
  > **Substitution flag:** Lucide is a CDN stand-in for a future bespoke set. If/when custom icons
  > are commissioned, keep the 2px stroke, 24px grid, and rounded caps so swaps are 1:1.
- **Size grid:** 24px default, 20px in dense rows, 18px inline with `--fs-label`. Stroke stays
  ~2px (`stroke-width:1.75–2`); color inherits `currentColor`.
- **Domain glyphs (Lucide names):** `file-text` (SPA), `landmark` (DLD/escrow),
  `badge-check` (Oqood/verified), `building-2` (project), `hard-hat`/`construction` for
  construction-linked, `calendar` for time-linked, `banknote`/`receipt` (money),
  `bell` (reminders), `message-circle` (WhatsApp nudge), `shield-alert` (risk/Article 11),
  `users` (client). Directional: `chevron-right`/`-left` (mirror in RTL).
- **Status pairing rule:** every status/confidence icon ships with a text label — icons reinforce,
  never replace, the word (accessibility + color-blind safety).
- **Emoji:** never used. **Unicode symbols:** avoided as UI icons (only `·` as a dot separator and
  `~` for estimates in copy).
- **Logo:** `assets/meridian-mark.svg` (ring + meridian line + amber progress marker) and
  `meridian-wordmark.svg` / `-dark.svg`. The mark uses `currentColor` — tint it `--jade-500` on
  light, `--jade-200` on dark; the progress dot stays amber.

---

## Illustration & imagery

- **No stock photography, no AI illustrations, no 3D blobs.** When a screen needs visual interest
  (empty states, onboarding), use the **meridian-line motif** rendered from tokens: a hairline arc
  with milestone ticks and the amber marker. Project "photos" in mockups are represented by a
  warm `--sand` placeholder block with a `building-2` glyph — clearly a placeholder, never faked.

---

## INDEX — what's in this repository

**Foundations (root)**
- `styles.css` — the single entry point (consumers link this). `@import`-only.
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `elevation.css`,
  `motion.css`, `base.css`.
- `guidelines/*.card.html` — foundation specimen cards (Design System tab).
- `assets/` — logo mark + wordmarks (SVG). Icons load from the Lucide CDN.

**Components** (`components/<group>/` — each: `Name.jsx`, `Name.d.ts`, `Name.prompt.md`, one card)
- `forms/` — Button, IconButton, Input, Select, Switch, Checkbox, SegmentedControl
- `data-display/` — Card, Badge, StatusPill, Avatar, ProgressMeter
- `money/` — Amount (AED), MilestoneRow
- `ai/` — ConfidenceCue, FieldReviewRow
- `feedback/` — Toast, Sheet
- `navigation/` — TabBar, AppHeader

**UI kit** (`ui_kits/meridian-app/`) — high-fidelity click-through of the redesigned app:
the **"What's due" home** and the **AI SPA review** screen (the two signature moments), plus
onboarding, add-deal, deal detail, nudge composer, settings, an **Arabic / RTL** screen, and key
states (empty, loading, overdue, in-grace, at-risk, low-confidence AI, sample-data).

**Skill** — `SKILL.md` makes this folder usable as a downloadable Claude Skill.

---

### Font substitution (action needed)
Display/UI/mono/Arabic fonts currently load from **Google Fonts CDN** (Bricolage Grotesque,
Hanken Grotesk, JetBrains Mono, IBM Plex Sans Arabic). For offline/production builds, replace the
`@import` in `tokens/fonts.css` with self-hosted `@font-face` binaries. **If you have licensed
brand fonts, send them and I'll swap these.**
