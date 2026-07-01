import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/shared/theme/ThemeProvider";

import { ScreenBackground, type ScreenBackgroundVariant } from "./ScreenBackground";

type ScreenProps = {
  children: React.ReactNode;
  background?: ScreenBackgroundVariant;
  contentStyle?: StyleProp<ViewStyle>;
};

// The background fills the device edge-to-edge, while the content lives in a
// column capped at `contentMax` and centred. On phones the column is already
// narrower than the cap, so this is a no-op; on tablets / large screens the
// content stays a readable width instead of stretching across the whole panel.
export function Screen({ children, background = "screen", contentStyle }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <ScreenBackground variant={background} style={styles.fill}>
      <View
        style={[
          styles.content,
          {
            maxWidth: theme.sizing.contentMax,
            paddingHorizontal: theme.sizing.screenPad,
            paddingTop: Math.max(insets.top + theme.space[4], theme.sizing.safeTopMin),
            paddingBottom: Math.max(insets.bottom + theme.space[4], theme.space[6]),
          },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: "100%",
    alignSelf: "center",
  },
});
