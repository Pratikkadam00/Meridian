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

    if (orgId) {
      // Only erase the whole org (cascade) when the caller is its SOLE member.
      // In a shared workspace, deleting the org would wipe every teammate's data,
      // so we delete only the caller's own deals + account instead.
      const { count: memberCount, error: countError } = await service
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("org_id", orgId);

      if (countError) {
        return json({ error: countError.message }, 500);
      }

      if ((memberCount ?? 0) <= 1) {
        // Sole member: erase the org's SPA documents then the org row (cascades
        // profiles, developers, deals, milestones, documents, reminders, push_tokens).
        const paths = await listAll(service, "deal-documents", String(orgId));
        for (let i = 0; i < paths.length; i += 100) {
          await service.storage.from("deal-documents").remove(paths.slice(i, i + 100));
        }
        const { error: orgDeleteError } = await service.from("orgs").delete().eq("id", orgId);
        if (orgDeleteError) {
          return json({ error: orgDeleteError.message }, 500);
        }
      } else {
        // Shared workspace: delete ONLY the caller's own data. Remove their deals'
        // storage, delete their deals (cascades that deal's milestones/documents/
        // reminders); the auth-user delete below then cascades the caller's profile
        // + push tokens. The org and teammates' deals are left intact.
        const { data: ownDeals, error: dealsError } = await service
          .from("deals")
          .select("id")
          .eq("org_id", orgId)
          .eq("created_by", userId);

        if (dealsError) {
          return json({ error: dealsError.message }, 500);
        }

        for (const deal of ownDeals ?? []) {
          const paths = await listAll(service, "deal-documents", `${orgId}/${deal.id}`);
          for (let i = 0; i < paths.length; i += 100) {
            await service.storage.from("deal-documents").remove(paths.slice(i, i + 100));
          }
        }

        if ((ownDeals ?? []).length) {
          // Delete the caller's deals BEFORE the auth user so the deals.created_by
          // ON DELETE RESTRICT FK doesn't block the cascading profile delete.
          const { error: dealDeleteError } = await service
            .from("deals")
            .delete()
            .eq("org_id", orgId)
            .eq("created_by", userId);
          if (dealDeleteError) {
            return json({ error: dealDeleteError.message }, 500);
          }
        }
      }
    }

    // Delete the auth user (cascades the caller's profile + push tokens).
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
