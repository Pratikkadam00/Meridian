// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.108.1";
import { z } from "npm:zod@4.4.3";

const requestSchema = z
  .object({
    limit: z.number().int().positive().max(100).optional(),
  })
  .optional();

const EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push/send";
const RESEND_ENDPOINT = "https://api.resend.com/emails";

serve(async (request) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const reminderSecret = Deno.env.get("REMINDER_FUNCTION_SECRET");

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "Supabase function environment is not configured." }, 500);
  }

  // Fail closed: the dispatcher must be invoked by the scheduler with the secret.
  if (!reminderSecret) {
    return json({ error: "Reminder dispatch secret is not configured." }, 500);
  }

  const providedSecret = request.headers.get("x-reminder-secret") ?? "";
  if (!(await secretsMatch(providedSecret, reminderSecret))) {
    return json({ error: "Unauthorized." }, 401);
  }

  const body = requestSchema.safeParse(await request.json().catch(() => undefined));

  if (!body.success) {
    return json({ error: "Invalid reminder request." }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
  const limit = body.data?.limit ?? 50;

  // From here on this is a real, authorized dispatch attempt — log it (success
  // or failure) so "reminders are firing" is a verifiable fact, not a hope.
  // See phase_17_dispatch_observability.sql / reminder_dispatch_health().
  const startedAt = new Date();
  const results = { inspected: 0, sent: 0, failed: 0, cancelled: 0 };
  let topLevelError: string | null = null;

  try {
    // Atomically claim due rows (pending -> sending, FOR UPDATE SKIP LOCKED) so
    // two overlapping runs never deliver the same reminder twice.
    const { data: claimed, error: claimError } = await supabase.rpc("claim_due_reminders", { p_limit: limit });

    if (claimError) {
      topLevelError = claimError.message;
      return json({ error: claimError.message }, 500);
    }

    const claimedIds = (claimed ?? []).map((row) => row.id);

    if (!claimedIds.length) {
      return json(results, 200);
    }

    const { data: reminders, error } = await supabase
      .from("reminders")
      .select(
        "id, org_id, channel, send_at, status, milestones(id, label, amount_aed, due_date, status, deals(id, project_name, unit, created_by))",
      )
      .in("id", claimedIds);

    if (error) {
      topLevelError = error.message;
      return json({ error: error.message }, 500);
    }

    results.inspected = reminders?.length ?? 0;

    for (const reminder of reminders ?? []) {
      const milestone = relationOne(reminder.milestones);

      if (!milestone || milestone.status === "paid") {
        await markReminder(supabase, reminder.id, "cancelled");
        results.cancelled += 1;
        continue;
      }

      try {
        const message = buildReminderMessage(milestone);

        if (reminder.channel === "push") {
          await sendPushReminder(supabase, reminder.org_id, message);
        } else if (reminder.channel === "email") {
          await sendEmailReminder(supabase, reminder.org_id, message);
        } else {
          throw new Error(`Unsupported reminder channel: ${reminder.channel}`);
        }

        await markReminder(supabase, reminder.id, "sent");
        results.sent += 1;
      } catch (sendError) {
        console.error("Reminder delivery failed", {
          reminderId: reminder.id,
          channel: reminder.channel,
          error: sendError instanceof Error ? sendError.message : String(sendError),
        });
        await markReminder(supabase, reminder.id, "failed");
        results.failed += 1;
      }
    }

    return json(results, 200);
  } catch (unexpectedError) {
    topLevelError = unexpectedError instanceof Error ? unexpectedError.message : String(unexpectedError);
    return json({ error: "Reminder dispatch failed." }, 500);
  } finally {
    // A rejected promise here (not just a resolved {error}) would otherwise
    // throw inside `finally` and override the Response the try/catch already
    // prepared above. Logging failure must never mask the real dispatch
    // outcome already returned, so this can never escape as a throw.
    try {
      const { error: logError } = await supabase.rpc("log_dispatch_run", {
        p_function_name: "send-due-reminders",
        p_started_at: startedAt.toISOString(),
        p_finished_at: new Date().toISOString(),
        p_inspected: results.inspected,
        p_sent: results.sent,
        p_failed: results.failed,
        p_cancelled: results.cancelled,
        p_error: topLevelError,
      });

      if (logError) {
        console.error("Failed to record dispatch run", { error: logError.message });
      }
    } catch (logException) {
      console.error("Failed to record dispatch run", {
        error: logException instanceof Error ? logException.message : String(logException),
      });
    }
  }
});

async function sendPushReminder(supabase, orgId, message) {
  // Target the broker who owns the deal, not the whole org, so a buyer's
  // project/unit/amount isn't pushed to teammates who don't manage the deal
  // (mirrors the email path). Fall back to the org only if the deal has no owner.
  let query = supabase.from("push_tokens").select("token").eq("org_id", orgId);
  if (message.createdBy) {
    query = query.eq("profile_id", message.createdBy);
  }
  const { data: tokens, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const expoTokens = [...new Set((tokens ?? []).map((row) => row.token).filter(Boolean))];

  if (!expoTokens.length) {
    throw new Error("No Expo push token registered for this deal owner.");
  }

  const response = await fetch(EXPO_PUSH_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      expoTokens.map((token) => ({
        to: token,
        title: message.title,
        body: message.body,
        sound: "default",
        data: {
          type: "milestone_reminder",
          dealId: message.dealId,
          milestoneId: message.milestoneId,
        },
      })),
    ),
  });

  if (!response.ok) {
    throw new Error(`Expo push request failed with ${response.status}.`);
  }

  const result = await response.json().catch(() => null);
  const deliveries = Array.isArray(result?.data) ? result.data : [result?.data].filter(Boolean);

  // Prune tokens Expo reports as unregistered so a dead device can't keep
  // failing every future reminder for the org.
  const deadTokens = deliveries
    .map((ticket, index) => (ticket?.status === "error" && ticket?.details?.error === "DeviceNotRegistered" ? expoTokens[index] : null))
    .filter(Boolean);

  if (deadTokens.length) {
    await supabase.from("push_tokens").delete().eq("org_id", orgId).in("token", deadTokens);
  }

  // Succeed if at least one device received it; only fail when every token failed.
  const anyDelivered = deliveries.some((ticket) => ticket?.status === "ok");

  if (!anyDelivered) {
    const firstError = deliveries.find((ticket) => ticket?.status === "error");
    throw new Error(firstError?.message ?? "All Expo push tickets failed.");
  }
}

async function sendEmailReminder(supabase, orgId, message) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("REMINDER_EMAIL_FROM") ?? "Meridian <reminders@meridian.local>";

  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  // Target the broker who owns the deal, not the whole org (avoids emailing
  // teammates about deals they don't manage); fall back to org members only if
  // the owner has no email on file.
  let recipients = [];

  if (message.createdBy) {
    const { data: owner, error: ownerError } = await supabase.from("profiles").select("email").eq("id", message.createdBy).maybeSingle();

    if (ownerError) {
      throw new Error(ownerError.message);
    }

    if (owner?.email) {
      recipients = [owner.email];
    }
  }

  if (!recipients.length) {
    const { data: profiles, error } = await supabase.from("profiles").select("email").eq("org_id", orgId);

    if (error) {
      throw new Error(error.message);
    }

    recipients = [...new Set((profiles ?? []).map((profile) => profile.email).filter(Boolean))];
  }

  if (!recipients.length) {
    throw new Error("No broker email address found for this organization.");
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: recipients,
      subject: message.title,
      text: `${message.body}\n\nOpen Meridian to mark this milestone paid or share the reminder.`,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Email request failed with ${response.status}. ${detail}`.trim());
  }
}

async function markReminder(supabase, reminderId, status) {
  const values =
    status === "sent"
      ? {
          status,
          sent_at: new Date().toISOString(),
        }
      : {
          status,
        };
  const { error } = await supabase.from("reminders").update(values).eq("id", reminderId);

  if (error) {
    throw new Error(error.message);
  }
}

function buildReminderMessage(milestone) {
  const deal = relationOne(milestone.deals);
  const dealLabel = [deal?.project_name, deal?.unit].filter(Boolean).join(" - ") || "payment plan";
  const amount = formatAed(milestone.amount_aed);
  const dueDate = formatDate(milestone.due_date);

  return {
    title: `Payment due: ${milestone.label}`,
    body: `${amount} is due ${dueDate} for ${dealLabel}.`,
    dealId: deal?.id ?? null,
    milestoneId: milestone.id,
    createdBy: deal?.created_by ?? null,
  };
}

function relationOne(value) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function formatAed(value) {
  const [wholePart] = String(value ?? "0").split(".");
  const normalized = wholePart.replace(/[^\d-]/g, "");
  const negative = normalized.startsWith("-");
  const digits = normalized.replace(/\D/g, "").replace(/^0+(?=\d)/, "") || "0";
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return `AED ${negative ? "-" : ""}${grouped}`;
}

function formatDate(value) {
  if (!value) {
    return "soon";
  }

  const date = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Constant-time secret comparison: SHA-256 both sides to a fixed 32 bytes, then
// XOR-compare, so the loop count never depends on secret length/content and a
// timing side-channel can't recover the dispatch secret byte by byte.
async function secretsMatch(provided: string, expected: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(provided)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const av = new Uint8Array(a);
  const bv = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < av.length; i++) {
    diff |= av[i] ^ bv[i];
  }
  return diff === 0;
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
