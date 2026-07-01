import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { useTheme } from "@/shared/theme/ThemeProvider";

export type ScreenBackgroundVariant = "screen" | "splash" | "flat";

type ScreenBackgroundProps = {
  children: React.ReactNode;
  variant?: ScreenBackgroundVariant;
  style?: StyleProp<ViewStyle>;
};

// The new system is flat warm paper (light) / jade-ink (dark) — no decorative
// glow. "splash" sits on the deep ink hero surface.
export function ScreenBackground({ children, variant = "screen", style }: ScreenBackgroundProps) {
  const { theme } = useTheme();
  const backgroundColor = variant === "splash" ? theme.color.surfaceInk : theme.color.bgApp;

  return <View style={[styles.base, { backgroundColor }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
});
