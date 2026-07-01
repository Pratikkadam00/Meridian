import { Check, type LucideIcon } from "lucide-react-native";
import { StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

import type { MeridianTheme } from "@/shared/theme/meridian";
import { useTheme, useThemedStyles } from "@/shared/theme/ThemeProvider";

import { PressableScale } from "./PressableScale";
import { Text } from "./Text";

export type SegmentedControlProps<T extends string> = {
  options: readonly T[];
  labels?: Partial<Record<T, string>>;
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export type OptionCardProps = Omit<PressableProps, "children" | "style"> & {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
};

export type OptionChipProps = Omit<PressableProps, "children" | "style"> & {
  label: string;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function SegmentedControl<T extends string>({ options, labels, value, onChange, accessibilityLabel, style }: SegmentedControlProps<T>) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View accessibilityLabel={accessibilityLabel} accessibilityRole="tablist" style={[styles.segment, style]}>
      {options.map((option) => {
        const selected = option === value;
        return (
          <PressableScale
            key={option}
            accessibilityLabel={labels?.[option] ?? option}
            accessibilityRole="tab"
            focusRadius={999}
            haptic
            onPress={() => onChange(option)}
            outerStyle={styles.segmentItemWrap}
            pressScale={0.98}
            pressableStyle={[styles.segmentOption, selected && styles.segmentOptionSelected]}
            selected={selected}
          >
            <Text variant="caption" style={[styles.segmentText, selected && styles.segmentTextSelected]}>
              {labels?.[option] ?? option}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

export function OptionCard({ title, subtitle, icon: Icon, selected = false, disabled, accessibilityLabel, style, ...props }: OptionCardProps) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <PressableScale
      {...props}
      accessibilityLabel={accessibilityLabel ?? title}
      disabled={Boolean(disabled)}
      focusRadius={theme.radius.lg + 3}
      haptic
      outerStyle={style}
      pressScale={0.98}
      pressableStyle={[styles.optionCard, selected && styles.optionCardSelected]}
      selected={selected}
    >
      <View style={styles.optionIcon}>
        <Icon size={22} color={theme.color.action} strokeWidth={2.1} />
      </View>
      <View style={styles.optionCopy}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text variant="caption" muted style={styles.optionSubtitle}>
          {subtitle}
        </Text>
      </View>
      <View style={[styles.optionTick, selected && styles.optionTickSelected]}>
        {selected ? <Check size={13} color={theme.color.textOnBrand} strokeWidth={3} /> : null}
      </View>
    </PressableScale>
  );
}

export function OptionChip({ label, selected = false, disabled, accessibilityLabel, style, ...props }: OptionChipProps) {
  const styles = useThemedStyles(makeStyles);
  return (
    <PressableScale
      {...props}
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={Boolean(disabled)}
      focusRadius={14}
      haptic
      outerStyle={style}
      pressScale={0.98}
      pressableStyle={[styles.optionChip, selected && styles.optionChipSelected]}
      selected={selected}
    >
      <Text variant="caption" style={[styles.optionChipText, selected && styles.optionChipTextSelected]}>
        {label}
      </Text>
    </PressableScale>
  );
}

const makeStyles = (t: MeridianTheme) =>
  StyleSheet.create({
    segment: {
      minHeight: 44,
      flexDirection: "row",
      borderWidth: 1,
      borderColor: t.color.borderHair,
      borderRadius: t.radius.pill,
      backgroundColor: t.color.surfaceSunk,
      padding: 4,
    },
    segmentItemWrap: { flex: 1 },
    segmentOption: {
      minHeight: 36,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: t.radius.pill,
      paddingHorizontal: 16,
    },
    segmentOptionSelected: {
      backgroundColor: t.color.surfaceCard,
      ...t.elevation.sm,
    },
    segmentText: {
      color: t.color.textSecondary,
      fontFamily: t.typography.family.uiSemi,
    },
    segmentTextSelected: { color: t.color.textPrimary },
    optionCard: {
      minHeight: 80,
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      borderWidth: 1,
      borderColor: t.color.borderHair,
      borderRadius: t.radius.lg,
      backgroundColor: t.color.surfaceCard,
      padding: 16,
    },
    optionCardSelected: {
      borderColor: t.color.action,
      backgroundColor: t.color.selectedTint,
    },
    optionIcon: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
      backgroundColor: t.color.selectedTint,
    },
    optionCopy: { flex: 1 },
    optionTitle: {
      fontFamily: t.typography.family.uiSemi,
      fontSize: 16,
      lineHeight: 20,
      color: t.color.textPrimary,
    },
    optionSubtitle: { marginTop: 2 },
    optionTick: {
      width: 22,
      height: 22,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: t.color.borderStrong,
      borderRadius: t.radius.pill,
    },
    optionTickSelected: {
      borderColor: t.color.action,
      backgroundColor: t.color.action,
    },
    optionChip: {
      minHeight: 42,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: t.color.borderHair,
      borderRadius: t.radius.sm,
      backgroundColor: t.color.surfaceCard,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    optionChipSelected: {
      borderColor: t.color.action,
      backgroundColor: t.color.selectedTint,
    },
    optionChipText: {
      color: t.color.textSecondary,
      fontFamily: t.typography.family.uiMedium,
    },
    optionChipTextSelected: { color: t.color.textPrimary },
  });
