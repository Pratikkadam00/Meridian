import { ActivityIndicator, Platform, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

import type { MeridianTheme } from "@/shared/theme/meridian";
import { useTheme, useThemedStyles } from "@/shared/theme/ThemeProvider";

import { PressableScale } from "./PressableScale";
import { Text } from "./Text";

export type SocialButtonProvider = "apple" | "google";

export type SocialButtonProps = Omit<PressableProps, "children" | "style"> & {
  provider: SocialButtonProvider;
  label?: string;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

const APPLE_BG = "#000000";
const APPLE_TEXT = "#FFFFFF";
const APPLE_BORDER = "#2C2C2E";
const GOOGLE_BLUE = "#4285F4";

export function SocialButton({ provider, label, loading = false, disabled, accessibilityLabel, style, ...props }: SocialButtonProps) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const resolvedLabel = label ?? (provider === "apple" ? "Continue with Apple" : "Continue with Google");
  const isApple = provider === "apple";

  return (
    <PressableScale
      {...props}
      accessibilityLabel={accessibilityLabel ?? resolvedLabel}
      busy={loading}
      disabled={Boolean(disabled)}
      focusRadius={14 + 3}
      outerStyle={[styles.block, style]}
      pressScale={0.97}
      pressableStyle={[styles.base, isApple ? styles.apple : styles.google]}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={isApple ? APPLE_TEXT : theme.color.textPrimary} size="small" /> : <SocialMark provider={provider} />}
        <Text variant="caption" style={[styles.label, isApple && styles.appleLabel]}>
          {loading ? "Connecting" : resolvedLabel}
        </Text>
      </View>
    </PressableScale>
  );
}

function SocialMark({ provider }: { provider: SocialButtonProvider }) {
  const styles = useThemedStyles(makeStyles);
  if (provider === "apple") {
    return (
      <Text variant="caption" style={styles.appleMark}>
        {Platform.OS === "ios" ? "Apple" : "A"}
      </Text>
    );
  }

  return (
    <View style={styles.googleMark}>
      <Text variant="caption" style={styles.googleMarkText}>
        G
      </Text>
    </View>
  );
}

const makeStyles = (t: MeridianTheme) =>
  StyleSheet.create({
    block: { width: "100%" },
    base: {
      minHeight: 52,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: t.radius.md,
      paddingHorizontal: 16,
      paddingVertical: 15,
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
    apple: {
      borderWidth: 1,
      borderColor: APPLE_BORDER,
      backgroundColor: APPLE_BG,
    },
    google: {
      borderWidth: 1,
      borderColor: t.color.borderStrong,
      backgroundColor: t.color.surfaceCard,
    },
    label: {
      color: t.color.textPrimary,
      fontFamily: t.typography.family.uiSemi,
      fontSize: 14.5,
      lineHeight: 20,
    },
    appleLabel: { color: APPLE_TEXT },
    appleMark: {
      color: APPLE_TEXT,
      fontFamily: t.typography.family.uiSemi,
      fontSize: 14.5,
      lineHeight: 20,
    },
    googleMark: {
      width: 18,
      height: 18,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: t.radius.pill,
      backgroundColor: t.color.surfaceSunk,
    },
    googleMarkText: {
      color: GOOGLE_BLUE,
      fontFamily: t.typography.family.uiSemi,
      fontSize: 13,
      lineHeight: 18,
    },
  });
