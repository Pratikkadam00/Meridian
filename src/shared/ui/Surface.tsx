import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { tokens } from "@/shared/theme/tokens";

export type SurfaceVariant = "panel" | "card" | "card-due";

type SurfaceProps = {
  children: React.ReactNode;
  variant?: SurfaceVariant;
  style?: StyleProp<ViewStyle>;
};

export function Surface({ children, variant = "panel", style }: SurfaceProps) {
  if (variant === "card" || variant === "card-due") {
    return (
      <LinearGradient colors={[tokens.colors.deck, tokens.colors.deckEnd]} start={{ x: 0.37, y: 0.02 }} end={{ x: 0.63, y: 0.98 }} style={[styles.card, variant === "card-due" && styles.cardDue, style]}>
        {children}
      </LinearGradient>
    );
  }

  return <View style={[styles.panel, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderColor: tokens.colors.line,
    borderRadius: tokens.radius.panel,
    backgroundColor: tokens.colors.panel,
  },
  card: {
    borderWidth: 1,
    borderColor: tokens.colors.line,
    borderRadius: tokens.radius.deck,
    shadowColor: tokens.colors.black,
    shadowOpacity: 0.5,
    shadowRadius: 54,
    shadowOffset: { width: 0, height: 24 },
    elevation: 16,
  },
  cardDue: {
    borderColor: tokens.colors.goldHairline,
  },
});
