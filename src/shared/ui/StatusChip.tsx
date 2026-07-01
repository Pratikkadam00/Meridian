import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import type { MeridianTheme } from "@/shared/theme/meridian";
import { useThemedStyles } from "@/shared/theme/ThemeProvider";

import { Text } from "./Text";

export type StatusChipVariant = "due" | "ok" | "over";

type StatusChipProps = {
  label: string;
  variant: StatusChipVariant;
  style?: StyleProp<ViewStyle>;
};

// Maps the app's due/ok/over onto the new status ramps (due=amber, ok=paid-jade,
// over=overdue-terracotta). Always a dot + word (never color alone).
export function StatusChip({ label, variant, style }: StatusChipProps) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View accessible accessibilityRole="text" accessibilityLabel={label} style={[styles.base, styles[variant], style]}>
      <View accessibilityElementsHidden importantForAccessibility="no" style={[styles.dot, styles[`${variant}Dot`]]} />
      <Text variant="caption" style={[styles.label, styles[`${variant}Label`]]}>
        {label}
      </Text>
    </View>
  );
}

const makeStyles = (t: MeridianTheme) =>
  StyleSheet.create({
    base: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderRadius: t.radius.pill,
      paddingHorizontal: 11,
      paddingVertical: 5,
    },
    dot: { width: 5, height: 5, borderRadius: t.radius.pill },
    label: { fontFamily: t.typography.family.uiSemi, fontSize: 11, lineHeight: 16 },
    due: { backgroundColor: t.status.due.bg },
    ok: { backgroundColor: t.status.paid.bg },
    over: { backgroundColor: t.status.overdue.bg },
    dueDot: { backgroundColor: t.status.due.solid },
    okDot: { backgroundColor: t.status.paid.solid },
    overDot: { backgroundColor: t.status.overdue.solid },
    dueLabel: { color: t.status.due.text },
    okLabel: { color: t.status.paid.text },
    overLabel: { color: t.status.overdue.text },
  });
