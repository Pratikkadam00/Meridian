import { StyleSheet, View } from "react-native";

import { tokens } from "@/shared/theme/tokens";

type ProgressDotsProps = {
  count: number;
  activeIndex: number;
  compact?: boolean;
};

export function ProgressDots({ count, activeIndex, compact = false }: ProgressDotsProps) {
  return (
    <View style={compact ? styles.compact : styles.full}>
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={[
            compact ? styles.compactDot : styles.fullDot,
            index === activeIndex && (compact ? styles.compactActive : styles.fullActive),
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  full: {
    flexDirection: "row",
    gap: 6,
  },
  compact: {
    flexDirection: "row",
    gap: 6,
  },
  fullDot: {
    height: 4,
    flex: 1,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.line,
  },
  compactDot: {
    width: 10,
    height: 4,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.line,
  },
  // onboarding bars stay equal-width and just turn gold (§6.2–6.5 .prog-dots i.on)
  fullActive: {
    backgroundColor: tokens.colors.accent,
  },
  // welcome/deck dots grow to a gold pill (§6.1 active 24px)
  compactActive: {
    width: 24,
    backgroundColor: tokens.colors.accent,
  },
});
