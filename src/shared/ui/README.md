# `@/shared/ui` — the control system

The single source of truth for every interactive control and primitive. **No
screen may hand-roll a `Pressable`/`TouchableOpacity` or hardcode a control's
colors** — a scoped `react/jsx-no-literals` + the "no inline Pressable" rule make
that a CI failure. Build the control once here; reuse everywhere.

## Components
| Component | Use | Variants |
|---|---|---|
| `Button` / `GoldButton` / `GhostButton` | text actions | `gold` · `ghost` · `text` · `danger` (+`solid`); sizes `lg` · `md` · `sm`; `loading`, `block`, `leftIcon`/`rightIcon` |
| `IconButton` | icon-only actions | `ghost` · `gold` · `circle` |
| `Fab` | the elevated jade action | — |
| `SocialButton` | Apple / Google auth | `apple` · `google`, `loading` |
| `SegmentedControl` | mutually-exclusive choice | generic over the option union |
| `OptionCard` / `OptionChip` | single/multi-select | `selected` |
| `StatusChip` | read-only status | `due` · `ok` · `over` |
| `Input` | text fields | jade focus border, error state, a11y label |
| `PressableScale` | the press primitive | UI-thread scale + optional `pressOverlayColor` brighten + focus ring + haptic |

## Rules
1. **Theme only.** All color/radius/spacing/motion comes from the active theme via `useTheme()` / `useThemedStyles()` (`@/shared/theme/meridian` — jade/amber, light + dark, switchable). Build styles from the `MeridianTheme`; never hardcode a hex outside the theme, and never import a static token module.
2. **Press on the UI thread.** Every control wraps `PressableScale` (Reanimated worklet), so press feedback never janks under JS load. Don't add a JS-thread `pressed` style.
3. **Accessibility built in.** `PressableScale` sets `accessibilityRole`/`State`, a focus ring, and ≥44pt targets. Pass a meaningful `accessibilityLabel`.
4. **i18n at the call site.** Pass already-translated strings (`t("…")`) as `label`/children — the components don't translate.

## Adding a variant
Add the variant to the `ButtonVariant` union + the `styles` map (add its fill there), and extend `buttonLabelColor()` if it needs a non-default label color. Then extend the snapshot in `__tests__/Button.test.tsx` so an unintended restyle of the other variants is caught.

## Tests
`__tests__/Button.test.tsx` snapshots every variant + the loading/disabled states. Run `npm test` — a visual change to any control fails the snapshot until reviewed and updated with `jest -u`.
