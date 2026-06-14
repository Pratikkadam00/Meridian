import type { PostgrestError } from "@supabase/supabase-js";

import type { Database, ProfileRow } from "../database.types";
import type { MeridianSupabaseClient } from "../supabaseClient";
import type { PreviewSessionStore } from "./previewSessionStore";

export type BrokerRole = "solo_broker" | "brokerage";
export type DealVolume = "1-5" | "6-15" | "16+";

export type PersonalizationInput = {
  role: BrokerRole;
  market: "dubai";
  volume: DealVolume;
  developerNames: string[];
};

export type OnboardingRepository = {
  savePersonalization: (input: PersonalizationInput) => Promise<ProfileRow | null>;
  completeOnboarding: () => Promise<ProfileRow | null>;
};

type OnboardingRpcClient = MeridianSupabaseClient & {
  rpc: (
    fn: "save_onboarding_personalization",
    args: Database["public"]["Functions"]["save_onboarding_personalization"]["Args"],
  ) => Promise<{ data: ProfileRow | null; error: PostgrestError | null }>;
} & {
  rpc: (
    fn: "complete_onboarding",
    args: Database["public"]["Functions"]["complete_onboarding"]["Args"],
  ) => Promise<{ data: ProfileRow | null; error: PostgrestError | null }>;
};

export class SupabaseOnboardingRepository implements OnboardingRepository {
  constructor(private readonly client: MeridianSupabaseClient) {}

  async savePersonalization(input: PersonalizationInput) {
    const { data, error } = await (this.client as OnboardingRpcClient).rpc("save_onboarding_personalization", {
      p_role: input.role,
      p_market: input.market,
      p_volume: input.volume,
      p_developer_names: input.developerNames,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async completeOnboarding() {
    const { data, error } = await (this.client as OnboardingRpcClient).rpc("complete_onboarding", {});

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}

export class PreviewOnboardingRepository implements OnboardingRepository {
  constructor(private readonly store: PreviewSessionStore) {}

  async savePersonalization(input: PersonalizationInput) {
    return this.store.savePersonalization(input);
  }

  async completeOnboarding() {
    return this.store.completeOnboarding();
  }
}
