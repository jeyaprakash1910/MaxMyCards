/**
 * Compute current billing cycle dates and due date from cycle day configuration.
 * Example: cycle_start=14, cycle_end=13 means cycle runs 14th of month N to 13th of month N+1
 */

import { clampDayToMonth } from './dateValidation';

export function getCurrentCycle(
  cycleStartDay: number,
  cycleEndDay: number,
  refDate: Date = new Date()
): { cycleStart: Date; cycleEnd: Date; daysLeftInCycle: number } {
  const today = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());

  let cycleStart: Date;
  let cycleEnd: Date;

  // cycle_end is typically the day before cycle_start (e.g. 13 when start is 14)
  // So cycle is: 14th of prev month to 13th of this month, or 14th this month to 13th next month
  const day = today.getDate();
  const month = today.getMonth();
  const year = today.getFullYear();

  if (cycleEndDay < cycleStartDay) {
    // e.g. start=14, end=13: cycle is 14th to 13th (next month)
    if (day >= cycleStartDay) {
      // We're in second half: 14th this month - 13th next month
      const clampedStartDay = clampDayToMonth(cycleStartDay, year, month);
      const clampedEndDay = clampDayToMonth(cycleEndDay, year, month + 1);
      cycleStart = new Date(year, month, clampedStartDay);
      cycleEnd = new Date(year, month + 1, clampedEndDay);
    } else {
      // We're in first half: 14th last month - 13th this month
      const clampedStartDay = clampDayToMonth(cycleStartDay, year, month - 1);
      const clampedEndDay = clampDayToMonth(cycleEndDay, year, month);
      cycleStart = new Date(year, month - 1, clampedStartDay);
      cycleEnd = new Date(year, month, clampedEndDay);
    }
  } else {
    // Same month cycle (e.g. 1st to 31st)
    const clampedStartDay = clampDayToMonth(cycleStartDay, year, month);
    const clampedEndDay = clampDayToMonth(cycleEndDay, year, month);
    cycleStart = new Date(year, month, clampedStartDay);
    cycleEnd = new Date(year, month, clampedEndDay);
    if (cycleEnd < cycleStart) cycleEnd.setMonth(cycleEnd.getMonth() + 1);
  }

  const daysLeftInCycle = Math.max(
    0,
    Math.floor((cycleEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  );

  return { cycleStart, cycleEnd, daysLeftInCycle };
}

/** Get the cycle that ended before the current one (one period back). */
export function getPastCycle(
  cycleStartDay: number,
  cycleEndDay: number,
  refDate: Date = new Date()
): { cycleStart: Date; cycleEnd: Date } {
  const { cycleStart, cycleEnd } = getCurrentCycle(cycleStartDay, cycleEndDay, refDate);
  const pastStartMonth = cycleStart.getMonth() - 1;
  const pastEndMonth = cycleEnd.getMonth() - 1;
  const clampedStartDay = clampDayToMonth(cycleStart.getDate(), cycleStart.getFullYear(), pastStartMonth);
  const clampedEndDay = clampDayToMonth(cycleEnd.getDate(), cycleEnd.getFullYear(), pastEndMonth);
  return {
    cycleStart: new Date(cycleStart.getFullYear(), pastStartMonth, clampedStartDay),
    cycleEnd: new Date(cycleEnd.getFullYear(), pastEndMonth, clampedEndDay),
  };
}

/** Get the cycle that starts after the current one (one period forward). */
export function getNextCycle(
  cycleStartDay: number,
  cycleEndDay: number,
  refDate: Date = new Date()
): { cycleStart: Date; cycleEnd: Date } {
  const { cycleStart, cycleEnd } = getCurrentCycle(cycleStartDay, cycleEndDay, refDate);
  const nextStartMonth = cycleStart.getMonth() + 1;
  const nextEndMonth = cycleEnd.getMonth() + 1;
  const clampedStartDay = clampDayToMonth(cycleStart.getDate(), cycleStart.getFullYear(), nextStartMonth);
  const clampedEndDay = clampDayToMonth(cycleEnd.getDate(), cycleEnd.getFullYear(), nextEndMonth);
  return {
    cycleStart: new Date(cycleStart.getFullYear(), nextStartMonth, clampedStartDay),
    cycleEnd: new Date(cycleEnd.getFullYear(), nextEndMonth, clampedEndDay),
  };
}

export function getNextDueDate(
  cycleEnd: Date,
  dueDateDays: number
): { dueDate: Date; daysUntilDue: number } {
  const dueDate = new Date(cycleEnd);
  dueDate.setDate(dueDate.getDate() + dueDateDays);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  // Allow negative values for overdue cards - use floor to avoid inflating remaining time
  const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return { dueDate, daysUntilDue };
}

export function formatCycleRange(cycleStart: Date, cycleEnd: Date): string {
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return `${cycleStart.toLocaleDateString('en-IN', opts)} - ${cycleEnd.toLocaleDateString('en-IN', opts)}`;
}

export function formatDueDate(dueDate: Date): string {
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
  return dueDate.toLocaleDateString('en-IN', opts);
}

/**
 * Given cycle end date and due_date_days, returns the day of month (1-31) the due date falls on.
 * Example: cycleEnd Nov 16, dueDateDays 15 → due date Dec 1 → returns 1
 */
export function dueDateDaysToDayOfMonth(cycleEnd: Date, dueDateDays: number): number {
  const dueDate = new Date(cycleEnd);
  dueDate.setDate(dueDate.getDate() + dueDateDays);
  return dueDate.getDate();
}

/**
 * Given cycle end date and a target day of month (e.g. 1 for 1st), returns days after cycle end.
 * The due date is the FIRST OCCURRENCE of that day of month AFTER the cycle end.
 * 
 * CRITICAL: Uses first occurrence, which may be in the same month or next month.
 * 
 * Examples:
 * - cycleEnd Jan 10, dueDayOfMonth 15 → Jan 15 (5 days) - SAME month
 * - cycleEnd Jan 10, dueDayOfMonth 5 → Feb 5 (26 days) - NEXT month (5th already passed)
 * - cycleEnd Nov 16, dueDayOfMonth 1 → Dec 1 (15 days) - NEXT month
 */
export function dueDayOfMonthToDays(cycleEnd: Date, dueDayOfMonth: number): number {
  const cycleEndDay = cycleEnd.getDate();
  const cycleEndMonth = cycleEnd.getMonth();
  const cycleEndYear = cycleEnd.getFullYear();
  
  // Try same month first
  const sameMonthDue = new Date(cycleEndYear, cycleEndMonth, dueDayOfMonth);
  
  // If the target day is after cycle end in the same month, use it
  if (sameMonthDue > cycleEnd) {
    const diffMs = sameMonthDue.getTime() - cycleEnd.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }
  
  // Otherwise, use next month
  const nextMonthDue = new Date(cycleEndYear, cycleEndMonth + 1, dueDayOfMonth);
  const diffMs = nextMonthDue.getTime() - cycleEnd.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/** Ordinal suffix for day: 1→1st, 2→2nd, 3→3rd, 4→4th, etc. */
export function ordinalDay(n: number): string {
  if (n >= 11 && n <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

/**
 * Get the status of a billing cycle statement.
 * Returns whether the statement has closed and how many days until/since.
 */
export function getStatementStatus(cycleEnd: Date): {
  closed: boolean;
  daysUntilClose?: number;
  daysSinceClosed?: number;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(cycleEnd);
  end.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays >= 0) {
    // Statement hasn't closed yet
    return {
      closed: false,
      daysUntilClose: diffDays,
    };
  } else {
    // Statement has closed
    return {
      closed: true,
      daysSinceClosed: Math.abs(diffDays),
    };
  }
}
