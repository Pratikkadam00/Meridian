import * as SplashScreen from "expo-splash-screen";
import { lazy, Suspense, type PropsWithChildren, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

import { useAuth } from "@/features/auth";

import { hasSeenLaunchSplash, setLaunchSplashSeen } from "./launchSplashStorage";

// Lazy so the Skia bundle is not on the cold-start critical path (the splash is
// skipped entirely on subsequent launches).
const AnimatedSplashScreen = lazy(() => import("./AnimatedSplashScreen").then((module) => ({ default: module.AnimatedSplashScreen })));

type LaunchSplashGateProps = PropsWithChildren<{
  fontsReady: boolean;
}>;

export function LaunchSplashGate({ children, fontsReady }: LaunchSplashGateProps) {
  const { isLoading } = useAuth();
  const reducedMotion = useReducedMotion();
  const [showLaunchSplash, setShowLaunchSplash] = useState(false);
  const [canRenderApp, setCanRenderApp] = useState(false);
  const bootReady = fontsReady && !isLoading;
  const splashDuration = useMemo(() => (reducedMotion ? 360 : 1_200), [reducedMotion]);

  useEffect(() => {
    let cancelled = false;

    async function releaseNativeSplash() {
      if (!bootReady || canRenderApp || showLaunchSplash) {
        return;
      }

      const hasSeenSplash = await hasSeenLaunchSplash();

      if (cancelled) {
        return;
      }

      await SplashScreen.hideAsync().catch(() => undefined);

      if (hasSeenSplash) {
        setCanRenderApp(true);
        return;
      }

      setShowLaunchSplash(true);
    }

    void releaseNativeSplash();

    return () => {
      cancelled = true;
    };
  }, [bootReady, canRenderApp, showLaunchSplash]);

  useEffect(() => {
    if (!showLaunchSplash) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      void setLaunchSplashSeen();
      setCanRenderApp(true);
      setShowLaunchSplash(false);
    }, splashDuration);

    return () => clearTimeout(timeout);
  }, [showLaunchSplash, splashDuration]);

  if (!canRenderApp && !showLaunchSplash) {
    return null;
  }

  return (
    <View style={styles.root}>
      {canRenderApp ? children : null}
      {showLaunchSplash ? (
        <Suspense fallback={null}>
          <AnimatedSplashScreen />
        </Suspense>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
