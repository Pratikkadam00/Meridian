import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { tokens } from "@/shared/theme/tokens";
import { Text } from "@/shared/ui/Text";

export { OptionCard, OptionChip, SegmentedControl, SegmentedControl as SegmentControl } from "@/shared/ui/SelectableControls";

type TeachCardProps = {
  title: string;
  body: string;
  icon: LucideIcon;
};

export function TeachCard({ title, body, icon: Icon }: TeachCardProps) {
  return (
    <View style={styles.teachCard}>
      <View style={styles.teachIcon}>
        <Icon size={22} color={tokens.colors.goldBright} strokeWidth={2.1} />
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

const styles = StyleSheet.create({
  teachCard: {
    flexDirection: "row",
    gap: 15,
    borderWidth: 1,
    borderColor: tokens.colors.line,
    borderRadius: 16,
    backgroundColor: tokens.colors.panel,
    padding: 18,
    marginBottom: 11,
  },
  teachIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: tokens.colors.goldTint,
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
