import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { tokens } from "@/shared/theme/tokens";

import { Text } from "./Text";

export type StatusChipVariant = "due" | "ok" | "over";

type StatusChipProps = {
  label: string;
  variant: StatusChipVariant;
  style?: StyleProp<ViewStyle>;
};

export function StatusChip({ label, variant, style }: StatusChipProps) {
  return (
    <View accessibilityLabel={label} style={[styles.base, styles[variant], style]}>
      <View style={[styles.dot, styles[`${variant}Dot`]]} />
      <Text variant="caption" style={[styles.label, styles[`${variant}Label`]]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.control.statusChip.gap,
    borderRadius: tokens.radius.pill,
    paddingHorizontal: tokens.control.statusChip.paddingHorizontal,
    paddingVertical: tokens.control.statusChip.paddingVertical,
  },
  dot: {
    width: tokens.control.statusChip.dotSize,
    height: tokens.control.statusChip.dotSize,
    borderRadius: tokens.radius.pill,
  },
  label: {
    fontFamily: tokens.font.bodySemi,
    fontSize: tokens.control.statusChip.fontSize,
    lineHeight: tokens.control.statusChip.lineHeight,
  },
  due: {
    backgroundColor: tokens.colors.dueTint,
  },
  ok: {
    backgroundColor: tokens.colors.okTint,
  },
  over: {
    backgroundColor: tokens.colors.overTint,
  },
  dueDot: {
    backgroundColor: tokens.colors.due,
  },
  okDot: {
    backgroundColor: tokens.colors.ok,
  },
  overDot: {
    backgroundColor: tokens.colors.over,
  },
  dueLabel: {
    color: tokens.colors.due,
  },
  okLabel: {
    color: tokens.colors.ok,
  },
  overLabel: {
    color: tokens.colors.over,
  },
});
