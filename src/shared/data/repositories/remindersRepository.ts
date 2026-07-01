import { t } from "i18next";
import type { PostgrestError } from "@supabase/supabase-js";

import type { Database, MilestoneStatus, ProfileRow, ReminderChannel, ReminderStatus } from "../database.types";
import type { MeridianSupabaseClient } from "../supabaseClient";

export type ReminderUrgency = "ready" | "scheduled" | "overdue" | "failed" | "sent";

export type ReminderItem = {
  id: string;
  milestoneId: string;
  dealId: string;
  dealLabel: string;
  milestoneLabel: string;
  amountAed: string;
  amountLabel: string;
  dueDateLabel: string;
  sendAtLabel: string;
  status: ReminderStatus;
  channels: ReminderChannel[];
  urgency: ReminderUrgency;
  whatsappMessage: string;
  whatsappUrl: string;
};

export type PushTokenRegistration = {
  status: "registered";
  message: string;
};

// Whether the reminder dispatcher is actually running — the trust signal for
// the app's core promise ("never miss a due date"). null lastRunAt means the
// cron has never fired for this project (see docs/reminders-cron.md).
export type DispatchHealth = {
  lastRunAt: string | null;
  lastRunOk: boolean;
  isStale: boolean;
};

export type RemindersRepository = {
  listUpcomingReminders: () => Promise<ReminderItem[]>;
  registerPushToken: (token: string) => Promise<PushTokenRegistration>;
  getDispatchHealth: () => Promise<DispatchHealth>;
};

type SupabaseDealRelation = { id: string; project_name: string; unit: string } | { id: string; project_name: string; unit: string }[] | null;

type SupabaseMilestoneRelation =
  | {
      id: string;
      label: string;
      amount_aed: string;
      due_date: string | null;
      status: MilestoneStatus;
      deals: SupabaseDealRelation;
    }
  | {
      id: string;
      label: string;
      amount_aed: string;
      due_date: string | null;
      status: MilestoneStatus;
      deals: SupabaseDealRelation;
    }[]
  | null;

type SupabaseReminderRow = {
  id: string;
  channel: ReminderChannel;
  send_at: string;
  sent_at: string | null;
  status: ReminderStatus;
  milestones: SupabaseMilestoneRelation;
};

type ReminderSelectQuery = {
  order: (column: "send_at", options: { ascending: boolean }) => {
    limit: (count: number) => Promise<{ data: unknown[] | null; error: PostgrestError | null }>;
  };
};

type ReminderSelectBuilder = {
  select: (columns: string) => {
    in: (column: "status", values: ReminderStatus[]) => ReminderSelectQuery;
  };
};

type ProfileSelectBuilder = {
  select: (columns: string) => {
    eq: (column: "id", value: string) => {
      single: () => Promise<{ data: ProfileRow; error: PostgrestError | null }>;
    };
  };
};

type PushTokenUpsertBuilder = {
  upsert: (
    values: Database["public"]["Tables"]["push_tokens"]["Insert"],
    options: { onConflict: string },
  ) => Promise<{ error: PostgrestError | null }>;
};

type DispatchHealthRow = {
  last_run_at: string | null;
  last_run_ok: boolean;
  minutes_since_last_run: number | null;
  is_stale: boolean;
};

type DispatchHealthRpcClient = {
  rpc: (fn: "reminder_dispatch_health", args: Record<string, never>) => Promise<{ data: DispatchHealthRow[] | null; error: PostgrestError | null }>;
};

const reminderOffsets = [7, 3, 1] as const;

const previewReminderSeeds = [
  {
    id: "preview-reminder-marina",
    milestoneId: "preview-marina-40-built",
    dealId: "preview-marina-vista",
    dealLabel: "Marina Vista - 2BR",
    milestoneLabel: "40% construction",
    amountAed: "320000",
    dueDate: "2026-06-19",
    sendAt: computeReminderSendAt("2026-06-19", 3),
    status: "pending" as ReminderStatus,
    channels: ["push", "email"] as ReminderChannel[],
  },
  {
    id: "preview-reminder-canal",
    milestoneId: "preview-canal-dld",
    dealId: "preview-canal-heights",
    dealLabel: "Canal Heights - Studio",
    milestoneLabel: "DLD/Oqood registration",
    amountAed: "50400",
    dueDate: "2026-06-24",
    sendAt: computeReminderSendAt("2026-06-24", 7),
    status: "pending" as ReminderStatus,
    channels: ["push", "email"] as ReminderChannel[],
  },
  {
    id: "preview-reminder-binghatti",
    milestoneId: "preview-binghatti-handover",
    dealId: "preview-binghatti-hills",
    dealLabel: "Binghatti Hills - 2BR",
    milestoneLabel: "Final payment",
    amountAed: "964000",
    dueDate: "2026-06-12",
    sendAt: computeReminderSendAt("2026-06-12", 1),
    status: "failed" as ReminderStatus,
    channels: ["email"] as ReminderChannel[],
  },
];

export class SupabaseRemindersRepository implements RemindersRepository {
  constructor(private readonly client: MeridianSupabaseClient) {}

  async listUpcomingReminders(): Promise<ReminderItem[]> {
    // Reminders are scheduled at deal-creation time (create_deal_with_plan), so
    // this read path no longer re-runs the org-wide scheduler on every load —
    // that unbounded re-scan was an application-layer DoS / cost vector.
    const reminders = this.client.from("reminders") as unknown as ReminderSelectBuilder;
    const { data, error } = await reminders
      .select("id, channel, send_at, sent_at, status, milestones(id, label, amount_aed, due_date, status, deals(id, project_name, unit))")
      .in("status", ["pending", "failed"])
      .order("send_at", { ascending: true })
      .limit(40);

    if (error) {
      throw new Error(error.message);
    }

    return groupReminderRows((data ?? []) as SupabaseReminderRow[]);
  }

  async registerPushToken(token: string): Promise<PushTokenRegistration> {
    const cleanToken = token.trim();

    if (!cleanToken) {
      throw new Error("Push token is empty.");
    }

    const profile = await this.getCurrentProfile();
    const pushTokens = this.client.from("push_tokens") as unknown as PushTokenUpsertBuilder;
    const { error } = await pushTokens.upsert(
      {
        org_id: profile.org_id,
        profile_id: profile.id,
        token: cleanToken,
        platform: "expo",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "org_id,profile_id,token" },
    );

    if (error) {
      throw new Error(error.message);
    }

    return {
      status: "registered",
      message: t("reminders.pushConnected"),
    };
  }

  private async getCurrentProfile(): Promise<ProfileRow> {
    const {
      data: { user },
      error: userError,
    } = await this.client.auth.getUser();

    if (userError) {
      throw new Error(userError.message);
    }

    if (!user) {
      throw new Error("Sign in before enabling reminders.");
    }

    const profiles = this.client.from("profiles") as unknown as ProfileSelectBuilder;
    const { data, error } = await profiles.select("*").eq("id", user.id).single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getDispatchHealth(): Promise<DispatchHealth> {
    const rpcClient = this.client as unknown as DispatchHealthRpcClient;
    const { data, error } = await rpcClient.rpc("reminder_dispatch_health", {});

    if (error) {
      throw new Error(error.message);
    }

    const row = (data ?? [])[0];

    if (!row) {
      // No dispatch has ever been logged for this project — the cron setup in
      // docs/reminders-cron.md has not run yet. Surface as stale, not an error.
      return { lastRunAt: null, lastRunOk: true, isStale: true };
    }

    return {
      lastRunAt: row.last_run_at,
      lastRunOk: row.last_run_ok,
      isStale: row.is_stale,
    };
  }
}

export class PreviewRemindersRepository implements RemindersRepository {
  async listUpcomingReminders(): Promise<ReminderItem[]> {
    return previewReminderSeeds.map((seed) =>
      toReminderItem({
        ...seed,
        sendAt: seed.sendAt ?? new Date().toISOString(),
      }),
    );
  }

  async registerPushToken(): Promise<PushTokenRegistration> {
    return {
      status: "registered",
      message: "Preview push reminders are enabled on this device.",
    };
  }

  async getDispatchHealth(): Promise<DispatchHealth> {
    // No real dispatcher exists in preview mode — reporting healthy avoids a
    // false "reminders may not be firing" warning while exploring the demo.
    return { lastRunAt: null, lastRunOk: true, isStale: false };
  }
}

export function computeReminderSendAt(dueDate: string | null, offsetDays: number) {
  if (!dueDate || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return null;
  }

  // Canonical send time is 09:00 Asia/Dubai (UTC+4) = 05:00 UTC — matching the
  // SQL scheduler exactly so client labels and real send times never drift.
  const date = new Date(`${dueDate}T09:00:00+04:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setUTCDate(date.getUTCDate() - offsetDays);

  return date.toISOString();
}

function groupReminderRows(rows: SupabaseReminderRow[]) {
  const groups = new Map<
    string,
    {
      id: string;
      milestoneId: string;
      dealId: string;
      dealLabel: string;
      milestoneLabel: string;
      amountAed: string;
      dueDate: string | null;
      sendAt: string;
      status: ReminderStatus;
      channels: Set<ReminderChannel>;
      milestoneStatus: MilestoneStatus;
    }
  >();

  rows.forEach((row) => {
    const milestone = relationOne(row.milestones);
    const deal = relationOne(milestone?.deals ?? null);

    if (!milestone || !deal) {
      return;
    }

    const existing = groups.get(milestone.id);
    const nextStatus = existing ? mergeStatus(existing.status, row.status) : row.status;
    const sendAt = existing && new Date(existing.sendAt).getTime() <= new Date(row.send_at).getTime() ? existing.sendAt : row.send_at;
    const channels = existing?.channels ?? new Set<ReminderChannel>();
    channels.add(row.channel);

    groups.set(milestone.id, {
      id: existing?.id ?? row.id,
      milestoneId: milestone.id,
      dealId: deal.id,
      dealLabel: `${deal.project_name} - ${deal.unit}`,
      milestoneLabel: milestone.label,
      amountAed: milestone.amount_aed,
      dueDate: milestone.due_date,
      sendAt,
      status: nextStatus,
      channels,
      milestoneStatus: milestone.status,
    });
  });

  return Array.from(groups.values()).map((group) =>
    toReminderItem({
      ...group,
      channels: Array.from(group.channels).sort(channelSort),
    }),
  );
}

function toReminderItem(input: {
  id: string;
  milestoneId: string;
  dealId: string;
  dealLabel: string;
  milestoneLabel: string;
  amountAed: string;
  dueDate: string | null;
  sendAt: string;
  status: ReminderStatus;
  channels: ReminderChannel[];
  milestoneStatus?: MilestoneStatus;
}): ReminderItem {
  const amountLabel = formatAedWhole(input.amountAed);
  const dueDateLabel = formatDateLabel(input.dueDate);
  const whatsappMessage = buildWhatsAppMessage({
    dealLabel: input.dealLabel,
    milestoneLabel: input.milestoneLabel,
    amountLabel,
    dueDateLabel,
  });

  return {
    id: input.id,
    milestoneId: input.milestoneId,
    dealId: input.dealId,
    dealLabel: input.dealLabel,
    milestoneLabel: input.milestoneLabel,
    amountAed: input.amountAed,
    amountLabel,
    dueDateLabel,
    sendAtLabel: formatSendAtLabel(input.sendAt),
    status: input.status,
    channels: input.channels,
    urgency: urgencyForReminder(input.status, input.milestoneStatus, input.sendAt),
    whatsappMessage,
    whatsappUrl: buildWhatsAppShareUrl(whatsappMessage),
  };
}

function buildWhatsAppMessage(input: { dealLabel: string; milestoneLabel: string; amountLabel: string; dueDateLabel: string }) {
  return t("reminders.whatsappMessage", {
    amount: input.amountLabel,
    milestone: input.milestoneLabel,
    deal: input.dealLabel,
    dueDate: input.dueDateLabel,
  });
}

function buildWhatsAppShareUrl(message: string) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

function relationOne<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function mergeStatus(current: ReminderStatus, next: ReminderStatus) {
  if (current === "failed" || next === "failed") {
    return "failed";
  }

  if (current === "pending" || next === "pending") {
    return "pending";
  }

  if (current === "sent" || next === "sent") {
    return "sent";
  }

  return "cancelled";
}

function urgencyForReminder(status: ReminderStatus, milestoneStatus: MilestoneStatus | undefined, sendAt: string): ReminderUrgency {
  if (status === "failed") {
    return "failed";
  }

  if (status === "sent") {
    return "sent";
  }

  if (milestoneStatus === "overdue") {
    return "overdue";
  }

  return new Date(sendAt).getTime() <= Date.now() ? "ready" : "scheduled";
}

function channelSort(left: ReminderChannel, right: ReminderChannel) {
  const order: Record<ReminderChannel, number> = {
    push: 0,
    email: 1,
  };

  return order[left] - order[right];
}

function formatAedWhole(value: string) {
  const [wholePart] = value.split(".");
  const normalized = wholePart.replace(/[^\d-]/g, "");
  const negative = normalized.startsWith("-");
  const digits = normalized.replace(/\D/g, "").replace(/^0+(?=\d)/, "") || "0";

  return `${negative ? "-" : ""}${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

function formatDateLabel(dateValue: string | null) {
  if (!dateValue) {
    return t("deal.tbd");
  }

  const [, monthValue, dayValue] = dateValue.split("-");
  const month = Number(monthValue);
  const day = Number(dayValue);

  if (!(month >= 1 && month <= 12) || !day) {
    return dateValue;
  }

  return `${day} ${t(`deal.monthShort.${month}`)}`;
}

function formatSendAtLabel(sendAt: string) {
  const date = new Date(sendAt);

  if (Number.isNaN(date.getTime())) {
    return t("reminders.queued");
  }

  const now = Date.now();
  const diffMs = date.getTime() - now;
  const diffDays = Math.ceil(diffMs / 86_400_000);

  if (diffMs <= 0) {
    return t("reminders.readyNow");
  }

  if (diffDays <= 1) {
    return t("reminders.tomorrow");
  }

  const matchingOffset = reminderOffsets.find((offset) => diffDays === offset);

  if (matchingOffset) {
    return t("reminders.daysBefore", { days: matchingOffset });
  }

  return t("reminders.daysAway", { days: diffDays });
}
