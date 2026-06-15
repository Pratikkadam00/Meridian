# Meridian — Website Build Prompt
**For:** Claude Code / Codex. **Deliverable:** a modern, multi-page marketing website with a working waitlist and full legal pages. **Deploy:** Vercel.

> Build a premium, editorial marketing site for **Meridian** — a deal manager for Dubai off-plan real-estate brokers. The app is still in build; **the website's job right now is to explain the product simply and capture a waitlist.** It must look intentional and editorial — **not generic AI-startup slop.** Read §4 (anti-slop rules) before writing a single line, and use the **exact copy in §6** rather than inventing marketing language.

---

## 1. What Meridian is (so copy stays accurate — don't embellish past this)
Meridian tracks the **construction-linked payment plan** on every Dubai off-plan deal — booking → DLD/Oqood registration → construction milestones → handover. You add a deal (or **drop the SPA PDF and it reads the payment plan for you**), and it **reminds you before every milestone is due**, with the whole portfolio in one glance. It's bilingual (English + Arabic), built for the Dubai/GCC off-plan workflow that generic CRMs and US tools don't cover. The product UI is dark ("Midnight" — obsidian + champagne gold).

## 2. Stack & deployment
- **Next.js (App Router) + TypeScript.** Static-first (SSG); fast, SEO-clean.
- **Styling:** Tailwind **with a fully custom theme** built from the tokens in §3 — OR CSS Modules. Either way, **no default component-library look.** Custom tokens only; no off-the-shelf hero/feature components.
- **Fonts:** `next/font/google` — **Fraunces** (serif display), **Inter** (body), **JetBrains Mono** (eyebrows/labels). Self-hosted via next/font (no FOUT).
- **Waitlist:** **Supabase** `waitlist` table via a Next.js **Route Handler / Server Action** (server-side insert + validation; see §7).
- **Analytics:** **Vercel Analytics** or **Plausible** — cookieless/privacy-first (keeps the cookie banner minimal and PDPL-friendly).
- **Deploy:** Vercel. Env vars for Supabase URL + anon key.

## 3. Design system — warm editorial, reskinned to Meridian's brand
Adapt the warm-canvas reference (cream canvas, serif display, dark-surface sections, single scarce accent, cream→dark pacing, 96px section rhythm) — **but use Meridian's brand, not Anthropic's:** gold replaces coral, Midnight obsidian replaces navy. This makes the site cohesive with the app.

```
/* light surfaces (the anchor) */
--canvas:#f7f4ee        warm bone canvas (NOT white)
--surface-soft:#f1ece2  slightly deeper cream (alternating bands)
--surface-card:#ece5d8  cream feature cards
--ink:#1a1814           warm near-black (display + strong text)
--body:#3f3b34          body text
--muted:#736e64         muted/captions
--hairline:#e4ddd0      borders/dividers

/* dark surfaces (Midnight — ties to the app) */
--obsidian:#0e0f13      dark band / product mockup background
--panel:#16181f         dark cards
--line:#262a33          dark borders
--on-dark:#eceef2       text on obsidian
--on-dark-soft:#8b919c  muted on obsidian

/* the single accent — champagne gold (scarce) */
--gold:#c8a96a   --gold-deep:#a6854a   --gold-bright:#e3c884

/* type */ display: Fraunces (400/500, negative tracking) · body: Inter (400–600) · labels: JetBrains Mono (uppercase, tracked)
/* radius */ sm 8 · md 12 · lg 16 · pill 999
/* spacing */ section padding 96px desktop / 64px mobile; max content width 1200px
```
**Type scale:** display-xl 72/clamp serif -0.03em · display-lg 52 · display-md 36 · title 20–22 Inter 600 · body 16–18 Inter · eyebrow 12 Mono uppercase 0.18em gold.

**Pacing (the brand's rhythm — non-negotiable):** alternate surfaces band to band — `canvas → cream-card → obsidian(product) → canvas → gold-callout → obsidian-footer`. **Never two identical surfaces in a row.** 96px between bands.

**Components to build (primitives):** `TopNav` (cream, pinned, Meridian wordmark + links + a gold "Join waitlist" button), `Button` (gold primary / cream-outline secondary / text-link gold / cream-on-obsidian for dark bands), `Section` (handles the surface + padding rhythm), `Eyebrow` (mono label), `FeatureCard` (cream), `ProductFrame` (a device/browser frame showing a **real Midnight app screen** — see below), `GoldCallout` (full-bleed gold CTA band), `Footer` (obsidian, 4-col links + mark), `WaitlistForm`, `Input`, `CookieBanner` (small obsidian card).

**Showing the app (do this, don't draw illustrations):** in the obsidian product bands, render **lightweight HTML/CSS recreations of the actual Midnight screens** inside a phone/browser frame — the **deck card**, the **payment tower**, the **SPA-import** screen — using the Midnight tokens above (panel `#16181f`, gold accents, Bricolage-style headings via Fraunces or a grotesque, JetBrains Mono figures). If real exported screenshots are dropped into `/public/app/`, use those instead. **No gradient blobs, no abstract 3D, no AI-art hero.**

**How this improves on the reference:** (1) shows the *real* obsidian product, tying site↔app; (2) gold is even more disciplined than the reference's coral; (3) adds a tasteful scroll-reveal motion layer the reference left out of scope (see §8); (4) tighter, concrete domain copy.

## 4. Anti-generic rules (read first — this is the whole point)
**Do:**
- Big, confident **serif** headlines (Fraunces, 400/500, negative tracking). Plain-spoken body. One clear idea per band.
- Concrete Dubai off-plan language: SPA, DLD, Oqood, escrow, handover, construction milestones. Real specifics.
- Editorial **asymmetry** — the 6-6 hero (copy left, app frame right), alternating bands. Generous whitespace.
- Anchor on the **warm cream canvas**; obsidian for product bands; **gold only** on primary CTAs + the one gold callout.
- Show the **real app**.

**Don't (these scream "AI slop"):**
- ❌ Buzzword copy: *seamless, revolutionary, transform, empower, unlock, supercharge, leverage, cutting-edge, next-gen, game-changer, elevate.* Banned.
- ❌ Pure white backgrounds; cool gray/blue; a second accent hue; two identical surfaces back-to-back.
- ❌ Glassmorphism, gradient-mesh blobs, floating 3D shapes, neon glows, AI-generated hero illustrations, generic line-icon feature trios with one-word labels.
- ❌ Centered-everything layouts; vague "AI-powered solution for modern teams" hero; lorem filler.
- ❌ Bold-bombastic serif (Fraunces stays ≤500). Hover effects beyond a subtle press/underline.

## 5. Sitemap (multiple pages)
1. `/` **Home**
2. `/how-it-works` **How it works**
3. `/about` **Why Meridian** (who it's for + the off-plan problem + a short founder note)
4. `/early-access` **Early access** (founder-pricing framing + waitlist; **no live checkout**)
5. `/join` **Waitlist** (dedicated page; the form is also embedded on `/` and `/early-access`)
6. `/privacy` · `/terms` · `/cookies` **Legal** (templates — see §9)
- Footer links all of the above + a contact email (`hello@meridian.ae` placeholder).

## 6. Page content (use this copy — it's deliberately concrete, not slop)

### Home `/`
**Hero (cream, 6-6 grid):**
- Eyebrow: `FOR DUBAI OFF-PLAN BROKERS`
- H1 (display-xl serif): **Off-plan deals, handled.**
- Sub: *Meridian tracks the payment plan on every off-plan deal — booking, DLD registration, construction milestones, handover — and reminds you before each one is due.*
- Buttons: **Join the waitlist** (gold) · **See how it works** (cream-outline, → /how-it-works)
- Right: `ProductFrame` showing the **deck** (Marina Vista — 2BR, Emaar Beachfront, AED 3.20M, due in 5 days).

**What Meridian does (cream-card band, simple + clear):**
- Eyebrow: `WHAT MERIDIAN DOES`
- One paragraph: *Every off-plan sale runs on a construction-linked payment plan. Meridian keeps that plan in one place — what's paid, what's due, what's overdue — across your whole portfolio, and nudges you before a DLD deadline or a handover slips. Drop in the SPA and it reads the plan for you.*

**How it works (obsidian band, 3 numbered steps + app frame):**
1. **Add a deal — or drop the SPA.** Upload the agreement; Meridian reads the payment plan. You confirm.
2. **Track every milestone.** Booking, Oqood, construction stages, handover — paid, due, overdue, at a glance.
3. **Never miss a payment.** A reminder before each one — on your phone and by email.

**The problem (cream band):**
- Eyebrow: `WHY IT'S HARD TODAY`
- H2 (serif): **Most Dubai sales are off-plan. The tools weren't built for it.**
- Body: *Off-plan runs on escrow-linked payments, Oqood registration, construction stages and handover. Miss one date and it costs you. Generic CRMs track contacts; they don't track a payment plan against a construction schedule.*

**Feature bands (alternate cream ↔ obsidian, each with a real app screen):**
- **Every milestone, to the dirham** (the payment tower) — *See each deal's full plan against the DLD schedule. Paid, due, overdue — and what's next.*
- **Drop the SPA, we read it** (SPA-import screen) — *Upload the agreement and the plan fills itself. You confirm — we never guess on your behalf, and manual entry always works.*
- **Built for Dubai, in two languages** — *DLD, Oqood, escrow, handover — the off-plan workflow US tools can't touch. Fully bilingual: English and Arabic, right-to-left.*

**Gold callout (full-bleed gold band):**
- H2: **Be among the first brokers on Meridian.** · Sub: *We're onboarding a first group with early access and founder pricing.* · Button (cream on gold): **Join the waitlist**

**Footer (obsidian).**

### How it works `/how-it-works`
Four pillars, alternating bands, each with the matching app screen + 2–3 sentences: **Add a deal / SPA import · Milestone tracking · Reminders & WhatsApp share · Built for Dubai (bilingual)**. End on the gold callout + waitlist.

### About `/about`
- H1 (serif): **Off-plan, handled by someone who's watched it break.**
- The problem in plain terms; who it's for (solo brokers and small Dubai brokerages); why now. A short **founder note** placeholder (1 paragraph). End with waitlist.

### Early access `/early-access`
- H1: **Founder pricing for the first brokers.**
- Two simple tier cards (cream; featured tier flips to obsidian) — *Solo* and *Brokerage* — listing what's included. **No prices hard-committed and no checkout** — each card's CTA is **Join the waitlist** (pricing is finalized with founding users). A line: *Early-access brokers lock in founder pricing and shape what gets built next.*

### Join `/join`
- Centered, calm: H1 **Join the waitlist.** · Sub: *Leave your email — we'll reach out with early access.* · the `WaitlistForm`. On success, a warm confirmation state.

## 7. Waitlist (the one piece of real functionality)
**Supabase table:**
```sql
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text,
  brokerage text,
  role text,            -- 'solo' | 'brokerage' (optional)
  source text,          -- which page the signup came from
  created_at timestamptz not null default now(),
  unique (email)
);
alter table public.waitlist enable row level security;
-- anonymous visitors may INSERT only; nobody can SELECT via the anon key
create policy "anon can join waitlist"
  on public.waitlist for insert to anon with check (true);
```
**Form:** email (required) + optional name + optional brokerage. Submit via a **Server Action / Route Handler** that: validates the email server-side (Zod), inserts via supabase-js, handles the unique-violation gracefully ("You're already on the list"), and returns a success/error state. Include a **honeypot** field + basic rate-limit (per-IP) to deter bots. Success → warm inline confirmation (*"You're on the list — we'll be in touch."*), never a page reload that loses state. **Never put the email in a URL.** Anon key only on the client; service-role key is never shipped.

## 8. Motion (tasteful — the reference skips this; add it well)
- **Scroll-reveal:** sections fade + rise ~16px on enter (IntersectionObserver / Framer Motion), ~500ms, easing `cubic-bezier(.22,.61,.36,1)`, stagger children ~80ms. Reveal once.
- **Hero app frame:** a subtle, slow float (≤6px) — nothing bouncy.
- Smooth anchor scrolling; button press = scale .97 + (gold) slight brightness.
- **Honor `prefers-reduced-motion`** — replace transforms with instant/opacity only. No parallax, no auto-playing carousels, no typewriter gimmicks.

## 9. Legal pages (templates — flag clearly for lawyer review)
Write clean, readable templates (not filler), each with a visible note: *"Template — review with a qualified lawyer before launch. Not legal advice."* Tailor to a UAE waitlist collecting emails (**PDPL** awareness).
- **/privacy** — what's collected (waitlist email/name/brokerage + cookieless analytics); how it's used (early-access contact only; no selling data); storage (Supabase); your rights (access/correct/delete; one-click unsubscribe); retention; contact.
- **/terms** — waitlist registers interest, doesn't guarantee access/pricing/launch date; acceptable use; IP (Meridian brand/site); "as is" disclaimer + liability limit; changes; contact.
- **/cookies** — what's used (if cookieless analytics, say so; only essential cookies); consent; how to opt out. A small obsidian `CookieBanner` only if any non-essential cookie is used.

## 10. SEO, performance, accessibility
- Per-page `metadata` (title/description), OpenGraph + Twitter cards, a generated `sitemap.xml`, `robots.txt`, favicon/app icons, JSON-LD `Organization`. Semantic landmarks, one `<h1>` per page, descriptive alt text.
- Static generation; `next/image` for any raster; Lighthouse ≥ 95 across the board.
- Keyboard-navigable; visible gold focus rings; WCAG-AA contrast (check gold-on-cream for small text — use `--ink` for body, gold only for large/decorative); reduced-motion honored.

## 11. Phased build order
1. **Scaffold** — Next.js + TS + Tailwind custom theme (§3 tokens) + next/font + `TopNav`/`Footer` layout + primitives (`Button`, `Section`, `Eyebrow`, `FeatureCard`, `ProductFrame`).
2. **Home** — all bands with the §6 copy + Midnight app recreations in `ProductFrame`.
3. **How it works · About · Early access** pages.
4. **Waitlist** — Supabase table + Server Action + form + success/error + honeypot.
5. **Legal** — privacy / terms / cookies + cookieless analytics (+ banner only if needed).
6. **SEO** — metadata, sitemap, robots, OG images, JSON-LD, favicons.
7. **Polish** — scroll-reveal motion, responsive (mobile hamburger; hero stacks; bands reflow), a11y + Lighthouse pass.

## 12. Guardrails (never violate)
- Follow §3 + §4 exactly: cream canvas anchor, obsidian product bands, **gold the only accent and scarce**, alternating-surface pacing, serif display ≤500, **no AI-slop visuals or buzzwords**.
- Show the **real Midnight app**, not illustrations.
- Waitlist persists to Supabase; **email never in a URL**; anon key client-side only; service-role key never shipped.
- Legal pages are **templates flagged for lawyer review**.
- Cookieless/privacy-first analytics; reduced-motion honored; Lighthouse ≥ 95; one `<h1>` per page.
