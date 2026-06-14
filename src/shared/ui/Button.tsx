import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

import { tokens } from "@/shared/theme/tokens";

import { PressableScale } from "./PressableScale";
import { Text } from "./Text";

export type ButtonVariant = "gold" | "ghost" | "text" | "danger";
export type ButtonSize = "lg" | "md" | "sm";

export type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  solid?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  variant = "gold",
  size = "lg",
  block = false,
  solid = false,
  loading = false,
  loadingLabel,
  leftIcon,
  rightIcon,
  disabled,
  accessibilityLabel,
  style,
  ...props
}: ButtonProps) {
  const sizeToken = tokens.control.button.sizes[size];
  const ringRadius = sizeToken.radius + tokens.control.focusRingOffset;
  const visualLabel = loading ? loadingLabel ?? label : label;
  const hitSlopSize = Math.max(0, (tokens.control.minTouchTarget - sizeToken.minHeight) / 2);
  const hitSlop = hitSlopSize > 0 ? { top: hitSlopSize, right: hitSlopSize, bottom: hitSlopSize, left: hitSlopSize } : undefined;
  const isGold = variant === "gold";
  const isDangerSolid = variant === "danger" && solid;
  const textStyle = [
    styles.label,
    {
      color: labelColor(variant, solid),
      fontSize: sizeToken.fontSize,
      lineHeight: sizeToken.lineHeight,
    },
  ];

  return (
    <PressableScale
      {...props}
      accessibilityLabel={accessibilityLabel ?? label}
      busy={loading}
      disabled={Boolean(disabled)}
      focusRadius={ringRadius}
      haptic
      hitSlop={hitSlop}
      outerStyle={[block && styles.block, style]}
      pressOverlayColor={isGold ? tokens.colors.goldBright : undefined}
      pressScale={tokens.control.button.pressScale}
      pressableStyle={[
        styles.base,
        styles[variant],
        isDangerSolid && styles.dangerSolid,
        {
          minHeight: sizeToken.minHeight,
          borderRadius: sizeToken.radius,
          paddingHorizontal: sizeToken.paddingHorizontal,
          paddingVertical: sizeToken.paddingVertical,
        },
      ]}
    >
      {(isGold || isDangerSolid) && <ButtonFill variant={variant} solid={solid} radius={sizeToken.radius} />}
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={spinnerColor(variant, solid)} size="small" /> : leftIcon}
        <Text variant="caption" style={textStyle}>
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

function ButtonFill({ variant, solid, radius }: { variant: ButtonVariant; solid: boolean; radius: number }) {
  if (variant === "gold") {
    return (
      <LinearGradient
        colors={[tokens.colors.goldBright, tokens.colors.accent2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
      />
    );
  }

  if (variant === "danger" && solid) {
    return <View style={[StyleSheet.absoluteFill, styles.dangerSolidFill, { borderRadius: radius }]} />;
  }

  return null;
}

function labelColor(variant: ButtonVariant, solid: boolean) {
  if (variant === "gold") {
    return tokens.colors.goldInk;
  }

  if (variant === "danger") {
    return solid ? tokens.colors.dangerInk : tokens.colors.over;
  }

  if (variant === "text") {
    return tokens.colors.accent;
  }

  return tokens.colors.ink;
}

function spinnerColor(variant: ButtonVariant, solid: boolean) {
  return variant === "gold" || (variant === "danger" && solid) ? tokens.colors.goldInk : tokens.colors.ink;
}

const styles = StyleSheet.create({
  block: {
    width: "100%",
  },
  base: {
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0,
  },
  content: {
    position: "relative",
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.control.button.gap,
  },
  label: {
    fontFamily: tokens.font.bodySemi,
  },
  gold: {
    shadowColor: tokens.colors.accent,
    shadowOpacity: 0.22,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  ghost: {
    borderWidth: 1,
    borderColor: tokens.colors.line,
    backgroundColor: tokens.colors.panel,
  },
  text: {
    backgroundColor: "transparent",
  },
  danger: {
    borderWidth: 1,
    borderColor: tokens.colors.dangerBorder,
    backgroundColor: tokens.colors.dangerTint,
  },
  dangerSolid: {
    borderWidth: 0,
  },
  dangerSolidFill: {
    backgroundColor: tokens.colors.over,
  },
});
