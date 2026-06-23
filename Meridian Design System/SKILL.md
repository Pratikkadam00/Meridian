---
name: meridian-design
description: Use this skill to generate well-branded interfaces and assets for Meridian — the off-plan real-estate deal OS for Dubai brokers — either for production or throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, assets, and UI-kit components for prototyping.
user-invocable: true
---

# Meridian design skill

Read `readme.md` first — it is the full design guide (brand idea, content fundamentals, visual
foundations, iconography, and a file index). Then explore the other files.

## What's here
- `styles.css` — the single CSS entry point. Link it and you get every token + webfont.
- `tokens/` — colors, typography, spacing, elevation, motion (CSS custom properties).
- `components/` — React UI primitives (Button, Input, StatusPill, ConfidenceCue, MilestoneRow,
  Amount, TabBar, Sheet, …). Each has a `.jsx`, a `.d.ts` props contract, and a `.prompt.md`.
- `ui_kits/meridian-app/` — full click-through app: the "What's due" home and the AI SPA-review
  screen are the signature views; also onboarding, deal detail, nudge composer, settings, EN/AR.
- `guidelines/` — foundation specimen cards.
- `assets/` — the Meridian logo (mark + wordmarks). Icons are Lucide (CDN).

## How to design with it
- **Voice:** broker-to-broker — confident, calm, concrete. Sentence case. AED with tabular
  figures. Status is always icon + word + color (never color alone). No emoji.
- **Look:** warm paper + deep jade-ink; jade is brand & "paid", amber is the single "due/act-now"
  spark; Bricolage Grotesque display, Hanken Grotesk UI, JetBrains Mono for money/IDs, IBM Plex
  Sans Arabic for RTL. Cards = hairline border + soft warm shadow. Calm motion, no bounce.
- **Bilingual:** mirror layout/nav/icons for Arabic; allow ~25% text expansion; never reverse
  digits; keep currency as AED.

If creating visual artifacts (slides, mocks, throwaway prototypes), copy assets out and create
static HTML files for the user to view — link `styles.css`, load `_ds_bundle.js`, and read
components via `window.MeridianDesignSystem_*` (run the design-system check to confirm the exact
namespace). If working on production code, copy assets and apply the rules here to design as a
Meridian brand expert.

If invoked with no other guidance, ask what the user wants to build, ask a few sharp questions,
then act as an expert designer who outputs HTML artifacts **or** production code as needed.
