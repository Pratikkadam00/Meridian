import { Decimal } from "decimal.js";

import type { DashboardDeal } from "@/shared/data/repositories/dealsRepository";

export function formatAedCompact(value: string) {
  const amount = new Decimal(value || "0");

  if (amount.greaterThanOrEqualTo(1_000_000)) {
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
  const due = deals.reduce((sum, deal) => (deal.status === "due" || deal.status === "over" ? sum.plus(deal.dueAmountAed || "0") : sum), new Decimal(0));

  return {
    escrowLabel: formatAedCompact(totalEscrow.toString()),
    dueLabel: formatAedCompact(due.toString()),
  };
}
