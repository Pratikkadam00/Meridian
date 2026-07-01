import { Bell, FileUp, Milestone } from "lucide-react-native";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";

import { useAuth } from "@/features/auth";
import { clearOnboardingStep, OnboardingStepView, TeachCard, useOnboardingStepTracking } from "@/features/onboarding";
import { useRepositories } from "@/shared/data/RepositoryProvider";
import { trackAnalyticsEvent } from "@/shared/observability/analytics";
import type { MeridianTheme } from "@/shared/theme/meridian";
import { useThemedStyles } from "@/shared/theme/ThemeProvider";
import { GoldButton, GhostButton } from "@/shared/ui/Button";
import { ProgressDots } from "@/shared/ui/ProgressDots";
import { Screen } from "@/shared/ui/Screen";
import { Text } from "@/shared/ui/Text";

export default function EducationScreen() {
  const { t } = useTranslation();
  const { onboarding } = useRepositories();
  const { refreshProfile } = useAuth();
  const styles = useThemedStyles(makeStyles);
  const [message, setMessage] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  useOnboardingStepTracking("education", 5);

  async function finish(intent: "add_first_deal" | "skip_dashboard") {
    setMessage(null);
    setIsCompleting(true);

    try {
      await onboarding.completeOnboarding();
      await refreshProfile();
      await clearOnboardingStep();
      trackAnalyticsEvent("onboarding_completed", { intent });
      router.replace("/home");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("education.finishError"));
    } finally {
      setIsCompleting(false);
    }
  }

  return (
    <Screen contentStyle={styles.screen}>
      <OnboardingStepView>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <ProgressDots count={5} activeIndex={4} />
          <Text variant="eyebrow">{t("education.eyebrow")}</Text>
          <Text variant="h1" style={styles.title}>
            {t("education.title")}
          </Text>

          <View style={styles.cards}>
            <TeachCard icon={FileUp} title={t("education.spaTitle")} body={t("education.spaBody")} />
            <TeachCard
              icon={Milestone}
              title={t("education.milestoneTitle")}
              body={t("education.milestoneBody")}
            />
            <TeachCard icon={Bell} title={t("education.reminderTitle")} body={t("education.reminderBody")} />
          </View>

          {message ? (
            <Text variant="caption" style={styles.message}>
              {message}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <GoldButton
              label={isCompleting ? t("education.finishing") : t("education.addFirstDeal")}
              disabled={isCompleting}
              onPress={() => void finish("add_first_deal")}
              style={isCompleting && styles.disabled}
            />
            <GhostButton label={t("education.skipToDashboard")} disabled={isCompleting} onPress={() => void finish("skip_dashboard")} />
            <GhostButton label={t("education.back")} onPress={() => router.back()} />
          </View>
        </ScrollView>
      </OnboardingStepView>
    </Screen>
  );
}

const makeStyles = (t: MeridianTheme) =>
  StyleSheet.create({
    screen: {
      paddingBottom: t.space[8],
    },
    scrollContent: {
      paddingBottom: t.space[8],
    },
    title: {
      marginTop: t.space[2],
      marginBottom: 20,
    },
    cards: {
      marginBottom: t.space[3],
    },
    message: {
      color: t.color.accentText,
      marginBottom: t.space[3],
    },
    actions: {
      gap: t.space[3],
      marginTop: t.space[5],
    },
    disabled: {
      opacity: 0.52,
    },
  });
