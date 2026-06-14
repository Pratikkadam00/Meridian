import { createContext, type PropsWithChildren, useContext, useMemo } from "react";

import { createMeridianSupabaseClient } from "./supabaseClient";
import { PreviewAuthRepository, SupabaseAuthRepository, type AuthRepository } from "./repositories/authRepository";
import { PreviewDealsRepository, SupabaseDealsRepository, type DealsRepository } from "./repositories/dealsRepository";
import { PreviewOnboardingRepository, SupabaseOnboardingRepository, type OnboardingRepository } from "./repositories/onboardingRepository";
import { PreviewSessionStore } from "./repositories/previewSessionStore";
import { PreviewRemindersRepository, SupabaseRemindersRepository, type RemindersRepository } from "./repositories/remindersRepository";

type RepositoryContextValue = {
  isSupabaseConfigured: boolean;
  auth: AuthRepository;
  deals: DealsRepository;
  onboarding: OnboardingRepository;
  reminders: RemindersRepository;
};

const RepositoryContext = createContext<RepositoryContextValue | null>(null);

export function RepositoryProvider({ children }: PropsWithChildren) {
  const value = useMemo<RepositoryContextValue>(() => {
    const supabase = createMeridianSupabaseClient();
    const previewSessionStore = new PreviewSessionStore();

    return {
      isSupabaseConfigured: Boolean(supabase),
      auth: supabase ? new SupabaseAuthRepository(supabase) : new PreviewAuthRepository(previewSessionStore),
      deals: supabase ? new SupabaseDealsRepository(supabase) : new PreviewDealsRepository(),
      onboarding: supabase ? new SupabaseOnboardingRepository(supabase) : new PreviewOnboardingRepository(previewSessionStore),
      reminders: supabase ? new SupabaseRemindersRepository(supabase) : new PreviewRemindersRepository(),
    };
  }, []);

  return <RepositoryContext.Provider value={value}>{children}</RepositoryContext.Provider>;
}

export function useRepositories() {
  const value = useContext(RepositoryContext);

  if (!value) {
    throw new Error("useRepositories must be used inside RepositoryProvider");
  }

  return value;
}
