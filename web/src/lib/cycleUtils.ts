/**
 * SHARED FINANCE LOGIC - Single Source of Truth
 * 
 * This file contains the core financial calculations shared between mobile and web.
 * These files are synced from the mobile lib/ directory.
 * 
 * IMPORTANT: Do not modify these files directly in web/src/lib/
 * Make changes in the root lib/ directory and copy to web.
 * 
 * See ARCHITECTURE_FIX.md for migration plan to proper monorepo structure.
 */

// Re-export date validation utilities
export {
  getMaxDayInMonth,
  isValidDayForMonth,
  clampDayToMonth,
  isDayEdgeCase,
  getEdgeCaseWarning,
} from './dateValidation';

// Re-export color thresholds
export { DUE_COLOR_THRESHOLDS, COLORS } from './colorThresholds';

// Cycle calculation functions are defined below
// (These are copied from root lib/cycleUtils.ts to maintain sync)
import { clampDayToMonth } from './dateValidation';

export function getCurrentCycle(
  cycleStartDay: number,
  cycleEndDay: number,
  refDate: Date = new Date()
): { cycleStart: Date; cycleEnd: Date; daysLeftInCycle: number } {
  const today = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate());

  let cycleStart: Date;
  let cycleEnd: Date;

  const day = today.getDate();
  const month = today.getMonth();
  const year = today.getFullYear();

  if (cycleEndDay < cycleStartDay) {
    if (day >= cycleStartDay) {
      const clampedStartDay = clampDayToMonth(cycleStartDay, year, month);
      const clampedEndDay = clampDayToMonth(cycleEndDay, year, month + 1);
      cycleStart = new Date(year, month, clampedStartDay);
      cycleEnd = new Date(year, month + 1, clampedEndDay);
    } else {
      const clampedStartDay = clampDayToMonth(cycleStartDay, year, month - 1);
      const clampedEndDay = clampDayToMonth(cycleEndDay, year, month);
      cycleStart = new Date(year, month - 1, clampedStartDay);
      cycleEnd = new Date(year, month, clampedEndDay);
    }
  } else {
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

export function dueDateDaysToDayOfMonth(cycleEnd: Date, dueDateDays: number): number {
  const dueDate = new Date(cycleEnd);
  dueDate.setDate(dueDate.getDate() + dueDateDays);
  return dueDate.getDate();
}

export function dueDayOfMonthToDays(cycleEnd: Date, dueDayOfMonth: number): number {
  const cycleEndDay = cycleEnd.getDate();
  const cycleEndMonth = cycleEnd.getMonth();
  const cycleEndYear = cycleEnd.getFullYear();
  
  const sameMonthDue = new Date(cycleEndYear, cycleEndMonth, dueDayOfMonth);
  
  if (sameMonthDue > cycleEnd) {
    const diffMs = sameMonthDue.getTime() - cycleEnd.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }
  
  const nextMonthDue = new Date(cycleEndYear, cycleEndMonth + 1, dueDayOfMonth);
  const diffMs = nextMonthDue.getTime() - cycleEnd.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function ordinalDay(n: number): string {
  if (n >= 11 && n <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

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
    return {
      closed: false,
      daysUntilClose: diffDays,
    };
  } else {
    return {
      closed: true,
      daysSinceClosed: Math.abs(diffDays),
    };
  }
}
