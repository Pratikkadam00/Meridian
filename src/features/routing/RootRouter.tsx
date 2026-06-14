import { Redirect } from "expo-router";

import { useAuth } from "@/features/auth";

export function RootRouter() {
  const { isLoading, profile, session } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!session) {
    return <Redirect href="/welcome" />;
  }

  if (!profile) {
    return <Redirect href="/account" />;
  }

  if (!profile.onboarding_complete) {
    return <Redirect href="/resume" />;
  }

  return <Redirect href="/home" />;
}
