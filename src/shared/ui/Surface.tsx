import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import type { MeridianTheme } from "@/shared/theme/meridian";
import { useThemedStyles } from "@/shared/theme/ThemeProvider";

export type SurfaceVariant = "panel" | "card" | "card-due";

type SurfaceProps = {
  children: React.ReactNode;
  variant?: SurfaceVariant;
  style?: StyleProp<ViewStyle>;
};

// New system: flat warm cards = hairline border + soft warm shadow (no
// gradient). "card-due" gets the single amber spark on its border.
export function Surface({ children, variant = "panel", style }: SurfaceProps) {
  const styles = useThemedStyles(makeStyles);
  return <View style={[styles.base, styles[variant === "card-due" ? "cardDue" : variant], style]}>{children}</View>;
}

const makeStyles = (t: MeridianTheme) =>
  StyleSheet.create({
    base: {
      borderWidth: 1,
      borderColor: t.color.borderHair,
      borderRadius: t.radius.lg,
      backgroundColor: t.color.surfaceCard,
    },
    panel: {},
    card: {
      ...t.elevation.sm,
    },
    cardDue: {
      borderColor: t.color.accent,
      ...t.elevation.sm,
    },
  });
