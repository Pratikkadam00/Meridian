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

export type RemindersRepository = {
  listUpcomingReminders: () => Promise<ReminderItem[]>;
  registerPushToken: (token: string) => Promise<PushTokenRegistration>;
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

type ReminderRpcClient = MeridianSupabaseClient & {
  rpc: (
    fn: "schedule_due_milestone_reminders",
    args: Database["public"]["Functions"]["schedule_due_milestone_reminders"]["Args"],
  ) => Promise<{ data: number | null; error: PostgrestError | null }>;
};

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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
    await this.ensureReminderSchedule();

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
      message: "Push reminders are connected to this device.",
    };
  }

  private async ensureReminderSchedule() {
    const { error } = await (this.client as ReminderRpcClient).rpc("schedule_due_milestone_reminders", {});

    if (error) {
      throw new Error(error.message);
    }
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
}

export function computeReminderSendAt(dueDate: string | null, offsetDays: number) {
  if (!dueDate || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return null;
  }

  const date = new Date(`${dueDate}T09:00:00.000Z`);

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
  return `Payment reminder: AED ${input.amountLabel} for ${input.milestoneLabel} on ${input.dealLabel} is due ${input.dueDateLabel}.`;
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
    return "TBD";
  }

  const [, monthValue, dayValue] = dateValue.split("-");
  const month = Number(monthValue);
  const day = Number(dayValue);

  if (!monthLabels[month - 1] || !day) {
    return dateValue;
  }

  return `${day} ${monthLabels[month - 1]}`;
}

function formatSendAtLabel(sendAt: string) {
  const date = new Date(sendAt);

  if (Number.isNaN(date.getTime())) {
    return "Queued";
  }

  const now = Date.now();
  const diffMs = date.getTime() - now;
  const diffDays = Math.ceil(diffMs / 86_400_000);

  if (diffMs <= 0) {
    return "Ready now";
  }

  if (diffDays <= 1) {
    return "Tomorrow";
  }

  const matchingOffset = reminderOffsets.find((offset) => diffDays === offset);

  if (matchingOffset) {
    return `${matchingOffset} days before`;
  }

  return `${diffDays} days`;
}
