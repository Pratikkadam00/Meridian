import { Decimal } from "decimal.js";
import { z } from "zod";
import type { PostgrestError } from "@supabase/supabase-js";

import type { Database, MilestoneSource, MilestoneStatus, MilestoneTrigger, ProfileRow } from "../database.types";
import type { MeridianSupabaseClient } from "../supabaseClient";
import { deriveMilestoneStatus } from "@/shared/lib/date/milestoneStatus";

export type DashboardDeal = {
  id: string;
  developer: string;
  locationLabel: string;
  projectName: string;
  buyerName: string;
  totalValueAed: string;
  nextMilestoneLabel: string;
  nextMilestoneDate: string;
  dueAmountAed: string;
  dueInLabel: string;
  paidPercent: number;
  status: "due" | "ok" | "over";
};

export type DealPaymentMilestone = {
  id: string;
  sequence: number;
  label: string;
  triggerType: MilestoneTrigger;
  triggerLabel: string;
  percent: string;
  amountAed: string;
  dueDateLabel: string;
  paidDateLabel: string | null;
  status: MilestoneStatus;
};

export type DealDetail = DashboardDeal & {
  unit: string;
  handoverLabel: string;
  paidToDateAed: string;
  milestones: DealPaymentMilestone[];
};

export type NewDealMilestoneInput = {
  label: string;
  triggerType: MilestoneTrigger;
  triggerValue: string | null;
  percent: string;
  amountAed: string;
  dueDate: string | null;
  status: MilestoneStatus;
  source: MilestoneSource;
};

export type NewDealDocumentInput = {
  originalName: string;
  storagePath: string;
};

export type CreateDealInput = {
  id?: string;
  projectName: string;
  unit: string;
  developerName: string;
  buyerName: string;
  buyerEmail: string | null;
  totalValueAed: string;
  spaNumber: string | null;
  handoverEstimate: string | null;
  milestones: NewDealMilestoneInput[];
  spaDocument: NewDealDocumentInput | null;
};

export type SpaExtractionInput = {
  fileUri: string;
  fileName: string;
  mimeType: string;
};

export type SpaExtractionResult = {
  dealId: string;
  storagePath: string;
  milestones: NewDealMilestoneInput[];
};

// Re-validate the edge function's response on the client too: it is a separate
// trust boundary (the function could be redeployed/proxied), and BUILD §3
// requires Zod at every boundary incl. AI output.
const extractedMilestoneSchema = z.object({
  label: z.string().min(1),
  triggerType: z.enum(["booking", "registration", "construction", "handover"]),
  triggerValue: z.string().nullable(),
  percent: z
    .string()
    .regex(/^\d+(\.\d+)?$/)
    .refine((value) => Number(value) > 0 && Number(value) <= 100, "percent must be 0-100"),
  amountAed: z.string().regex(/^\d+(\.\d+)?$/),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  status: z.enum(["due", "upcoming", "overdue", "paid"]),
  source: z.literal("spa_extracted"),
});

const spaExtractionResponseSchema = z.object({
  milestones: z.array(extractedMilestoneSchema).min(1),
});

export type DealsRepository = {
  listDashboardDeals: () => Promise<DashboardDeal[]>;
  getDealDetail: (dealId: string) => Promise<DealDetail>;
  createDeal: (input: CreateDealInput) => Promise<DealDetail>;
  extractSpaMilestones: (input: SpaExtractionInput) => Promise<SpaExtractionResult>;
  markMilestonePaid: (dealId: string, milestoneId: string) => Promise<DealDetail>;
};

type SupabaseMilestoneRow = {
  id: string;
  seq: number;
  label: string;
  trigger_type: MilestoneTrigger;
  trigger_value: string | null;
  percent: string;
  amount_aed: string;
  due_date: string | null;
  paid_date: string | null;
  status: MilestoneStatus;
};

type SupabaseDeveloperRelation = { name: string } | { name: string }[] | null;

export type SupabaseDealDetailRow = {
  id: string;
  project_name: string;
  unit: string;
  buyer_name: string;
  total_value_aed: string;
  handover_estimate: string | null;
  developers: SupabaseDeveloperRelation;
  milestones: SupabaseMilestoneRow[] | null;
};

type MilestoneUpdateQuery = PromiseLike<{ error: PostgrestError | null }> & {
  eq: (column: "deal_id" | "id", value: string) => MilestoneUpdateQuery;
};

type MilestoneUpdateBuilder = {
  update: (values: Database["public"]["Tables"]["milestones"]["Update"]) => MilestoneUpdateQuery;
};

type ReminderUpdateQuery = PromiseLike<{ error: PostgrestError | null }> & {
  eq: (column: "milestone_id" | "status", value: string) => ReminderUpdateQuery;
};

type ReminderUpdateBuilder = {
  update: (values: Database["public"]["Tables"]["reminders"]["Update"]) => ReminderUpdateQuery;
};

type QueryResult<T> = Promise<{ data: T; error: PostgrestError | null }>;

type InsertSelectBuilder<Insert, Row> = {
  insert: (values: Insert) => {
    select: (columns: string) => {
      single: () => QueryResult<Row>;
    };
  };
};

type InsertOnlyBuilder<Insert> = {
  insert: (values: Insert | Insert[]) => Promise<{ error: PostgrestError | null }>;
};

type MilestoneInsertWithId = Database["public"]["Tables"]["milestones"]["Insert"] & {
  id: string;
  due_date: string | null;
};

type ProfileSelectBuilder = {
  select: (columns: string) => {
    eq: (column: "id", value: string) => {
      single: () => QueryResult<ProfileRow>;
    };
  };
};

type DeveloperSelectBuilder = {
  select: (columns: string) => {
    ilike: (column: "name", value: string) => {
      maybeSingle: () => Promise<{ data: { id: string } | null; error: PostgrestError | null }>;
    };
  };
};

type StorageUploadResponse = {
  error: { message: string } | null;
};

type FunctionInvokeResponse<T> = {
  data: T | null;
  error: { message: string } | null;
};

type ReminderSchedulerRpcClient = MeridianSupabaseClient & {
  rpc: (
    fn: "schedule_milestone_reminders",
    args: Database["public"]["Functions"]["schedule_milestone_reminders"]["Args"],
  ) => Promise<{ data: Database["public"]["Tables"]["reminders"]["Row"][] | null; error: PostgrestError | null }>;
};

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const previewExtractedMilestones: NewDealMilestoneInput[] = [
  {
    label: "Down payment",
    triggerType: "booking",
    triggerValue: "Booking",
    percent: "20",
    amountAed: "640000",
    dueDate: "2026-01-12",
    status: "upcoming",
    source: "spa_extracted",
  },
  {
    label: "Oqood registration",
    triggerType: "registration",
    triggerValue: "DLD",
    percent: "4",
    amountAed: "128000",
    dueDate: "2026-01-18",
    status: "upcoming",
    source: "spa_extracted",
  },
  {
    label: "Construction milestone",
    triggerType: "construction",
    triggerValue: "40% built",
    percent: "10",
    amountAed: "320000",
    dueDate: "2026-06-19",
    status: "due",
    source: "spa_extracted",
  },
  {
    label: "Final payment",
    triggerType: "handover",
    triggerValue: "Handover",
    percent: "40",
    amountAed: "1280000",
    dueDate: "2026-12-01",
    status: "upcoming",
    source: "spa_extracted",
  },
];

const previewDealDetails: DealDetail[] = [
  {
    id: "preview-marina-vista",
    developer: "Emaar",
    locationLabel: "Beachfront",
    projectName: "Marina Vista - 2BR",
    unit: "2BR",
    buyerName: "Omar Al-Farsi",
    totalValueAed: "3200000",
    nextMilestoneLabel: "40% construction",
    nextMilestoneDate: "19 Jun",
    dueAmountAed: "320000",
    dueInLabel: "Due in 5 days",
    paidPercent: 34,
    status: "due",
    handoverLabel: "Q4 2026",
    paidToDateAed: "1088000",
    milestones: [
      {
        id: "preview-marina-booking",
        sequence: 1,
        label: "Down payment",
        triggerType: "booking",
        triggerLabel: "Booking",
        percent: "20",
        amountAed: "640000",
        dueDateLabel: "12 Jan",
        paidDateLabel: "12 Jan",
        status: "paid",
      },
      {
        id: "preview-marina-dld",
        sequence: 2,
        label: "Oqood registration",
        triggerType: "registration",
        triggerLabel: "DLD",
        percent: "4",
        amountAed: "128000",
        dueDateLabel: "18 Jan",
        paidDateLabel: "18 Jan",
        status: "paid",
      },
      {
        id: "preview-marina-40-built",
        sequence: 3,
        label: "Construction milestone",
        triggerType: "construction",
        triggerLabel: "40% built",
        percent: "10",
        amountAed: "320000",
        dueDateLabel: "19 Jun",
        paidDateLabel: null,
        status: "due",
      },
      {
        id: "preview-marina-60-built",
        sequence: 4,
        label: "Construction milestone",
        triggerType: "construction",
        triggerLabel: "60% built",
        percent: "10",
        amountAed: "320000",
        dueDateLabel: "Sep",
        paidDateLabel: null,
        status: "upcoming",
      },
      {
        id: "preview-marina-handover",
        sequence: 5,
        label: "Final payment",
        triggerType: "handover",
        triggerLabel: "Handover",
        percent: "40",
        amountAed: "1280000",
        dueDateLabel: "Q4 2026",
        paidDateLabel: null,
        status: "upcoming",
      },
    ],
  },
  {
    id: "preview-sobha-one",
    developer: "Sobha",
    locationLabel: "Hartland",
    projectName: "Sobha One - 1BR",
    unit: "1BR",
    buyerName: "Maya Haddad",
    totalValueAed: "1850000",
    nextMilestoneLabel: "60% construction",
    nextMilestoneDate: "Sep",
    dueAmountAed: "0",
    dueInLabel: "On track",
    paidPercent: 42,
    status: "ok",
    handoverLabel: "Q2 2027",
    paidToDateAed: "777000",
    milestones: [
      {
        id: "preview-sobha-booking",
        sequence: 1,
        label: "Down payment",
        triggerType: "booking",
        triggerLabel: "Booking",
        percent: "20",
        amountAed: "370000",
        dueDateLabel: "04 Feb",
        paidDateLabel: "04 Feb",
        status: "paid",
      },
      {
        id: "preview-sobha-dld",
        sequence: 2,
        label: "Oqood registration",
        triggerType: "registration",
        triggerLabel: "DLD",
        percent: "4",
        amountAed: "74000",
        dueDateLabel: "08 Feb",
        paidDateLabel: "08 Feb",
        status: "paid",
      },
      {
        id: "preview-sobha-60-built",
        sequence: 3,
        label: "Construction milestone",
        triggerType: "construction",
        triggerLabel: "60% built",
        percent: "18",
        amountAed: "333000",
        dueDateLabel: "Sep",
        paidDateLabel: "Paid",
        status: "paid",
      },
      {
        id: "preview-sobha-80-built",
        sequence: 4,
        label: "Construction milestone",
        triggerType: "construction",
        triggerLabel: "80% built",
        percent: "18",
        amountAed: "333000",
        dueDateLabel: "Dec",
        paidDateLabel: null,
        status: "upcoming",
      },
      {
        id: "preview-sobha-handover",
        sequence: 5,
        label: "Final payment",
        triggerType: "handover",
        triggerLabel: "Handover",
        percent: "40",
        amountAed: "740000",
        dueDateLabel: "Q2 2027",
        paidDateLabel: null,
        status: "upcoming",
      },
    ],
  },
  {
    id: "preview-canal-heights",
    developer: "Damac",
    locationLabel: "Business Bay",
    projectName: "Canal Heights - Studio",
    unit: "Studio",
    buyerName: "Rami Nassar",
    totalValueAed: "1260000",
    nextMilestoneLabel: "DLD/Oqood",
    nextMilestoneDate: "24 Jun",
    dueAmountAed: "50400",
    dueInLabel: "Upcoming",
    paidPercent: 20,
    status: "ok",
    handoverLabel: "Q1 2027",
    paidToDateAed: "252000",
    milestones: [
      {
        id: "preview-canal-booking",
        sequence: 1,
        label: "Down payment",
        triggerType: "booking",
        triggerLabel: "Booking",
        percent: "20",
        amountAed: "252000",
        dueDateLabel: "02 Jun",
        paidDateLabel: "02 Jun",
        status: "paid",
      },
      {
        id: "preview-canal-dld",
        sequence: 2,
        label: "Oqood registration",
        triggerType: "registration",
        triggerLabel: "DLD",
        percent: "4",
        amountAed: "50400",
        dueDateLabel: "24 Jun",
        paidDateLabel: null,
        status: "upcoming",
      },
      {
        id: "preview-canal-50-built",
        sequence: 3,
        label: "Construction milestone",
        triggerType: "construction",
        triggerLabel: "50% built",
        percent: "36",
        amountAed: "453600",
        dueDateLabel: "Oct",
        paidDateLabel: null,
        status: "upcoming",
      },
      {
        id: "preview-canal-handover",
        sequence: 4,
        label: "Final payment",
        triggerType: "handover",
        triggerLabel: "Handover",
        percent: "40",
        amountAed: "504000",
        dueDateLabel: "Q1 2027",
        paidDateLabel: null,
        status: "upcoming",
      },
    ],
  },
  {
    id: "preview-binghatti-hills",
    developer: "Binghatti",
    locationLabel: "Dubai Science Park",
    projectName: "Binghatti Hills - 2BR",
    unit: "2BR",
    buyerName: "Sara Malik",
    totalValueAed: "2410000",
    nextMilestoneLabel: "Handover",
    nextMilestoneDate: "Q4 2026",
    dueAmountAed: "964000",
    dueInLabel: "Overdue",
    paidPercent: 58,
    status: "over",
    handoverLabel: "Q4 2026",
    paidToDateAed: "1397800",
    milestones: [
      {
        id: "preview-binghatti-booking",
        sequence: 1,
        label: "Down payment",
        triggerType: "booking",
        triggerLabel: "Booking",
        percent: "20",
        amountAed: "482000",
        dueDateLabel: "10 Mar",
        paidDateLabel: "10 Mar",
        status: "paid",
      },
      {
        id: "preview-binghatti-dld",
        sequence: 2,
        label: "Oqood registration",
        triggerType: "registration",
        triggerLabel: "DLD",
        percent: "4",
        amountAed: "96400",
        dueDateLabel: "17 Mar",
        paidDateLabel: "17 Mar",
        status: "paid",
      },
      {
        id: "preview-binghatti-structure",
        sequence: 3,
        label: "Construction milestone",
        triggerType: "construction",
        triggerLabel: "Structure",
        percent: "34",
        amountAed: "819400",
        dueDateLabel: "03 May",
        paidDateLabel: "03 May",
        status: "paid",
      },
      {
        id: "preview-binghatti-handover",
        sequence: 4,
        label: "Final payment",
        triggerType: "handover",
        triggerLabel: "Handover",
        percent: "40",
        amountAed: "964000",
        dueDateLabel: "Q4 2026",
        paidDateLabel: null,
        status: "overdue",
      },
    ],
  },
];

export class SupabaseDealsRepository implements DealsRepository {
  constructor(private readonly client: MeridianSupabaseClient) {}

  async listDashboardDeals(): Promise<DashboardDeal[]> {
    const { data, error } = await this.client
      .from("deals")
      .select("id, project_name, unit, buyer_name, total_value_aed, handover_estimate, developers(name), milestones(id, seq, label, trigger_type, trigger_value, percent, amount_aed, due_date, paid_date, status)")
      .order("updated_at", { ascending: false })
      .limit(10);

    if (error) {
      throw new Error(error.message);
    }

    const rows = (data ?? []) as unknown as SupabaseDealDetailRow[];

    return rows.map((row) => {
      const detail = mapSupabaseDetail(row);

      return toDashboardDeal(detail);
    });
  }

  async getDealDetail(dealId: string): Promise<DealDetail> {
    const { data, error } = await this.client
      .from("deals")
      .select("id, project_name, unit, buyer_name, total_value_aed, handover_estimate, developers(name), milestones(id, seq, label, trigger_type, trigger_value, percent, amount_aed, due_date, paid_date, status)")
      .eq("id", dealId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapSupabaseDetail(data as unknown as SupabaseDealDetailRow);
  }

  async createDeal(input: CreateDealInput): Promise<DealDetail> {
    const profile = await this.getCurrentProfile();
    const dealId = input.id ?? createUuid();
    const developerId = await this.findOrCreateDeveloper(profile.org_id, input.developerName);
    const deals = this.client.from("deals") as unknown as InsertSelectBuilder<Database["public"]["Tables"]["deals"]["Insert"], { id: string }>;

    const { data: dealRow, error: dealError } = await deals
      .insert({
        id: dealId,
        org_id: profile.org_id,
        created_by: profile.id,
        developer_id: developerId,
        project_name: input.projectName,
        unit: input.unit,
        buyer_name: input.buyerName,
        buyer_email: input.buyerEmail,
        total_value_aed: input.totalValueAed,
        spa_number: input.spaNumber,
        handover_estimate: input.handoverEstimate,
      })
      .select("id")
      .single();

    if (dealError) {
      throw new Error(dealError.message);
    }

    const milestoneRows: MilestoneInsertWithId[] = input.milestones.map((milestone, index) => ({
      id: createUuid(),
      org_id: profile.org_id,
      deal_id: dealRow.id,
      seq: index + 1,
      label: milestone.label,
      trigger_type: milestone.triggerType,
      trigger_value: milestone.triggerValue,
      percent: milestone.percent,
      amount_aed: milestone.amountAed,
      due_date: milestone.dueDate,
      status: milestone.status,
      source: milestone.source,
    }));
    const milestones = this.client.from("milestones") as unknown as InsertOnlyBuilder<Database["public"]["Tables"]["milestones"]["Insert"]>;

    const { error: milestoneError } = await milestones.insert(milestoneRows);

    if (milestoneError) {
      throw new Error(milestoneError.message);
    }

    await this.scheduleMilestoneReminders(milestoneRows);

    if (input.spaDocument) {
      const documents = this.client.from("documents") as unknown as InsertOnlyBuilder<Database["public"]["Tables"]["documents"]["Insert"]>;
      const { error: documentError } = await documents.insert({
        org_id: profile.org_id,
        deal_id: dealRow.id,
        name: input.spaDocument.originalName,
        storage_path: input.spaDocument.storagePath,
        kind: "spa",
      });

      if (documentError) {
        throw new Error(documentError.message);
      }
    }

    return this.getDealDetail(dealRow.id);
  }

  async extractSpaMilestones(input: SpaExtractionInput): Promise<SpaExtractionResult> {
    const profile = await this.getCurrentProfile();
    const dealId = createUuid();
    const storagePath = `${profile.org_id}/${dealId}/spa-${createUuid()}.pdf`;
    const fileResponse = await fetch(input.fileUri);
    const fileBlob = await fileResponse.blob();
    const { error: uploadError } = (await this.client.storage.from("deal-documents").upload(storagePath, fileBlob, {
      contentType: input.mimeType || "application/pdf",
      upsert: false,
    })) as StorageUploadResponse;

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data, error } = (await this.client.functions.invoke("extract-spa-milestones", {
      body: {
        dealId,
        storagePath,
      },
    })) as FunctionInvokeResponse<{ milestones: NewDealMilestoneInput[] }>;

    if (error) {
      throw new Error(error.message);
    }

    const parsed = spaExtractionResponseSchema.safeParse(data);

    if (!parsed.success) {
      throw new Error("The AI returned an invalid payment plan. Enter the milestones manually.");
    }

    return {
      dealId,
      storagePath,
      milestones: parsed.data.milestones,
    };
  }

  async markMilestonePaid(dealId: string, milestoneId: string): Promise<DealDetail> {
    const paidDate = new Date().toISOString().slice(0, 10);
    const milestones = this.client.from("milestones") as unknown as MilestoneUpdateBuilder;
    const { error } = await milestones
      .update({
        paid_date: paidDate,
        status: "paid",
      })
      .eq("deal_id", dealId)
      .eq("id", milestoneId);

    if (error) {
      throw new Error(error.message);
    }

    await this.cancelPendingReminderRows(milestoneId);

    return this.getDealDetail(dealId);
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
      throw new Error("Sign in before creating a deal.");
    }

    const profiles = this.client.from("profiles") as unknown as ProfileSelectBuilder;
    const { data, error } = await profiles.select("*").eq("id", user.id).single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  private async findOrCreateDeveloper(orgId: string, developerNameValue: string): Promise<string | null> {
    const developerName = developerNameValue.trim();

    if (!developerName) {
      return null;
    }

    const developerSelect = this.client.from("developers") as unknown as DeveloperSelectBuilder;
    const { data: existingDeveloper, error: existingError } = await developerSelect.select("id").ilike("name", developerName).maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (existingDeveloper?.id) {
      return existingDeveloper.id;
    }

    const developerInsert = this.client.from("developers") as unknown as InsertSelectBuilder<Database["public"]["Tables"]["developers"]["Insert"], { id: string }>;
    const { data: createdDeveloper, error: createError } = await developerInsert
      .insert({
        org_id: orgId,
        name: developerName,
      })
      .select("id")
      .single();

    if (createError) {
      throw new Error(createError.message);
    }

    return createdDeveloper.id;
  }

  private async scheduleMilestoneReminders(milestones: MilestoneInsertWithId[]) {
    const reminderClient = this.client as ReminderSchedulerRpcClient;

    for (const milestone of milestones) {
      if (!milestone.due_date || milestone.status === "paid") {
        continue;
      }

      const { error } = await reminderClient.rpc("schedule_milestone_reminders", {
        p_milestone_id: milestone.id,
      });

      if (error) {
        throw new Error(error.message);
      }
    }
  }

  private async cancelPendingReminderRows(milestoneId: string) {
    const reminders = this.client.from("reminders") as unknown as ReminderUpdateBuilder;
    const { error } = await reminders
      .update({
        status: "cancelled",
      })
      .eq("milestone_id", milestoneId)
      .eq("status", "pending");

    if (error) {
      throw new Error(error.message);
    }
  }
}

export class PreviewDealsRepository implements DealsRepository {
  private dealDetails = previewDealDetails.map(cloneDealDetail);

  async listDashboardDeals(): Promise<DashboardDeal[]> {
    return this.dealDetails.map(toDashboardDeal);
  }

  async getDealDetail(dealId: string): Promise<DealDetail> {
    const deal = this.dealDetails.find((candidate) => candidate.id === dealId);

    if (!deal) {
      throw new Error("Deal not found.");
    }

    return cloneDealDetail(deal);
  }

  async createDeal(input: CreateDealInput): Promise<DealDetail> {
    const deal = createDealDetailFromInput(input, input.id ?? createUuid());
    this.dealDetails = [deal, ...this.dealDetails];

    return cloneDealDetail(deal);
  }

  async extractSpaMilestones(): Promise<SpaExtractionResult> {
    const dealId = createUuid();

    return {
      dealId,
      storagePath: `preview-org/${dealId}/spa-${createUuid()}.pdf`,
      milestones: previewExtractedMilestones.map((milestone) => ({ ...milestone })),
    };
  }

  async markMilestonePaid(dealId: string, milestoneId: string): Promise<DealDetail> {
    const deal = this.dealDetails.find((candidate) => candidate.id === dealId);

    if (!deal) {
      throw new Error("Deal not found.");
    }

    const updatedDeal = markMilestonePaidInDetail(deal, milestoneId, "Today");
    this.dealDetails = this.dealDetails.map((candidate) => (candidate.id === dealId ? updatedDeal : candidate));

    return cloneDealDetail(updatedDeal);
  }
}

export function markMilestonePaidInDetail(deal: DealDetail, milestoneId: string, paidDateLabel: string): DealDetail {
  const milestones = deal.milestones.map((milestone) =>
    milestone.id === milestoneId
      ? {
          ...milestone,
          paidDateLabel,
          status: "paid" as const,
        }
      : milestone,
  );

  return withMilestoneRollup({
    ...deal,
    milestones,
  });
}

export function createUuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === "x" ? random : (random & 0x3) | 0x8;

    return value.toString(16);
  });
}

export function mapSupabaseDetail(row: SupabaseDealDetailRow): DealDetail {
  const milestones = (row.milestones ?? [])
    .map((milestone) => {
      const isPaid = milestone.status === "paid" || Boolean(milestone.paid_date);

      return {
        id: milestone.id,
        sequence: milestone.seq,
        label: milestone.label,
        triggerType: milestone.trigger_type,
        triggerLabel: milestone.trigger_value ?? triggerLabelForType(milestone.trigger_type),
        percent: formatPercent(milestone.percent),
        amountAed: milestone.amount_aed,
        dueDateLabel: formatDateLabel(milestone.due_date),
        paidDateLabel: milestone.paid_date ? formatDateLabel(milestone.paid_date) : null,
        // Re-derive against today so a passed due date never keeps showing as
        // "upcoming" — the stored column can be stale until the nightly recompute.
        status: deriveMilestoneStatus(milestone.due_date, isPaid),
      };
    })
    .sort((left, right) => left.sequence - right.sequence);

  return withMilestoneRollup({
    id: row.id,
    developer: developerName(row.developers),
    locationLabel: "Off-plan",
    projectName: `${row.project_name} - ${row.unit}`,
    unit: row.unit,
    buyerName: row.buyer_name,
    totalValueAed: row.total_value_aed,
    nextMilestoneLabel: "Payment plan",
    nextMilestoneDate: "TBD",
    dueAmountAed: "0",
    dueInLabel: "Add milestones",
    paidPercent: 0,
    status: "ok",
    handoverLabel: formatDateLabel(row.handover_estimate),
    paidToDateAed: "0",
    milestones,
  });
}

export function withMilestoneRollup(deal: DealDetail): DealDetail {
  const paidToDate = sumMilestones(deal.milestones, (milestone) => milestone.status === "paid");
  const dueAmount = sumMilestones(deal.milestones, (milestone) => milestone.status === "due" || milestone.status === "overdue");
  const nextMilestone = deal.milestones.find((milestone) => milestone.status === "due" || milestone.status === "overdue" || milestone.status === "upcoming");
  const nextStatus = nextMilestone?.status;

  return {
    ...deal,
    nextMilestoneLabel: nextMilestone?.triggerLabel ?? "Payment plan",
    nextMilestoneDate: nextMilestone?.dueDateLabel ?? "Complete",
    dueAmountAed: dueAmount.toFixed(0),
    dueInLabel: formatDueLabel(nextStatus, nextMilestone?.dueDateLabel),
    paidPercent: paidPercent(deal.totalValueAed, paidToDate),
    paidToDateAed: paidToDate.toFixed(0),
    status: nextStatus === "overdue" ? "over" : nextStatus === "due" ? "due" : "ok",
  };
}

function toDashboardDeal(detail: DealDetail): DashboardDeal {
  return {
    id: detail.id,
    developer: detail.developer,
    locationLabel: detail.locationLabel,
    projectName: detail.projectName,
    buyerName: detail.buyerName,
    totalValueAed: detail.totalValueAed,
    nextMilestoneLabel: detail.nextMilestoneLabel,
    nextMilestoneDate: detail.nextMilestoneDate,
    dueAmountAed: detail.dueAmountAed,
    dueInLabel: detail.dueInLabel,
    paidPercent: detail.paidPercent,
    status: detail.status,
  };
}

function cloneDealDetail(deal: DealDetail): DealDetail {
  return {
    ...deal,
    milestones: deal.milestones.map((milestone) => ({ ...milestone })),
  };
}

function createDealDetailFromInput(input: CreateDealInput, dealId: string): DealDetail {
  return withMilestoneRollup({
    id: dealId,
    developer: input.developerName,
    locationLabel: "Off-plan",
    projectName: `${input.projectName} - ${input.unit}`,
    unit: input.unit,
    buyerName: input.buyerName,
    totalValueAed: input.totalValueAed,
    nextMilestoneLabel: "Payment plan",
    nextMilestoneDate: "TBD",
    dueAmountAed: "0",
    dueInLabel: "Add milestones",
    paidPercent: 0,
    status: "ok",
    handoverLabel: formatDateLabel(input.handoverEstimate),
    paidToDateAed: "0",
    milestones: input.milestones.map((milestone, index) => ({
      id: createUuid(),
      sequence: index + 1,
      label: milestone.label,
      triggerType: milestone.triggerType,
      triggerLabel: milestone.triggerValue ?? triggerLabelForType(milestone.triggerType),
      percent: formatPercent(milestone.percent),
      amountAed: milestone.amountAed,
      dueDateLabel: formatDateLabel(milestone.dueDate),
      paidDateLabel: null,
      status: deriveMilestoneStatus(milestone.dueDate, milestone.status === "paid"),
    })),
  });
}

function sumMilestones(milestones: DealPaymentMilestone[], predicate: (milestone: DealPaymentMilestone) => boolean) {
  return milestones.reduce((sum, milestone) => (predicate(milestone) ? sum.plus(milestone.amountAed || "0") : sum), new Decimal(0));
}

export function paidPercent(totalValueAed: string, paidToDate: Decimal) {
  const total = new Decimal(totalValueAed || "0");

  if (total.lessThanOrEqualTo(0)) {
    return 0;
  }

  return paidToDate.dividedBy(total).times(100).toDecimalPlaces(0).toNumber();
}

function developerName(relation: SupabaseDeveloperRelation) {
  if (Array.isArray(relation)) {
    return relation[0]?.name ?? "Developer";
  }

  return relation?.name ?? "Developer";
}

function triggerLabelForType(triggerType: MilestoneTrigger) {
  switch (triggerType) {
    case "booking":
      return "Booking";
    case "registration":
      return "DLD";
    case "construction":
      return "Construction";
    case "handover":
      return "Handover";
  }
}

function formatPercent(value: string) {
  return new Decimal(value || "0").toDecimalPlaces(3).toString();
}

function formatDateLabel(dateValue: string | null) {
  if (!dateValue) {
    return "TBD";
  }

  if (!dateValue.includes("-")) {
    return dateValue;
  }

  const [, monthValue, dayValue] = dateValue.split("-");
  const month = Number(monthValue);
  const day = Number(dayValue);

  if (!monthLabels[month - 1] || !day) {
    return dateValue;
  }

  return `${day} ${monthLabels[month - 1]}`;
}

function formatDueLabel(status: MilestoneStatus | undefined, dueDateLabel: string | undefined) {
  if (status === "overdue") {
    return "Overdue";
  }

  if (status === "due") {
    return dueDateLabel && dueDateLabel !== "TBD" ? `Due ${dueDateLabel}` : "Due soon";
  }

  if (status === "upcoming") {
    return "Upcoming";
  }

  return "Complete";
}
