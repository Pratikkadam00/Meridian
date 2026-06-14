import type { DashboardDeal } from "@/shared/data/repositories/dealsRepository";

import { formatAedCompact, formatAedWhole, getPortfolioMetrics } from "../dashboardFormat";

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

describe("dashboard formatting", () => {
  it("formats AED values for dashboard cards", () => {
    expect(formatAedCompact("3200000")).toBe("AED 3.20M");
    expect(formatAedCompact("93000")).toBe("AED 93K");
    expect(formatAedWhole("1234567.89")).toBe("1,234,568");
  });

  it("rounds the 999.5K boundary up to millions instead of '1000K'", () => {
    expect(formatAedCompact("999600")).toBe("AED 1.00M");
    expect(formatAedCompact("999400")).toBe("AED 999K");
  });

  it("rolls up escrow, due-this-week, and overdue as three separate totals", () => {
    const metrics = getPortfolioMetrics([
      deal({ id: "ok", totalValueAed: "1200000", status: "ok", dueAmountAed: "200000" }),
      deal({ id: "due", totalValueAed: "900000", status: "due", dueAmountAed: "80000" }),
      deal({ id: "over", totalValueAed: "1100000", status: "over", dueAmountAed: "50000" }),
    ]);

    expect(metrics).toEqual({
      escrowLabel: "AED 3.20M",
      dueLabel: "AED 80K",
      overdueLabel: "AED 50K",
    });
  });
});
