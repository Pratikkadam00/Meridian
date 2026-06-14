import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Sentry } from "@/shared/observability/sentry";
import { redactUnknown } from "@/shared/security/redaction";
import { tokens } from "@/shared/theme/tokens";
import { GoldButton } from "./Button";
import { Screen } from "./Screen";
import { Text } from "./Text";

type AppErrorFallbackProps = {
  error: Error;
  onRetry?: () => void;
};

export function AppErrorFallback({ error, onRetry }: AppErrorFallbackProps) {
  const { t } = useTranslation();

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

const styles = StyleSheet.create({
  screen: {
    justifyContent: "center",
  },
  panel: {
    borderWidth: 1,
    borderColor: tokens.colors.line,
    borderRadius: tokens.radius.panel,
    backgroundColor: tokens.colors.panel,
    padding: tokens.spacing[22],
  },
  title: {
    marginTop: tokens.spacing[8],
  },
  body: {
    marginTop: tokens.spacing[12],
    marginBottom: tokens.spacing[22],
  },
});
