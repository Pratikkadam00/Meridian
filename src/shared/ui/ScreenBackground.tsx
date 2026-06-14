import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";

import { tokens } from "@/shared/theme/tokens";

export type ScreenBackgroundVariant = "screen" | "splash" | "flat";

type ScreenBackgroundProps = {
  children: React.ReactNode;
  variant?: ScreenBackgroundVariant;
  style?: StyleProp<ViewStyle>;
};

export function ScreenBackground({ children, variant = "screen", style }: ScreenBackgroundProps) {
  if (variant === "flat") {
    return <LinearGradient colors={[tokens.colors.bg, tokens.colors.bg]} style={[styles.base, style]}>{children}</LinearGradient>;
  }

  if (variant === "splash") {
    return (
      <LinearGradient colors={[tokens.colors.bg, tokens.colors.pageGlow, tokens.colors.bg]} locations={[0, 0.42, 1]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={[styles.base, style]}>
        {children}
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[tokens.colors.pageGlow, tokens.colors.bg, tokens.colors.bg]} locations={[0, 0.45, 1]} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={[styles.base, style]}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
  },
});
