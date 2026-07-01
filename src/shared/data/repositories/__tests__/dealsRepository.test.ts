import { Decimal } from "decimal.js";

import {
  mapSupabaseDetail,
  markMilestonePaidInDetail,
  paidPercent,
  PreviewDealsRepository,
  withMilestoneRollup,
  type CommissionTrancheInput,
  type DealDetail,
  type DealPaymentMilestone,
  type SupabaseDealDetailRow,
} from "@/shared/data/repositories/dealsRepository";
import { todayInDubai } from "@/shared/lib/date/milestoneStatus";

/** A YYYY-MM-DD date `offset` days from today (Dubai), for deterministic relative dates. */
function ymd(offset: number): string {
  const base = new Date(`${todayInDubai()}T00:00:00.000Z`).getTime();
  return new Date(base + offset * 86_400_000).toISOString().slice(0, 10);
}

function milestone(overrides: Partial<DealPaymentMilestone>): DealPaymentMilestone {
  return {
    id: "m",
    sequence: 1,
    label: "Milestone",
    triggerType: "construction",
    triggerLabel: "Construction",
    percent: "10",
    amountAed: "100000",
    dueDateLabel: "TBD",
    paidDateLabel: null,
    status: "upcoming",
    ...overrides,
  };
}

function dealDetail(milestones: DealPaymentMilestone[], totalValueAed = "1000000"): DealDetail {
  return {
    id: "deal",
    developer: "Emaar",
    locationLabel: "Off-plan",
    projectName: "Marina Vista - 2BR",
    unit: "2BR",
    buyerName: "Omar Al-Farsi",
    totalValueAed,
    nextMilestoneLabel: "Payment plan",
    nextMilestoneDate: "TBD",
    dueAmountAed: "0",
    dueInLabel: "Add milestones",
    paidPercent: 0,
    status: "ok",
    handoverLabel: "Q4 2026",
    paidToDateAed: "0",
    milestones,
    commission: { ratePercent: null, totalAed: "0", receivedAed: "0", outstandingAed: "0", tranches: [] },
  };
}

describe("mapSupabaseDetail — status re-derivation on read", () => {
  it("re-derives each non-paid milestone's status from due_date vs today", () => {
    const row: SupabaseDealDetailRow = {
      id: "d1",
      project_name: "Marina Vista",
      unit: "2BR",
      buyer_name: "Omar Al-Farsi",
      total_value_aed: "1000000",
      handover_estimate: null,
      commission_percent: null,
      commission_tranches: [],
      developers: { name: "Emaar" },
      milestones: [
        // paid stays paid
        { id: "m1", seq: 1, label: "Booking", trigger_type: "booking", trigger_value: null, percent: "20", amount_aed: "200000", due_date: ymd(-60), paid_date: ymd(-60), status: "paid" },
        // stored "upcoming" but due date has passed → must become overdue
        { id: "m2", seq: 2, label: "Stale", trigger_type: "construction", trigger_value: null, percent: "10", amount_aed: "100000", due_date: ymd(-3), paid_date: null, status: "upcoming" },
        // stored "upcoming" but within the 7-day window → must become due
        { id: "m3", seq: 3, label: "Soon", trigger_type: "construction", trigger_value: null, percent: "10", amount_aed: "100000", due_date: ymd(3), paid_date: null, status: "upcoming" },
        // stored "due" but far out → must become upcoming
        { id: "m4", seq: 4, label: "Far", trigger_type: "handover", trigger_value: null, percent: "40", amount_aed: "400000", due_date: ymd(40), paid_date: null, status: "due" },
      ],
    };

    const detail = mapSupabaseDetail(row);
    const byId = Object.fromEntries(detail.milestones.map((m) => [m.id, m.status]));

    expect(byId).toEqual({ m1: "paid", m2: "overdue", m3: "due", m4: "upcoming" });
    // Rollup reflects the re-derived statuses, not the stale stored ones.
    expect(detail.paidToDateAed).toBe("200000");
    expect(detail.dueAmountAed).toBe("200000"); // overdue + due
    expect(detail.status).toBe("over"); // earliest unpaid is overdue
  });

  it("treats a milestone with a paid_date as paid even if status column says otherwise", () => {
    const row: SupabaseDealDetailRow = {
      id: "d2",
      project_name: "Sobha One",
      unit: "1BR",
      buyer_name: "Maya",
      total_value_aed: "500000",
      handover_estimate: null,
      commission_percent: null,
      commission_tranches: [],
      developers: { name: "Sobha" },
      milestones: [
        { id: "m1", seq: 1, label: "Booking", trigger_type: "booking", trigger_value: null, percent: "20", amount_aed: "100000", due_date: ymd(-5), paid_date: ymd(-5), status: "overdue" },
      ],
    };

    expect(mapSupabaseDetail(row).milestones[0].status).toBe("paid");
  });
});

describe("commission tracking", () => {
  it("derives commission total from rate, and reconciles received vs outstanding from tranches", () => {
    const row: SupabaseDealDetailRow = {
      id: "d3",
      project_name: "Canal Heights",
      unit: "1BR",
      buyer_name: "Layla",
      total_value_aed: "2000000",
      handover_estimate: null,
      commission_percent: "3", // 3% of 2,000,000 = 60,000 total commission
      developers: { name: "DAMAC" },
      milestones: [],
      commission_tranches: [
        { id: "c2", seq: 2, label: "On handover", percent: "50", amount_aed: "30000", status: "pending", expected_date: null, received_date: null },
        { id: "c1", seq: 1, label: "On booking", percent: "50", amount_aed: "30000", status: "received", expected_date: null, received_date: ymd(-10) },
      ],
    };

    const { commission } = mapSupabaseDetail(row);

    expect(commission.ratePercent).toBe("3");
    expect(commission.totalAed).toBe("60000"); // 2,000,000 * 3%
    expect(commission.receivedAed).toBe("30000"); // only the received tranche
    expect(commission.outstandingAed).toBe("30000");
    expect(commission.tranches.map((t) => t.label)).toEqual(["On booking", "On handover"]); // sorted by seq
  });
});

describe("PreviewDealsRepository.setDealCommission — editing a schedule must not wipe received tranches", () => {
  it("preserves status and received date for a tranche whose id round-trips, even though the payload never carries status", async () => {
    const repo = new PreviewDealsRepository();
    const before = await repo.getDealDetail("preview-marina-vista");
    const receivedTranche = before.commission.tranches.find((tranche) => tranche.status === "received");
    expect(receivedTranche).toBeDefined();

    // Mirrors exactly what CommissionEditorScreen sends: id/label/percent/
    // amountAed/expectedDate only — no status, no receivedDate.
    const payload: CommissionTrancheInput[] = before.commission.tranches.map((tranche) => ({
      id: tranche.id,
      label: tranche.id === receivedTranche!.id ? `${tranche.label} (renamed)` : tranche.label,
      percent: tranche.percent,
      amountAed: tranche.amountAed,
      expectedDate: null,
    }));

    const after = await repo.setDealCommission("preview-marina-vista", before.commission.ratePercent, payload);
    const stillReceived = after.commission.tranches.find((tranche) => tranche.id === receivedTranche!.id);

    expect(stillReceived?.status).toBe("received");
    expect(stillReceived?.receivedDateLabel).toBe(receivedTranche!.receivedDateLabel);
    expect(stillReceived?.label).toBe(`${receivedTranche!.label} (renamed)`);
  });

  it("starts a brand-new tranche (no id) as pending, without touching existing ones", async () => {
    const repo = new PreviewDealsRepository();
    const before = await repo.getDealDetail("preview-marina-vista");
    const existingIds = new Set(before.commission.tranches.map((tranche) => tranche.id));

    const payload: CommissionTrancheInput[] = [
      ...before.commission.tranches.map((tranche) => ({ id: tranche.id, label: tranche.label, percent: tranche.percent, amountAed: tranche.amountAed, expectedDate: null })),
      { id: null, label: "Referral bonus", percent: "0", amountAed: "0", expectedDate: null },
    ];

    const after = await repo.setDealCommission("preview-marina-vista", before.commission.ratePercent, payload);
    const newTranche = after.commission.tranches.find((tranche) => !existingIds.has(tranche.id));

    expect(newTranche?.label).toBe("Referral bonus");
    expect(newTranche?.status).toBe("pending");
    expect(newTranche?.receivedDateLabel).toBeNull();
    // Every previously-received tranche is still received.
    expect(after.commission.tranches.filter((tranche) => existingIds.has(tranche.id) && tranche.status === "received")).toHaveLength(
      before.commission.tranches.filter((tranche) => tranche.status === "received").length,
    );
  });
});

describe("withMilestoneRollup", () => {
  it("sums paid to date, due amount, and derives the next milestone + status", () => {
    const detail = withMilestoneRollup(
      dealDetail([
        milestone({ id: "a", sequence: 1, status: "paid", amountAed: "200000" }),
        milestone({ id: "b", sequence: 2, status: "overdue", amountAed: "100000", triggerLabel: "DLD", dueDateLabel: "10 Jun" }),
        milestone({ id: "c", sequence: 3, status: "due", amountAed: "150000" }),
        milestone({ id: "d", sequence: 4, status: "upcoming", amountAed: "550000" }),
      ]),
    );

    expect(detail.paidToDateAed).toBe("200000");
    expect(detail.dueAmountAed).toBe("250000"); // overdue + due
    expect(detail.nextMilestoneLabel).toBe("DLD"); // first non-paid in sequence
    expect(detail.status).toBe("over");
    expect(detail.paidPercent).toBe(20); // 200000 / 1000000
  });

  it("reports a complete plan when everything is paid", () => {
    const detail = withMilestoneRollup(
      dealDetail([
        milestone({ id: "a", sequence: 1, status: "paid", amountAed: "600000" }),
        milestone({ id: "b", sequence: 2, status: "paid", amountAed: "400000" }),
      ]),
    );

    expect(detail.paidPercent).toBe(100);
    expect(detail.status).toBe("ok");
    expect(detail.dueInLabel).toBe("Complete");
  });
});

describe("paidPercent", () => {
  it("rounds to a whole percent", () => {
    expect(paidPercent("3200000", new Decimal("1088000"))).toBe(34);
  });

  it("guards divide-by-zero / empty totals", () => {
    expect(paidPercent("0", new Decimal("100"))).toBe(0);
    expect(paidPercent("", new Decimal("100"))).toBe(0);
  });
});

describe("markMilestonePaidInDetail", () => {
  it("marks the target paid and advances the next milestone to be the active one", () => {
    const before = withMilestoneRollup(
      dealDetail([
        milestone({ id: "a", sequence: 1, status: "due", amountAed: "200000", triggerLabel: "Booking", dueDateLabel: "12 Jun" }),
        milestone({ id: "b", sequence: 2, status: "upcoming", amountAed: "300000", triggerLabel: "DLD", dueDateLabel: "20 Jun" }),
      ]),
    );
    expect(before.nextMilestoneLabel).toBe("Booking");

    const after = markMilestonePaidInDetail(before, "a", "Today");

    expect(after.milestones.find((m) => m.id === "a")?.status).toBe("paid");
    expect(after.milestones.find((m) => m.id === "a")?.paidDateLabel).toBe("Today");
    expect(after.paidToDateAed).toBe("200000");
    expect(after.nextMilestoneLabel).toBe("DLD"); // advanced to the next unpaid node
  });
});
