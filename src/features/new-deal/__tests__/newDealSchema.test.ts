import { newDealFormSchema, toCreateDealInput, type NewDealFormValues } from "@/features/new-deal/newDealSchema";

function values(overrides: Partial<NewDealFormValues> = {}): NewDealFormValues {
  return {
    project: "Marina Vista - 2BR",
    developer: "Emaar",
    buyerName: "Omar Al-Farsi",
    totalValueAed: "1,000,000",
    milestones: [
      { label: "Down payment", triggerType: "booking", triggerValue: "Booking", percent: "60", amountAed: "600000", dueDate: "", source: "manual" },
      { label: "Handover", triggerType: "handover", triggerValue: "Handover", percent: "40", amountAed: "400000", dueDate: "", source: "manual" },
    ],
    ...overrides,
  };
}

describe("newDealFormSchema plan integrity", () => {
  it("accepts a plan whose amounts and percents add up", () => {
    expect(newDealFormSchema.safeParse(values()).success).toBe(true);
  });

  it("rejects a plan whose milestone amounts don't sum to the total", () => {
    const result = newDealFormSchema.safeParse(
      values({
        milestones: [
          { label: "Down payment", triggerType: "booking", triggerValue: "Booking", percent: "60", amountAed: "600000", dueDate: "", source: "manual" },
          { label: "Handover", triggerType: "handover", triggerValue: "Handover", percent: "40", amountAed: "100000", dueDate: "", source: "manual" },
        ],
      }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message).join(" ");
      expect(messages).toMatch(/add up to the total value/i);
    }
  });

  it("rejects a plan whose percentages don't total 100", () => {
    const result = newDealFormSchema.safeParse(
      values({
        totalValueAed: "1,000,000",
        milestones: [
          { label: "Down payment", triggerType: "booking", triggerValue: "Booking", percent: "50", amountAed: "600000", dueDate: "", source: "manual" },
          { label: "Handover", triggerType: "handover", triggerValue: "Handover", percent: "40", amountAed: "400000", dueDate: "", source: "manual" },
        ],
      }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((i) => i.message).join(" ")).toMatch(/should add up to 100%/i);
    }
  });
});

describe("toCreateDealInput", () => {
  it("splits project/unit, normalizes money, and derives milestone status", () => {
    const input = toCreateDealInput(values(), null);

    expect(input.projectName).toBe("Marina Vista");
    expect(input.unit).toBe("2BR");
    expect(input.totalValueAed).toBe("1000000.00");
    expect(input.milestones[0].amountAed).toBe("600000.00");
    // No due date → upcoming (terminal "paid" only when actually paid).
    expect(input.milestones[0].status).toBe("upcoming");
  });

  it("defaults unit when the project has no separator", () => {
    const input = toCreateDealInput(values({ project: "Standalone Tower" }), null);
    expect(input.projectName).toBe("Standalone Tower");
    expect(input.unit).toBe("Unit TBD");
  });
});
