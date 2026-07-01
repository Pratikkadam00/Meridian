import { Decimal } from "decimal.js";
import { t } from "i18next";

import type { DashboardDeal, PortfolioCommissionTranche } from "@/shared/data/repositories/dealsRepository";

// Clawback windows are grounded in cited market research (Oliva — off-plan
// commission tranches): a cancellation within ~30-60 days of the broker
// receiving a commission tranche typically triggers a 100% developer
// clawback; 60-180 days is a partial (50-75%) clawback; beyond that the
// commission is generally non-refundable. This classifies REAL received
// tranches (commission_tranches.received_date) against those windows — it is
// not a guess, but it is also not a legal/contractual guarantee: always
// verify against the actual developer agency agreement.
export type ClawbackBand = "high" | "moderate" | "safe";

export function clawbackBandForDays(daysSinceReceived: number): ClawbackBand {
  if (daysSinceReceived <= 60) {
    return "high";
  }
  if (daysSinceReceived <= 180) {
    return "moderate";
  }
  return "safe";
}

export type ClawbackExposureItem = {
  trancheId: string;
  dealId: string;
  projectName: string;
  label: string;
  amountAed: string;
  daysSinceReceived: number;
  band: ClawbackBand;
};

export function computeClawbackExposure(tranches: PortfolioCommissionTranche[], now: Date): ClawbackExposureItem[] {
  return tranches
    .filter((tranche) => tranche.status === "received" && tranche.receivedDate)
    .map((tranche) => {
      const receivedAt = new Date(`${tranche.receivedDate}T00:00:00Z`);
      const daysSinceReceived = Math.max(0, Math.floor((now.getTime() - receivedAt.getTime()) / 86_400_000));
      return {
        trancheId: tranche.trancheId,
        dealId: tranche.dealId,
        projectName: tranche.projectName,
        label: tranche.label,
        amountAed: tranche.amountAed,
        daysSinceReceived,
        band: clawbackBandForDays(daysSinceReceived),
      };
    })
    .filter((item) => item.band !== "safe")
    .sort((a, b) => a.daysSinceReceived - b.daysSinceReceived);
}

export type ForecastMonth = {
  monthKey: string;
  monthLabel: string;
  totalAed: string;
  count: number;
};

// Groups not-yet-received tranches by their expected month, chronologically.
export function computeIncomeForecast(tranches: PortfolioCommissionTranche[]): ForecastMonth[] {
  const groups = new Map<string, { total: Decimal; count: number; year: number; month: number }>();

  for (const tranche of tranches) {
    if (tranche.status === "received" || !tranche.expectedDate) {
      continue;
    }

    const [yearStr, monthStr] = tranche.expectedDate.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);

    if (!year || !(month >= 1 && month <= 12)) {
      continue;
    }

    const key = `${year}-${String(month).padStart(2, "0")}`;
    const existing = groups.get(key) ?? { total: new Decimal(0), count: 0, year, month };
    existing.total = existing.total.plus(tranche.amountAed || "0");
    existing.count += 1;
    groups.set(key, existing);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, value]) => ({
      monthKey: key,
      monthLabel: `${t(`deal.monthShort.${value.month}`)} ${value.year}`,
      totalAed: value.total.toDecimalPlaces(0).toFixed(0),
      count: value.count,
    }));
}

export type CommissionSummary = {
  collectedAed: string;
  outstandingAed: string;
};

export function computeCommissionSummary(tranches: PortfolioCommissionTranche[]): CommissionSummary {
  let collected = new Decimal(0);
  let outstanding = new Decimal(0);

  for (const tranche of tranches) {
    if (tranche.status === "received") {
      collected = collected.plus(tranche.amountAed || "0");
    } else {
      outstanding = outstanding.plus(tranche.amountAed || "0");
    }
  }

  return {
    collectedAed: collected.toDecimalPlaces(0).toFixed(0),
    outstandingAed: outstanding.toDecimalPlaces(0).toFixed(0),
  };
}

export type PortfolioSummary = {
  totalValueAed: string;
  paidToDateAed: string;
  paidPercent: number;
  dealCount: number;
};

// paidToDate is an estimate derived from each deal's already-rounded
// paidPercent (the same figures shown elsewhere in the app) — a reasonable
// portfolio-level aggregate, not a claim of cent-precision.
export function computePortfolioSummary(deals: DashboardDeal[]): PortfolioSummary {
  let totalValue = new Decimal(0);
  let paidToDate = new Decimal(0);

  for (const deal of deals) {
    const value = new Decimal(deal.totalValueAed || "0");
    totalValue = totalValue.plus(value);
    paidToDate = paidToDate.plus(value.times(deal.paidPercent).dividedBy(100));
  }

  const paidPercent = totalValue.greaterThan(0) ? paidToDate.dividedBy(totalValue).times(100).toDecimalPlaces(0).toNumber() : 0;

  return {
    totalValueAed: totalValue.toDecimalPlaces(0).toFixed(0),
    paidToDateAed: paidToDate.toDecimalPlaces(0).toFixed(0),
    paidPercent,
    dealCount: deals.length,
  };
}
