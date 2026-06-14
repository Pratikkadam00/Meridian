import { Stack, type ErrorBoundaryProps } from "expo-router";

import { AppErrorFallback } from "@/shared/ui/AppErrorFallback";

export default function OnboardingLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

// Contain onboarding-step crashes to the step rather than the whole app.
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <AppErrorFallback error={error} onRetry={retry} />;
}
