import { t } from "i18next";
import type { PostgrestError, Session } from "@supabase/supabase-js";

import type { Database, Json, ProfileRow } from "../database.types";
import type { MeridianSupabaseClient } from "../supabaseClient";
import type { PreviewSessionStore } from "./previewSessionStore";

function formatExpiryLabel(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return `${date.getUTCDate()} ${t(`deal.monthShort.${date.getUTCMonth() + 1}`)}`;
}

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

// Joining an EXISTING org via an invite code, instead of creating a new one.
// Deliberately a separate signup path (not a post-hoc org switch) — org
// membership is decided once, before any deals accumulate under the wrong org.
export type SignUpAndJoinTeamInput = SignInInput & {
  fullName: string;
  inviteCode: string;
  persona: Json;
};

export type OrgInvite = {
  code: string;
  expiresAtLabel: string;
};

// Inputs for finishing profile setup on an ALREADY-authenticated session (no
// auth.signUp() call). Used to recover a session stranded by a prior
// signUpWithWorkspace/signUpAndJoinTeam whose profile-creation RPC failed —
// retrying auth.signUp() for an already-registered email is a dead end
// (Supabase returns needsEmailConfirmation with no session), so recovery
// must skip straight to the RPC.
export type CompleteWorkspaceProfileInput = {
  fullName: string;
  orgName: string;
  persona: Json;
  developerNames: string[];
};

export type CompleteTeamJoinInput = {
  fullName: string;
  inviteCode: string;
  persona: Json;
};

export type AuthRepository = {
  getSession: () => Promise<Session | null>;
  getCurrentProfile: () => Promise<ProfileRow | null>;
  signInWithEmail: (input: SignInInput) => Promise<Session>;
  signUpWithWorkspace: (input: SignUpWithWorkspaceInput) => Promise<SignUpWithWorkspaceResult>;
  signUpAndJoinTeam: (input: SignUpAndJoinTeamInput) => Promise<SignUpWithWorkspaceResult>;
  completeWorkspaceProfile: (input: CompleteWorkspaceProfileInput) => Promise<ProfileRow>;
  completeTeamJoin: (input: CompleteTeamJoinInput) => Promise<ProfileRow>;
  createOrgInvite: () => Promise<OrgInvite>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  onAuthStateChange: (listener: (session: Session | null) => void) => () => void;
};

type WorkspaceRpcClient = MeridianSupabaseClient & {
  rpc: (
    fn: "create_workspace_after_signup",
    args: Database["public"]["Functions"]["create_workspace_after_signup"]["Args"],
  ) => Promise<{ data: ProfileRow | null; error: PostgrestError | null }>;
};

type RedeemInviteRpcClient = {
  rpc: (
    fn: "redeem_org_invite",
    args: { p_code: string; p_full_name: string; p_persona: Json },
  ) => Promise<{ data: ProfileRow | null; error: PostgrestError | null }>;
};

type CreateInviteRpcClient = {
  rpc: (fn: "create_org_invite", args: Record<string, never>) => Promise<{ data: { code: string; expires_at: string }[] | null; error: PostgrestError | null }>;
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

    const profile = await this.completeWorkspaceProfile({
      fullName: input.fullName,
      orgName: input.orgName,
      persona: input.persona,
      developerNames: input.developerNames,
    });

    return {
      session: data.session,
      profile,
      needsEmailConfirmation: false,
    };
  }

  async completeWorkspaceProfile(input: CompleteWorkspaceProfileInput): Promise<ProfileRow> {
    const { data: profile, error } = await (this.client as WorkspaceRpcClient).rpc("create_workspace_after_signup", {
      p_full_name: input.fullName,
      p_org_name: input.orgName,
      p_persona: input.persona,
      p_developer_names: input.developerNames,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!profile) {
      throw new Error("Could not finish setting up your workspace.");
    }

    return profile;
  }

  async signUpAndJoinTeam(input: SignUpAndJoinTeamInput) {
    const { data, error } = await this.client.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName,
          invite_code: input.inviteCode,
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

    const profile = await this.completeTeamJoin({
      fullName: input.fullName,
      inviteCode: input.inviteCode,
      persona: input.persona,
    });

    return {
      session: data.session,
      profile,
      needsEmailConfirmation: false,
    };
  }

  async completeTeamJoin(input: CompleteTeamJoinInput): Promise<ProfileRow> {
    const { data: profile, error } = await (this.client as unknown as RedeemInviteRpcClient).rpc("redeem_org_invite", {
      p_code: input.inviteCode,
      p_full_name: input.fullName,
      p_persona: input.persona,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!profile) {
      throw new Error("Could not join this team.");
    }

    return profile;
  }

  async createOrgInvite(): Promise<OrgInvite> {
    const { data, error } = await (this.client as unknown as CreateInviteRpcClient).rpc("create_org_invite", {});

    if (error) {
      throw new Error(error.message);
    }

    const row = (data ?? [])[0];

    if (!row) {
      throw new Error("Could not create an invite.");
    }

    return { code: row.code, expiresAtLabel: formatExpiryLabel(row.expires_at) };
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  async deleteAccount() {
    // Server-side erasure (storage + org cascade + auth user), then local sign-out.
    const { error } = await this.client.functions.invoke("delete-account", { body: {} });
    if (error) {
      throw new Error(error.message);
    }
    await this.client.auth.signOut().catch(() => undefined);
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

  async signUpAndJoinTeam(input: SignUpAndJoinTeamInput): Promise<SignUpWithWorkspaceResult> {
    if (!input.inviteCode.trim()) {
      throw new Error("This invite code is invalid or has expired");
    }
    // Preview mode has no real multi-tenant org to join — falls back to the
    // same seeded profile creation as a normal signup.
    return this.store.signUp({
      email: input.email,
      fullName: input.fullName,
      orgName: "Preview team",
      persona: input.persona,
    });
  }

  // Preview mode has no real backend RPC to retry, so these just replay the
  // seeded signup against the already-active preview session's email — kept
  // for interface parity with the real recovery path.
  async completeWorkspaceProfile(input: CompleteWorkspaceProfileInput): Promise<ProfileRow> {
    const session = this.store.getSession();

    if (!session) {
      throw new Error("No active session to finish setting up.");
    }

    const result = this.store.signUp({
      email: session.user.email ?? "preview@meridian.local",
      fullName: input.fullName,
      orgName: input.orgName,
      persona: input.persona,
    });

    return result.profile;
  }

  async completeTeamJoin(input: CompleteTeamJoinInput): Promise<ProfileRow> {
    if (!input.inviteCode.trim()) {
      throw new Error("This invite code is invalid or has expired");
    }

    const session = this.store.getSession();

    if (!session) {
      throw new Error("No active session to finish setting up.");
    }

    const result = this.store.signUp({
      email: session.user.email ?? "preview@meridian.local",
      fullName: input.fullName,
      orgName: "Preview team",
      persona: input.persona,
    });

    return result.profile;
  }

  async createOrgInvite(): Promise<OrgInvite> {
    return { code: "PREV-DEMO", expiresAtLabel: t("deal.tbd") };
  }

  async signOut() {
    this.store.signOut();
  }

  async deleteAccount() {
    this.store.signOut();
  }

  onAuthStateChange(listener: (session: Session | null) => void) {
    return this.store.subscribe(listener);
  }
}
