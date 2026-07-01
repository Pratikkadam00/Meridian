import { Plus, type LucideIcon } from "lucide-react-native";
import { StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

import type { MeridianTheme } from "@/shared/theme/meridian";
import { useTheme, useThemedStyles } from "@/shared/theme/ThemeProvider";

import { PressableScale } from "./PressableScale";

export type FabProps = Omit<PressableProps, "children" | "style"> & {
  icon?: LucideIcon;
  label?: string;
  style?: StyleProp<ViewStyle>;
};

// Solid jade (action) circle-square with the on-brand icon — the new system's
// docked primary action.
export function Fab({ icon: Icon = Plus, label = "Create", disabled, accessibilityLabel, style, ...props }: FabProps) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <PressableScale
      {...props}
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={Boolean(disabled)}
      focusRadius={21 + 3}
      haptic
      outerStyle={style}
      pressOverlayColor={theme.color.actionPress}
      pressScale={0.93}
      pressableStyle={styles.base}
    >
      <View style={styles.iconWrap}>
        <Icon size={26} color={theme.color.textOnBrand} strokeWidth={2.4} />
      </View>
    </PressableScale>
  );
}

const makeStyles = (t: MeridianTheme) =>
  StyleSheet.create({
    base: {
      width: 60,
      height: 60,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      borderRadius: 21,
      backgroundColor: t.color.action,
      ...t.elevation.md,
    },
    iconWrap: {
      position: "relative",
      zIndex: 1,
    },
  });
