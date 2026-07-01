import type { TFunction } from "i18next";

import { formatAedWhole } from "@/features/dashboard";
import type { DealDetail, DealPaymentMilestone } from "@/shared/data/repositories/dealsRepository";

// Post-sale client-comms templates. Grounded ONLY in data the app actually
// has (payment-plan progress, milestone figures, handover estimate) — no
// construction-% or escrow-account claims, since there is no DLD/Mashrooi
// build-status signal wired up (tracked as a future integration, not faked
// here). Mirrors the existing reminder-share pattern: wa.me/?text=... with no
// phone number, so the broker picks the contact from their own phone.
export type DealMessageTemplateKey = "recap" | "progressUpdate" | "handoverApproaching";

// The same "next milestone" pick as withMilestoneRollup (dealsRepository.ts):
// due/overdue/upcoming, in milestone order. dueAmountAed only sums due/overdue
// milestones, so it's legitimately "0" whenever the next milestone is merely
// upcoming — using it as a fallback source for "next payment amount" would
// substitute the ENTIRE deal total in that (normal, common) case. Read the
// amount straight off the actual next milestone instead, and only fall back
// to the deal total when there truly is no next milestone (fully paid).
function nextMilestoneAmountAed(deal: DealDetail): string {
  const next = deal.milestones.find((milestone) => milestone.status === "due" || milestone.status === "overdue" || milestone.status === "upcoming");
  return next?.amountAed ?? deal.totalValueAed;
}

export function buildDealMessage(key: DealMessageTemplateKey, deal: DealDetail, t: TFunction): string {
  switch (key) {
    case "recap":
      return t("dealMessages.recapBody", {
        buyer: deal.buyerName,
        project: deal.projectName,
        total: formatAedWhole(deal.totalValueAed),
        nextLabel: deal.nextMilestoneLabel,
        nextAmount: formatAedWhole(nextMilestoneAmountAed(deal)),
        nextDate: deal.nextMilestoneDate,
      });
    case "progressUpdate":
      return t("dealMessages.progressBody", {
        buyer: deal.buyerName,
        project: deal.projectName,
        paidPercent: deal.paidPercent,
        nextLabel: deal.nextMilestoneLabel,
        nextAmount: formatAedWhole(nextMilestoneAmountAed(deal)),
        nextDate: deal.nextMilestoneDate,
      });
    case "handoverApproaching":
      return t("dealMessages.handoverBody", {
        buyer: deal.buyerName,
        project: deal.projectName,
        handover: deal.handoverLabel,
      });
  }
}

export function buildMilestoneMessage(kind: "reminder" | "paidConfirmation", deal: DealDetail, milestone: DealPaymentMilestone, t: TFunction): string {
  const amount = formatAedWhole(milestone.amountAed);

  if (kind === "paidConfirmation") {
    return t("dealMessages.milestonePaidBody", {
      buyer: deal.buyerName,
      label: milestone.label,
      amount,
      project: deal.projectName,
    });
  }

  return t("dealMessages.milestoneReminderBody", {
    buyer: deal.buyerName,
    label: milestone.label,
    amount,
    project: deal.projectName,
    date: milestone.dueDateLabel,
  });
}

export function buildWhatsAppShareUrl(message: string) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
