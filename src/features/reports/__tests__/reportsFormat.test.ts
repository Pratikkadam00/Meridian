import type { DashboardDeal, PortfolioCommissionTranche } from "@/shared/data/repositories/dealsRepository";

import { clawbackBandForDays, computeClawbackExposure, computeCommissionSummary, computeIncomeForecast, computePortfolioSummary } from "../reportsFormat";

function tranche(input: Partial<PortfolioCommissionTranche>): PortfolioCommissionTranche {
  return {
    trancheId: "t-1",
    dealId: "deal-1",
    projectName: "Marina Vista - 2BR",
    label: "On booking",
    amountAed: "0",
    status: "pending",
    expectedDate: null,
    receivedDate: null,
    ...input,
  };
}

function deal(input: Partial<DashboardDeal>): DashboardDeal {
  return {
    id: "deal-1",
    developer: "Emaar",
    locationLabel: "Dubai Marina",
    projectName: "Marina Vista",
    buyerName: "Buyer",
    totalValueAed: "0",
    nextMilestoneLabel: "Booking",
    nextMilestoneDate: "19 Jun",
    dueAmountAed: "0",
    dueInLabel: "On track",
    paidPercent: 0,
    status: "ok",
    ...input,
  };
}

describe("clawbackBandForDays", () => {
  it("bands days since receipt into high (<=60), moderate (<=180), safe (>180)", () => {
    expect(clawbackBandForDays(0)).toBe("high");
    expect(clawbackBandForDays(60)).toBe("high");
    expect(clawbackBandForDays(61)).toBe("moderate");
    expect(clawbackBandForDays(180)).toBe("moderate");
    expect(clawbackBandForDays(181)).toBe("safe");
  });
});

describe("computeClawbackExposure", () => {
  const now = new Date("2026-06-01T00:00:00Z");

  it("includes only received tranches within the exposure window, sorted soonest-received first", () => {
    const tranches = [
      tranche({ trancheId: "t-safe", status: "received", receivedDate: "2025-01-01", amountAed: "1000" }), // ~17 months ago -> safe
      tranche({ trancheId: "t-high", status: "received", receivedDate: "2026-05-20", amountAed: "2000" }), // 12 days ago -> high
      tranche({ trancheId: "t-moderate", status: "received", receivedDate: "2026-03-01", amountAed: "3000" }), // ~92 days ago -> moderate
      tranche({ trancheId: "t-pending", status: "pending", receivedDate: null, amountAed: "4000" }),
    ];

    const result = computeClawbackExposure(tranches, now);

    expect(result.map((item) => item.trancheId)).toEqual(["t-high", "t-moderate"]);
    expect(result[0].band).toBe("high");
    expect(result[1].band).toBe("moderate");
  });

  it("returns nothing when no tranche has been received", () => {
    expect(computeClawbackExposure([tranche({ status: "pending" })], now)).toEqual([]);
  });
});

describe("computeIncomeForecast", () => {
  it("groups non-received tranches by expected month and sums amounts, sorted chronologically", () => {
    const tranches = [
      tranche({ trancheId: "a", status: "pending", expectedDate: "2026-08-15", amountAed: "10000" }),
      tranche({ trancheId: "b", status: "invoiced", expectedDate: "2026-08-01", amountAed: "5000" }),
      tranche({ trancheId: "c", status: "pending", expectedDate: "2026-07-10", amountAed: "20000" }),
      tranche({ trancheId: "d", status: "received", expectedDate: "2026-07-01", amountAed: "99999" }), // excluded — already received
      tranche({ trancheId: "e", status: "pending", expectedDate: null, amountAed: "50000" }), // excluded — no date
    ];

    const result = computeIncomeForecast(tranches);

    expect(result).toEqual([
      { monthKey: "2026-07", monthLabel: "Jul 2026", totalAed: "20000", count: 1 },
      { monthKey: "2026-08", monthLabel: "Aug 2026", totalAed: "15000", count: 2 },
    ]);
  });

  it("returns an empty forecast when nothing is outstanding", () => {
    expect(computeIncomeForecast([tranche({ status: "received", expectedDate: "2026-01-01" })])).toEqual([]);
  });
});

describe("computeCommissionSummary", () => {
  it("splits received (collected) from pending/invoiced (outstanding)", () => {
    const summary = computeCommissionSummary([
      tranche({ status: "received", amountAed: "10000" }),
      tranche({ status: "received", amountAed: "5000" }),
      tranche({ status: "pending", amountAed: "3000" }),
      tranche({ status: "invoiced", amountAed: "2000" }),
    ]);

    expect(summary).toEqual({ collectedAed: "15000", outstandingAed: "5000" });
  });
});

describe("computePortfolioSummary", () => {
  it("sums total value and estimates paid-to-date from each deal's paidPercent", () => {
    const summary = computePortfolioSummary([
      deal({ totalValueAed: "1000000", paidPercent: 50 }),
      deal({ totalValueAed: "2000000", paidPercent: 25 }),
    ]);

    expect(summary.totalValueAed).toBe("3000000");
    expect(summary.paidToDateAed).toBe("1000000"); // 500000 + 500000
    expect(summary.paidPercent).toBe(33); // 1000000 / 3000000, rounded
    expect(summary.dealCount).toBe(2);
  });

  it("guards divide-by-zero on an empty portfolio", () => {
    expect(computePortfolioSummary([])).toEqual({ totalValueAed: "0", paidToDateAed: "0", paidPercent: 0, dealCount: 0 });
  });
});
