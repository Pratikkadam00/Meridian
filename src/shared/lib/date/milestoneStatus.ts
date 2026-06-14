import type { MilestoneStatus } from "@/shared/data/database.types";

/**
 * Dubai (Asia/Dubai) is a fixed UTC+4 offset with no DST, so the broker-facing
 * "today" is the UTC instant shifted forward four hours. Keeping all milestone
 * date math on calendar dates (UTC midnight) makes status derivation independent
 * of the device timezone — the same milestone never lands in two different
 * buckets depending on where the phone is.
 */
export const DUBAI_UTC_OFFSET_HOURS = 4;

const MS_PER_DAY = 86_400_000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Number of days from `dueDate`, classed `due` to the milestone. */
export const DUE_SOON_DAYS = 7;

/** Today's calendar date in Asia/Dubai as a YYYY-MM-DD string. */
export function todayInDubai(now: Date = new Date()): string {
  return new Date(now.getTime() + DUBAI_UTC_OFFSET_HOURS * 3_600_000).toISOString().slice(0, 10);
}

function toUtcMidnight(ymd: string): number | null {
  if (!ISO_DATE.test(ymd)) {
    return null;
  }

  const [year, month, day] = ymd.split("-").map(Number);
  const time = Date.UTC(year, month - 1, day);

  // Reject impossible dates (e.g. 2026-02-31 → rolls over to March).
  const check = new Date(time);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    return null;
  }

  return time;
}

/**
 * Whole calendar days between two YYYY-MM-DD dates (`to - from`). Positive when
 * `to` is in the future relative to `from`. Returns null if either is invalid.
 */
export function daysBetween(fromYmd: string, toYmd: string): number | null {
  const from = toUtcMidnight(fromYmd);
  const to = toUtcMidnight(toYmd);

  if (from === null || to === null) {
    return null;
  }

  return Math.round((to - from) / MS_PER_DAY);
}

/**
 * The single source of truth for a milestone's *effective* status, derived from
 * the current date rather than a stored column that can go stale. `paid` is
 * terminal; everything else is recomputed from `dueDate` vs `today`.
 */
export function deriveMilestoneStatus(
  dueDate: string | null | undefined,
  isPaid: boolean,
  today: string = todayInDubai(),
): MilestoneStatus {
  if (isPaid) {
    return "paid";
  }

  if (!dueDate) {
    return "upcoming";
  }

  const days = daysBetween(today, dueDate);

  if (days === null) {
    // Unparseable due date — don't pretend we know its urgency.
    return "upcoming";
  }

  if (days < 0) {
    return "overdue";
  }

  if (days <= DUE_SOON_DAYS) {
    return "due";
  }

  return "upcoming";
}
