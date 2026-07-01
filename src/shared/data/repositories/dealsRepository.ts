import { Decimal } from "decimal.js";
import { t } from "i18next";
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

export type CommissionTrancheStatus = "pending" | "invoiced" | "received";

export type CommissionTranche = {
  id: string;
  sequence: number;
  label: string;
  percent: string; // % of total commission
  amountAed: string;
  status: CommissionTrancheStatus;
  expectedDateLabel: string | null;
  receivedDateLabel: string | null;
};

// The broker's OWN commission on a deal: a construction-linked, multi-tranche
// receivable. rate + tranches are broker-entered (developer-specific) — never
// inferred. totals are derived so the UI always reconciles.
export type DealCommission = {
  ratePercent: string | null; // broker's commission rate on the unit price
  totalAed: string;
  receivedAed: string;
  outstandingAed: string;
  tranches: CommissionTranche[];
};

export type CommissionTrancheInput = {
  // Present for a tranche that already exists on the deal (so the backend can
  // preserve its status/received_date instead of resetting it); null for a
  // brand-new tranche added in the editor.
  id: string | null;
  label: string;
  percent: string;
  amountAed: string;
  expectedDate: string | null;
};

// A single unreceived commission tranche across the whole portfolio (for the
// money-risk view).
export type CommissionRiskItem = {
  trancheId: string;
  dealId: string;
  projectName: string;
  label: string;
  amountAed: string;
  status: CommissionTrancheStatus;
  expectedDateLabel: string | null;
};

// Every commission tranche across the portfolio, with raw ISO dates (not just
// display labels) so the reports screen can do real date math — e.g. "days
// since received" for clawback-window exposure.
export type PortfolioCommissionTranche = {
  trancheId: string;
  dealId: string;
  projectName: string;
  label: string;
  amountAed: string;
  status: CommissionTrancheStatus;
  expectedDate: string | null;
  receivedDate: string | null;
};

// Off-plan documents tracked per deal. There is no public DLD/Trakheesi API to
// sync these automatically (confirmed: no such API exists), so this is a
// broker-maintained checklist + upload vault, not a live registry sync.
export type DocumentKind = "spa" | "form_a" | "form_b" | "form_f" | "oqood" | "noc" | "other";

export type DealDocument = {
  id: string;
  kind: DocumentKind;
  name: string;
  storagePath: string;
  uploadedAtLabel: string;
};

export type UploadDealDocumentInput = {
  kind: DocumentKind;
  fileUri: string;
  fileName: string;
  mimeType: string;
};

export type DealDetail = DashboardDeal & {
  unit: string;
  handoverLabel: string;
  paidToDateAed: string;
  milestones: DealPaymentMilestone[];
  commission: DealCommission;
};

export type MilestoneConfidence = "high" | "medium" | "low";

export type NewDealMilestoneInput = {
  label: string;
  triggerType: MilestoneTrigger;
  triggerValue: string | null;
  percent: string;
  amountAed: string;
  dueDate: string | null;
  status: MilestoneStatus;
  source: MilestoneSource;
  // Set only for AI-extracted rows — the model's own self-assessed confidence
  // (see extract-spa-milestones' SYSTEM_PROMPT). Review-time only, never stored.
  confidence?: MilestoneConfidence;
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
  confidence: z.enum(["high", "medium", "low"]),
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
  setDealCommission: (dealId: string, ratePercent: string | null, tranches: CommissionTrancheInput[]) => Promise<DealDetail>;
  markCommissionTranche: (dealId: string, trancheId: string, status: CommissionTrancheStatus) => Promise<DealDetail>;
  listCommissionRisk: () => Promise<CommissionRiskItem[]>;
  listAllCommissionTranches: () => Promise<PortfolioCommissionTranche[]>;
  listDealDocuments: (dealId: string) => Promise<DealDocument[]>;
  uploadDealDocument: (dealId: string, input: UploadDealDocumentInput) => Promise<DealDocument>;
  deleteDealDocument: (dealId: string, documentId: string) => Promise<void>;
  getDocumentSignedUrl: (storagePath: string) => Promise<string>;
  // Client-facing shareable read-only portal (web page, not in-app — buyers
  // don't install the broker's app).
  getShareLink: (dealId: string) => Promise<string>;
  revokeShareLink: (dealId: string) => Promise<void>;
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

type SupabaseCommissionTrancheRow = {
  id: string;
  seq: number;
  label: string;
  percent: string;
  amount_aed: string;
  status: CommissionTrancheStatus;
  expected_date: string | null;
  received_date: string | null;
};

export type SupabaseDealDetailRow = {
  id: string;
  project_name: string;
  unit: string;
  buyer_name: string;
  total_value_aed: string;
  handover_estimate: string | null;
  commission_percent: string | null;
  developers: SupabaseDeveloperRelation;
  milestones: SupabaseMilestoneRow[] | null;
  commission_tranches: SupabaseCommissionTrancheRow[] | null;
};

// The hand-maintained database.types do not give supabase-js enough to infer
// the Update parameter for these tables (it resolves to `never`), so the typed
// update builders are declared explicitly. Regenerating with
// `supabase gen types typescript` would let these be fully inferred.
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

type StorageUploadResponse = {
  error: { message: string } | null;
};

type FunctionInvokeResponse<T> = {
  data: T | null;
  error: { message: string } | null;
};

type CreateDealWithPlanArgs = {
  p_deal_id: string | null;
  p_developer_name: string;
  p_project_name: string;
  p_unit: string;
  p_buyer_name: string;
  p_buyer_email: string | null;
  p_total_value_aed: string;
  p_spa_number: string | null;
  p_handover_estimate: string | null;
  p_milestones: {
    label: string;
    trigger_type: MilestoneTrigger;
    trigger_value: string | null;
    percent: string;
    amount_aed: string;
    due_date: string | null;
    status: MilestoneStatus;
    source: MilestoneSource;
  }[];
  p_document: { name: string; storage_path: string; kind: string } | null;
};

type CreateDealWithPlanRpcClient = {
  rpc: (fn: "create_deal_with_plan", args: CreateDealWithPlanArgs) => Promise<{ data: string | null; error: PostgrestError | null }>;
};

type SetDealCommissionArgs = {
  p_deal_id: string;
  p_commission_percent: string | null;
  p_tranches: { id: string | null; label: string; percent: string; amount_aed: string; expected_date: string | null }[];
};

type SetDealCommissionRpcClient = {
  rpc: (fn: "set_deal_commission", args: SetDealCommissionArgs) => Promise<{ data: string | null; error: PostgrestError | null }>;
};

type CommissionTrancheUpdateQuery = PromiseLike<{ error: PostgrestError | null }> & {
  eq: (column: "id" | "deal_id", value: string) => CommissionTrancheUpdateQuery;
};

type CommissionTrancheUpdateClient = {
  from: (table: "commission_tranches") => {
    update: (values: { status: CommissionTrancheStatus; received_date: string | null }) => CommissionTrancheUpdateQuery;
  };
};

type CommissionRiskJoinRow = {
  id: string;
  label: string;
  amount_aed: string;
  status: CommissionTrancheStatus;
  expected_date: string | null;
  deals: { id: string; project_name: string; unit: string } | { id: string; project_name: string; unit: string }[] | null;
};

type CommissionRiskSelectClient = {
  from: (table: "commission_tranches") => {
    select: (columns: string) => {
      neq: (
        column: "status",
        value: string,
      ) => {
        order: (column: "expected_date", opts: { ascending: boolean; nullsFirst?: boolean }) => {
          limit: (count: number) => PromiseLike<{ data: CommissionRiskJoinRow[] | null; error: PostgrestError | null }>;
        };
      };
    };
  };
};

type PortfolioCommissionJoinRow = CommissionRiskJoinRow & { received_date: string | null };

type PortfolioCommissionSelectClient = {
  from: (table: "commission_tranches") => {
    select: (columns: string) => {
      order: (
        column: "expected_date",
        opts: { ascending: boolean; nullsFirst?: boolean },
      ) => {
        limit: (count: number) => PromiseLike<{ data: PortfolioCommissionJoinRow[] | null; error: PostgrestError | null }>;
      };
    };
  };
};

type DocumentRow = {
  id: string;
  kind: DocumentKind;
  name: string;
  storage_path: string;
  uploaded_at: string;
};

type DocumentSelectClient = {
  from: (table: "documents") => {
    select: (columns: string) => {
      eq: (column: "deal_id", value: string) => {
        order: (column: "uploaded_at", opts: { ascending: boolean }) => PromiseLike<{ data: DocumentRow[] | null; error: PostgrestError | null }>;
      };
    };
  };
};

type DocumentSelectByIdClient = {
  from: (table: "documents") => {
    select: (columns: string) => {
      eq: (column: "id", value: string) => {
        eq: (column: "deal_id", value: string) => {
          single: () => Promise<{ data: { storage_path: string }; error: PostgrestError | null }>;
        };
      };
    };
  };
};

type DocumentInsertClient = {
  from: (table: "documents") => {
    insert: (values: { org_id: string; deal_id: string; name: string; storage_path: string; kind: DocumentKind }) => {
      select: (columns: string) => {
        single: () => Promise<{ data: DocumentRow; error: PostgrestError | null }>;
      };
    };
  };
};

type DocumentDeleteQuery = PromiseLike<{ error: PostgrestError | null }> & {
  eq: (column: "id" | "deal_id", value: string) => DocumentDeleteQuery;
};

type DocumentDeleteClient = {
  from: (table: "documents") => {
    delete: () => DocumentDeleteQuery;
  };
};

type GetShareTokenRpcClient = {
  rpc: (fn: "get_or_create_deal_share_token", args: { p_deal_id: string }) => Promise<{ data: string | null; error: PostgrestError | null }>;
};

type RevokeShareTokenRpcClient = {
  rpc: (fn: "revoke_deal_share_token", args: { p_deal_id: string }) => Promise<{ error: PostgrestError | null }>;
};

const DEFAULT_SITE_URL = "https://meridian.ae";

function buildShareUrl(token: string) {
  const siteUrl = process.env.EXPO_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
  return `${siteUrl.replace(/\/$/, "")}/shared/${token}`;
}

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
    confidence: "high",
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
    confidence: "high",
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
    // Illustrative: construction-linked dates are inherently less certain than
    // fixed-date rows, so the preview demonstrates the confirm gate in action.
    confidence: "low",
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
    confidence: "medium",
  },
];

const previewDealDetails: DealDetail[] = ([
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
] as Omit<DealDetail, "commission">[]).map((deal) => ({
  ...deal,
  commission: deal.id === "preview-marina-vista" ? previewSeededCommission(deal.totalValueAed) : emptyCommission(),
}));

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
      .select(
        "id, project_name, unit, buyer_name, total_value_aed, handover_estimate, commission_percent, developers(name), milestones(id, seq, label, trigger_type, trigger_value, percent, amount_aed, due_date, paid_date, status), commission_tranches(id, seq, label, percent, amount_aed, status, expected_date, received_date)",
      )
      .eq("id", dealId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapSupabaseDetail(data as unknown as SupabaseDealDetailRow);
  }

  async createDeal(input: CreateDealInput): Promise<DealDetail> {
    // One transactional RPC inserts the deal, its milestones, schedules
    // reminders, and records the SPA document — so a partial failure rolls the
    // whole deal back instead of leaving an orphan deal with no plan.
    const rpcClient = this.client as unknown as CreateDealWithPlanRpcClient;
    const { data, error } = await rpcClient.rpc("create_deal_with_plan", {
      p_deal_id: input.id ?? null,
      p_developer_name: input.developerName,
      p_project_name: input.projectName,
      p_unit: input.unit,
      p_buyer_name: input.buyerName,
      p_buyer_email: input.buyerEmail,
      p_total_value_aed: input.totalValueAed,
      p_spa_number: input.spaNumber,
      p_handover_estimate: input.handoverEstimate,
      p_milestones: input.milestones.map((milestone) => ({
        label: milestone.label,
        trigger_type: milestone.triggerType,
        trigger_value: milestone.triggerValue,
        percent: milestone.percent,
        amount_aed: milestone.amountAed,
        due_date: milestone.dueDate,
        status: milestone.status,
        source: milestone.source,
      })),
      p_document: input.spaDocument
        ? { name: input.spaDocument.originalName, storage_path: input.spaDocument.storagePath, kind: "spa" }
        : null,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Deal could not be created.");
    }

    return this.getDealDetail(data);
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
      .update({ paid_date: paidDate, status: "paid" })
      .eq("deal_id", dealId)
      .eq("id", milestoneId);

    if (error) {
      throw new Error(error.message);
    }

    await this.cancelPendingReminderRows(milestoneId);

    return this.getDealDetail(dealId);
  }

  async setDealCommission(dealId: string, ratePercent: string | null, tranches: CommissionTrancheInput[]): Promise<DealDetail> {
    const rpcClient = this.client as unknown as SetDealCommissionRpcClient;
    const { error } = await rpcClient.rpc("set_deal_commission", {
      p_deal_id: dealId,
      p_commission_percent: ratePercent != null && ratePercent !== "" ? ratePercent : null,
      p_tranches: tranches.map((tranche) => ({
        id: tranche.id,
        label: tranche.label,
        percent: tranche.percent,
        amount_aed: tranche.amountAed,
        expected_date: tranche.expectedDate,
      })),
    });

    if (error) {
      throw new Error(error.message);
    }

    return this.getDealDetail(dealId);
  }

  async markCommissionTranche(dealId: string, trancheId: string, status: CommissionTrancheStatus): Promise<DealDetail> {
    const builder = this.client as unknown as CommissionTrancheUpdateClient;
    const values =
      status === "received"
        ? { status, received_date: new Date().toISOString().slice(0, 10) }
        : { status, received_date: null };
    const { error } = await builder.from("commission_tranches").update(values).eq("id", trancheId).eq("deal_id", dealId);

    if (error) {
      throw new Error(error.message);
    }

    return this.getDealDetail(dealId);
  }

  async listCommissionRisk(): Promise<CommissionRiskItem[]> {
    const builder = this.client as unknown as CommissionRiskSelectClient;
    const { data, error } = await builder
      .from("commission_tranches")
      .select("id, label, amount_aed, status, expected_date, deals(id, project_name, unit)")
      .neq("status", "received")
      .order("expected_date", { ascending: true, nullsFirst: false })
      .limit(200);

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row) => {
      const deal = Array.isArray(row.deals) ? row.deals[0] ?? null : row.deals;
      return {
        trancheId: row.id,
        dealId: deal?.id ?? "",
        projectName: deal ? `${deal.project_name} - ${deal.unit}` : "",
        label: row.label,
        amountAed: row.amount_aed,
        status: row.status,
        expectedDateLabel: row.expected_date ? formatDateLabel(row.expected_date) : null,
      };
    });
  }

  async listAllCommissionTranches(): Promise<PortfolioCommissionTranche[]> {
    const builder = this.client as unknown as PortfolioCommissionSelectClient;
    const { data, error } = await builder
      .from("commission_tranches")
      .select("id, label, amount_aed, status, expected_date, received_date, deals(id, project_name, unit)")
      .order("expected_date", { ascending: true, nullsFirst: false })
      .limit(500);

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row) => {
      const deal = Array.isArray(row.deals) ? row.deals[0] ?? null : row.deals;
      return {
        trancheId: row.id,
        dealId: deal?.id ?? "",
        projectName: deal ? `${deal.project_name} - ${deal.unit}` : "",
        label: row.label,
        amountAed: row.amount_aed,
        status: row.status,
        expectedDate: row.expected_date,
        receivedDate: row.received_date,
      };
    });
  }

  async listDealDocuments(dealId: string): Promise<DealDocument[]> {
    const builder = this.client as unknown as DocumentSelectClient;
    const { data, error } = await builder
      .from("documents")
      .select("id, kind, name, storage_path, uploaded_at")
      .eq("deal_id", dealId)
      .order("uploaded_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      kind: row.kind,
      name: row.name,
      storagePath: row.storage_path,
      uploadedAtLabel: formatDateLabel(row.uploaded_at.slice(0, 10)),
    }));
  }

  async uploadDealDocument(dealId: string, input: UploadDealDocumentInput): Promise<DealDocument> {
    const profile = await this.getCurrentProfile();
    const extension = input.fileName.includes(".") ? input.fileName.split(".").pop() : "pdf";
    const storagePath = `${profile.org_id}/${dealId}/${input.kind}-${createUuid()}.${extension}`;
    // Matches documents_name_len (<= 200 chars) so a long picker filename
    // fails visibly here rather than as an opaque insert error below.
    const documentName = input.fileName.trim().slice(0, 200) || t("documents.untitled");

    const fileResponse = await fetch(input.fileUri);
    const fileBlob = await fileResponse.blob();
    const { error: uploadError } = (await this.client.storage.from("deal-documents").upload(storagePath, fileBlob, {
      contentType: input.mimeType || "application/octet-stream",
      upsert: false,
    })) as StorageUploadResponse;

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const builder = this.client as unknown as DocumentInsertClient;
    const { data, error } = await builder
      .from("documents")
      .insert({
        org_id: profile.org_id,
        deal_id: dealId,
        name: documentName,
        storage_path: storagePath,
        kind: input.kind,
      })
      .select("id, kind, name, storage_path, uploaded_at")
      .single();

    if (error) {
      // The blob already landed in storage; the row didn't. Clean it up so a
      // failed insert doesn't leak an orphaned object nothing can reach or
      // delete through the app.
      await this.client.storage
        .from("deal-documents")
        .remove([storagePath])
        .catch(() => undefined);
      throw new Error(error.message);
    }

    return {
      id: data.id,
      kind: data.kind,
      name: data.name,
      storagePath: data.storage_path,
      uploadedAtLabel: formatDateLabel(data.uploaded_at.slice(0, 10)),
    };
  }

  async deleteDealDocument(dealId: string, documentId: string): Promise<void> {
    const selectBuilder = this.client as unknown as DocumentSelectByIdClient;
    const { data: existing, error: selectError } = await selectBuilder
      .from("documents")
      .select("storage_path")
      .eq("id", documentId)
      .eq("deal_id", dealId)
      .single();

    if (selectError) {
      throw new Error(selectError.message);
    }

    const { error: storageError } = await this.client.storage.from("deal-documents").remove([existing.storage_path]);

    if (storageError) {
      throw new Error(storageError.message);
    }

    const deleteBuilder = this.client as unknown as DocumentDeleteClient;
    const { error: deleteError } = await deleteBuilder.from("documents").delete().eq("id", documentId).eq("deal_id", dealId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }
  }

  async getDocumentSignedUrl(storagePath: string): Promise<string> {
    const { data, error } = await this.client.storage.from("deal-documents").createSignedUrl(storagePath, 60);

    if (error || !data?.signedUrl) {
      throw new Error(error?.message ?? "Could not open this document.");
    }

    return data.signedUrl;
  }

  async getShareLink(dealId: string): Promise<string> {
    const rpcClient = this.client as unknown as GetShareTokenRpcClient;
    const { data, error } = await rpcClient.rpc("get_or_create_deal_share_token", { p_deal_id: dealId });

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Could not create a share link.");
    }

    return buildShareUrl(data);
  }

  async revokeShareLink(dealId: string): Promise<void> {
    const rpcClient = this.client as unknown as RevokeShareTokenRpcClient;
    const { error } = await rpcClient.rpc("revoke_deal_share_token", { p_deal_id: dealId });

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
      throw new Error("Sign in before creating a deal.");
    }

    const { data, error } = await this.client.from("profiles").select("*").eq("id", user.id).single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  private async cancelPendingReminderRows(milestoneId: string) {
    const reminders = this.client.from("reminders") as unknown as ReminderUpdateBuilder;
    const { error } = await reminders
      .update({ status: "cancelled" })
      .eq("milestone_id", milestoneId)
      .eq("status", "pending");

    if (error) {
      throw new Error(error.message);
    }
  }
}

export class PreviewDealsRepository implements DealsRepository {
  private dealDetails = previewDealDetails.map(cloneDealDetail);
  private documentsByDeal = new Map<string, DealDocument[]>([
    [
      "preview-marina-vista",
      [
        { id: "preview-doc-spa", kind: "spa", name: "Marina-Vista-SPA.pdf", storagePath: "preview-org/preview-marina-vista/spa-preview.pdf", uploadedAtLabel: "12 Jan" },
        { id: "preview-doc-oqood", kind: "oqood", name: "Oqood-Certificate.pdf", storagePath: "preview-org/preview-marina-vista/oqood-preview.pdf", uploadedAtLabel: "18 Jan" },
      ],
    ],
  ]);

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

    const updatedDeal = markMilestonePaidInDetail(deal, milestoneId, t("deal.today"));
    this.dealDetails = this.dealDetails.map((candidate) => (candidate.id === dealId ? updatedDeal : candidate));

    return cloneDealDetail(updatedDeal);
  }

  async setDealCommission(dealId: string, ratePercent: string | null, tranches: CommissionTrancheInput[]): Promise<DealDetail> {
    const deal = this.dealDetails.find((candidate) => candidate.id === dealId);

    if (!deal) {
      throw new Error("Deal not found.");
    }

    // Mirror the real RPC: a tranche whose id matches an existing row keeps
    // its status/received_date (schedule edits never touch already-received
    // money); an id-less tranche is new and starts pending.
    const existingById = new Map(deal.commission.tranches.map((tranche) => [tranche.id, tranche]));

    const hasRate = ratePercent != null && ratePercent !== "";
    const total = hasRate
      ? new Decimal(deal.totalValueAed || "0").times(new Decimal(ratePercent as string).dividedBy(100))
      : tranches.reduce((sum, tranche) => sum.plus(tranche.amountAed || "0"), new Decimal(0));

    const nextTranches: CommissionTranche[] = tranches.map((tranche, index) => {
      const existing = tranche.id ? existingById.get(tranche.id) : undefined;
      return {
        id: existing?.id ?? `${dealId}-comm-${createUuid()}`,
        sequence: index + 1,
        label: tranche.label,
        percent: formatPercent(tranche.percent),
        amountAed: tranche.amountAed,
        status: existing?.status ?? "pending",
        expectedDateLabel: tranche.expectedDate ?? null,
        receivedDateLabel: existing?.receivedDateLabel ?? null,
      };
    });

    const received = nextTranches.reduce((sum, tranche) => (tranche.status === "received" ? sum.plus(tranche.amountAed || "0") : sum), new Decimal(0));

    const commission: DealCommission = {
      ratePercent: hasRate ? formatPercent(ratePercent as string) : null,
      totalAed: total.toDecimalPlaces(0).toFixed(0),
      receivedAed: received.toDecimalPlaces(0).toFixed(0),
      outstandingAed: total.minus(received).toDecimalPlaces(0).toFixed(0),
      tranches: nextTranches,
    };

    const updated: DealDetail = { ...cloneDealDetail(deal), commission };
    this.dealDetails = this.dealDetails.map((candidate) => (candidate.id === dealId ? updated : candidate));

    return cloneDealDetail(updated);
  }

  async markCommissionTranche(dealId: string, trancheId: string, status: CommissionTrancheStatus): Promise<DealDetail> {
    const deal = this.dealDetails.find((candidate) => candidate.id === dealId);

    if (!deal) {
      throw new Error("Deal not found.");
    }

    const tranches = deal.commission.tranches.map((tranche) =>
      tranche.id === trancheId
        ? { ...tranche, status, receivedDateLabel: status === "received" ? t("deal.today") : null }
        : tranche,
    );
    const received = tranches.reduce((sum, tranche) => (tranche.status === "received" ? sum.plus(tranche.amountAed || "0") : sum), new Decimal(0));
    const total = new Decimal(deal.commission.totalAed || "0");
    const commission: DealCommission = {
      ...deal.commission,
      tranches,
      receivedAed: received.toFixed(0),
      outstandingAed: total.minus(received).toFixed(0),
    };

    const updated: DealDetail = { ...cloneDealDetail(deal), commission };
    this.dealDetails = this.dealDetails.map((candidate) => (candidate.id === dealId ? updated : candidate));

    return cloneDealDetail(updated);
  }

  async listCommissionRisk(): Promise<CommissionRiskItem[]> {
    return this.dealDetails.flatMap((deal) =>
      deal.commission.tranches
        .filter((tranche) => tranche.status !== "received")
        .map((tranche) => ({
          trancheId: tranche.id,
          dealId: deal.id,
          projectName: deal.projectName,
          label: tranche.label,
          amountAed: tranche.amountAed,
          status: tranche.status,
          expectedDateLabel: tranche.expectedDateLabel,
        })),
    );
  }

  async listAllCommissionTranches(): Promise<PortfolioCommissionTranche[]> {
    // Preview seed data only stores formatted labels, not raw dates (no real
    // backend to persist them against). Synthesize real, relative dates here
    // so the reports screen's clawback-window math has something honest to
    // show in the demo, without claiming these are real transaction dates.
    const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
    const daysAhead = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

    return this.dealDetails.flatMap((deal) =>
      deal.commission.tranches.map((tranche, index) => ({
        trancheId: tranche.id,
        dealId: deal.id,
        projectName: deal.projectName,
        label: tranche.label,
        amountAed: tranche.amountAed,
        status: tranche.status,
        expectedDate: tranche.status === "received" ? null : daysAhead(30 + index * 60),
        receivedDate: tranche.status === "received" ? daysAgo(20 + index * 70) : null,
      })),
    );
  }

  async listDealDocuments(dealId: string): Promise<DealDocument[]> {
    return (this.documentsByDeal.get(dealId) ?? []).map((document) => ({ ...document }));
  }

  async uploadDealDocument(dealId: string, input: UploadDealDocumentInput): Promise<DealDocument> {
    const document: DealDocument = {
      id: createUuid(),
      kind: input.kind,
      name: input.fileName.trim() || t("documents.untitled"),
      storagePath: `preview-org/${dealId}/${input.kind}-${createUuid()}`,
      uploadedAtLabel: t("deal.today"),
    };
    this.documentsByDeal.set(dealId, [document, ...(this.documentsByDeal.get(dealId) ?? [])]);

    return { ...document };
  }

  async deleteDealDocument(dealId: string, documentId: string): Promise<void> {
    this.documentsByDeal.set(dealId, (this.documentsByDeal.get(dealId) ?? []).filter((document) => document.id !== documentId));
  }

  async getDocumentSignedUrl(): Promise<string> {
    throw new Error(t("documents.previewViewUnavailable"));
  }

  async getShareLink(dealId: string): Promise<string> {
    // Deterministic per-deal (no real backend to persist a token against) —
    // stable across calls, matching the real RPC's idempotent behavior.
    return buildShareUrl(`preview-${dealId}`);
  }

  async revokeShareLink(): Promise<void> {
    // No-op in preview mode — there's no real token to invalidate.
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
    locationLabel: t("deal.offPlan"),
    projectName: `${row.project_name} - ${row.unit}`,
    unit: row.unit,
    buyerName: row.buyer_name,
    totalValueAed: row.total_value_aed,
    nextMilestoneLabel: t("deal.paymentPlan"),
    nextMilestoneDate: t("deal.tbd"),
    dueAmountAed: "0",
    dueInLabel: t("deal.addMilestones"),
    paidPercent: 0,
    status: "ok",
    handoverLabel: formatDateLabel(row.handover_estimate),
    paidToDateAed: "0",
    milestones,
    commission: buildCommission(row.total_value_aed, row.commission_percent ?? null, row.commission_tranches ?? []),
  });
}

export function withMilestoneRollup(deal: DealDetail): DealDetail {
  const paidToDate = sumMilestones(deal.milestones, (milestone) => milestone.status === "paid");
  const dueAmount = sumMilestones(deal.milestones, (milestone) => milestone.status === "due" || milestone.status === "overdue");
  const nextMilestone = deal.milestones.find((milestone) => milestone.status === "due" || milestone.status === "overdue" || milestone.status === "upcoming");
  const nextStatus = nextMilestone?.status;

  return {
    ...deal,
    nextMilestoneLabel: nextMilestone?.triggerLabel ?? t("deal.paymentPlan"),
    nextMilestoneDate: nextMilestone?.dueDateLabel ?? t("deal.complete"),
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
    commission: { ...deal.commission, tranches: deal.commission.tranches.map((tranche) => ({ ...tranche })) },
  };
}

function createDealDetailFromInput(input: CreateDealInput, dealId: string): DealDetail {
  return withMilestoneRollup({
    id: dealId,
    developer: input.developerName,
    locationLabel: t("deal.offPlan"),
    projectName: `${input.projectName} - ${input.unit}`,
    unit: input.unit,
    buyerName: input.buyerName,
    totalValueAed: input.totalValueAed,
    nextMilestoneLabel: t("deal.paymentPlan"),
    nextMilestoneDate: t("deal.tbd"),
    dueAmountAed: "0",
    dueInLabel: t("deal.addMilestones"),
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
    commission: emptyCommission(),
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
    return relation[0]?.name ?? t("deal.developerFallback");
  }

  return relation?.name ?? t("deal.developerFallback");
}

function triggerLabelForType(triggerType: MilestoneTrigger) {
  switch (triggerType) {
    case "booking":
      return t("deal.triggerBooking");
    case "registration":
      return t("deal.triggerDld");
    case "construction":
      return t("deal.triggerConstruction");
    case "handover":
      return t("deal.triggerHandover");
  }
}

function buildCommission(
  totalValueAed: string,
  ratePercent: string | null,
  rows: SupabaseCommissionTrancheRow[],
): DealCommission {
  const tranches: CommissionTranche[] = [...rows]
    .sort((left, right) => left.seq - right.seq)
    .map((row) => ({
      id: row.id,
      sequence: row.seq,
      label: row.label,
      percent: formatPercent(row.percent),
      amountAed: row.amount_aed,
      status: row.status,
      expectedDateLabel: row.expected_date ? formatDateLabel(row.expected_date) : null,
      receivedDateLabel: row.received_date ? formatDateLabel(row.received_date) : null,
    }));

  const hasRate = ratePercent != null && ratePercent !== "";
  const total = hasRate
    ? new Decimal(totalValueAed || "0").times(new Decimal(ratePercent as string).dividedBy(100))
    : tranches.reduce((sum, tranche) => sum.plus(tranche.amountAed || "0"), new Decimal(0));
  const received = tranches.reduce(
    (sum, tranche) => (tranche.status === "received" ? sum.plus(tranche.amountAed || "0") : sum),
    new Decimal(0),
  );

  return {
    ratePercent: hasRate ? formatPercent(ratePercent as string) : null,
    totalAed: total.toDecimalPlaces(0).toFixed(0),
    receivedAed: received.toDecimalPlaces(0).toFixed(0),
    outstandingAed: total.minus(received).toDecimalPlaces(0).toFixed(0),
    tranches,
  };
}

function emptyCommission(): DealCommission {
  return { ratePercent: null, totalAed: "0", receivedAed: "0", outstandingAed: "0", tranches: [] };
}

// Preview-mode seed only: a realistic 2% commission, two tranches collected and
// one pending at handover (so the feature is explorable without a backend).
function previewSeededCommission(totalValueAed: string): DealCommission {
  const total = new Decimal(totalValueAed || "0").times(0.02);
  const part = (pct: number) => total.times(pct).dividedBy(100).toDecimalPlaces(0).toFixed(0);
  return {
    ratePercent: "2",
    totalAed: total.toDecimalPlaces(0).toFixed(0),
    receivedAed: new Decimal(part(50)).plus(part(25)).toFixed(0),
    outstandingAed: part(25),
    tranches: [
      { id: "preview-comm-1", sequence: 1, label: "On booking", percent: "50", amountAed: part(50), status: "received", expectedDateLabel: "12 Jan", receivedDateLabel: "15 Jan" },
      { id: "preview-comm-2", sequence: 2, label: "After DLD", percent: "25", amountAed: part(25), status: "received", expectedDateLabel: "18 Jan", receivedDateLabel: "22 Jan" },
      { id: "preview-comm-3", sequence: 3, label: "On handover", percent: "25", amountAed: part(25), status: "pending", expectedDateLabel: "Q4 2026", receivedDateLabel: null },
    ],
  };
}

function formatPercent(value: string) {
  return new Decimal(value || "0").toDecimalPlaces(3).toString();
}

function formatDateLabel(dateValue: string | null) {
  if (!dateValue) {
    return t("deal.tbd");
  }

  if (!dateValue.includes("-")) {
    return dateValue;
  }

  const [, monthValue, dayValue] = dateValue.split("-");
  const month = Number(monthValue);
  const day = Number(dayValue);

  if (!(month >= 1 && month <= 12) || !day) {
    return dateValue;
  }

  return `${day} ${t(`deal.monthShort.${month}`)}`;
}

function formatDueLabel(status: MilestoneStatus | undefined, dueDateLabel: string | undefined) {
  if (status === "overdue") {
    return t("deal.overdue");
  }

  if (status === "due") {
    return dueDateLabel && dueDateLabel !== t("deal.tbd") ? t("deal.due", { date: dueDateLabel }) : t("deal.dueSoon");
  }

  if (status === "upcoming") {
    return t("deal.upcoming");
  }

  return t("deal.complete");
}
