import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { tokens } from "@/shared/theme/tokens";
import { Text } from "@/shared/ui/Text";

const MARK_SIZE = 96;
const markPath = Skia.PathBuilder.Make()
  .moveTo(13, 76)
  .lineTo(31, 22)
  .lineTo(48, 58)
  .lineTo(65, 22)
  .lineTo(83, 76)
  .detach();

export function AnimatedSplashScreen() {
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
    <LinearGradient
      colors={[tokens.colors.panel2, tokens.colors.bg, tokens.colors.black]}
      locations={[0, 0.62, 1]}
      style={styles.background}
    >
      <View style={styles.stage}>
        <View style={styles.markFrame}>
          <Animated.View style={[styles.markReveal, revealStyle]}>
            <Canvas style={styles.markCanvas}>
              <Path path={markPath} color={tokens.colors.goldBright} style="stroke" strokeWidth={7} strokeCap="round" strokeJoin="round" />
            </Canvas>
          </Animated.View>
        </View>
        <Animated.View style={[styles.brand, brandStyle]}>
          <Text variant="h1" style={styles.brandName}>
            Meridian
          </Text>
          <Text variant="mono" muted style={styles.brandMeta}>
            off-plan command center
          </Text>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: tokens.spacing[32],
  },
  background: {
    ...StyleSheet.absoluteFill,
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
    marginTop: tokens.spacing[16],
  },
  brandName: {
    color: tokens.colors.ink,
  },
  brandMeta: {
    marginTop: tokens.spacing[4],
    textTransform: "uppercase",
  },
});
