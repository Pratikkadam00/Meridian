import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { tokens } from "@/shared/theme/tokens";
import { ScreenBackground, type ScreenBackgroundVariant } from "./ScreenBackground";

type ScreenProps = {
  children: React.ReactNode;
  background?: ScreenBackgroundVariant;
  contentStyle?: StyleProp<ViewStyle>;
};

export function Screen({ children, background = "screen", contentStyle }: ScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <ScreenBackground
      variant={background}
      style={[
        styles.screen,
        {
          paddingTop: Math.max(insets.top + tokens.spacing[32], 60),
          paddingBottom: Math.max(insets.bottom + tokens.spacing[32], 44),
        },
        contentStyle,
      ]}
    >
      {children}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: tokens.spacing[22],
    backgroundColor: tokens.colors.bg,
  },
});
