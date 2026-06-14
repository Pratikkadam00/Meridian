# Meridian — Design System (Midnight)
**The single source of truth for the UI.** Dark, premium, obsidian-and-champagne-gold. This replaces the earlier warm-canvas (Anthropic) reference file — that was a quality benchmark; Meridian uses **Midnight**. Build every screen to match the reference HTML/CSS in §6, using the tokens in §1.

---

## 1. Tokens
```
/* color */
--bg:#0e0f13         page canvas (deep obsidian)
--panel:#16181f      cards / surfaces
--panel2:#1b1e26     nested / active surfaces
--line:#262a33       borders / dividers
--ink:#eceef2        primary text
--mut:#8b919c        muted text
--accent:#c8a96a     champagne gold — primary accent
--accent-2:#a6854a   gold gradient end
--gold-bright:#e3c884 gold highlight
--ok:#5bbf9e         on-track (sage)
--due:#e0a458        due / warning (amber-gold)
--over:#e87c7c       overdue (muted red)

/* type */  display: Bricolage Grotesque (600/700) · body: Inter (400–600) · figures/labels: JetBrains Mono
/* radius */ card 17 · panel 18 · field 13 · nav 24 · pill 99
/* spacing */ 4 · 8 · 12 · 16 · 22 · 32
/* motion */ ease cubic-bezier(.22,.61,.36,1) ~400ms · spring withSpring{damping:18,stiffness:140} · stagger 80–90ms
```
Fonts (Google substitutes for any licensed faces): `Bricolage Grotesque`, `Inter`, `JetBrains Mono`.

## 2. Type scale
| role | family / weight / size |
|---|---|
| display-xl (splash/hero) | Bricolage 700 · 40–46px · -0.03em |
| h1 (screen title) | Bricolage 700 · 28px · -0.02em |
| amount (deck big) | Bricolage 700 · 42px · -0.03em |
| title (card project) | Bricolage 600 · 17–20px |
| body | Inter · 13–15px |
| eyebrow | JetBrains Mono · 10–11px · uppercase · 0.16em · gold |
| figure | JetBrains Mono · tabular-nums |

## 3. Component catalog (states in §6 CSS)
| component | notes |
|---|---|
| `btn-gold` | primary CTA — gold gradient, ink text, radius 14. Press: scale .96 + shadow lift |
| `btn-ghost` | secondary — panel bg, hairline border, ink text |
| `input` | panel bg, hairline; focus → gold border |
| `chip` | status pill — due (gold) / ok (sage) / over (red) |
| `dcard` | deck deal card — dark gradient surface, gold accents; due card gets gold glow border |
| `floating-nav` | **the signature** — detached glass capsule, springing gold indicator, elevated gold FAB. Never a flush tab bar |
| `tower` | payment-plan timeline — done (gold node) / now (amber ring) / upcoming |
| `prog-dots` | onboarding step indicator — gold active pill |
| `opt-card` / `opt-chip` | personalization selectors — selected → gold border + tint |
| `teach-card` | core-education card — icon, title, body |

## 4. Do's & Don'ts
**Do** — anchor on obsidian `--bg`; gold is the single accent and stays scarce (CTAs, active states, the due milestone); Bricolage for display, Inter for body, Mono for figures; the floating capsule nav, never a flush tab bar; one confident motion language (§5).
**Don't** — introduce a second accent hue; bold the body; use a generic bottom tab bar; animate on the JS thread; hardcode hex outside tokens; block the user in onboarding.

## 5. Motion & animation stack (won't break, New-Arch compatible)
- **Reanimated** (UI-thread worklets) — all transitions, the deck swipe, the nav-indicator spring, micro-interactions. 60fps even when JS is busy.
- **Gesture Handler** — the deck drag, draggable sheets.
- **Moti** — declarative entrances/staggers (onboarding cards, list reveals) — friendly layer over Reanimated.
- **Lottie via `react-native-skottie`** (Skia/GPU) — the **splash** brand animation + onboarding illustrations (vector, lightweight, +~63% fps vs plain lottie on low-end Android). Fallback: `lottie-react-native`.
- **Skia** (`@shopify/react-native-skia`) — custom canvas visuals (gold-mark draw, custom progress) when a Lottie isn't right.
- **expo-splash-screen** — native pre-splash (no white flash) held until fonts/session resolve, then hand off to the animated splash.
- Verify every lib New-Arch compatible via `expo-doctor`.

**Motion contract**
| moment | spec |
|---|---|
| Splash | native splash holds → gold mark draws + wordmark fades up (~1.2s, Skottie/Skia) → crossfade to Welcome. < 2s total; skipped on later launches |
| Screen entrance | content fades + `translateY(18→0)`, stagger 80–90ms (Moti) |
| Onboarding step change | horizontal slide + fade, ~360ms ease; progress dots animate |
| Deck swipe | drag (Gesture Handler) → release past ~90px advances; background cards spring depth; `withSpring{damping:18,stiffness:140}` |
| Nav indicator | gold glow springs under tapped icon `withSpring{damping:16,stiffness:180}` |
| Mark paid | node pops `withSpring{damping:12}` + progress animates ~700ms + success haptic |
| Press | scale .96, 120ms |
| Reduced motion | replace transforms with fades |

---

## 6. Reference HTML/CSS for every screen
**Shared CSS (the visual contract — port to `/shared/theme` + `/shared/ui`):**
```css
:root{
  --bg:#0e0f13;--panel:#16181f;--panel2:#1b1e26;--line:#262a33;--ink:#eceef2;--mut:#8b919c;
  --accent:#c8a96a;--accent2:#a6854a;--goldb:#e3c884;--ok:#5bbf9e;--due:#e0a458;--over:#e87c7c;
  --disp:'Bricolage Grotesque';--body:Inter;--mono:'JetBrains Mono';
  --ease:cubic-bezier(.22,.61,.36,1);--spring:cubic-bezier(.34,1.4,.64,1);
}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--ink);font-family:var(--body),system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.screen{min-height:100vh;background:radial-gradient(120% 50% at 50% -8%,rgba(200,169,106,.08),transparent 55%),var(--bg);padding:60px 22px 120px;display:flex;flex-direction:column}
.eye{font-family:var(--mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--accent)}
.h1{font-family:var(--disp);font-weight:700;font-size:28px;letter-spacing:-.02em}
.lede{font-size:15px;line-height:1.55;color:var(--mut)}
.btn-gold{background:linear-gradient(150deg,var(--goldb),var(--accent2));color:#1a1407;font-weight:700;font-size:15px;padding:16px;border-radius:14px;text-align:center;width:100%;border:0}
.btn-ghost{background:var(--panel);border:1px solid var(--line);color:var(--ink);font-weight:600;font-size:15px;padding:15px;border-radius:13px;text-align:center;width:100%}
.input{width:100%;background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:15px;color:var(--ink);font-size:15px;font-family:var(--body)}
.input::placeholder{color:#5f656e}.input:focus{outline:none;border-color:var(--accent)}
.field{margin-bottom:12px}.field label{display:block;font-size:12px;color:var(--mut);margin-bottom:7px}
.chip{font-size:11px;font-weight:600;padding:5px 12px;border-radius:99px;display:inline-flex;gap:6px;align-items:center}
.chip::before{content:"";width:5px;height:5px;border-radius:99px;background:currentColor}
.chip.due{color:var(--due);background:rgba(224,164,88,.13)}.chip.ok{color:var(--ok);background:rgba(91,191,158,.1)}.chip.over{color:var(--over);background:rgba(232,124,124,.13)}
/* onboarding */
.prog-dots{display:flex;gap:6px;margin-bottom:26px}
.prog-dots i{height:4px;flex:1;border-radius:99px;background:var(--line)}
.prog-dots i.on{background:var(--accent)}
.opt-card{display:flex;align-items:center;gap:14px;background:var(--panel);border:1px solid var(--line);border-radius:15px;padding:18px;margin-bottom:10px}
.opt-card.sel{border-color:var(--accent);background:rgba(200,169,106,.07)}
.opt-card .ic{width:42px;height:42px;border-radius:12px;background:var(--panel2);display:grid;place-items:center;font-size:19px;color:var(--accent);flex:none}
.opt-card .t{font-family:var(--disp);font-weight:600;font-size:16px}.opt-card .s{font-size:12.5px;color:var(--mut);margin-top:2px}
.opt-chips{display:flex;flex-wrap:wrap;gap:9px}
.opt-chip{font-size:13px;font-weight:500;padding:10px 15px;border-radius:11px;background:var(--panel);border:1px solid var(--line);color:var(--mut)}
.opt-chip.sel{border-color:var(--accent);background:rgba(200,169,106,.1);color:var(--ink)}
.seg{display:flex;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:3px}
.seg button{flex:1;padding:11px;border-radius:9px;font-size:13px;font-weight:500;color:var(--mut);border:0;background:none}
.seg button.on{background:var(--panel2);color:var(--ink)}
.teach{display:flex;gap:15px;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px;margin-bottom:11px}
.teach .ic{width:46px;height:46px;border-radius:13px;background:linear-gradient(150deg,rgba(200,169,106,.25),rgba(200,169,106,.05));display:grid;place-items:center;font-size:20px;flex:none}
.teach .t{font-family:var(--disp);font-weight:600;font-size:16px}.teach .b{font-size:13px;color:var(--mut);margin-top:3px;line-height:1.5}
/* deck */
.glance{display:flex;gap:18px;font-family:var(--mono);font-size:11.5px;color:var(--mut)}.glance b{color:var(--ink)}
.dcard{border-radius:26px;padding:26px;background:linear-gradient(165deg,#191c24,#14161c);border:1px solid var(--line);box-shadow:0 24px 54px rgba(0,0,0,.5);display:flex;flex-direction:column}
.dcard.due{border-color:rgba(200,169,106,.45);box-shadow:0 24px 54px rgba(0,0,0,.5),0 0 0 1px rgba(200,169,106,.2)}
.dcard .dev{font-family:var(--mono);font-size:10px;letter-spacing:.09em;text-transform:uppercase;color:var(--accent)}
.dcard .proj{font-family:var(--disp);font-weight:700;font-size:27px;letter-spacing:-.02em;margin:7px 0 2px}
.dcard .buyer{font-size:13px;color:var(--mut)} .dcard .big{font-family:var(--disp);font-weight:700;font-size:42px;letter-spacing:-.03em;margin-top:auto}
.dcard .prog{height:6px;background:#23262d;border-radius:99px;margin-top:16px;overflow:hidden}.dcard .prog i{display:block;height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2))}
/* floating nav */
.navwrap{position:fixed;left:0;right:0;bottom:0;height:108px;display:flex;justify-content:center;align-items:flex-end;padding-bottom:24px;pointer-events:none}
.nav{position:relative;width:84%;max-width:340px;height:62px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;border-radius:24px;background:rgba(22,24,31,.72);backdrop-filter:blur(22px);border:1px solid rgba(200,169,106,.22);box-shadow:0 18px 44px rgba(0,0,0,.55),inset 0 1px 0 rgba(255,255,255,.05);pointer-events:auto}
.nav .ind{position:absolute;top:9px;height:44px;width:44px;border-radius:14px;background:radial-gradient(circle at 50% 45%,rgba(200,169,106,.32),rgba(200,169,106,.08) 70%);transition:transform .45s var(--spring)}
.ni{position:relative;z-index:2;width:44px;height:44px;display:grid;place-items:center;color:var(--mut);font-size:19px}.ni.on{color:var(--goldb)}
.gap{width:50px}
.fab{position:absolute;left:50%;top:-16px;transform:translateX(-50%);width:60px;height:60px;border-radius:21px;background:linear-gradient(150deg,var(--goldb),var(--accent2));color:#1a1407;font-size:27px;font-weight:700;display:grid;place-items:center;box-shadow:0 12px 28px rgba(200,169,106,.4),0 4px 10px rgba(0,0,0,.45);pointer-events:auto}
/* tower */
.tw{position:relative;padding:0 0 22px 36px;border-left:2px solid var(--line)}.tw:last-child{border-color:transparent;padding-bottom:0}
.tw .node{position:absolute;left:-11px;top:0;width:20px;height:20px;border-radius:7px;background:var(--panel2);border:2px solid var(--line);display:grid;place-items:center;font-size:10px}
.tw.done .node{background:var(--accent);border-color:var(--accent);color:#1a1407}.tw.now .node{border-color:var(--due);box-shadow:0 0 0 5px rgba(224,164,88,.12)}
.tw .pct{font-family:var(--disp);font-weight:700;font-size:14px}.tw .lbl{font-size:13px;margin:1px 0 4px}.tw .meta{display:flex;gap:12px;font-family:var(--mono);font-size:11px;color:var(--mut)}.tw .meta b{color:var(--ink)}
```

### 6.0 Splash  ·  _animate: gold mark draws (Skottie/Skia) + wordmark fade-up, then crossfade out_
```html
<div class="screen" style="align-items:center;justify-content:center;text-align:center">
  <div style="width:72px;height:72px;border-radius:20px;background:linear-gradient(150deg,var(--goldb),var(--accent2));display:grid;place-items:center;color:#1a1407;font-family:var(--disp);font-weight:800;font-size:34px">◷</div>
  <div style="font-family:var(--disp);font-weight:700;font-size:30px;letter-spacing:-.02em;margin-top:22px">Meridian</div>
  <div class="eye" style="margin-top:10px">Off-plan, handled</div>
</div>
```

### 6.1 Welcome  ·  _swipeable 3-beat value carousel; CTAs pinned bottom_
```html
<div class="screen" style="justify-content:flex-end">
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center">
    <div class="eye">For Dubai off-plan brokers</div>
    <h1 class="h1" style="font-size:38px;line-height:1.05;margin:14px 0 16px">Track every milestone, booking to handover.</h1>
    <p class="lede">Drop the SPA, we read the payment plan. Reminders fire before every DLD deadline. Your whole portfolio, in one glance.</p>
  </div>
  <div style="display:flex;gap:6px;margin-bottom:22px"><i style="height:4px;width:24px;border-radius:9px;background:var(--accent)"></i><i style="height:4px;width:10px;border-radius:9px;background:var(--line)"></i><i style="height:4px;width:10px;border-radius:9px;background:var(--line)"></i></div>
  <button class="btn-gold" style="margin-bottom:11px">Get started</button>
  <button class="btn-ghost">I already have an account</button>
</div>
```

### 6.2 Account Setup  ·  _step 2 of 5_
```html
<div class="screen">
  <div class="prog-dots"><i class="on"></i><i class="on"></i><i></i><i></i><i></i></div>
  <div class="eye">Step 2</div>
  <h1 class="h1" style="margin:8px 0 22px">Create your workspace</h1>
  <div class="field"><label>Full name</label><input class="input" placeholder="Your name"></div>
  <div class="field"><label>Work email</label><input class="input" type="email" placeholder="you@brokerage.ae"></div>
  <div class="field"><label>Password</label><input class="input" type="password" placeholder="••••••••"></div>
  <button class="btn-gold" style="margin-top:6px">Continue</button>
  <div style="text-align:center;font-size:13px;color:var(--mut);margin-top:18px">Already have an account? <span style="color:var(--accent);font-weight:600">Sign in</span></div>
</div>
```

### 6.3 Personalization  ·  _step 3 of 5 — seeds defaults_
```html
<div class="screen">
  <div class="prog-dots"><i class="on"></i><i class="on"></i><i class="on"></i><i></i><i></i></div>
  <div class="eye">Step 3</div>
  <h1 class="h1" style="margin:8px 0 20px">Tell us about your work</h1>
  <div style="font-size:12px;color:var(--mut);margin-bottom:10px">Your role</div>
  <div class="opt-card sel"><span class="ic">◍</span><div><div class="t">Solo broker</div><div class="s">Just me, my own deals</div></div></div>
  <div class="opt-card"><span class="ic">▦</span><div><div class="t">Part of a brokerage</div><div class="s">A team of agents</div></div></div>
  <div style="font-size:12px;color:var(--mut);margin:18px 0 10px">Developers you work with</div>
  <div class="opt-chips">
    <span class="opt-chip sel">Emaar</span><span class="opt-chip sel">Damac</span><span class="opt-chip">Sobha</span>
    <span class="opt-chip">Binghatti</span><span class="opt-chip">Nakheel</span><span class="opt-chip">Meraas</span><span class="opt-chip">+ Add</span>
  </div>
  <div style="font-size:12px;color:var(--mut);margin:18px 0 10px">Deals you run at a time</div>
  <div class="seg"><button class="on">1–5</button><button>6–15</button><button>16+</button></div>
  <button class="btn-gold" style="margin-top:24px">Continue</button>
</div>
```

### 6.4 Permissions & Notifications  ·  _step 4 of 5 — value-framed_
```html
<div class="screen">
  <div class="prog-dots"><i class="on"></i><i class="on"></i><i class="on"></i><i class="on"></i><i></i></div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:center;text-align:center">
    <div style="width:84px;height:84px;border-radius:24px;margin:0 auto 26px;background:linear-gradient(150deg,rgba(200,169,106,.25),rgba(200,169,106,.05));display:grid;place-items:center;font-size:38px">🔔</div>
    <h1 class="h1" style="font-size:30px">Never miss a payment</h1>
    <p class="lede" style="margin-top:14px;max-width:300px;align-self:center">We'll remind you before every milestone is due — so an Oqood deadline or a handover never slips. Notifications only when it matters.</p>
  </div>
  <button class="btn-gold" style="margin-bottom:11px">Enable reminders</button>
  <button class="btn-ghost">Maybe later</button>
  <div style="text-align:center;font-size:12px;color:var(--mut);margin-top:14px">You can also lock the app with Face ID in Settings.</div>
</div>
```

### 6.5 Core Education  ·  _step 5 of 5_
```html
<div class="screen">
  <div class="prog-dots"><i class="on"></i><i class="on"></i><i class="on"></i><i class="on"></i><i class="on"></i></div>
  <div class="eye">You're set</div>
  <h1 class="h1" style="margin:8px 0 20px">How Meridian works</h1>
  <div class="teach"><span class="ic">⤓</span><div><div class="t">Drop the SPA</div><div class="b">Upload the agreement — we read the payment plan and fill it in. You confirm.</div></div></div>
  <div class="teach"><span class="ic">◷</span><div><div class="t">Track every milestone</div><div class="b">Booking, DLD/Oqood, construction stages, handover — paid, due, and overdue at a glance.</div></div></div>
  <div class="teach"><span class="ic">🔔</span><div><div class="t">Get reminded</div><div class="b">A nudge before each payment, and a portfolio view of what's due this week.</div></div></div>
  <button class="btn-gold" style="margin-top:22px">Add your first deal</button>
  <button class="btn-ghost" style="margin-top:11px">Skip to dashboard</button>
</div>
```

### 6.6 Home / Dashboard (the Deck)  ·  _swipe deck + floating nav; see midnight motion contract_
```html
<div class="screen" style="padding-bottom:0">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px">
    <div><div class="eye">Portfolio · Q2 2026</div><h1 class="h1">Your deals</h1></div>
    <div style="font-family:var(--mono);font-size:12px;color:var(--mut);margin-top:6px">01 / 04</div>
  </div>
  <div class="glance" style="margin-bottom:14px"><span><b>AED 4.21M</b> in escrow</span><span><b style="color:var(--due)">AED 320K</b> due</span></div>
  <!-- deck: stacked .dcard items, front = due deal; swipe via Gesture Handler -->
  <div style="position:relative;height:430px">
    <div class="dcard due">
      <div class="dev">Emaar · Beachfront</div><div class="proj">Marina Vista — 2BR</div><div class="buyer">Omar Al-Farsi</div>
      <div style="flex:1"></div>
      <div style="font-size:12.5px;color:var(--mut);margin-bottom:4px">Next · <b style="color:var(--ink)">40% construction</b> · 19 Jun</div>
      <div class="big">AED 3.20M</div>
      <div class="prog"><i style="width:34%"></i></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px"><span style="font-family:var(--mono);font-size:11.5px;color:var(--mut)">34% paid</span><span class="chip due">Due in 5 days</span></div>
    </div>
  </div>
  <div style="display:flex;gap:6px;justify-content:center;margin:18px 0 6px"><i style="width:22px;height:7px;border-radius:99px;background:var(--accent)"></i><i style="width:7px;height:7px;border-radius:99px;background:#2a2d34"></i><i style="width:7px;height:7px;border-radius:99px;background:#2a2d34"></i><i style="width:7px;height:7px;border-radius:99px;background:#2a2d34"></i></div>
  <!-- floating-nav from shared CSS -->
  <div class="navwrap"><nav class="nav"><span class="ind"></span><button class="ni on"><span>▦</span></button><button class="ni"><span>◴</span></button><span class="gap"></span><button class="ni"><span>◫</span></button><button class="ni"><span>◍</span></button></nav><button class="fab">+</button></div>
</div>
```

### 6.7 Deal detail (payment tower)
```html
<div class="screen">
  <div style="color:var(--accent);font-weight:600;font-size:14px;margin-bottom:14px">‹ Portfolio</div>
  <div class="eye">Emaar · Beachfront</div>
  <h1 class="h1" style="margin:6px 0 3px">Marina Vista — 2BR</h1>
  <div class="lede" style="font-size:12.5px;margin-bottom:18px">Buyer: Omar Al-Farsi · Handover Q4 2026</div>
  <div style="background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:18px;margin-bottom:14px">
    <div style="font-size:11.5px;color:var(--mut);margin-bottom:7px">Paid to date</div>
    <div style="font-family:var(--disp);font-weight:700;font-size:25px">AED 1.09M <span style="font-size:13px;color:var(--mut)">/ 3.20M</span></div>
    <div style="height:8px;border-radius:99px;background:#23262d;overflow:hidden;margin-top:13px"><i style="display:block;height:100%;width:34%;background:linear-gradient(90deg,var(--accent),var(--accent2))"></i></div>
  </div>
  <div style="background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:20px">
    <div style="font-family:var(--disp);font-weight:700;font-size:15px;margin-bottom:16px">Payment plan</div>
    <div class="tw done"><div class="node">✓</div><div class="pct">20% · Booking</div><div class="lbl">Down payment</div><div class="meta"><span>AED <b>640,000</b></span><span>Paid · 12 Jan</span></div></div>
    <div class="tw done"><div class="node">✓</div><div class="pct">4% · DLD</div><div class="lbl">Oqood registration</div><div class="meta"><span>AED <b>128,000</b></span><span>Paid · 18 Jan</span></div></div>
    <div class="tw now"><div class="node">●</div><div class="pct">10% · 40% built</div><div class="lbl">Construction milestone</div><div class="meta"><span>AED <b>320,000</b></span><span style="color:var(--due)">Due 19 Jun</span></div></div>
    <div class="tw"><div class="node"></div><div class="pct">10% · 60% built</div><div class="lbl">Construction milestone</div><div class="meta"><span>AED <b>320,000</b></span><span>Est. Sep</span></div></div>
    <div class="tw"><div class="node"></div><div class="pct">40% · Handover</div><div class="lbl">Final payment</div><div class="meta"><span>AED <b>1,280,000</b></span><span>Est. Q4 2026</span></div></div>
  </div>
</div>
```

### 6.8 New deal + SPA upload
```html
<div class="screen">
  <div style="color:var(--accent);font-weight:600;font-size:14px;margin-bottom:14px">‹ Cancel</div>
  <h1 class="h1" style="margin-bottom:16px">New deal</h1>
  <button style="width:100%;border:1.5px dashed rgba(200,169,106,.45);background:rgba(200,169,106,.05);border-radius:16px;padding:20px;text-align:center;margin-bottom:20px;color:var(--ink)">
    <div style="font-size:22px;margin-bottom:6px">⤓</div>
    <div style="font-family:var(--disp);font-weight:600;font-size:15px">Drop the SPA PDF</div>
    <div style="font-size:12px;color:var(--mut);margin-top:3px">We'll read it and fill the payment plan</div>
  </button>
  <div class="field"><label>Project</label><input class="input" placeholder="Marina Vista — 2BR"></div>
  <div class="field"><label>Developer</label><input class="input" placeholder="Emaar"></div>
  <div class="field"><label>Buyer name</label><input class="input" placeholder="Omar Al-Farsi"></div>
  <div class="field"><label>Total value (AED)</label><input class="input" inputmode="numeric" placeholder="3,200,000"></div>
  <div style="display:flex;justify-content:space-between;align-items:center;margin:20px 0 11px"><div style="font-family:var(--disp);font-weight:700;font-size:15px">Payment plan</div><span style="color:var(--accent);font-size:13px;font-weight:600">+ Add milestone</span></div>
  <div style="background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px;display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;margin-bottom:9px">
    <input class="input" style="padding:10px;font-size:13px" value="Down payment"><input class="input" style="padding:10px;width:58px;font-size:13px;text-align:center;font-family:var(--mono)" value="20%"><input class="input" style="padding:10px;width:92px;font-size:13px;text-align:right;font-family:var(--mono)" value="640,000">
  </div>
  <button class="btn-gold" style="margin-top:16px">Save deal</button>
</div>
```

## 7. Responsive & accessibility
Designed mobile-first (~390px). Safe-area insets via `useSafeAreaInsets()` for the floating nav and headers. Touch targets ≥ 44px. Visible focus, labelled controls, `prefers-reduced-motion` honored (transforms → fades), full **RTL** for Arabic (every screen mirrors correctly). Status/text color is light on the obsidian canvas throughout.
