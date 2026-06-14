import { Decimal } from "decimal.js";
import { z } from "zod";

import type { CreateDealInput, NewDealDocumentInput, NewDealMilestoneInput } from "@/shared/data/repositories/dealsRepository";
import { deriveMilestoneStatus } from "@/shared/lib/date/milestoneStatus";

const triggerTypeSchema = z.enum(["booking", "registration", "construction", "handover"]);
const sourceSchema = z.enum(["manual", "spa_extracted"]);

const dateSchema = z
  .string()
  .trim()
  .refine((value) => value.length === 0 || /^\d{4}-\d{2}-\d{2}$/.test(value), "Use YYYY-MM-DD.");

const decimalInputSchema = (message: string) =>
  z
    .string()
    .trim()
    .refine((value) => {
      try {
        return new Decimal(stripNumber(value)).greaterThan(0);
      } catch {
        return false;
      }
    }, message);

const percentInputSchema = z
  .string()
  .trim()
  .refine((value) => {
    try {
      const percent = new Decimal(stripNumber(value));

      return percent.greaterThan(0) && percent.lessThanOrEqualTo(100);
    } catch {
      return false;
    }
  }, "Enter a percent from 0 to 100.");

export const newDealMilestoneFormSchema = z.object({
  label: z.string().trim().min(1, "Milestone label is required."),
  triggerType: triggerTypeSchema,
  triggerValue: z.string().trim().optional(),
  percent: percentInputSchema,
  amountAed: decimalInputSchema("Amount is required."),
  dueDate: dateSchema,
  source: sourceSchema,
});

export const newDealFormSchema = z
  .object({
    project: z.string().trim().min(2, "Project is required."),
    developer: z.string().trim().min(2, "Developer is required."),
    buyerName: z.string().trim().min(2, "Buyer name is required."),
    totalValueAed: decimalInputSchema("Total value is required."),
    milestones: z.array(newDealMilestoneFormSchema).min(1, "Add at least one milestone."),
  })
  .superRefine((values, ctx) => {
    // A payment plan that doesn't add up to the deal value is the exact error
    // this app exists to prevent. Validate the totals (skip if any field is
    // unparseable — those get their own field-level errors first).
    let total: Decimal;
    let amountSum = new Decimal(0);
    let percentSum = new Decimal(0);

    try {
      total = new Decimal(stripNumber(values.totalValueAed));
      for (const milestone of values.milestones) {
        amountSum = amountSum.plus(new Decimal(stripNumber(milestone.amountAed)));
        percentSum = percentSum.plus(new Decimal(stripNumber(milestone.percent)));
      }
    } catch {
      return;
    }

    if (total.lessThanOrEqualTo(0)) {
      return;
    }

    const amountTolerance = Decimal.max(1, total.times(0.005));
    if (amountSum.minus(total).abs().greaterThan(amountTolerance)) {
      ctx.addIssue({
        code: "custom",
        path: ["milestones"],
        message: `Milestone amounts (AED ${amountSum.toFixed(0)}) must add up to the total value (AED ${total.toFixed(0)}).`,
      });
    }

    if (percentSum.minus(100).abs().greaterThan(1)) {
      ctx.addIssue({
        code: "custom",
        path: ["milestones"],
        message: `Milestone percentages total ${percentSum.toDecimalPlaces(2).toString()}% — they should add up to 100%.`,
      });
    }
  });

export type NewDealFormValues = z.infer<typeof newDealFormSchema>;

export function defaultMilestone(source: "manual" | "spa_extracted" = "manual"): NewDealFormValues["milestones"][number] {
  return {
    label: "Down payment",
    triggerType: "booking",
    triggerValue: "Booking",
    percent: "20",
    amountAed: "",
    dueDate: "",
    source,
  };
}

export function milestoneInputToForm(milestone: NewDealMilestoneInput): NewDealFormValues["milestones"][number] {
  return {
    label: milestone.label,
    triggerType: milestone.triggerType,
    triggerValue: milestone.triggerValue ?? "",
    percent: milestone.percent,
    amountAed: milestone.amountAed,
    dueDate: milestone.dueDate ?? "",
    source: milestone.source,
  };
}

export function toCreateDealInput(values: NewDealFormValues, spaDocument: (NewDealDocumentInput & { dealId: string }) | null): CreateDealInput {
  const { projectName, unit } = splitProjectAndUnit(values.project);

  return {
    id: spaDocument?.dealId,
    projectName,
    unit,
    developerName: values.developer.trim(),
    buyerName: values.buyerName.trim(),
    buyerEmail: null,
    totalValueAed: normalizeDecimal(values.totalValueAed),
    spaNumber: null,
    handoverEstimate: null,
    milestones: values.milestones.map((milestone) => ({
      label: milestone.label.trim(),
      triggerType: milestone.triggerType,
      triggerValue: cleanOptional(milestone.triggerValue),
      percent: normalizeDecimal(milestone.percent),
      amountAed: normalizeDecimal(milestone.amountAed),
      dueDate: cleanOptional(milestone.dueDate),
      status: deriveMilestoneStatus(cleanOptional(milestone.dueDate), false),
      source: milestone.source,
    })),
    spaDocument: spaDocument
      ? {
          originalName: spaDocument.originalName,
          storagePath: spaDocument.storagePath,
        }
      : null,
  };
}

function splitProjectAndUnit(project: string) {
  const parts = project
    .replace(" - ", " - ")
    .split(/\s[-–—]\s/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return {
      projectName: parts.slice(0, -1).join(" - "),
      unit: parts[parts.length - 1],
    };
  }

  return {
    projectName: project.trim(),
    unit: "Unit TBD",
  };
}

function cleanOptional(value: string | undefined) {
  const cleanValue = value?.trim();

  return cleanValue ? cleanValue : null;
}

function normalizeDecimal(value: string) {
  return new Decimal(stripNumber(value)).toDecimalPlaces(2).toFixed(2);
}

function stripNumber(value: string) {
  return value.replace(/,/g, "").trim();
}
