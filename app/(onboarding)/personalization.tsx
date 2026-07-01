import { Building2, UserRound } from "lucide-react-native";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";

import { useAuth } from "@/features/auth";
import { OnboardingStepView, OptionCard, OptionChip, SegmentControl, persistOnboardingStep, useOnboardingStepTracking } from "@/features/onboarding";
import { useRepositories } from "@/shared/data/RepositoryProvider";
import type { BrokerRole, DealVolume } from "@/shared/data/repositories/onboardingRepository";
import { trackAnalyticsEvent } from "@/shared/observability/analytics";
import type { MeridianTheme } from "@/shared/theme/meridian";
import { useThemedStyles } from "@/shared/theme/ThemeProvider";
import { GoldButton, GhostButton } from "@/shared/ui/Button";
import { ProgressDots } from "@/shared/ui/ProgressDots";
import { Screen } from "@/shared/ui/Screen";
import { Text } from "@/shared/ui/Text";

const developers = ["Emaar", "Damac", "Sobha", "Binghatti", "Nakheel", "Meraas"];
const volumes = ["1-5", "6-15", "16+"] as const;

export default function PersonalizationScreen() {
  const { t } = useTranslation();
  const { onboarding } = useRepositories();
  const { refreshProfile } = useAuth();
  const styles = useThemedStyles(makeStyles);
  const [role, setRole] = useState<BrokerRole>("solo_broker");
  const [volume, setVolume] = useState<DealVolume>("1-5");
  const [selectedDevelopers, setSelectedDevelopers] = useState(() => new Set(["Emaar", "Damac"]));
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  useOnboardingStepTracking("personalization", 3);

  const selectedDeveloperNames = useMemo(() => Array.from(selectedDevelopers), [selectedDevelopers]);

  function toggleDeveloper(developer: string) {
    setSelectedDevelopers((current) => {
      const next = new Set(current);

      if (next.has(developer)) {
        next.delete(developer);
      } else {
        next.add(developer);
      }

      return next;
    });
  }

  async function handleContinue() {
    setMessage(null);
    setIsSaving(true);

    try {
      await onboarding.savePersonalization({
        role,
        market: "dubai",
        volume,
        developerNames: selectedDeveloperNames,
      });
      await refreshProfile();
      trackAnalyticsEvent("onboarding_personalization_saved", {
        role,
        volume,
        developerCount: selectedDeveloperNames.length,
      });
      await persistOnboardingStep("permissions");
      router.push("/permissions");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("personalization.saveError"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Screen contentStyle={styles.screen}>
      <OnboardingStepView>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <ProgressDots count={5} activeIndex={2} />
          <Text variant="eyebrow">{t("personalization.eyebrow")}</Text>
          <Text variant="h1" style={styles.title}>
            {t("personalization.title")}
          </Text>

          <Text variant="caption" muted style={styles.sectionLabel}>
            {t("personalization.roleLabel")}
          </Text>
          <OptionCard title={t("personalization.soloBrokerTitle")} subtitle={t("personalization.soloBrokerSubtitle")} icon={UserRound} selected={role === "solo_broker"} onPress={() => setRole("solo_broker")} />
          <OptionCard
            title={t("personalization.brokerageTitle")}
            subtitle={t("personalization.brokerageSubtitle")}
            icon={Building2}
            selected={role === "brokerage"}
            onPress={() => setRole("brokerage")}
          />

          <Text variant="caption" muted style={styles.sectionLabel}>
            {t("personalization.developersLabel")}
          </Text>
          <View style={styles.chips}>
            {developers.map((developer) => (
              <OptionChip key={developer} label={developer} selected={selectedDevelopers.has(developer)} onPress={() => toggleDeveloper(developer)} />
            ))}
          </View>

          <Text variant="caption" muted style={styles.sectionLabel}>
            {t("personalization.volumeLabel")}
          </Text>
          <SegmentControl options={volumes} value={volume} onChange={setVolume} />

          {message ? (
            <Text variant="caption" style={styles.message}>
              {message}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <GoldButton label={isSaving ? t("personalization.saving") : t("personalization.continue")} disabled={isSaving} onPress={handleContinue} style={isSaving && styles.disabled} />
            <GhostButton label={t("personalization.back")} onPress={() => router.back()} />
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
    sectionLabel: {
      marginTop: t.space[2],
      marginBottom: 10,
    },
    chips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 9,
      marginBottom: t.space[2],
    },
    message: {
      color: t.color.accentText,
      marginTop: t.space[3],
    },
    actions: {
      gap: t.space[3],
      marginTop: t.space[5],
    },
    disabled: {
      opacity: 0.52,
    },
  });
