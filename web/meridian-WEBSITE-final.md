# Meridian — Website Build Prompt (FINAL)
**For:** Claude Code / Codex. **Visual contract:** `meridian-site-v4.html` (match it). **Deliverable:** a modern multi-page marketing site + working waitlist + legal pages, deployed on Vercel. *This supersedes the earlier warm-canvas website prompt.*

> Build the site shown in `meridian-site-v4.html`. It is bold, editorial, and **not generic AI slop** — deep green canvas, a single lime accent, bold-sans/italic-serif headlines, hand-drawn annotations, and a signature **tower hero** (the building *is* the payment plan). Read §3 (system) and §4 (anti-slop) before writing anything, and reuse the copy in §6 verbatim.

## 1. What Meridian is (don't embellish past this)
A deal manager for **Dubai off-plan brokers**. It tracks the construction-linked payment plan on every deal — booking → DLD/Oqood → construction milestones → handover — reads the plan from an uploaded SPA, and reminds the broker before every payment. Bilingual (EN/AR). The product UI is dark ("Midnight" — obsidian + champagne gold). The site is **pre-launch**: its job is to explain the product simply and **capture a waitlist**.

## 2. Stack & deploy
**Next.js (App Router) + TypeScript**, static-first. Styling: Tailwind with a **fully custom theme** from §3 tokens (no default component look). Fonts via `next/font/google`: **Bricolage Grotesque**, **Fraunces** (incl. italic), **Inter**, **JetBrains Mono**, **Caveat**. Waitlist → **Supabase** via a Server Action (§9). Analytics: **Vercel Analytics / Plausible** (cookieless). Deploy: **Vercel**.

## 3. Design system (the approved direction)
```
/* dark canvas */ --green:#0f2a1f  --green-deep:#0a2016  --green2:#16382a  --gline:rgba(241,236,225,.13)
/* light bands */ --bone:#f1ece1  --paper:#f4f0e6  --ink:#15150f  --ink-soft:#4f4f42
/* accent */      --lime:#c8e85c  --lime-deep:#9bbf3e         (the ONE accent — scarce)
/* architectural / app UI */ --gold:#c8a96a  --gold-bright:#e3c884  --gold-deep:#a6854a
/* muted on green */ --sage:#9fb3a8
```
- **Type:** display = **Bricolage Grotesque** 800 (oversized, uppercase, tight) with an **italic Fraunces** turn on the last line of headlines; body = **Inter**; labels/eyebrows = **JetBrains Mono** (uppercase, tracked); hand-drawn notes = **Caveat**.
- **Rhythm:** alternate surfaces — green (hero, statement) → green-deep (stats) → cream/bone feature bands → green (closing) → green footer. **Torn-paper edges** between green and light.
- **The tower motif** (the brand's signature) recurs lightly: a faint **blueprint grid** + **grain** on the green sections; the architectural tower with milestone ticks is the hero; the gold "payment tower" appears again in a feature.
- **Footer is fixed — do not redesign it:** the giant **Meridian** wordmark (lime dot on the *i*) bleeding full-width, a bone card overlapping it (tagline + Product/Legal columns + the rotating "BUILT FOR DUBAI OFF-PLAN · EST. 2026" stamp). Exactly as in `meridian-site-v4.html`.

## 4. Anti-slop rules (read first)
**Do:** oversized serif/sans headlines with intent; concrete Dubai off-plan language (SPA, DLD, Oqood, handover); editorial asymmetry; green canvas + **lime only** on the live milestone and CTAs; hand-drawn annotations; real layered backgrounds (blueprint grid, glow, grain).
**Don't:** buzzwords (*seamless, revolutionary, transform, empower, leverage, unlock, supercharge, next-gen, elevate*); pure-white/cool-gray backgrounds; a second accent hue; glassmorphism, gradient blobs, floating 3D, neon; centered-template heroes; a phone-mockup hero; stock-screenshot heroes; two identical surfaces back-to-back.

## 5. The hero (signature — build to match `meridian-site-v4.html`)
**Concept:** off-plan payments are tied to construction height, so the hero visual is an **architectural elevation of a tower** with the payment milestones marked up its height — booking at the base, DLD, the construction stages, handover at the crown, with the **due milestone lit in lime**. Headline and visual say the same thing.
- **Background, layered (not flat):** deep-green gradient + a **faint blueprint grid** (46px, radial-masked) + a soft gold **glow** behind the tower + fine **grain**. No photo required.
- **Left:** mono eyebrow → oversized kinetic headline `Every floor / is a payment. / `*`Track every one.`* (last line italic Fraunces, lime) → sub → inline email + lime **Join the waitlist**.
- **Right:** the SVG tower (full-height, gold line-art, floor lines, a lime "currently building" band) with milestone chips (mono label + amount) ticking to floors; the live one in lime ("40% built — due · in 5 days").
- **Motion:** headline lines **rise in** on load (stagger), then tower fades and milestone chips slide in; a "Scroll ↓" cue. Honor reduced-motion.
- **Optional cinematic upgrade (only with real footage):** the same headline can sit over a slow Dubai-construction video/photo loop. Not required — the tower stands alone.

## 6. Sitemap + copy (use verbatim)
Pages: `/` (home — the full v4 page), `/how-it-works`, `/about`, `/early-access`, `/join`, `/privacy`, `/terms`, `/cookies`.
**Home sections (in order), matching v4:**
1. **Hero** (§5).
2. **Statement** (green): "You've outgrown *the spreadsheet.*" · *"A deal that takes three years to close needs more than a row in Excel and a date in your head."*
3. **Stats** (green-deep, torn edge in, **real broker photography** behind each): **60%** *of Dubai sales are off-plan* · **Every dirham** *tracked against the DLD schedule* · **0** *missed deadlines*.
4. **"A plan that reads itself."** (cream) — SPA→plan; product card + hand-drawn scribble + *"read from your SPA ✓"*.
5. **"A step ahead of every deadline."** (bone) — reminders; "Due this week AED 412,000" card + hand-drawn rising arrow.
6. **"Every milestone you can see coming."** (cream) — the payment tower; card **flies in**.
7. **"Payments that never slip."** (bone) — confirmed-payments list; hand-drawn **checkmarks** tick on.
8. **Closing** (green): "You've mastered the deal. Now master *the timeline.*" + waitlist.
9. **Footer** (fixed, §3).
Other pages reuse these sections/components; `/early-access` frames **founder pricing** with **no checkout** (CTA = Join the waitlist); `/join` is the form on a calm green page.

## 7. Animations (match v4; all perf-friendly, reduced-motion honored)
- **Kinetic hero** headline (rise-in stagger) + tower/chips reveal.
- **Scroll reveals** (fade + 22px rise) on every section.
- **Draw-on hand annotations** — SVG `pathLength="1"` + `stroke-dashoffset` 1→0 on scroll (the scribble, the rising arrow, the connector, the checkmarks; stagger the checkmarks).
- **Torn-paper edges** (inline SVG) between green and light bands.
- **Card fly-in** on the payment-tower feature.
- Use IntersectionObserver (or Framer Motion); no parallax-heavy or autoplay gimmicks.

## 8. Photography (the one thing code can't fake — commission or license)
- **Stats band:** 3 duotone (green-toned) **portraits of Dubai brokers / property professionals** — at a handover, at a desk, on site. Mandatory for that band to land; placeholders are marked in v4.
- **Optional hero footage:** one slow overhead or cinematic **Dubai off-plan construction / skyline** clip or still, if going cinematic.
- Until shot: keep the tower hero (no photo) and the marked placeholders. Don't fake it with AI art.

## 9. Waitlist (Supabase)
```sql
create table public.waitlist(
  id uuid primary key default gen_random_uuid(),
  email text not null, full_name text, brokerage text, source text,
  created_at timestamptz not null default now(), unique(email));
alter table public.waitlist enable row level security;
create policy "anon can join waitlist" on public.waitlist
  for insert to anon with check (true);
```
Submit via a **Server Action**: Zod-validate the email, insert with supabase-js, handle the unique violation gracefully ("You're already on the list"), honeypot + per-IP rate-limit, warm inline success state. **Email never in a URL.** Anon key client-side only; service-role key never shipped.

## 10. Legal (templates — flag for lawyer review, UAE PDPL aware)
`/privacy` (waitlist email/name/brokerage + cookieless analytics; used only for early-access contact; no selling; storage Supabase; access/delete/unsubscribe rights), `/terms` (waitlist ≠ guaranteed access/pricing/date; acceptable use; IP; "as is"; changes), `/cookies` (essential + cookieless analytics only). Each carries a visible "Template — review with a lawyer. Not legal advice." note.

## 11. SEO / performance / accessibility
Per-page metadata + OpenGraph + `sitemap.xml` + `robots.txt` + favicons + JSON-LD `Organization`. Static generation; `next/image`; Lighthouse ≥ 95. One `<h1>` per page, semantic landmarks, visible **lime** focus rings, WCAG-AA contrast (body text is `--ink`/`--bone`, never lime on cream for small text), reduced-motion honored, mobile nav + stacked layouts (hero tower hides on mobile as in v4).

## 12. Phased build order
1. Scaffold (Next + TS + Tailwind custom theme + fonts) + layout (nav + the fixed footer) + primitives (Button, Section, Eyebrow, the email-capture, Surface).
2. **Hero** — the tower SVG + layered background + kinetic headline (the signature; get it right first).
3. Home sections 2–8 with the §6 copy + the product UI cards + hand-drawn annotation SVGs.
4. Animations pass (draw-on, torn edges, fly-in, reveals) + reduced-motion.
5. Waitlist (Supabase table + Server Action + states).
6. Other pages (how-it-works / about / early-access / join) + legal.
7. SEO + a11y + Lighthouse + responsive.

## 13. Guardrails
Match `meridian-site-v4.html`; green canvas + **lime-only** accent + bold-sans/italic-serif; **no phone-mockup hero, no AI-art, no buzzwords**; the **footer is fixed**; waitlist persists to Supabase (email never in URL, anon key only); legal pages are flagged templates; cookieless analytics; reduced-motion honored; Lighthouse ≥ 95.
