/**
 * Meridian — Jade/Amber design system (Redesign v2), ported verbatim from the
 * "Meridian Design System" package (tokens/*.css).
 *
 * Brand/action/paid = Jade (#0E6E5C). Signature spark = Meridian Amber (#E0922F).
 * Light "warm paper" is the primary theme; "Midnight Meridian" (jade-ink) is the
 * first-class dark peer. Status is never color-alone — always icon + word.
 *
 * This module is the single source of truth for theme tokens. The legacy
 * ./tokens.ts has been removed; every primitive consumes meridian.ts via
 * useTheme()/useThemedStyles() from ThemeProvider.tsx.
 */

// ── Ramps (theme-independent) ───────────────────────────────────────────────
export const jade = {
  50: "#E7F3EF",
  100: "#C9E6DD",
  200: "#9CD0C1",
  300: "#66B3A0",
  400: "#2E9079",
  500: "#0E6E5C", // brand primary
  600: "#0B5C4D",
  700: "#094B3F",
  800: "#0A2E2A", // brand ink / deep surface
  900: "#07201D",
} as const;

export const amber = {
  50: "#FBF0DA",
  100: "#F6DFB1",
  300: "#ECB45F",
  500: "#E0922F", // accent
  600: "#B9791A", // amber text-on-light (AA)
  700: "#8A5A12",
} as const;

// ── Typography ──────────────────────────────────────────────────────────────
// Family tokens use @expo-google-fonts naming (Hanken Grotesk UI + IBM Plex
// Sans Arabic + Bricolage display + JetBrains Mono, all loaded in app/_layout.tsx).
export const typography = {
  family: {
    display: "BricolageGrotesque_700Bold",
    displaySemi: "BricolageGrotesque_600SemiBold",
    displayBlack: "BricolageGrotesque_800ExtraBold",
    ui: "HankenGrotesk_400Regular",
    uiMedium: "HankenGrotesk_500Medium",
    uiSemi: "HankenGrotesk_600SemiBold",
    uiBold: "HankenGrotesk_700Bold",
    mono: "JetBrainsMono_400Regular",
    monoMedium: "JetBrainsMono_500Medium",
    monoSemi: "JetBrainsMono_600SemiBold",
    arabic: "IBMPlexSansArabic_400Regular",
    arabicSemi: "IBMPlexSansArabic_600SemiBold",
  },
  // mobile-first px scale (tokens/typography.css)
  size: {
    display: 34,
    title: 24,
    h1: 20,
    h2: 17,
    body: 16,
    sub: 15,
    label: 13,
    caption: 12,
    micro: 11,
  },
  lineHeight: { tight: 1.08, snug: 1.25, body: 1.5 },
  tracking: { display: -0.02, tight: -0.01, normal: 0, caps: 0.06 },
  weight: { regular: "400", medium: "500", semibold: "600", bold: "700" },
  // Honor OS Dynamic Type up to this multiple, then stop — keeps large system
  // fonts legible without letting them overflow fixed-height controls.
  maxFontScale: 1.3,
} as const;

// ── Spacing / radii / sizing (4px grid) ─────────────────────────────────────
export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16, // default gutter
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const radius = {
  xs: 6, // chips, tags
  sm: 10, // inputs, small buttons
  md: 14, // buttons, list rows
  lg: 18, // cards
  xl: 24, // sheets, hero panels
  xxl: 32, // modal sheets
  pill: 999,
} as const;

export const sizing = {
  tapMin: 44,
  ctrlSm: 36,
  ctrlMd: 48, // default control height
  ctrlLg: 56, // primary CTAs
  screenPad: 20,
  safeTopMin: 56, // floor for top padding when a device reports no status-bar inset
  bottomNavH: 64,
  tabBarClearance: 110, // scroll-content clearance above the bottom tab bar
  contentMax: 440, // content column cap; wider screens center within it
} as const;

// ── Motion ──────────────────────────────────────────────────────────────────
export const motion = {
  duration: { d1: 120, d2: 180, d3: 240, d4: 360 },
  easeOut: [0.22, 1, 0.36, 1] as const,
  easeIn: [0.4, 0, 1, 1] as const,
  easeMid: [0.4, 0, 0.2, 1] as const,
  easeSnap: [0.3, 0.7, 0.2, 1] as const,
  press: { scale: 0.98, durationMs: 120 },
} as const;

// ── Elevation (warm jade-ink shadows, RN approximations) ────────────────────
type Shadow = {
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: { width: number; height: number };
  elevation: number;
};

const shadowInk = "#0A1F1B"; // jade-ink tint base (never pure black)

export const elevation: Record<"xs" | "sm" | "md" | "lg" | "sheet", Shadow> = {
  xs: { shadowColor: shadowInk, shadowOpacity: 0.06, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  sm: { shadowColor: shadowInk, shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  md: { shadowColor: shadowInk, shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  lg: { shadowColor: shadowInk, shadowOpacity: 0.16, shadowRadius: 40, shadowOffset: { width: 0, height: 18 }, elevation: 18 },
  sheet: { shadowColor: shadowInk, shadowOpacity: 0.2, shadowRadius: 40, shadowOffset: { width: 0, height: -8 }, elevation: 24 },
};

// ── Status ramp factory ─────────────────────────────────────────────────────
type StatusRamp = { solid: string; text: string; bg: string };
type StatusKey = "paid" | "due" | "upcoming" | "overdue" | "critical";

// ── Light theme (warm paper) — PRIMARY ──────────────────────────────────────
const lightColors = {
  // surfaces
  bgApp: "#F6F5F2", // paper
  surfaceCard: "#FFFFFF",
  surfaceSunk: "#EFEDE7", // sand
  surfaceInk: jade[800], // dark hero panels in light mode
  // borders
  borderHair: "#E2DFD8", // line-100
  borderFaint: "#ECEAE3", // line-50
  borderStrong: "#CFCBC1", // line-200
  // text
  textPrimary: "#16201E", // ink-900
  textSecondary: "#5A655F", // ink-500
  textTertiary: "#646E68", // ink-400 (darkened to clear WCAG-AA on paper/card)
  textDisabled: "#AEB5AF", // ink-300
  textOnBrand: "#F4FBF8",
  textOnInk: "#E8F0ED",
  // action / accent
  action: jade[500],
  actionPress: jade[700],
  actionText: jade[500], // jade-as-text on light (AA at <18px)
  accent: amber[500], // the single spark (due / act-now) — fills only
  accentText: amber[700], // amber-as-text on light (AA at <18px)
  selectedTint: jade[50], // brand-tinted selection / active background
  focusRing: "#2E9079",
  // confidence
  confHigh: jade[500],
  confMed: amber[500],
  confLow: "#C0432B",
} as const;

const lightStatus: Record<StatusKey, StatusRamp> = {
  paid: { solid: "#0E6E5C", text: "#0B5C4D", bg: "#DCEFE9" },
  due: { solid: "#E0922F", text: "#8A5A12", bg: "#FBEFD8" },
  upcoming: { solid: "#41607A", text: "#2E4C64", bg: "#E5EBF0" },
  overdue: { solid: "#C0432B", text: "#9A3320", bg: "#F8E3DC" },
  critical: { solid: "#A3231B", text: "#821B14", bg: "#F6DBD7" },
};

// ── Dark theme ("Midnight Meridian" — jade-ink) ─────────────────────────────
const darkColors = {
  bgApp: "#0A2E2A", // paper (dark)
  surfaceCard: "#103A35",
  surfaceSunk: "#0E3833", // sand
  surfaceInk: "#07201D",
  borderHair: "#1C4D46", // line-100
  borderFaint: "#16433D", // line-50
  borderStrong: "#2A5F57", // line-200
  textPrimary: "#ECF3F0", // ink-900
  textSecondary: "#95A8A2", // ink-500
  textTertiary: "#8FA39D", // ink-400 (lightened to clear WCAG-AA on dark surfaces)
  textDisabled: "#4F635D", // ink-300
  textOnBrand: "#F4FBF8",
  textOnInk: "#E8F0ED",
  action: "#2E9079", // jade-400
  actionPress: "#9CD0C1",
  actionText: jade[300], // jade-as-text on dark (AA at <18px) — #66B3A0
  accent: amber[500],
  accentText: amber[300],
  selectedTint: "#15433C",
  focusRing: "#66B3A0",
  confHigh: "#66B3A0",
  confMed: amber[300],
  confLow: "#E58E78",
} as const;

const darkStatus: Record<StatusKey, StatusRamp> = {
  paid: { solid: "#0E6E5C", text: "#66B3A0", bg: "#0F4339" },
  due: { solid: "#E0922F", text: "#ECB45F", bg: "#3C2F12" },
  upcoming: { solid: "#41607A", text: "#92B2CC", bg: "#1B3346" },
  overdue: { solid: "#C0432B", text: "#E58E78", bg: "#3E1F18" },
  critical: { solid: "#A3231B", text: "#E89084", bg: "#421A15" },
};

// ── Assembled themes ────────────────────────────────────────────────────────
export type ThemeColors = { [K in keyof typeof lightColors]: string };

export type MeridianTheme = {
  name: "light" | "dark";
  color: ThemeColors;
  status: Record<StatusKey, StatusRamp>;
  jade: typeof jade;
  amber: typeof amber;
  typography: typeof typography;
  space: typeof space;
  radius: typeof radius;
  sizing: typeof sizing;
  motion: typeof motion;
  elevation: typeof elevation;
};

const shared = { jade, amber, typography, space, radius, sizing, motion, elevation };

export const lightTheme: MeridianTheme = { name: "light", color: lightColors, status: lightStatus, ...shared };
export const darkTheme: MeridianTheme = { name: "dark", color: darkColors, status: darkStatus, ...shared };

export const meridianThemes = { light: lightTheme, dark: darkTheme } as const;
export type ThemeName = keyof typeof meridianThemes;
