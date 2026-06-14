import type { PostgrestError, Session } from "@supabase/supabase-js";

import type { Database, Json, ProfileRow } from "../database.types";
import type { MeridianSupabaseClient } from "../supabaseClient";
import type { PreviewSessionStore } from "./previewSessionStore";

export type SignInInput = {
  email: string;
  password: string;
};

export type SignUpWithWorkspaceInput = SignInInput & {
  fullName: string;
  orgName: string;
  persona: Json;
  developerNames: string[];
};

export type SignUpWithWorkspaceResult = {
  session: Session | null;
  profile: ProfileRow | null;
  needsEmailConfirmation: boolean;
};

export type AuthRepository = {
  getSession: () => Promise<Session | null>;
  getCurrentProfile: () => Promise<ProfileRow | null>;
  signInWithEmail: (input: SignInInput) => Promise<Session>;
  signUpWithWorkspace: (input: SignUpWithWorkspaceInput) => Promise<SignUpWithWorkspaceResult>;
  signOut: () => Promise<void>;
  onAuthStateChange: (listener: (session: Session | null) => void) => () => void;
};

type WorkspaceRpcClient = MeridianSupabaseClient & {
  rpc: (
    fn: "create_workspace_after_signup",
    args: Database["public"]["Functions"]["create_workspace_after_signup"]["Args"],
  ) => Promise<{ data: ProfileRow | null; error: PostgrestError | null }>;
};

export class SupabaseAuthRepository implements AuthRepository {
  constructor(private readonly client: MeridianSupabaseClient) {}

  async getSession() {
    const { data, error } = await this.client.auth.getSession();
    if (error) {
      throw new Error(error.message);
    }

    return data.session;
  }

  async getCurrentProfile() {
    const {
      data: { user },
      error: userError,
    } = await this.client.auth.getUser();

    if (userError) {
      throw new Error(userError.message);
    }

    if (!user) {
      return null;
    }

    const { data, error } = await this.client.from("profiles").select("*").eq("id", user.id).maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async signInWithEmail(input: SignInInput) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.session) {
      throw new Error("No session returned for sign-in.");
    }

    return data.session;
  }

  async signUpWithWorkspace(input: SignUpWithWorkspaceInput) {
    const { data, error } = await this.client.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName,
          org_name: input.orgName,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.session) {
      return {
        session: null,
        profile: null,
        needsEmailConfirmation: true,
      };
    }

    const { data: profile, error: workspaceError } = await (this.client as WorkspaceRpcClient).rpc("create_workspace_after_signup", {
      p_full_name: input.fullName,
      p_org_name: input.orgName,
      p_persona: input.persona,
      p_developer_names: input.developerNames,
    });

    if (workspaceError) {
      throw new Error(workspaceError.message);
    }

    return {
      session: data.session,
      profile,
      needsEmailConfirmation: false,
    };
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  onAuthStateChange(listener: (session: Session | null) => void) {
    const { data } = this.client.auth.onAuthStateChange((_event, session) => {
      listener(session);
    });

    return () => data.subscription.unsubscribe();
  }
}

export class PreviewAuthRepository implements AuthRepository {
  constructor(private readonly store: PreviewSessionStore) {}

  async getSession() {
    return this.store.getSession();
  }

  async getCurrentProfile() {
    return this.store.getProfile();
  }

  async signInWithEmail(input: SignInInput): Promise<Session> {
    return this.store.signIn(input.email);
  }

  async signUpWithWorkspace(input: SignUpWithWorkspaceInput): Promise<SignUpWithWorkspaceResult> {
    return this.store.signUp({
      email: input.email,
      fullName: input.fullName,
      orgName: input.orgName,
      persona: input.persona,
    });
  }

  async signOut() {
    this.store.signOut();
  }

  onAuthStateChange(listener: (session: Session | null) => void) {
    return this.store.subscribe(listener);
  }
}
