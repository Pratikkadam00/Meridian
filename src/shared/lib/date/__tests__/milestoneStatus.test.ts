import { daysBetween, deriveMilestoneStatus, todayInDubai } from "@/shared/lib/date/milestoneStatus";

const TODAY = "2026-06-14";

describe("todayInDubai", () => {
  it("returns the Dubai calendar date (UTC+4) across the UTC midnight boundary", () => {
    // 2026-06-14 22:30 UTC is already 2026-06-15 02:30 in Dubai.
    expect(todayInDubai(new Date("2026-06-14T22:30:00.000Z"))).toBe("2026-06-15");
    // 2026-06-14 12:00 UTC is 16:00 in Dubai, still the 14th.
    expect(todayInDubai(new Date("2026-06-14T12:00:00.000Z"))).toBe("2026-06-14");
  });
});

describe("daysBetween", () => {
  it("counts whole calendar days and direction", () => {
    expect(daysBetween("2026-06-14", "2026-06-14")).toBe(0);
    expect(daysBetween("2026-06-14", "2026-06-21")).toBe(7);
    expect(daysBetween("2026-06-14", "2026-06-13")).toBe(-1);
    expect(daysBetween("2025-12-31", "2026-01-01")).toBe(1);
  });

  it("is timezone/DST independent (pure calendar math)", () => {
    // Spans a northern-hemisphere DST change; still exactly 31 days.
    expect(daysBetween("2026-03-01", "2026-04-01")).toBe(31);
  });

  it("returns null for malformed or impossible dates", () => {
    expect(daysBetween("2026-13-01", "2026-06-14")).toBeNull();
    expect(daysBetween("2026-02-31", "2026-06-14")).toBeNull();
    expect(daysBetween("not-a-date", "2026-06-14")).toBeNull();
  });
});

describe("deriveMilestoneStatus", () => {
  it("treats paid as terminal regardless of due date", () => {
    expect(deriveMilestoneStatus("2026-01-01", true, TODAY)).toBe("paid");
    expect(deriveMilestoneStatus(null, true, TODAY)).toBe("paid");
  });

  it("is upcoming when there is no due date", () => {
    expect(deriveMilestoneStatus(null, false, TODAY)).toBe("upcoming");
    expect(deriveMilestoneStatus(undefined, false, TODAY)).toBe("upcoming");
  });

  it("classifies the due-window boundaries exactly", () => {
    expect(deriveMilestoneStatus(TODAY, false, TODAY)).toBe("due"); // 0 days
    expect(deriveMilestoneStatus("2026-06-21", false, TODAY)).toBe("due"); // +7 days
    expect(deriveMilestoneStatus("2026-06-22", false, TODAY)).toBe("upcoming"); // +8 days
    expect(deriveMilestoneStatus("2026-06-13", false, TODAY)).toBe("overdue"); // -1 day
  });

  it("falls back to upcoming for an unparseable due date instead of guessing urgency", () => {
    expect(deriveMilestoneStatus("Q4 2026", false, TODAY)).toBe("upcoming");
  });
});
