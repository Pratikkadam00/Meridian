import { Stack, type ErrorBoundaryProps } from "expo-router";

import { useTheme } from "@/shared/theme/ThemeProvider";
import { AppErrorFallback } from "@/shared/ui/AppErrorFallback";

export default function OnboardingLayout() {
  const { theme } = useTheme();
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.color.bgApp } }} />;
}

// Contain onboarding-step crashes to the step rather than the whole app.
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <AppErrorFallback error={error} onRetry={retry} />;
}
