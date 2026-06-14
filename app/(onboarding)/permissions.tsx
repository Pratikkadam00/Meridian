import { Bell, LockKeyhole } from "lucide-react-native";
import * as LocalAuthentication from "expo-local-authentication";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";

import { OnboardingStepView, persistOnboardingStep, useOnboardingStepTracking } from "@/features/onboarding";
import { trackAnalyticsEvent } from "@/shared/observability/analytics";
import { tokens } from "@/shared/theme/tokens";
import { GoldButton, GhostButton } from "@/shared/ui/Button";
import { ProgressDots } from "@/shared/ui/ProgressDots";
import { Screen } from "@/shared/ui/Screen";
import { Text } from "@/shared/ui/Text";

const BIOMETRIC_KEY = "meridian.biometricLock.enabled.v1";

export default function PermissionsScreen() {
  const [message, setMessage] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  useOnboardingStepTracking("permissions", 4);

  async function continueToEducation(pushStatus: string) {
    trackAnalyticsEvent("onboarding_permissions_selected", {
      pushStatus,
      biometricEnabled,
    });
    await persistOnboardingStep("education");
    router.push("/education");
  }

  async function handleEnableReminders() {
    setMessage(null);
    setIsRequesting(true);

    try {
      const current = await Notifications.getPermissionsAsync();
      const finalStatus = current.granted ? current : await Notifications.requestPermissionsAsync();
      await continueToEducation(finalStatus.granted ? "granted" : finalStatus.status);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Notifications are unavailable on this device.");
    } finally {
      setIsRequesting(false);
    }
  }

  async function handleBiometricLock() {
    setMessage(null);

    if (Platform.OS === "web") {
      setMessage("Biometric lock is available on iOS and Android devices.");
      return;
    }

    const [hasHardware, enrolled] = await Promise.all([LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync()]);

    if (!hasHardware || !enrolled) {
      setMessage("Set up Face ID or device biometrics first, then enable app lock in Settings.");
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Enable Meridian app lock",
      cancelLabel: "Not now",
    });

    if (result.success) {
      await SecureStore.setItemAsync(BIOMETRIC_KEY, "1");
      setBiometricEnabled(true);
      setMessage("Biometric app lock is ready.");
    }
  }

  return (
    <Screen contentStyle={styles.screen}>
      <OnboardingStepView>
        <ProgressDots count={5} activeIndex={3} />
        <View style={styles.center}>
          <View style={styles.iconHero}>
            <Bell size={38} color={tokens.colors.goldBright} strokeWidth={2} />
          </View>
          <Text variant="h1" style={styles.title}>
            Never miss a payment
          </Text>
          <Text variant="body" muted style={styles.lede}>
            {"We'll remind you before every milestone is due, so an Oqood deadline or a handover never slips. Notifications only when it matters."}
          </Text>

          <View style={styles.lockPanel}>
            <LockKeyhole size={18} color={tokens.colors.accent} strokeWidth={2.1} />
            <Text variant="caption" muted style={styles.lockCopy}>
              You can also lock the app with Face ID.
            </Text>
            <GhostButton label={biometricEnabled ? "App lock enabled" : "Enable app lock"} onPress={handleBiometricLock} />
          </View>

          {message ? (
            <Text variant="caption" style={styles.message}>
              {message}
            </Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <GoldButton
            label={isRequesting ? "Requesting" : "Enable reminders"}
            disabled={isRequesting}
            onPress={handleEnableReminders}
            style={isRequesting && styles.disabled}
          />
          <GhostButton label="Maybe later" onPress={() => void continueToEducation("skipped")} />
          <GhostButton label="Back" onPress={() => router.back()} />
        </View>
      </OnboardingStepView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: "space-between",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconHero: {
    width: 84,
    height: 84,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: tokens.colors.goldTint,
    marginBottom: 26,
  },
  title: {
    textAlign: "center",
    fontSize: 30,
    lineHeight: 34,
  },
  lede: {
    maxWidth: 310,
    textAlign: "center",
    marginTop: tokens.spacing[16],
  },
  lockPanel: {
    width: "100%",
    alignItems: "center",
    gap: tokens.spacing[8],
    marginTop: tokens.spacing[32],
  },
  lockCopy: {
    textAlign: "center",
  },
  message: {
    color: tokens.colors.due,
    textAlign: "center",
    marginTop: tokens.spacing[16],
  },
  actions: {
    gap: tokens.spacing[12],
  },
  disabled: {
    opacity: 0.52,
  },
});
