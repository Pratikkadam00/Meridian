import { Text as NativeText, StyleSheet, type TextProps as NativeTextProps } from "react-native";

import type { MeridianTheme } from "@/shared/theme/meridian";
import { useTheme, useThemedStyles } from "@/shared/theme/ThemeProvider";

// Variant names are kept stable across the gold→jade migration so every call
// site keeps compiling; values now follow the jade/amber type system
// (Bricolage display, Hanken UI, JetBrains mono).
type TextVariant = "display" | "h1" | "amount" | "cardTitle" | "body" | "caption" | "eyebrow" | "mono";

type TextProps = NativeTextProps & {
  variant?: TextVariant;
  muted?: boolean;
  tertiary?: boolean;
};

export function Text({ variant = "body", muted = false, tertiary = false, style, ...props }: TextProps) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  // Cap Dynamic Type so a large OS font setting can't overflow controls; callers
  // can still override per-instance via props.
  return <NativeText maxFontSizeMultiplier={theme.typography.maxFontScale} {...props} style={[styles.base, styles[variant], muted && styles.muted, tertiary && styles.tertiary, style]} />;
}

const makeStyles = (t: MeridianTheme) =>
  StyleSheet.create({
    base: {
      color: t.color.textPrimary,
      fontFamily: t.typography.family.ui,
    },
    muted: {
      color: t.color.textSecondary,
    },
    tertiary: {
      color: t.color.textTertiary,
    },
    display: {
      fontFamily: t.typography.family.display,
      fontSize: 34,
      letterSpacing: -0.68, // -0.02em
      lineHeight: 38,
    },
    h1: {
      // screen titles → the new "title" role (Bricolage 24)
      fontFamily: t.typography.family.display,
      fontSize: 24,
      letterSpacing: -0.24, // -0.01em
      lineHeight: 29,
    },
    amount: {
      fontFamily: t.typography.family.display,
      fontSize: 34,
      letterSpacing: -0.68,
      lineHeight: 38,
    },
    cardTitle: {
      fontFamily: t.typography.family.display,
      fontSize: 20,
      letterSpacing: -0.4,
      lineHeight: 25,
    },
    body: {
      fontFamily: t.typography.family.ui,
      fontSize: 16,
      lineHeight: 24,
    },
    caption: {
      fontFamily: t.typography.family.uiMedium,
      fontSize: 13,
      lineHeight: 18,
    },
    eyebrow: {
      color: t.color.actionText,
      fontFamily: t.typography.family.uiSemi,
      fontSize: 12,
      letterSpacing: 0.72, // 0.06em caps tracking
      lineHeight: 14,
      textTransform: "uppercase",
    },
    mono: {
      fontFamily: t.typography.family.mono,
      fontSize: 13,
      lineHeight: 18,
    },
  });
