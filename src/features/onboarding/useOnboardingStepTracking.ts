import { useEffect } from "react";

import { trackAnalyticsEvent } from "@/shared/observability/analytics";

import { persistOnboardingStep, type OnboardingStepId } from "./onboardingProgress";

export function useOnboardingStepTracking(step: OnboardingStepId, index: number) {
  useEffect(() => {
    void persistOnboardingStep(step);
    trackAnalyticsEvent("onboarding_step_viewed", { step, index });
  }, [index, step]);
}
