import type { Session } from "@supabase/supabase-js";

import type { Json, ProfileRow } from "../database.types";
import type { PersonalizationInput } from "./onboardingRepository";

type PreviewSessionListener = (session: Session | null) => void;

type PreviewSignUpInput = {
  email: string;
  fullName: string;
  orgName: string;
  persona: Json;
};

export class PreviewSessionStore {
  private session: Session | null = null;
  private profile: ProfileRow | null = null;
  private readonly listeners = new Set<PreviewSessionListener>();

  getSession() {
    return this.session;
  }

  getProfile() {
    return this.profile ? { ...this.profile } : null;
  }

  signIn(email: string) {
    const normalizedEmail = normalizeEmail(email);

    if (!this.profile) {
      this.profile = createProfile({
        email: normalizedEmail,
        fullName: "Preview Broker",
        orgName: "Meridian Preview",
        onboardingComplete: true,
        persona: {
          role: "solo_broker",
          market: "dubai",
          volume: "6-15",
          developerNames: ["Emaar", "Damac"],
        },
      });
    }

    this.session = createSession(this.profile.id, normalizedEmail);
    this.emit();

    return this.session;
  }

  signUp(input: PreviewSignUpInput) {
    const normalizedEmail = normalizeEmail(input.email);
    this.profile = createProfile({
      email: normalizedEmail,
      fullName: input.fullName,
      orgName: input.orgName,
      onboardingComplete: false,
      persona: input.persona,
    });
    this.session = createSession(this.profile.id, normalizedEmail);
    this.emit();

    return {
      session: this.session,
      profile: { ...this.profile },
      needsEmailConfirmation: false,
    };
  }

  savePersonalization(input: PersonalizationInput) {
    if (!this.profile) {
      throw new Error("Create or sign in to a preview workspace first.");
    }

    this.profile = {
      ...this.profile,
      role: input.role,
      persona: {
        role: input.role,
        market: input.market,
        volume: input.volume,
        developerNames: input.developerNames,
      },
      updated_at: new Date().toISOString(),
    };

    return { ...this.profile };
  }

  completeOnboarding() {
    if (!this.profile) {
      throw new Error("Create or sign in to a preview workspace first.");
    }

    this.profile = {
      ...this.profile,
      onboarding_complete: true,
      updated_at: new Date().toISOString(),
    };

    return { ...this.profile };
  }

  signOut() {
    this.session = null;
    this.profile = null;
    this.emit();
  }

  subscribe(listener: PreviewSessionListener) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit() {
    this.listeners.forEach((listener) => listener(this.session));
  }
}

function createProfile(input: {
  email: string;
  fullName: string;
  orgName: string;
  onboardingComplete: boolean;
  persona: Json;
}): ProfileRow {
  const now = new Date().toISOString();
  const userId = createPreviewId("profile");
  const persona = isPersonaObject(input.persona)
    ? {
        ...input.persona,
        workspaceName: input.orgName.trim() || "Meridian Preview",
      }
    : input.persona;

  return {
    id: userId,
    org_id: createPreviewId("org"),
    full_name: input.fullName.trim() || "Preview Broker",
    email: input.email,
    role: getPersonaRole(persona),
    onboarding_complete: input.onboardingComplete,
    persona,
    created_at: now,
    updated_at: now,
  };
}

function createSession(userId: string, email: string): Session {
  const nowIso = new Date().toISOString();
  const nowSeconds = Math.floor(Date.now() / 1000);

  return {
    access_token: `preview-access-${userId}`,
    refresh_token: `preview-refresh-${userId}`,
    expires_in: 3600,
    expires_at: nowSeconds + 3600,
    token_type: "bearer",
    user: {
      id: userId,
      app_metadata: {
        provider: "email",
        providers: ["email"],
      },
      aud: "authenticated",
      confirmed_at: nowIso,
      created_at: nowIso,
      email,
      email_confirmed_at: nowIso,
      identities: [],
      last_sign_in_at: nowIso,
      phone: "",
      role: "authenticated",
      updated_at: nowIso,
      user_metadata: {},
    },
  } as Session;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase() || "preview@meridian.local";
}

function createPreviewId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

function isPersonaObject(persona: Json): persona is { [key: string]: Json | undefined } {
  return Boolean(persona) && typeof persona === "object" && !Array.isArray(persona);
}

function getPersonaRole(persona: Json) {
  if (!isPersonaObject(persona)) {
    return "solo_broker";
  }

  return typeof persona.role === "string" ? persona.role : "solo_broker";
}
