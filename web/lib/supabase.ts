import { createClient } from "@supabase/supabase-js";

// Anon client only. The anon key is public by design — Row-Level Security is the
// boundary (the waitlist table allows anon INSERT and nothing else). The
// service-role key must never be used here.
export function createWaitlistClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}
