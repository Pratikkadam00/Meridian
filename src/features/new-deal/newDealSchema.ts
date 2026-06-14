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

export const newDealFormSchema = z.object({
  project: z.string().trim().min(2, "Project is required."),
  developer: z.string().trim().min(2, "Developer is required."),
  buyerName: z.string().trim().min(2, "Buyer name is required."),
  totalValueAed: decimalInputSchema("Total value is required."),
  milestones: z.array(newDealMilestoneFormSchema).min(1, "Add at least one milestone."),
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
