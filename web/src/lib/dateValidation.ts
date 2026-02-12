/**
 * Date validation utilities for handling day-of-month edge cases.
 * Prevents invalid dates like Feb 31st which JavaScript silently rolls over.
 */

/**
 * Get the maximum valid day for a given month/year.
 * Handles leap years correctly.
 */
export function getMaxDayInMonth(year: number, month: number): number {
  // JavaScript Date: month 0-11, day 0 = last day of previous month
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Check if a day is valid for the given month/year.
 */
export function isValidDayForMonth(day: number, year: number, month: number): boolean {
  if (day < 1 || day > 31) return false;
  return day <= getMaxDayInMonth(year, month);
}

/**
 * Clamp a day to the maximum valid day for the given month/year.
 * Example: clampDayToMonth(31, 2024, 1) returns 29 (Feb 2024 is leap year)
 */
export function clampDayToMonth(day: number, year: number, month: number): number {
  const maxDay = getMaxDayInMonth(year, month);
  return Math.min(Math.max(1, day), maxDay);
}

/**
 * Check if a day might cause issues in some months.
 * Returns true for days 29-31 which don't exist in all months.
 */
export function isDayEdgeCase(day: number): boolean {
  return day >= 29 && day <= 31;
}

/**
 * Get a warning message for edge case days.
 */
export function getEdgeCaseWarning(day: number): string | null {
  if (day === 29) {
    return 'Day 29 will be adjusted to 28 in non-leap year February';
  }
  if (day === 30) {
    return 'Day 30 will be adjusted to 28/29 in February';
  }
  if (day === 31) {
    return 'Day 31 will be adjusted in months with fewer days (Feb, Apr, Jun, Sep, Nov)';
  }
  return null;
}
