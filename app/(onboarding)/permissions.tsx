import { Bell, LockKeyhole } from "lucide-react-native";
import * as LocalAuthentication from "expo-local-authentication";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, View } from "react-native";

import { OnboardingStepView, persistOnboardingStep, useOnboardingStepTracking } from "@/features/onboarding";
import { hasBiometricHardware, setBiometricLockEnabled } from "@/features/security/appLock";
import { trackAnalyticsEvent } from "@/shared/observability/analytics";
import { captureNonFatalError } from "@/shared/observability/sentry";
import type { MeridianTheme } from "@/shared/theme/meridian";
import { useTheme, useThemedStyles } from "@/shared/theme/ThemeProvider";
import { GoldButton, GhostButton } from "@/shared/ui/Button";
import { ProgressDots } from "@/shared/ui/ProgressDots";
import { Screen } from "@/shared/ui/Screen";
import { Text } from "@/shared/ui/Text";

export default function PermissionsScreen() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [message, setMessage] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  useOnboardingStepTracking("permissions", 4);

  async function continueToEducation(pushStatus: string) {
    trackAnalyticsEvent("onboarding_permissions_selected", {
      pushStatus,
      biometricEnabled,
    });
    // Never dead-end onboarding (PRD §5): if persisting the step fails, still
    // advance — the resume gate will reconcile later.
    try {
      await persistOnboardingStep("education");
    } catch (error) {
      captureNonFatalError("onboarding_step_persist_failed", error, { surface: "permissions" });
    }
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
      setMessage(error instanceof Error ? error.message : t("permissions.notificationsUnavailable"));
    } finally {
      setIsRequesting(false);
    }
  }

  async function handleBiometricLock() {
    setMessage(null);

    if (Platform.OS === "web") {
      setMessage(t("permissions.biometricWebUnavailable"));
      return;
    }

    try {
      if (!(await hasBiometricHardware())) {
        setMessage(t("permissions.biometricSetupFirst"));
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t("permissions.biometricPrompt"),
        cancelLabel: t("permissions.biometricCancel"),
      });

      if (result.success) {
        await setBiometricLockEnabled(true);
        setBiometricEnabled(true);
        setMessage(t("permissions.biometricReady"));
      }
    } catch (error) {
      captureNonFatalError("biometric_enroll_failed", error, { surface: "permissions" });
      setMessage(t("permissions.biometricEnableFailed"));
    }
  }

  return (
    <Screen contentStyle={styles.screen}>
      <OnboardingStepView>
        <ProgressDots count={5} activeIndex={3} />
        <View style={styles.center}>
          <View style={styles.iconHero}>
            <Bell size={38} color={theme.color.action} strokeWidth={2} />
          </View>
          <Text variant="h1" style={styles.title}>
            {t("permissions.title")}
          </Text>
          <Text variant="body" muted style={styles.lede}>
            {t("permissions.lede")}
          </Text>

          <View style={styles.lockPanel}>
            <LockKeyhole size={18} color={theme.color.action} strokeWidth={2.1} />
            <Text variant="caption" muted style={styles.lockCopy}>
              {t("permissions.lockCopy")}
            </Text>
            <GhostButton label={biometricEnabled ? t("permissions.appLockEnabled") : t("permissions.enableAppLock")} onPress={handleBiometricLock} />
          </View>

          {message ? (
            <Text variant="caption" style={styles.message}>
              {message}
            </Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <GoldButton
            label={isRequesting ? t("permissions.requesting") : t("permissions.enableReminders")}
            disabled={isRequesting}
            onPress={handleEnableReminders}
            style={isRequesting && styles.disabled}
          />
          <GhostButton label={t("permissions.maybeLater")} onPress={() => void continueToEducation("skipped")} />
          <GhostButton label={t("permissions.back")} onPress={() => router.back()} />
        </View>
      </OnboardingStepView>
    </Screen>
  );
}

const makeStyles = (t: MeridianTheme) =>
  StyleSheet.create({
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
      borderRadius: t.radius.xl,
      backgroundColor: t.color.selectedTint,
      marginBottom: t.space[6],
    },
    title: {
      textAlign: "center",
      fontSize: 30,
      lineHeight: 34,
    },
    lede: {
      maxWidth: 310,
      textAlign: "center",
      marginTop: t.space[4],
    },
    lockPanel: {
      width: "100%",
      alignItems: "center",
      gap: t.space[2],
      marginTop: t.space[8],
    },
    lockCopy: {
      textAlign: "center",
    },
    message: {
      color: t.color.accentText,
      textAlign: "center",
      marginTop: t.space[4],
    },
    actions: {
      gap: t.space[3],
    },
    disabled: {
      opacity: 0.52,
    },
  });
