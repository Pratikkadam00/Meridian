import { createClient } from "@supabase/supabase-js";

// Anon client only. The anon key is public by design — RLS (and, for the
// shared client portal, an edge function checking a server-generated share
// token) is the real boundary. The service-role key must never be used here.
export function createAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}

export function createWaitlistClient() {
  return createAnonClient();
}
