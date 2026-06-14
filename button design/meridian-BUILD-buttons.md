# Meridian — Button & Control System: Codex Build Pack

**Feed Codex:** this file + `button-system.html` + `nav-backgrounds.html` (the visual contracts) + `meridian-DESIGN.md` (tokens) + the main `meridian-BUILD.md`.
Goal: one **component library** that is the single source of truth for every button, control, the footer nav, and backgrounds — so a change is made once and propagates everywhere. Work the phases in order.

---

## 0. Prime directive
> Build the controls in `button-system.html` and `nav-backgrounds.html` as typed, reusable React Native components in `/src/shared/ui`. Match the references exactly (Midnight tokens, radii, states). **No raw `<Pressable>` with inline styles anywhere in feature screens** — every button goes through these components. All press feedback runs on the UI thread (Reanimated). Every control is accessible (role, label, ≥44px target, reduced-motion).

## 1. Component spec (the full set)
| Component | Variants | Sizes | States | Tokens / notes |
|---|---|---|---|---|
| `Button` | `gold` (primary) · `ghost` (secondary) · `text` (tertiary) · `danger` (+`solid`) | `lg` (14r/16p/15) · `md` (12r/13p/14) · `sm` (10r/9p/13) | default · pressed (scale .96; gold +brightness) · **loading** (spinner, label optional) · disabled (opacity .40) · focused (2px gold ring, offset 3) | gold = gradient #e3c884→#a6854a on #1a1407; `block` prop = full width; left/right icon slots |
| `IconButton` | `ghost` · `gold` · `circle` | 46×46 | default · pressed (scale .90) · disabled | back ‹ · add + · close × · more ⋯ |
| `Fab` | gold | 60×60, radius 21 | default · pressed (scale .93) | the nav's create action; gold gradient + glow |
| `SocialButton` | `apple` · `google` | full-width | default · pressed · loading | Apple = #000/#fff; Google = panel + colored G. Show Apple on iOS if social offered |
| `SegmentedControl` | — | — | per-segment active | options array + value; active = panel2 fill |
| `OptionCard` | single-select | full-width | selected (gold border + tint + filled tick) · unselected | icon + title + subtitle + tick |
| `OptionChip` | multi-select | — | selected (gold border + tint) · unselected | personalization (developers) |
| `StatusChip` | `due` · `ok` · `over` | — | read-only | dot + label pill |
| `FloatingNav` | with-FAB · `even` (no FAB) | — | active item; **springing gold indicator** | `nav-backgrounds.html` §1–2; BlurView; safe-area inset; contract-on-scroll |
| `ScreenBackground` | `screen` (top glow) · `splash` (center glow) · `flat` | — | — | `nav-backgrounds.html` §3; wraps every screen |
| `Surface` | `panel` · `card` · `card-due` | — | — | card = gradient #191c24→#14161c; due = gold glow border |

## 2. Phases

**Phase A — Build the control library.**
> In `/src/shared/ui`, create the components in §1, matching `button-system.html` and `nav-backgrounds.html` pixel-for-pixel using the Midnight tokens from `/shared/theme`. Requirements: TypeScript props with literal unions for `variant`/`size`; press feedback via Reanimated (`useAnimatedStyle` + `withSpring`/`withTiming`) on the UI thread, not the JS thread; `loading` shows a spinner and disables press; `disabled` sets opacity .40 and blocks press; light-impact haptic (expo-haptics) on press for `Button`/`IconButton`/`Fab`/nav; accessibility — `accessibilityRole="button"`, `accessibilityLabel`, `accessibilityState={{disabled,busy,selected}}`, `hitSlop` to guarantee ≥44px; honor `AccessibilityInfo.isReduceMotionEnabled` (skip scale, keep opacity). Export a single `ui` barrel. **Acceptance:** a storybook/preview screen renders every variant×size×state and visually matches the two HTML sheets on iOS + Android; no inline button styling exists in `/shared/ui` consumers.

**Phase B — Adopt across the flow.**
> Replace every inline/ad-hoc button and control in the feature screens with these components, matching `meridian-DESIGN.md` §6. Mapping: Welcome → `Button gold lg block` ("Get started") + `Button ghost lg block` ("I already have an account"); Account Setup → email `Button gold` + `SocialButton` + `Button text` ("Sign in"); Personalization → `OptionCard` (role) + `OptionChip` (developers) + `SegmentedControl` (volume); Permissions → `Button gold` ("Enable reminders") + `Button ghost` ("Maybe later"); Education → `Button gold` + `Button ghost`; Home → `FloatingNav` (with-FAB) + `Fab`; Deal detail → `IconButton` (back) + mark-paid action + `StatusChip`; New deal → upload `Button`, `Button text` ("+ Add milestone"), `Button gold` ("Save deal"). Wrap every screen in `ScreenBackground`. **Acceptance:** grep shows no `Pressable`/`TouchableOpacity` with inline styles in `/src/features`; every screen still matches its `meridian-DESIGN.md` reference.

**Phase C — Footer nav & backgrounds.**
> Implement `FloatingNav` from `nav-backgrounds.html`: `BlurView` capsule, gold hairline, destinations + elevated `Fab`, the gold indicator animated to the active item with `withSpring({damping:16,stiffness:180})`, `useSafeAreaInsets()` bottom offset, contract-on-scroll driven by the list's `useAnimatedScrollHandler`, light haptic on switch; plus the `even` (no-FAB) variant for Settings. Implement `ScreenBackground` and `Surface` variants. **Acceptance:** indicator springs to the tapped item on both platforms (Android blur via `experimentalBlurMethod`); never renders as a flush full-width bar; backgrounds match §3 of the sheet.

**Phase D — Re-edit workflow (single source of truth).**
> Make edits cheap and safe: all color/size/radius values come from `/shared/theme` tokens — changing a token restyles every button. Each component reads tokens, never hardcodes hex. Add a visual-snapshot test for the preview screen so a button change that unintentionally alters another variant fails CI. Document in `/shared/ui/README.md`: how to add a variant, how to change the gold gradient/radius globally (edit the token), and the rule that feature code never styles buttons directly. **Acceptance:** changing the gold token in `/shared/theme` updates every primary button + FAB + indicator in one commit; the snapshot test catches an unintended change.

## 3. Guardrails
- Every button/control goes through `/shared/ui` — no inline button styling in features.
- Press/spring animations on the UI thread (Reanimated); honor reduced-motion.
- Values come from `/shared/theme` tokens only — no hardcoded hex/sizes in components.
- The footer is the floating capsule — never a flush tab bar.
- ≥44px touch targets; `accessibilityRole`/label/state on every control.
