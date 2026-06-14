import { router } from "expo-router";
import { useEffect } from "react";

import { useAuth } from "@/features/auth";
import { getOnboardingRoute, getPersistedOnboardingStep } from "@/features/onboarding";

export default function ResumeOnboardingScreen() {
  const { profile } = useAuth();

  useEffect(() => {
    let mounted = true;

    async function resume() {
      const savedStep = await getPersistedOnboardingStep();

      if (!mounted) {
        return;
      }

      if (!profile) {
        router.replace("/account");
        return;
      }

      router.replace(getOnboardingRoute(savedStep && savedStep !== "welcome" && savedStep !== "account" ? savedStep : "personalization"));
    }

    void resume();

    return () => {
      mounted = false;
    };
  }, [profile]);

  return null;
}
