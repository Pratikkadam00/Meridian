import { ActivityIndicator, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

import type { MeridianTheme } from "@/shared/theme/meridian";
import { useTheme, useThemedStyles } from "@/shared/theme/ThemeProvider";

import { PressableScale } from "./PressableScale";
import { Text } from "./Text";

export type ButtonVariant = "gold" | "ghost" | "text" | "danger";
export type ButtonSize = "lg" | "md" | "sm";

export type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  /** Retained for API compatibility; danger is always a solid fill now. */
  solid?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

// New system control heights/radius (tokens/spacing.css): lg 56, md 48, sm 36.
const SIZE: Record<ButtonSize, { height: number; paddingHorizontal: number; fontSize: number; radius: number }> = {
  lg: { height: 56, paddingHorizontal: 22, fontSize: 16, radius: 14 },
  md: { height: 48, paddingHorizontal: 18, fontSize: 15, radius: 14 },
  sm: { height: 36, paddingHorizontal: 14, fontSize: 13, radius: 14 },
};

export function Button({
  label,
  variant = "gold",
  size = "lg",
  block = false,
  solid: _solid,
  loading = false,
  loadingLabel,
  leftIcon,
  rightIcon,
  disabled,
  accessibilityLabel,
  style,
  ...props
}: ButtonProps) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const sz = SIZE[size];
  const visualLabel = loading ? loadingLabel ?? label : label;
  const labelColor = buttonLabelColor(theme, variant);
  const isPrimary = variant === "gold";
  const isBusy = Boolean(disabled) || loading;

  return (
    <PressableScale
      {...props}
      accessibilityLabel={accessibilityLabel ?? label}
      busy={loading}
      disabled={isBusy}
      focusRadius={sz.radius + 3}
      haptic
      outerStyle={[block && styles.block, style]}
      pressOverlayColor={isPrimary ? theme.color.actionPress : undefined}
      pressScale={0.98}
      pressableStyle={[
        styles.base,
        styles[variant],
        { minHeight: sz.height, borderRadius: sz.radius, paddingHorizontal: sz.paddingHorizontal },
        isBusy && styles.disabled,
      ]}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={labelColor} size="small" /> : leftIcon}
        <Text variant="caption" style={[styles.label, { color: labelColor, fontSize: sz.fontSize }]}>
          {visualLabel}
        </Text>
        {!loading ? rightIcon : null}
      </View>
    </PressableScale>
  );
}

export function GoldButton(props: Omit<ButtonProps, "variant">) {
  return <Button {...props} block={props.block ?? true} variant="gold" />;
}

export function GhostButton(props: Omit<ButtonProps, "variant">) {
  return <Button {...props} block={props.block ?? true} variant="ghost" />;
}

function buttonLabelColor(theme: MeridianTheme, variant: ButtonVariant): string {
  if (variant === "gold") {
    return theme.color.textOnBrand;
  }
  if (variant === "danger") {
    return theme.color.textOnBrand;
  }
  if (variant === "text") {
    return theme.color.actionText;
  }
  return theme.color.textPrimary; // ghost / secondary
}

const makeStyles = (t: MeridianTheme) =>
  StyleSheet.create({
    block: {
      width: "100%",
    },
    base: {
      position: "relative",
      overflow: "hidden",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 0,
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    label: {
      fontFamily: t.typography.family.uiSemi,
      letterSpacing: -0.15,
    },
    gold: {
      backgroundColor: t.color.action,
      ...t.elevation.sm,
    },
    ghost: {
      backgroundColor: t.color.surfaceCard,
      borderWidth: 1,
      borderColor: t.color.borderStrong,
      ...t.elevation.xs,
    },
    text: {
      backgroundColor: "transparent",
    },
    danger: {
      backgroundColor: t.status.overdue.solid,
      ...t.elevation.sm,
    },
    disabled: {
      opacity: 0.55,
    },
  });
