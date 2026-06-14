import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import { Bell, Fingerprint, Languages, LogOut } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { useAuth } from "@/features/auth/AuthProvider";
import { registerForReminderPush } from "@/features/reminders/notificationRegistration";
import { authenticateAppLock, hasBiometricHardware, isBiometricLockEnabled, setBiometricLockEnabled } from "@/features/security/appLock";
import { useRepositories } from "@/shared/data/RepositoryProvider";
import { useI18nControls } from "@/shared/lib/i18n/I18nProvider";
import { captureNonFatalError } from "@/shared/observability/sentry";
import { tokens } from "@/shared/theme/tokens";
import { GhostButton, GoldButton } from "@/shared/ui/Button";
import { Screen } from "@/shared/ui/Screen";
import { Surface } from "@/shared/ui/Surface";
import { Text } from "@/shared/ui/Text";

export function SettingsScreen() {
  const { profile, signOut } = useAuth();
  const { reminders } = useRepositories();
  const { language, setLanguage } = useI18nControls();

  const [lockEnabled, setLockEnabled] = useState(false);
  const [pushMessage, setPushMessage] = useState<string | null>(null);
  const [lockMessage, setLockMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<"push" | "lock" | "signout" | null>(null);

  useEffect(() => {
    let active = true;
    void isBiometricLockEnabled().then((enabled) => {
      if (active) {
        setLockEnabled(enabled);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  async function handleEnablePush() {
    setPushMessage(null);
    setBusy("push");
    try {
      const message = await registerForReminderPush(reminders);
      setPushMessage(message);
    } catch (error) {
      captureNonFatalError("settings_push_register_failed", error, { surface: "settings" });
      setPushMessage(error instanceof Error ? error.message : "Could not enable push reminders.");
    } finally {
      setBusy(null);
    }
  }

  async function handleToggleLock() {
    setLockMessage(null);
    setBusy("lock");
    try {
      if (lockEnabled) {
        // Re-authenticate before turning the lock off, so a passer-by can't.
        const ok = await authenticateAppLock("Confirm to turn off app lock");
        if (!ok) {
          return;
        }
        await setBiometricLockEnabled(false);
        setLockEnabled(false);
        setLockMessage("App lock turned off.");
        return;
      }

      if (!(await hasBiometricHardware())) {
        setLockMessage("Set up Face ID or device biometrics first, then enable app lock here.");
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({ promptMessage: "Enable Meridian app lock", cancelLabel: "Not now" });
      if (result.success) {
        await setBiometricLockEnabled(true);
        setLockEnabled(true);
        setLockMessage("Biometric app lock is on.");
      }
    } catch (error) {
      captureNonFatalError("settings_app_lock_failed", error, { surface: "settings" });
      setLockMessage("Could not change the app lock. Try again later.");
    } finally {
      setBusy(null);
    }
  }

  async function handleSignOut() {
    setBusy("signout");
    try {
      await signOut();
      router.replace("/welcome");
    } catch (error) {
      captureNonFatalError("settings_sign_out_failed", error, { surface: "settings" });
    } finally {
      setBusy(null);
    }
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text variant="eyebrow">Your workspace</Text>
        <Text variant="h1" style={styles.title}>
          Settings
        </Text>

        <Surface style={styles.card}>
          <Text variant="caption" muted>
            Signed in as
          </Text>
          <Text variant="cardTitle" style={styles.cardValue}>
            {profile?.full_name ?? "Preview broker"}
          </Text>
          {profile?.email ? (
            <Text variant="caption" muted>
              {profile.email}
            </Text>
          ) : null}
          {profile?.role ? (
            <Text variant="caption" muted style={styles.role}>
              {profile.role === "solo" ? "Solo broker" : "Brokerage team"}
            </Text>
          ) : null}
        </Surface>

        <Surface style={styles.card}>
          <View style={styles.rowHeader}>
            <Bell size={18} color={tokens.colors.accent} strokeWidth={2.1} />
            <Text variant="cardTitle" style={styles.rowTitle}>
              Notifications
            </Text>
          </View>
          <Text variant="caption" muted style={styles.rowBody}>
            Get a push reminder before every milestone is due.
          </Text>
          <GhostButton label={busy === "push" ? "Connecting" : "Enable push reminders"} disabled={busy !== null} onPress={handleEnablePush} />
          {pushMessage ? (
            <Text variant="caption" muted style={styles.message}>
              {pushMessage}
            </Text>
          ) : null}
        </Surface>

        <Surface style={styles.card}>
          <View style={styles.rowHeader}>
            <Fingerprint size={18} color={tokens.colors.accent} strokeWidth={2.1} />
            <Text variant="cardTitle" style={styles.rowTitle}>
              App lock
            </Text>
          </View>
          <Text variant="caption" muted style={styles.rowBody}>
            Require Face ID / biometrics each time Meridian opens.
          </Text>
          <GhostButton label={busy === "lock" ? "Please wait" : lockEnabled ? "Turn off app lock" : "Enable app lock"} disabled={busy !== null} onPress={handleToggleLock} />
          {lockMessage ? (
            <Text variant="caption" muted style={styles.message}>
              {lockMessage}
            </Text>
          ) : null}
        </Surface>

        <Surface style={styles.card}>
          <View style={styles.rowHeader}>
            <Languages size={18} color={tokens.colors.accent} strokeWidth={2.1} />
            <Text variant="cardTitle" style={styles.rowTitle}>
              Language
            </Text>
          </View>
          <Text variant="caption" muted style={styles.rowBody}>
            Switching to Arabic mirrors the app right-to-left (the app reloads).
          </Text>
          <View style={styles.languageRow}>
            <GhostButton label="English" disabled={busy !== null || language === "en"} onPress={() => setLanguage("en")} style={styles.languageButton} />
            <GhostButton label="العربية" disabled={busy !== null || language === "ar"} onPress={() => setLanguage("ar")} style={styles.languageButton} />
          </View>
        </Surface>

        <View style={styles.signOutWrap}>
          <View style={styles.signOutRow}>
            <LogOut size={18} color={tokens.colors.over} strokeWidth={2.1} />
            <Text variant="caption" muted style={styles.rowTitle}>
              Sign out of this device
            </Text>
          </View>
          <GoldButton label={busy === "signout" ? "Signing out" : "Sign out"} disabled={busy !== null} onPress={handleSignOut} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: tokens.spacing[32],
    gap: tokens.spacing[12],
  },
  title: {
    marginTop: tokens.spacing[8],
    marginBottom: tokens.spacing[8],
  },
  card: {
    padding: tokens.spacing[16],
    gap: tokens.spacing[8],
  },
  cardValue: {
    fontSize: 18,
    lineHeight: 22,
  },
  role: {
    marginTop: tokens.spacing[4],
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[8],
  },
  rowTitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  rowBody: {
    marginBottom: tokens.spacing[4],
  },
  message: {
    marginTop: tokens.spacing[4],
  },
  languageRow: {
    flexDirection: "row",
    gap: tokens.spacing[8],
  },
  languageButton: {
    flex: 1,
  },
  signOutWrap: {
    marginTop: tokens.spacing[8],
    gap: tokens.spacing[12],
  },
  signOutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing[8],
  },
});
