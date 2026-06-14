import { ActivityIndicator, Platform, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

import { tokens } from "@/shared/theme/tokens";

import { PressableScale } from "./PressableScale";
import { Text } from "./Text";

export type SocialButtonProvider = "apple" | "google";

export type SocialButtonProps = Omit<PressableProps, "children" | "style"> & {
  provider: SocialButtonProvider;
  label?: string;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function SocialButton({ provider, label, loading = false, disabled, accessibilityLabel, style, ...props }: SocialButtonProps) {
  const resolvedLabel = label ?? (provider === "apple" ? "Continue with Apple" : "Continue with Google");
  const isApple = provider === "apple";

  return (
    <PressableScale
      {...props}
      accessibilityLabel={accessibilityLabel ?? resolvedLabel}
      busy={loading}
      disabled={Boolean(disabled)}
      focusRadius={tokens.control.socialButton.radius + tokens.control.focusRingOffset}
      outerStyle={[styles.block, style]}
      pressScale={tokens.control.socialButton.pressScale}
      pressableStyle={[styles.base, isApple ? styles.apple : styles.google]}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={isApple ? tokens.colors.authAppleText : tokens.colors.ink} size="small" /> : <SocialMark provider={provider} />}
        <Text variant="caption" style={[styles.label, isApple && styles.appleLabel]}>
          {loading ? "Connecting" : resolvedLabel}
        </Text>
      </View>
    </PressableScale>
  );
}

function SocialMark({ provider }: { provider: SocialButtonProvider }) {
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

const styles = StyleSheet.create({
  block: {
    width: "100%",
  },
  base: {
    minHeight: tokens.control.socialButton.minHeight,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: tokens.control.socialButton.radius,
    paddingHorizontal: tokens.control.socialButton.paddingHorizontal,
    paddingVertical: tokens.control.socialButton.paddingVertical,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.control.socialButton.gap,
  },
  apple: {
    borderWidth: 1,
    borderColor: tokens.colors.authAppleBorder,
    backgroundColor: tokens.colors.authAppleBg,
  },
  google: {
    borderWidth: 1,
    borderColor: tokens.colors.line,
    backgroundColor: tokens.colors.panel,
  },
  label: {
    color: tokens.colors.ink,
    fontFamily: tokens.font.bodySemi,
    fontSize: tokens.control.socialButton.fontSize,
    lineHeight: tokens.control.socialButton.lineHeight,
  },
  appleLabel: {
    color: tokens.colors.authAppleText,
  },
  appleMark: {
    color: tokens.colors.authAppleText,
    fontFamily: tokens.font.bodySemi,
    fontSize: tokens.control.socialButton.fontSize,
    lineHeight: tokens.control.socialButton.lineHeight,
  },
  googleMark: {
    width: tokens.control.socialButton.markSize,
    height: tokens.control.socialButton.markSize,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.panel2,
  },
  googleMarkText: {
    color: tokens.colors.googleBlue,
    fontFamily: tokens.font.bodySemi,
    fontSize: tokens.control.button.sizes.sm.fontSize,
    lineHeight: tokens.control.button.sizes.sm.lineHeight,
  },
});
