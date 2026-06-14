import { LinearGradient } from "expo-linear-gradient";
import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

import { tokens } from "@/shared/theme/tokens";

import { PressableScale } from "./PressableScale";

export type IconButtonVariant = "ghost" | "gold" | "circle";

export type IconButtonProps = Omit<PressableProps, "children" | "style"> & {
  icon: LucideIcon;
  label: string;
  variant?: IconButtonVariant;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({ icon: Icon, label, variant = "ghost", selected, disabled, accessibilityLabel, style, ...props }: IconButtonProps) {
  const isGold = variant === "gold";
  const radius = variant === "circle" ? tokens.control.iconButton.circleRadius : tokens.control.iconButton.radius;

  return (
    <PressableScale
      {...props}
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={Boolean(disabled)}
      focusRadius={radius + tokens.control.focusRingOffset}
      haptic
      outerStyle={style}
      pressScale={tokens.control.iconButton.pressScale}
      pressableStyle={[styles.base, styles[variant], { borderRadius: radius }]}
      selected={selected}
    >
      {isGold ? (
        <LinearGradient colors={[tokens.colors.goldBright, tokens.colors.accent2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: radius }]} />
      ) : null}
      <View style={styles.iconWrap}>
        <Icon size={tokens.control.iconButton.iconSize} color={isGold ? tokens.colors.goldInk : selected ? tokens.colors.goldBright : tokens.colors.ink} strokeWidth={2.3} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    width: tokens.control.iconButton.size,
    height: tokens.control.iconButton.size,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  iconWrap: {
    position: "relative",
    zIndex: 1,
  },
  ghost: {
    borderWidth: 1,
    borderColor: tokens.colors.line,
    backgroundColor: tokens.colors.panel,
  },
  gold: {
    shadowColor: tokens.colors.accent,
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  circle: {
    borderWidth: 1,
    borderColor: tokens.colors.line,
    backgroundColor: tokens.colors.navInset,
  },
});
