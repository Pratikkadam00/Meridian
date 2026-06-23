Primary tappable action; use `primary` for the one main action per screen, `secondary`/`quiet` for the rest, `danger` for destructive confirms.

```jsx
<Button variant="primary" size="lg" fullWidth leftIcon={icon('upload')}>
  Upload the SPA
</Button>
<Button variant="secondary">Enter manually</Button>
<Button variant="ghost" size="sm">Skip for now</Button>
```

Variants: `primary` (jade, one per screen) · `secondary` (bordered) · `quiet` (sand fill) · `ghost` (text) · `danger` (terracotta). Sizes `sm|md|lg` (lg = 56px CTA). Pass `loading` for async, `leftIcon`/`rightIcon` for glyphs (mirror chevrons in RTL).
