import * as Haptics from "expo-haptics";
import * as LocalAuthentication from "expo-local-authentication";
import { router, type Href } from "expo-router";
import { Bell, ChartBar, Fingerprint, Languages, LogOut, Palette, Trash2, Users } from "lucide-react-native";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Linking, ScrollView, StyleSheet, View } from "react-native";

import { useAuth } from "@/features/auth/AuthProvider";
import { registerForReminderPush } from "@/features/reminders/notificationRegistration";
import { authenticateAppLock, hasBiometricHardware, isBiometricLockEnabled, setBiometricLockEnabled } from "@/features/security/appLock";
import { useRepositories } from "@/shared/data/RepositoryProvider";
import { useI18nControls } from "@/shared/lib/i18n/I18nProvider";
import { captureNonFatalError } from "@/shared/observability/sentry";
import type { MeridianTheme } from "@/shared/theme/meridian";
import { useTheme, useThemedStyles, type ThemePreference } from "@/shared/theme/ThemeProvider";
import { Button, GhostButton, GoldButton } from "@/shared/ui/Button";
import { Screen } from "@/shared/ui/Screen";
import { SegmentedControl } from "@/shared/ui/SelectableControls";
import { Surface } from "@/shared/ui/Surface";
import { Text } from "@/shared/ui/Text";

const THEME_OPTIONS: readonly ThemePreference[] = ["system", "light", "dark"];

export function SettingsScreen() {
  const { t } = useTranslation();
  const { profile, signOut, deleteAccount, createOrgInvite } = useAuth();
  const { reminders } = useRepositories();
  const { language, setLanguage, isRTL } = useI18nControls();
  const { theme, preference, setPreference } = useTheme();
  const styles = useThemedStyles(makeStyles);

  const [lockEnabled, setLockEnabled] = useState(false);
  const [pushMessage, setPushMessage] = useState<string | null>(null);
  const [lockMessage, setLockMessage] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState<"push" | "lock" | "signout" | "delete" | "invite" | null>(null);
  const [invite, setInvite] = useState<{ code: string; expiresAtLabel: string } | null>(null);
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);

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
      setPushMessage(error instanceof Error ? error.message : t("settings.pushError"));
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
        const ok = await authenticateAppLock(t("settings.lockConfirmTurnOff"));
        if (!ok) {
          return;
        }
        await setBiometricLockEnabled(false);
        setLockEnabled(false);
        setLockMessage(t("settings.lockTurnedOff"));
        return;
      }

      if (!(await hasBiometricHardware())) {
        setLockMessage(t("settings.lockNoHardware"));
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({ promptMessage: t("settings.lockEnablePrompt"), cancelLabel: t("settings.lockCancelLabel") });
      if (result.success) {
        await setBiometricLockEnabled(true);
        setLockEnabled(true);
        setLockMessage(t("settings.lockTurnedOn"));
      }
    } catch (error) {
      captureNonFatalError("settings_app_lock_failed", error, { surface: "settings" });
      setLockMessage(t("settings.lockError"));
    } finally {
      setBusy(null);
    }
  }

  async function handleCreateInvite() {
    setInviteMessage(null);
    setBusy("invite");
    try {
      const nextInvite = await createOrgInvite();
      setInvite(nextInvite);
    } catch (error) {
      captureNonFatalError("settings_create_invite_failed", error, { surface: "settings" });
      setInviteMessage(error instanceof Error ? error.message : t("settings.inviteError"));
    } finally {
      setBusy(null);
    }
  }

  async function handleShareInvite() {
    if (!invite) {
      return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    const message = t("settings.inviteShareMessage", { code: invite.code });
    void Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`);
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

  async function handleDeleteAccount() {
    // Two-tap confirm before an irreversible erasure.
    if (!confirmDelete) {
      setConfirmDelete(true);
      setDeleteMessage(null);
      return;
    }

    setBusy("delete");
    try {
      await deleteAccount();
      router.replace("/welcome");
    } catch (error) {
      captureNonFatalError("settings_delete_account_failed", error, { surface: "settings" });
      setDeleteMessage(error instanceof Error ? error.message : t("settings.deleteError"));
      setConfirmDelete(false);
    } finally {
      setBusy(null);
    }
  }

  const themeLabels: Record<ThemePreference, string> = {
    system: t("settings.themeSystem"),
    light: t("settings.themeLight"),
    dark: t("settings.themeDark"),
  };

  return (
    <Screen contentStyle={isRTL && styles.rtl}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text variant="eyebrow">{t("settings.eyebrow")}</Text>
        <Text variant="h1" style={styles.title}>
          {t("settings.title")}
        </Text>

        <Surface style={styles.card}>
          <Text variant="caption" muted>
            {t("settings.signedInAs")}
          </Text>
          <Text variant="cardTitle" style={styles.cardValue}>
            {profile?.full_name ?? t("settings.previewBroker")}
          </Text>
          {profile?.email ? (
            <Text variant="caption" muted>
              {profile.email}
            </Text>
          ) : null}
          {profile?.role ? (
            <Text variant="caption" muted style={styles.role}>
              {profile.role === "solo" ? t("settings.roleSolo") : t("settings.roleTeam")}
            </Text>
          ) : null}
        </Surface>

        <Surface style={styles.card}>
          <View style={styles.rowHeader}>
            <ChartBar size={18} color={theme.color.action} strokeWidth={2.1} />
            <Text variant="cardTitle" style={styles.rowTitle}>
              {t("settings.reportsTitle")}
            </Text>
          </View>
          <Text variant="caption" muted style={styles.rowBody}>
            {t("settings.reportsBody")}
          </Text>
          <GhostButton label={t("settings.reportsOpen")} onPress={() => router.push("/reports" as unknown as Href)} />
        </Surface>

        <Surface style={styles.card}>
          <View style={styles.rowHeader}>
            <Palette size={18} color={theme.color.action} strokeWidth={2.1} />
            <Text variant="cardTitle" style={styles.rowTitle}>
              {t("settings.appearanceTitle")}
            </Text>
          </View>
          <Text variant="caption" muted style={styles.rowBody}>
            {t("settings.appearanceBody")}
          </Text>
          <SegmentedControl
            options={THEME_OPTIONS}
            labels={themeLabels}
            value={preference}
            onChange={setPreference}
            accessibilityLabel={t("settings.appearanceTitle")}
          />
        </Surface>

        <Surface style={styles.card}>
          <View style={styles.rowHeader}>
            <Bell size={18} color={theme.color.action} strokeWidth={2.1} />
            <Text variant="cardTitle" style={styles.rowTitle}>
              {t("settings.notificationsTitle")}
            </Text>
          </View>
          <Text variant="caption" muted style={styles.rowBody}>
            {t("settings.notificationsBody")}
          </Text>
          <GhostButton label={busy === "push" ? t("settings.pushConnecting") : t("settings.pushEnable")} disabled={busy !== null} onPress={handleEnablePush} />
          {pushMessage ? (
            <Text variant="caption" muted style={styles.message}>
              {pushMessage}
            </Text>
          ) : null}
        </Surface>

        <Surface style={styles.card}>
          <View style={styles.rowHeader}>
            <Users size={18} color={theme.color.action} strokeWidth={2.1} />
            <Text variant="cardTitle" style={styles.rowTitle}>
              {t("settings.inviteTitle")}
            </Text>
          </View>
          <Text variant="caption" muted style={styles.rowBody}>
            {t("settings.inviteBody")}
          </Text>
          {invite ? (
            <>
              <View style={styles.inviteCodeRow}>
                <Text variant="mono" style={styles.inviteCode}>
                  {invite.code}
                </Text>
                <Text variant="caption" muted>
                  {t("settings.inviteExpires", { date: invite.expiresAtLabel })}
                </Text>
              </View>
              <GhostButton label={t("settings.inviteShare")} onPress={handleShareInvite} />
            </>
          ) : (
            <GhostButton label={busy === "invite" ? t("settings.inviteCreating") : t("settings.inviteCreate")} disabled={busy !== null} onPress={handleCreateInvite} />
          )}
          {inviteMessage ? (
            <Text variant="caption" muted style={styles.message}>
              {inviteMessage}
            </Text>
          ) : null}
        </Surface>

        <Surface style={styles.card}>
          <View style={styles.rowHeader}>
            <Fingerprint size={18} color={theme.color.action} strokeWidth={2.1} />
            <Text variant="cardTitle" style={styles.rowTitle}>
              {t("settings.lockTitle")}
            </Text>
          </View>
          <Text variant="caption" muted style={styles.rowBody}>
            {t("settings.lockBody")}
          </Text>
          <GhostButton label={busy === "lock" ? t("settings.lockPleaseWait") : lockEnabled ? t("settings.lockTurnOff") : t("settings.lockEnable")} disabled={busy !== null} onPress={handleToggleLock} />
          {lockMessage ? (
            <Text variant="caption" muted style={styles.message}>
              {lockMessage}
            </Text>
          ) : null}
        </Surface>

        <Surface style={styles.card}>
          <View style={styles.rowHeader}>
            <Languages size={18} color={theme.color.action} strokeWidth={2.1} />
            <Text variant="cardTitle" style={styles.rowTitle}>
              {t("settings.languageTitle")}
            </Text>
          </View>
          <Text variant="caption" muted style={styles.rowBody}>
            {t("settings.languageBody")}
          </Text>
          <View style={styles.languageRow}>
            <GhostButton label={t("settings.languageEnglish")} disabled={busy !== null || language === "en"} onPress={() => setLanguage("en")} style={styles.languageButton} />
            <GhostButton label={t("settings.languageArabic")} disabled={busy !== null || language === "ar"} onPress={() => setLanguage("ar")} style={styles.languageButton} />
          </View>
        </Surface>

        <View style={styles.signOutWrap}>
          <View style={styles.signOutRow}>
            <LogOut size={18} color={theme.status.overdue.solid} strokeWidth={2.1} />
            <Text variant="caption" muted style={styles.rowTitle}>
              {t("settings.signOutRowLabel")}
            </Text>
          </View>
          <GoldButton label={busy === "signout" ? t("settings.signingOut") : t("settings.signOut")} disabled={busy !== null} onPress={handleSignOut} />
        </View>

        <Surface style={styles.card}>
          <View style={styles.rowHeader}>
            <Trash2 size={18} color={theme.status.overdue.solid} strokeWidth={2.1} />
            <Text variant="cardTitle" style={[styles.rowTitle, styles.dangerTitle]}>
              {t("settings.dangerTitle")}
            </Text>
          </View>
          <Text variant="caption" muted style={styles.rowBody}>
            {confirmDelete ? t("settings.deleteConfirmBody") : t("settings.dangerBody")}
          </Text>
          <Button
            variant="danger"
            block
            label={busy === "delete" ? t("settings.deleting") : confirmDelete ? t("settings.deleteConfirm") : t("settings.deleteAccount")}
            disabled={busy !== null}
            onPress={handleDeleteAccount}
          />
          {deleteMessage ? (
            <Text variant="caption" style={styles.dangerTitle}>
              {deleteMessage}
            </Text>
          ) : null}
        </Surface>
      </ScrollView>
    </Screen>
  );
}

const makeStyles = (t: MeridianTheme) =>
  StyleSheet.create({
    rtl: {
      direction: "rtl",
    },
    scroll: {
      paddingBottom: t.sizing.tabBarClearance,
      gap: t.space[3],
    },
    title: {
      marginTop: t.space[2],
      marginBottom: t.space[2],
    },
    card: {
      padding: t.space[4],
      gap: t.space[2],
    },
    cardValue: {
      fontSize: 18,
      lineHeight: 22,
    },
    role: {
      marginTop: t.space[1],
    },
    rowHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.space[2],
    },
    rowTitle: {
      fontSize: 15,
      lineHeight: 20,
    },
    dangerTitle: {
      color: t.status.overdue.text,
    },
    rowBody: {
      marginBottom: t.space[1],
    },
    message: {
      marginTop: t.space[1],
    },
    inviteCodeRow: {
      borderWidth: 1,
      borderColor: t.color.borderHair,
      borderRadius: t.radius.sm,
      backgroundColor: t.color.surfaceSunk,
      padding: t.space[3],
      alignItems: "center",
      gap: t.space[1],
    },
    inviteCode: {
      fontSize: 20,
      letterSpacing: 2,
    },
    languageRow: {
      flexDirection: "row",
      gap: t.space[2],
    },
    languageButton: {
      flex: 1,
    },
    signOutWrap: {
      marginTop: t.space[2],
      gap: t.space[3],
    },
    signOutRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: t.space[2],
    },
  });
