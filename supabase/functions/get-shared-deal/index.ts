// @ts-nocheck
// Public, unauthenticated read for the client-facing shared deal portal
// (web/app/shared/[token]). Callers use the ANON key (no user session — the
// buyer never signs in), so this function is the trust boundary: it looks up
// by a server-generated token via the service role (bypassing RLS entirely)
// and returns ONLY a minimal, curated read-only projection — never buyer
// email, commission data, other deals in the org, or storage/internal ids.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.108.1";
import { z } from "npm:zod@4.4.3";

const requestSchema = z.object({
  token: z.string().uuid(),
});

// Mirrors src/shared/lib/date/milestoneStatus.ts (deriveMilestoneStatus).
// Deno functions can't import from the Expo app bundle, so the Dubai-date
// logic is duplicated here rather than trusted from the stored `status`
// column, which is only refreshed by a nightly recompute_milestone_statuses()
// cron and can be up to ~24h stale — a buyer on the shared link would
// otherwise see a wrong "next payment" or paid percent.
const DUBAI_UTC_OFFSET_HOURS = 4;
const MS_PER_DAY = 86_400_000;
const DUE_SOON_DAYS = 7;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function todayInDubai() {
  return new Date(Date.now() + DUBAI_UTC_OFFSET_HOURS * 3_600_000).toISOString().slice(0, 10);
}

function toUtcMidnight(ymd) {
  if (!ISO_DATE.test(ymd)) {
    return null;
  }

  const [year, month, day] = ymd.split("-").map(Number);
  const time = Date.UTC(year, month - 1, day);

  const check = new Date(time);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }

  return time;
}

function daysBetween(fromYmd, toYmd) {
  const from = toUtcMidnight(fromYmd);
  const to = toUtcMidnight(toYmd);

  if (from === null || to === null) {
    return null;
  }

  return Math.round((to - from) / MS_PER_DAY);
}

function deriveMilestoneStatus(dueDate, isPaid, today) {
  if (isPaid) {
    return "paid";
  }

  if (!dueDate) {
    return "upcoming";
  }

  const days = daysBetween(today, dueDate);

  if (days === null) {
    return "upcoming";
  }

  if (days < 0) {
    return "overdue";
  }

  if (days <= DUE_SOON_DAYS) {
    return "due";
  }

  return "upcoming";
}

serve(async (request) => {
  try {
    if (request.method !== "POST") {
      return json({ error: "Method not allowed." }, 405);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: "Supabase function environment is not configured." }, 500);
    }

    const body = requestSchema.safeParse(await request.json().catch(() => null));

    if (!body.success) {
      return json({ error: "Invalid request." }, 400);
    }

    const service = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    // Rate-limit per token (not per IP — Deno edge functions don't reliably
    // expose a trustworthy client IP): bounds abuse of a leaked/guessed link
    // while a legitimate buyer can refresh the page freely.
    const { data: allowed, error: rlError } = await service.rpc("consume_rate_limit", {
      p_bucket: `shared_deal_view:${body.data.token}`,
      p_max: 300,
      p_window: "1 hour",
    });

    // Fail closed, matching the rest of this codebase's rate-limit posture.
    if (rlError) {
      return json({ error: "This is temporarily unavailable. Try again shortly." }, 503);
    }
    if (allowed !== true) {
      return json({ error: "Too many requests. Try again later." }, 429);
    }

    const { data: deal, error: dealError } = await service
      .from("deals")
      .select("id, created_by, project_name, unit, total_value_aed, handover_estimate, developers(name), milestones(id, seq, label, trigger_type, trigger_value, percent, amount_aed, due_date, paid_date, status)")
      .eq("share_token", body.data.token)
      .maybeSingle();

    if (dealError) {
      return json({ error: dealError.message }, 500);
    }

    if (!deal) {
      // Generic 404 — don't distinguish "never existed" from "revoked/expired".
      return json({ error: "This link is no longer valid." }, 404);
    }

    const { data: brokerProfile } = await service.from("profiles").select("full_name").eq("id", deal.created_by).maybeSingle();

    const today = todayInDubai();
    const milestones = (deal.milestones ?? [])
      .slice()
      .sort((a, b) => a.seq - b.seq)
      .map((milestone) => {
        const isPaid = milestone.status === "paid" || Boolean(milestone.paid_date);
        return {
          label: milestone.label,
          triggerLabel: milestone.trigger_value || triggerLabelForType(milestone.trigger_type),
          percent: milestone.percent,
          amountAed: milestone.amount_aed,
          dueDate: milestone.due_date,
          paidDate: milestone.paid_date,
          // Re-derived against "today", not the stored column — see
          // deriveMilestoneStatus above.
          status: deriveMilestoneStatus(milestone.due_date, isPaid, today),
        };
      });

    const paidToDate = milestones.filter((m) => m.status === "paid").reduce((sum, m) => sum + Number(m.amountAed || 0), 0);
    const totalValue = Number(deal.total_value_aed || 0);
    const paidPercent = totalValue > 0 ? Math.round((paidToDate / totalValue) * 100) : 0;
    const nextMilestone = milestones.find((m) => m.status === "due" || m.status === "overdue" || m.status === "upcoming") ?? null;
    const developer = Array.isArray(deal.developers) ? deal.developers[0] : deal.developers;

    return json({
      projectName: deal.project_name,
      unit: deal.unit,
      developerName: developer?.name ?? null,
      brokerName: brokerProfile?.full_name ?? null,
      totalValueAed: deal.total_value_aed,
      handoverEstimate: deal.handover_estimate,
      paidToDateAed: String(paidToDate),
      paidPercent,
      nextMilestone,
      milestones,
    });
  } catch (_error) {
    return json({ error: "Could not load this deal." }, 500);
  }
});

function triggerLabelForType(triggerType) {
  switch (triggerType) {
    case "booking":
      return "Booking";
    case "registration":
      return "DLD";
    case "construction":
      return "Construction";
    case "handover":
      return "Handover";
    default:
      return triggerType;
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}
