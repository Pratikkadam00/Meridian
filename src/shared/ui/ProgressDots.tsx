import { StyleSheet, View } from "react-native";

import type { MeridianTheme } from "@/shared/theme/meridian";
import { useThemedStyles } from "@/shared/theme/ThemeProvider";

type ProgressDotsProps = {
  count: number;
  activeIndex: number;
  compact?: boolean;
};

export function ProgressDots({ count, activeIndex, compact = false }: ProgressDotsProps) {
  const styles = useThemedStyles(makeStyles);
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

const makeStyles = (t: MeridianTheme) =>
  StyleSheet.create({
    full: { flexDirection: "row", gap: 6 },
    compact: { flexDirection: "row", gap: 6 },
    fullDot: {
      height: 4,
      flex: 1,
      borderRadius: t.radius.pill,
      backgroundColor: t.color.borderStrong,
    },
    compactDot: {
      width: 10,
      height: 4,
      borderRadius: t.radius.pill,
      backgroundColor: t.color.borderStrong,
    },
    // onboarding bars stay equal-width, just turn jade
    fullActive: { backgroundColor: t.color.action },
    // welcome/deck dots grow to a jade pill
    compactActive: { width: 24, backgroundColor: t.color.action },
  });
