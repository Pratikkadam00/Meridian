import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export type OnboardingStepId = "welcome" | "account" | "personalization" | "permissions" | "education";

const STEP_KEY = "meridian.onboarding.step.v1";

const routeByStep: Record<OnboardingStepId, "/welcome" | "/account" | "/personalization" | "/permissions" | "/education"> = {
  welcome: "/welcome",
  account: "/account",
  personalization: "/personalization",
  permissions: "/permissions",
  education: "/education",
};

function getWebStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isOnboardingStep(value: string | null): value is OnboardingStepId {
  return value === "welcome" || value === "account" || value === "personalization" || value === "permissions" || value === "education";
}

export function getOnboardingRoute(step: OnboardingStepId) {
  return routeByStep[step];
}

export async function persistOnboardingStep(step: OnboardingStepId) {
  if (Platform.OS === "web") {
    getWebStorage()?.setItem(STEP_KEY, step);
    return;
  }

  await SecureStore.setItemAsync(STEP_KEY, step);
}

export async function getPersistedOnboardingStep() {
  if (Platform.OS === "web") {
    const step = getWebStorage()?.getItem(STEP_KEY) ?? null;
    return isOnboardingStep(step) ? step : null;
  }

  const step = await SecureStore.getItemAsync(STEP_KEY);
  return isOnboardingStep(step) ? step : null;
}

export async function clearOnboardingStep() {
  if (Platform.OS === "web") {
    getWebStorage()?.removeItem(STEP_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(STEP_KEY);
}
