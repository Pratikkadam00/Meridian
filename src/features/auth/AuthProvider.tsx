import type { Session } from "@supabase/supabase-js";
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useRepositories } from "@/shared/data/RepositoryProvider";
import type { ProfileRow } from "@/shared/data/database.types";
import type { SignInInput, SignUpWithWorkspaceInput, SignUpWithWorkspaceResult } from "@/shared/data/repositories/authRepository";

type AuthContextValue = {
  session: Session | null;
  profile: ProfileRow | null;
  isConfigured: boolean;
  isLoading: boolean;
  refreshProfile: () => Promise<ProfileRow | null>;
  signIn: (input: SignInInput) => Promise<Session>;
  signUp: (input: SignUpWithWorkspaceInput) => Promise<SignUpWithWorkspaceResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const { auth, isSupabaseConfigured } = useRepositories();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const nextProfile = await auth.getCurrentProfile();
    setProfile(nextProfile);
    return nextProfile;
  }, [auth]);

  useEffect(() => {
    let isMounted = true;

    auth
      .getSession()
      .then(async (nextSession) => {
        if (!isMounted) {
          return;
        }

        setSession(nextSession);

        if (!nextSession) {
          setProfile(null);
          return;
        }

        const nextProfile = await auth.getCurrentProfile();

        if (isMounted) {
          setProfile(nextProfile);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSession(null);
          setProfile(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    const unsubscribe = auth.onAuthStateChange(async (nextSession) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);

      if (!nextSession) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const nextProfile = await auth.getCurrentProfile();

        if (isMounted) {
          setProfile(nextProfile);
        }
      } catch {
        if (isMounted) {
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [auth]);

  const signIn = useCallback(
    async (input: SignInInput) => {
      setIsLoading(true);
      try {
        const nextSession = await auth.signInWithEmail(input);
        const nextProfile = await auth.getCurrentProfile();
        setSession(nextSession);
        setProfile(nextProfile);
        return nextSession;
      } finally {
        setIsLoading(false);
      }
    },
    [auth],
  );

  const signUp = useCallback(
    async (input: SignUpWithWorkspaceInput) => {
      setIsLoading(true);
      try {
        const result = await auth.signUpWithWorkspace(input);
        setSession(result.session);
        setProfile(result.profile);
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    [auth],
  );

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await auth.signOut();
      setSession(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [auth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      isConfigured: isSupabaseConfigured,
      isLoading,
      refreshProfile,
      signIn,
      signUp,
      signOut,
    }),
    [isLoading, isSupabaseConfigured, profile, refreshProfile, session, signIn, signOut, signUp],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return value;
}
