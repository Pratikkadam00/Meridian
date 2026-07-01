import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import type { MeridianTheme } from "@/shared/theme/meridian";
import { useTheme, useThemedStyles } from "@/shared/theme/ThemeProvider";
import { Text } from "@/shared/ui/Text";

export { OptionCard, OptionChip, SegmentedControl, SegmentedControl as SegmentControl } from "@/shared/ui/SelectableControls";

type TeachCardProps = {
  title: string;
  body: string;
  icon: LucideIcon;
};

export function TeachCard({ title, body, icon: Icon }: TeachCardProps) {
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.teachCard}>
      <View style={styles.teachIcon}>
        <Icon size={22} color={theme.color.action} strokeWidth={2.1} />
      </View>
      <View style={styles.teachCopy}>
        <Text variant="cardTitle" style={styles.teachTitle}>
          {title}
        </Text>
        <Text variant="caption" muted style={styles.teachBody}>
          {body}
        </Text>
      </View>
    </View>
  );
}

const makeStyles = (t: MeridianTheme) =>
  StyleSheet.create({
    teachCard: {
      flexDirection: "row",
      gap: 15,
      borderWidth: 1,
      borderColor: t.color.borderHair,
      borderRadius: t.radius.lg,
      backgroundColor: t.color.surfaceCard,
      padding: 18,
      marginBottom: 11,
      ...t.elevation.sm,
    },
    teachIcon: {
      width: 46,
      height: 46,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 13,
      backgroundColor: t.color.selectedTint,
    },
    teachCopy: {
      flex: 1,
    },
    teachTitle: {
      fontSize: 16,
      lineHeight: 20,
    },
    teachBody: {
      marginTop: 3,
      lineHeight: 19,
    },
  });
