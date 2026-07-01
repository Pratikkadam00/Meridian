import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

import type { MeridianTheme } from "@/shared/theme/meridian";
import { useTheme, useThemedStyles } from "@/shared/theme/ThemeProvider";

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
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const isFilled = variant === "gold";
  const radius = variant === "circle" ? 999 : theme.radius.md;
  const iconColor = isFilled ? theme.color.textOnBrand : selected ? theme.color.action : theme.color.textPrimary;

  return (
    <PressableScale
      {...props}
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={Boolean(disabled)}
      focusRadius={radius + 3}
      haptic
      outerStyle={style}
      pressOverlayColor={isFilled ? theme.color.actionPress : undefined}
      pressScale={0.9}
      pressableStyle={[styles.base, styles[variant], { borderRadius: radius }]}
      selected={selected}
    >
      <View style={styles.iconWrap}>
        <Icon size={20} color={iconColor} strokeWidth={2.3} />
      </View>
    </PressableScale>
  );
}

const makeStyles = (t: MeridianTheme) =>
  StyleSheet.create({
    base: {
      width: 46,
      height: 46,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    iconWrap: { position: "relative", zIndex: 1 },
    ghost: {
      borderWidth: 1,
      borderColor: t.color.borderHair,
      backgroundColor: t.color.surfaceCard,
    },
    gold: {
      backgroundColor: t.color.action,
      ...t.elevation.sm,
    },
    circle: {
      borderWidth: 1,
      borderColor: t.color.borderHair,
      backgroundColor: t.color.surfaceCard,
    },
  });
