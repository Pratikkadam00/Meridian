import { Bell, FileUp, Milestone } from "lucide-react-native";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { useAuth } from "@/features/auth";
import { clearOnboardingStep, OnboardingStepView, TeachCard, useOnboardingStepTracking } from "@/features/onboarding";
import { useRepositories } from "@/shared/data/RepositoryProvider";
import { trackAnalyticsEvent } from "@/shared/observability/analytics";
import { tokens } from "@/shared/theme/tokens";
import { GoldButton, GhostButton } from "@/shared/ui/Button";
import { ProgressDots } from "@/shared/ui/ProgressDots";
import { Screen } from "@/shared/ui/Screen";
import { Text } from "@/shared/ui/Text";

export default function EducationScreen() {
  const { onboarding } = useRepositories();
  const { refreshProfile } = useAuth();
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
      setMessage(error instanceof Error ? error.message : "Could not finish onboarding.");
    } finally {
      setIsCompleting(false);
    }
  }

  return (
    <Screen contentStyle={styles.screen}>
      <OnboardingStepView>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <ProgressDots count={5} activeIndex={4} />
          <Text variant="eyebrow">{"You're set"}</Text>
          <Text variant="h1" style={styles.title}>
            How Meridian works
          </Text>

          <View style={styles.cards}>
            <TeachCard icon={FileUp} title="Drop the SPA" body="Upload the agreement, we read the payment plan and fill it in. You confirm." />
            <TeachCard
              icon={Milestone}
              title="Track every milestone"
              body="Booking, DLD/Oqood, construction stages, handover, paid, due, and overdue at a glance."
            />
            <TeachCard icon={Bell} title="Get reminded" body="A nudge before each payment, and a portfolio view of what is due this week." />
          </View>

          {message ? (
            <Text variant="caption" style={styles.message}>
              {message}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <GoldButton
              label={isCompleting ? "Finishing" : "Add your first deal"}
              disabled={isCompleting}
              onPress={() => void finish("add_first_deal")}
              style={isCompleting && styles.disabled}
            />
            <GhostButton label="Skip to dashboard" disabled={isCompleting} onPress={() => void finish("skip_dashboard")} />
            <GhostButton label="Back" onPress={() => router.back()} />
          </View>
        </ScrollView>
      </OnboardingStepView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: tokens.spacing[32],
  },
  scrollContent: {
    paddingBottom: tokens.spacing[32],
  },
  title: {
    marginTop: tokens.spacing[8],
    marginBottom: 20,
  },
  cards: {
    marginBottom: tokens.spacing[12],
  },
  message: {
    color: tokens.colors.due,
    marginBottom: tokens.spacing[12],
  },
  actions: {
    gap: tokens.spacing[12],
    marginTop: tokens.spacing[22],
  },
  disabled: {
    opacity: 0.52,
  },
});
