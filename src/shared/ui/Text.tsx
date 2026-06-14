import { Text as NativeText, StyleSheet, type TextProps as NativeTextProps } from "react-native";

import { tokens } from "@/shared/theme/tokens";

type TextVariant = "display" | "h1" | "amount" | "cardTitle" | "body" | "caption" | "eyebrow" | "mono";

type TextProps = NativeTextProps & {
  variant?: TextVariant;
  muted?: boolean;
};

export function Text({ variant = "body", muted = false, style, ...props }: TextProps) {
  return <NativeText {...props} style={[styles.base, styles[variant], muted && styles.muted, style]} />;
}

const styles = StyleSheet.create({
  base: {
    color: tokens.colors.ink,
    fontFamily: tokens.font.bodyRegular,
  },
  muted: {
    color: tokens.colors.muted,
  },
  display: {
    fontFamily: tokens.font.displayBold,
    fontSize: 38,
    lineHeight: 40,
  },
  h1: {
    fontFamily: tokens.font.displayBold,
    fontSize: 28,
    lineHeight: 32,
  },
  amount: {
    fontFamily: tokens.font.displayBold,
    fontSize: 42,
    lineHeight: 48,
  },
  cardTitle: {
    fontFamily: tokens.font.displayBold,
    fontSize: 27,
    lineHeight: 31,
  },
  body: {
    fontFamily: tokens.font.bodyRegular,
    fontSize: 15,
    lineHeight: 23,
  },
  caption: {
    fontFamily: tokens.font.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  eyebrow: {
    color: tokens.colors.accent,
    fontFamily: tokens.font.monoRegular,
    fontSize: 11,
    letterSpacing: 1.76,
    lineHeight: 16,
    textTransform: "uppercase",
  },
  mono: {
    fontFamily: tokens.font.monoRegular,
    fontSize: 12,
    lineHeight: 18,
  },
});
