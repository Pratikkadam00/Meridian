import { Check, type LucideIcon } from "lucide-react-native";
import { StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

import { tokens } from "@/shared/theme/tokens";

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
  return (
    <View accessibilityLabel={accessibilityLabel} accessibilityRole="tablist" style={[styles.segment, style]}>
      {options.map((option) => {
        const selected = option === value;

        return (
          <PressableScale
            key={option}
            accessibilityLabel={labels?.[option] ?? option}
            focusRadius={tokens.control.segmented.itemRadius + tokens.control.focusRingOffset}
            haptic
            onPress={() => onChange(option)}
            outerStyle={styles.segmentItemWrap}
            pressScale={tokens.control.optionChip.pressScale}
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
  return (
    <PressableScale
      {...props}
      accessibilityLabel={accessibilityLabel ?? title}
      disabled={Boolean(disabled)}
      focusRadius={tokens.control.optionCard.radius + tokens.control.focusRingOffset}
      haptic
      outerStyle={style}
      pressScale={tokens.control.optionCard.pressScale}
      pressableStyle={[styles.optionCard, selected && styles.optionCardSelected]}
      selected={selected}
    >
      <View style={styles.optionIcon}>
        <Icon size={22} color={tokens.colors.accent} strokeWidth={2.1} />
      </View>
      <View style={styles.optionCopy}>
        <Text variant="cardTitle" style={styles.optionTitle}>
          {title}
        </Text>
        <Text variant="caption" muted style={styles.optionSubtitle}>
          {subtitle}
        </Text>
      </View>
      <View style={[styles.optionTick, selected && styles.optionTickSelected]}>
        {selected ? <Check size={13} color={tokens.colors.goldInk} strokeWidth={3} /> : null}
      </View>
    </PressableScale>
  );
}

export function OptionChip({ label, selected = false, disabled, accessibilityLabel, style, ...props }: OptionChipProps) {
  return (
    <PressableScale
      {...props}
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={Boolean(disabled)}
      focusRadius={tokens.control.optionChip.radius + tokens.control.focusRingOffset}
      haptic
      outerStyle={style}
      pressScale={tokens.control.optionChip.pressScale}
      pressableStyle={[styles.optionChip, selected && styles.optionChipSelected]}
      selected={selected}
    >
      <Text variant="caption" style={[styles.optionChipText, selected && styles.optionChipTextSelected]}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  segment: {
    minHeight: tokens.control.segmented.minHeight,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: tokens.colors.line,
    borderRadius: tokens.control.segmented.radius,
    backgroundColor: tokens.colors.panel,
    padding: tokens.control.segmented.padding,
  },
  segmentItemWrap: {
    flex: 1,
  },
  segmentOption: {
    minHeight: tokens.control.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: tokens.control.segmented.itemRadius,
    paddingHorizontal: tokens.control.segmented.itemPaddingHorizontal,
    paddingVertical: tokens.control.segmented.itemPaddingVertical,
  },
  segmentOptionSelected: {
    backgroundColor: tokens.colors.panel2,
  },
  segmentText: {
    color: tokens.colors.muted,
    fontFamily: tokens.font.bodyMedium,
  },
  segmentTextSelected: {
    color: tokens.colors.ink,
  },
  optionCard: {
    minHeight: tokens.control.optionCard.minHeight,
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.control.optionCard.gap,
    borderWidth: 1,
    borderColor: tokens.colors.line,
    borderRadius: tokens.control.optionCard.radius,
    backgroundColor: tokens.colors.panel,
    padding: tokens.control.optionCard.padding,
  },
  optionCardSelected: {
    borderColor: tokens.colors.accent,
    backgroundColor: tokens.colors.goldTint,
  },
  optionIcon: {
    width: tokens.control.optionCard.iconSize,
    height: tokens.control.optionCard.iconSize,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: tokens.control.optionCard.iconRadius,
    backgroundColor: tokens.colors.panel2,
  },
  optionCopy: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    lineHeight: 20,
  },
  optionSubtitle: {
    marginTop: 2,
  },
  optionTick: {
    width: tokens.control.optionCard.tickSize,
    height: tokens.control.optionCard.tickSize,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: tokens.colors.line,
    borderRadius: tokens.radius.pill,
  },
  optionTickSelected: {
    borderColor: tokens.colors.accent,
    backgroundColor: tokens.colors.accent,
  },
  optionChip: {
    minHeight: tokens.control.optionChip.minHeight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: tokens.colors.line,
    borderRadius: tokens.control.optionChip.radius,
    backgroundColor: tokens.colors.panel,
    paddingHorizontal: tokens.control.optionChip.paddingHorizontal,
    paddingVertical: tokens.control.optionChip.paddingVertical,
  },
  optionChipSelected: {
    borderColor: tokens.colors.accent,
    backgroundColor: tokens.colors.goldTint,
  },
  optionChipText: {
    color: tokens.colors.muted,
    fontFamily: tokens.font.bodyMedium,
  },
  optionChipTextSelected: {
    color: tokens.colors.ink,
  },
});
