import "react-native-get-random-values";
import * as SecureStore from "expo-secure-store";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { assertNoPublicServiceRoleKey, createSecurityFetch, resolveTrustedHost } from "@/shared/security/networkSecurity";

import type { Database } from "./database.types";

const secureStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export function createMeridianSupabaseClient(): SupabaseClient<Database> | null {
  assertNoPublicServiceRoleKey();

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: false,
      persistSession: true,
      storage: secureStorage,
    },
    global: {
      fetch: createSecurityFetch([resolveTrustedHost(supabaseUrl)]),
    },
  });
}

export type MeridianSupabaseClient = SupabaseClient<Database>;
