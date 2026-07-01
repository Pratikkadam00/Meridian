import { LockKeyhole } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState, type PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";
import { AppState, Platform, StyleSheet, View } from "react-native";

import type { MeridianTheme } from "@/shared/theme/meridian";
import { useTheme, useThemedStyles } from "@/shared/theme/ThemeProvider";
import { GoldButton } from "@/shared/ui/Button";
import { Screen } from "@/shared/ui/Screen";
import { Text } from "@/shared/ui/Text";

import { authenticateAppLock, isBiometricLockEnabled } from "./appLock";

type LockState = "checking" | "locked" | "unlocked";

/**
 * Enforces the biometric app-lock flag at launch. Fails OPEN where biometrics
 * are unavailable (authenticateAppLock returns true) so a user is never bricked
 * out; only an explicit failed/cancelled prompt holds at the lock screen.
 */
export function AppLockGate({ children }: PropsWithChildren) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [state, setState] = useState<LockState>(Platform.OS === "web" ? "unlocked" : "checking");

  const attempt = useCallback(async () => {
    setState("checking");
    try {
      if (!(await isBiometricLockEnabled())) {
        setState("unlocked");
        return;
      }

      const ok = await authenticateAppLock("Unlock Meridian");
      setState(ok ? "unlocked" : "locked");
    } catch {
      setState("unlocked");
    }
  }, []);

  const backgroundedAt = useRef<number | null>(null);

  useEffect(() => {
    // One-time launch auth check; attempt() drives its own state machine.
    if (Platform.OS !== "web") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void attempt();
    }
  }, [attempt]);

  useEffect(() => {
    if (Platform.OS === "web") {
      return undefined;
    }
    // Re-lock when the app returns to the foreground after being away beyond a
    // short grace window, so an already-open phone that's been backgrounded
    // doesn't resume straight into broker data. attempt() re-checks the flag, so
    // this is a no-op when the lock is disabled.
    const RELOCK_GRACE_MS = 30_000;
    const subscription = AppState.addEventListener("change", (next) => {
      if (next === "background" || next === "inactive") {
        backgroundedAt.current = Date.now();
        return;
      }
      if (next === "active" && backgroundedAt.current != null) {
        const awayMs = Date.now() - backgroundedAt.current;
        backgroundedAt.current = null;
        if (awayMs >= RELOCK_GRACE_MS) {
          void attempt();
        }
      }
    });
    return () => subscription.remove();
  }, [attempt]);

  if (state === "unlocked") {
    return <>{children}</>;
  }

  if (state === "checking") {
    // Warm-paper / jade-ink canvas only — brief, avoids a flash during the prompt.
    return <Screen contentStyle={styles.blank}><View /></Screen>;
  }

  return (
    <Screen contentStyle={styles.locked}>
      <View style={styles.iconHero}>
        <LockKeyhole size={34} color={theme.color.action} strokeWidth={2} />
      </View>
      <Text variant="h1" style={styles.title}>
        {t("lock.title")}
      </Text>
      <Text variant="body" muted style={styles.body}>
        {t("lock.body")}
      </Text>
      <GoldButton label={t("lock.unlock")} onPress={() => void attempt()} />
    </Screen>
  );
}

const makeStyles = (t: MeridianTheme) =>
  StyleSheet.create({
    blank: {
      flex: 1,
    },
    locked: {
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
      marginBottom: t.space[5],
    },
    title: {
      textAlign: "center",
    },
    body: {
      textAlign: "center",
      maxWidth: 300,
      marginTop: t.space[3],
      marginBottom: t.space[5],
    },
  });
