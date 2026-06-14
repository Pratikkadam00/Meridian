import { computeReminderSendAt } from "../remindersRepository";

describe("reminder date logic", () => {
  it("schedules reminder offsets at 09:00 UTC", () => {
    expect(computeReminderSendAt("2026-06-19", 3)).toBe("2026-06-16T09:00:00.000Z");
    expect(computeReminderSendAt("2026-01-02", 7)).toBe("2025-12-26T09:00:00.000Z");
  });

  it("rejects missing or malformed due dates", () => {
    expect(computeReminderSendAt(null, 3)).toBeNull();
    expect(computeReminderSendAt("19-06-2026", 3)).toBeNull();
    expect(computeReminderSendAt("not-a-date", 3)).toBeNull();
  });
});
