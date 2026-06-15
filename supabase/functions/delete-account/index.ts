// @ts-nocheck
// PDPL right-to-erasure + Apple/Google mandatory account deletion.
// Authenticated by the caller's JWT; erases their org's storage objects, the org
// row (which cascades all app tables), and the auth user.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.108.1";

serve(async (request) => {
  try {
    if (request.method !== "POST") {
      return json({ error: "Method not allowed." }, 405);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return json({ error: "Supabase function environment is not configured." }, 500);
    }

    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Authorization is required." }, 401);
    }

    // Resolve the caller (user + org) BEFORE any deletion.
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      return json({ error: "Could not resolve the user." }, 401);
    }
    const userId = userData.user.id;
    const { data: orgId, error: orgError } = await userClient.rpc("current_org_id");
    if (orgError) {
      return json({ error: orgError.message }, 403);
    }

    const service = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    // 1. Erase the org's SPA documents from private storage (recursively).
    if (orgId) {
      const paths = await listAll(service, "deal-documents", String(orgId));
      for (let i = 0; i < paths.length; i += 100) {
        await service.storage.from("deal-documents").remove(paths.slice(i, i + 100));
      }
      // 2. Delete the org row — cascades profiles, developers, deals, milestones,
      //    documents, reminders, push_tokens via ON DELETE CASCADE.
      const { error: orgDeleteError } = await service.from("orgs").delete().eq("id", orgId);
      if (orgDeleteError) {
        return json({ error: orgDeleteError.message }, 500);
      }
    }

    // 3. Delete the auth user.
    const { error: authDeleteError } = await service.auth.admin.deleteUser(userId);
    if (authDeleteError) {
      return json({ error: authDeleteError.message }, 500);
    }

    return json({ ok: true });
  } catch (_error) {
    return json({ error: "Account deletion failed. Please try again or contact support." }, 500);
  }
});

async function listAll(client, bucket, prefix) {
  const out = [];
  const { data, error } = await client.storage.from(bucket).list(prefix, { limit: 1000 });
  if (error || !data) {
    return out;
  }
  for (const item of data) {
    const path = `${prefix}/${item.name}`;
    if (item.id === null) {
      out.push(...(await listAll(client, bucket, path)));
    } else {
      out.push(path);
    }
  }
  return out;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}
