import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Sentry } from "@/shared/observability/sentry";
import { redactUnknown } from "@/shared/security/redaction";
import type { MeridianTheme } from "@/shared/theme/meridian";
import { useThemedStyles } from "@/shared/theme/ThemeProvider";

import { GoldButton } from "./Button";
import { Screen } from "./Screen";
import { Text } from "./Text";

type AppErrorFallbackProps = {
  error: Error;
  onRetry?: () => void;
};

export function AppErrorFallback({ error, onRetry }: AppErrorFallbackProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(makeStyles);

  useEffect(() => {
    Sentry.captureException(redactUnknown(error));
  }, [error]);

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.panel}>
        <Text variant="eyebrow">{t("error.eyebrow")}</Text>
        <Text variant="h1" style={styles.title}>
          {t("error.title")}
        </Text>
        <Text variant="body" muted style={styles.body}>
          {t("error.body")}
        </Text>
        {onRetry ? <GoldButton label={t("error.retry")} onPress={onRetry} /> : null}
      </View>
    </Screen>
  );
}

const makeStyles = (t: MeridianTheme) =>
  StyleSheet.create({
    screen: {
      justifyContent: "center",
    },
    panel: {
      borderWidth: 1,
      borderColor: t.color.borderHair,
      borderRadius: t.radius.lg,
      backgroundColor: t.color.surfaceCard,
      padding: t.space[5],
    },
    title: {
      marginTop: t.space[2],
    },
    body: {
      marginTop: t.space[3],
      marginBottom: t.space[5],
    },
  });
