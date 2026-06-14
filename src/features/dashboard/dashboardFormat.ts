import { Decimal } from "decimal.js";

import type { DashboardDeal } from "@/shared/data/repositories/dealsRepository";

export function formatAedCompact(value: string) {
  const amount = new Decimal(value || "0");

  // 999_500 (not 1_000_000) so values that round to 1000K render as "1.00M".
  if (amount.greaterThanOrEqualTo(999_500)) {
    return `AED ${amount.dividedBy(1_000_000).toDecimalPlaces(2).toFixed(2)}M`;
  }

  if (amount.greaterThanOrEqualTo(1_000)) {
    return `AED ${amount.dividedBy(1_000).toDecimalPlaces(0).toFixed(0)}K`;
  }

  return `AED ${amount.toDecimalPlaces(0).toFixed(0)}`;
}

export function formatAedWhole(value: string) {
  const amount = new Decimal(value || "0").toDecimalPlaces(0).toFixed(0);

  return amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function getPortfolioMetrics(deals: DashboardDeal[]) {
  const totalEscrow = deals.reduce((sum, deal) => sum.plus(deal.totalValueAed || "0"), new Decimal(0));
  // PRD §6 / G3: three distinct glance figures — in escrow, due this week, overdue.
  const dueThisWeek = deals.reduce((sum, deal) => (deal.status === "due" ? sum.plus(deal.dueAmountAed || "0") : sum), new Decimal(0));
  const overdue = deals.reduce((sum, deal) => (deal.status === "over" ? sum.plus(deal.dueAmountAed || "0") : sum), new Decimal(0));

  return {
    escrowLabel: formatAedCompact(totalEscrow.toString()),
    dueLabel: formatAedCompact(dueThisWeek.toString()),
    overdueLabel: formatAedCompact(overdue.toString()),
  };
}
