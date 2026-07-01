import "react-native-gesture-handler";
import "react-native-reanimated";
import "react-native-get-random-values";
import "react-native-url-polyfill/auto";

import {
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from "@expo-google-fonts/bricolage-grotesque";
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
} from "@expo-google-fonts/hanken-grotesk";
import {
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_500Medium,
  IBMPlexSansArabic_600SemiBold,
  IBMPlexSansArabic_700Bold,
} from "@expo-google-fonts/ibm-plex-sans-arabic";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium, JetBrainsMono_600SemiBold } from "@expo-google-fonts/jetbrains-mono";
import { useFonts } from "expo-font";
import { Stack, type ErrorBoundaryProps } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { LogBox } from "react-native";

import { useNotificationObservers } from "@/features/reminders/notificationObservers";
import { AppLockGate } from "@/features/security/AppLockGate";
import { LaunchSplashGate } from "@/features/splash/LaunchSplashGate";
import { MeridianProviders } from "@/shared/providers/MeridianProviders";
import { AppErrorFallback } from "@/shared/ui/AppErrorFallback";
import { Sentry, startPerformanceJourney } from "@/shared/observability/sentry";

void SplashScreen.preventAutoHideAsync();

const ignoredNativeWarnings = ["SafeAreaView has been deprecated"];
const warningFilterGlobal = globalThis as typeof globalThis & {
  __meridianWarningFilterInstalled?: boolean;
};

if (!warningFilterGlobal.__meridianWarningFilterInstalled) {
  const originalWarn = console.warn;

  console.warn = (...args: unknown[]) => {
    const message = args.map((arg) => String(arg)).join(" ");

    if (ignoredNativeWarnings.some((ignoredWarning) => message.includes(ignoredWarning))) {
      return;
    }

    originalWarn(...args);
  };

  warningFilterGlobal.__meridianWarningFilterInstalled = true;
}

LogBox.ignoreLogs(ignoredNativeWarnings);

function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    IBMPlexSansArabic_400Regular,
    IBMPlexSansArabic_500Medium,
    IBMPlexSansArabic_600SemiBold,
    IBMPlexSansArabic_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
  });

  useEffect(() => {
    startPerformanceJourney("open_to_home");
  }, []);

  useNotificationObservers();

  return (
    <MeridianProviders>
      <LaunchSplashGate fontsReady={fontsLoaded || Boolean(fontError)}>
        <AppLockGate>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(app)" />
            <Stack.Screen name="dev/force-error" />
          </Stack>
        </AppLockGate>
      </LaunchSplashGate>
    </MeridianProviders>
  );
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <AppErrorFallback error={error} onRetry={retry} />;
}

export default Sentry.wrap(RootLayout);
