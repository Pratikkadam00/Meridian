import { LockKeyhole } from "lucide-react-native";
import { useCallback, useEffect, useState, type PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, View } from "react-native";

import { tokens } from "@/shared/theme/tokens";
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

  useEffect(() => {
    // One-time launch auth check; attempt() drives its own state machine.
    if (Platform.OS !== "web") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void attempt();
    }
  }, [attempt]);

  if (state === "unlocked") {
    return <>{children}</>;
  }

  if (state === "checking") {
    // Obsidian canvas only — brief, avoids a white flash during the prompt.
    return <Screen contentStyle={styles.blank}><View /></Screen>;
  }

  return (
    <Screen contentStyle={styles.locked}>
      <View style={styles.iconHero}>
        <LockKeyhole size={34} color={tokens.colors.goldBright} strokeWidth={2} />
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

const styles = StyleSheet.create({
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
    borderRadius: 24,
    backgroundColor: tokens.colors.goldTint,
    marginBottom: tokens.spacing[22],
  },
  title: {
    textAlign: "center",
  },
  body: {
    textAlign: "center",
    maxWidth: 300,
    marginTop: tokens.spacing[12],
    marginBottom: tokens.spacing[22],
  },
});
