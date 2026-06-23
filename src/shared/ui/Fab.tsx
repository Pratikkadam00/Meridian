import { LinearGradient } from "expo-linear-gradient";
import { Plus, type LucideIcon } from "lucide-react-native";
import { StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

import { tokens } from "@/shared/theme/tokens";

import { PressableScale } from "./PressableScale";

export type FabProps = Omit<PressableProps, "children" | "style"> & {
  icon?: LucideIcon;
  label?: string;
  style?: StyleProp<ViewStyle>;
};

export function Fab({ icon: Icon = Plus, label = "Create", disabled, accessibilityLabel, style, ...props }: FabProps) {
  return (
    <PressableScale
      {...props}
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={Boolean(disabled)}
      focusRadius={tokens.control.fab.radius + tokens.control.focusRingOffset}
      haptic
      outerStyle={style}
      pressOverlayColor={tokens.colors.goldBright}
      pressScale={tokens.control.fab.pressScale}
      pressableStyle={styles.base}
    >
      <LinearGradient colors={[tokens.colors.goldBright, tokens.colors.accent2]} start={{ x: 0.25, y: 0.07 }} end={{ x: 0.75, y: 0.93 }} style={StyleSheet.absoluteFill} />
      <View style={styles.iconWrap}>
        <Icon size={tokens.control.fab.iconSize} color={tokens.colors.goldInk} strokeWidth={2.4} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    width: tokens.control.fab.size,
    height: tokens.control.fab.size,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: tokens.control.fab.radius,
    shadowColor: tokens.colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
  },
  iconWrap: {
    position: "relative",
    zIndex: 1,
  },
});
