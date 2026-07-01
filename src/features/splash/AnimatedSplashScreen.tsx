import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { useTheme } from "@/shared/theme/ThemeProvider";
import { Text } from "@/shared/ui/Text";

const MARK_SIZE = 96;
const markPath = Skia.PathBuilder.Make()
  .moveTo(13, 76)
  .lineTo(31, 22)
  .lineTo(48, 58)
  .lineTo(65, 22)
  .lineTo(83, 76)
  .detach();

// Splash sits on the deep jade-ink hero surface. Background + mark follow the
// active theme (surfaceInk / jade[300]); the brand name uses the textOnInk
// token; the meta line keeps a fixed light-on-dark tone.
const BRAND_META = "#95A8A2";

export function AnimatedSplashScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const reveal = useSharedValue(0);
  const brand = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const quick = reducedMotion ? 1 : 0;
    reveal.value = withTiming(1, {
      duration: quick ? 180 : 680,
      easing: Easing.bezier(0.22, 0.61, 0.36, 1),
    });
    brand.value = withDelay(
      quick ? 0 : 420,
      withTiming(1, {
        duration: quick ? 180 : 420,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [brand, reducedMotion, reveal]);

  const revealStyle = useAnimatedStyle(() => ({
    width: MARK_SIZE * reveal.value,
  }));

  const brandStyle = useAnimatedStyle(() => ({
    opacity: brand.value,
    transform: [{ translateY: (1 - brand.value) * 10 }],
  }));

  return (
    <View style={[styles.background, { backgroundColor: theme.color.surfaceInk }]}>
      <View style={styles.stage}>
        <View style={styles.markFrame}>
          <Animated.View style={[styles.markReveal, revealStyle]}>
            <Canvas style={styles.markCanvas}>
              <Path path={markPath} color={theme.jade[300]} style="stroke" strokeWidth={7} strokeCap="round" strokeJoin="round" />
            </Canvas>
          </Animated.View>
        </View>
        <Animated.View style={[styles.brand, brandStyle]}>
          <Text variant="h1" style={{ color: theme.color.textOnInk }}>
            Meridian
          </Text>
          <Text variant="mono" style={styles.brandMeta}>
            {t("splash.tagline")}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  stage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  markFrame: {
    width: MARK_SIZE,
    height: MARK_SIZE,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  markReveal: {
    height: MARK_SIZE,
    overflow: "hidden",
  },
  markCanvas: {
    width: MARK_SIZE,
    height: MARK_SIZE,
  },
  brand: {
    alignItems: "center",
    marginTop: 16,
  },
  brandMeta: {
    color: BRAND_META,
    marginTop: 4,
    textTransform: "uppercase",
  },
});
