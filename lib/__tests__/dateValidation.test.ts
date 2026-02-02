/**
 * Unit tests for dateValidation.ts
 */

import {
  getMaxDayInMonth,
  isValidDayForMonth,
  clampDayToMonth,
  isDayEdgeCase,
  getEdgeCaseWarning,
} from '../dateValidation';

describe('getMaxDayInMonth', () => {
  it('should return 31 for months with 31 days', () => {
    expect(getMaxDayInMonth(2024, 0)).toBe(31); // January
    expect(getMaxDayInMonth(2024, 2)).toBe(31); // March
    expect(getMaxDayInMonth(2024, 4)).toBe(31); // May
    expect(getMaxDayInMonth(2024, 6)).toBe(31); // July
    expect(getMaxDayInMonth(2024, 7)).toBe(31); // August
    expect(getMaxDayInMonth(2024, 9)).toBe(31); // October
    expect(getMaxDayInMonth(2024, 11)).toBe(31); // December
  });

  it('should return 30 for months with 30 days', () => {
    expect(getMaxDayInMonth(2024, 3)).toBe(30); // April
    expect(getMaxDayInMonth(2024, 5)).toBe(30); // June
    expect(getMaxDayInMonth(2024, 8)).toBe(30); // September
    expect(getMaxDayInMonth(2024, 10)).toBe(30); // November
  });

  it('should return 29 for February in leap year', () => {
    expect(getMaxDayInMonth(2024, 1)).toBe(29); // Feb 2024 (leap year)
    expect(getMaxDayInMonth(2020, 1)).toBe(29); // Feb 2020 (leap year)
  });

  it('should return 28 for February in non-leap year', () => {
    expect(getMaxDayInMonth(2023, 1)).toBe(28); // Feb 2023 (non-leap year)
    expect(getMaxDayInMonth(2021, 1)).toBe(28); // Feb 2021 (non-leap year)
  });
});

describe('isValidDayForMonth', () => {
  it('should return true for valid days', () => {
    expect(isValidDayForMonth(15, 2024, 0)).toBe(true); // Jan 15
    expect(isValidDayForMonth(29, 2024, 1)).toBe(true); // Feb 29 (leap year)
    expect(isValidDayForMonth(30, 2024, 3)).toBe(true); // Apr 30
  });

  it('should return false for invalid days', () => {
    expect(isValidDayForMonth(0, 2024, 0)).toBe(false); // Day 0
    expect(isValidDayForMonth(32, 2024, 0)).toBe(false); // Day 32
    expect(isValidDayForMonth(31, 2024, 3)).toBe(false); // Apr 31 (doesn't exist)
    expect(isValidDayForMonth(30, 2024, 1)).toBe(false); // Feb 30 (doesn't exist)
    expect(isValidDayForMonth(29, 2023, 1)).toBe(false); // Feb 29 (non-leap year)
  });
});

describe('clampDayToMonth', () => {
  it('should not change valid days', () => {
    expect(clampDayToMonth(15, 2024, 0)).toBe(15); // Jan 15
    expect(clampDayToMonth(29, 2024, 1)).toBe(29); // Feb 29 (leap year)
  });

  it('should clamp to maximum day for invalid high values', () => {
    expect(clampDayToMonth(31, 2024, 1)).toBe(29); // Feb 31 → 29 (leap year)
    expect(clampDayToMonth(31, 2023, 1)).toBe(28); // Feb 31 → 28 (non-leap year)
    expect(clampDayToMonth(31, 2024, 3)).toBe(30); // Apr 31 → 30
  });

  it('should clamp to minimum day (1) for invalid low values', () => {
    expect(clampDayToMonth(0, 2024, 0)).toBe(1);
    expect(clampDayToMonth(-5, 2024, 0)).toBe(1);
  });

  it('should handle extreme values', () => {
    expect(clampDayToMonth(100, 2024, 1)).toBe(29); // Feb 100 → 29
    expect(clampDayToMonth(-100, 2024, 0)).toBe(1); // -100 → 1
  });
});

describe('isDayEdgeCase', () => {
  it('should return true for days 29-31', () => {
    expect(isDayEdgeCase(29)).toBe(true);
    expect(isDayEdgeCase(30)).toBe(true);
    expect(isDayEdgeCase(31)).toBe(true);
  });

  it('should return false for days 1-28', () => {
    expect(isDayEdgeCase(1)).toBe(false);
    expect(isDayEdgeCase(15)).toBe(false);
    expect(isDayEdgeCase(28)).toBe(false);
  });
});

describe('getEdgeCaseWarning', () => {
  it('should return appropriate warning for day 29', () => {
    const warning = getEdgeCaseWarning(29);
    expect(warning).toContain('29');
    expect(warning).toContain('February');
  });

  it('should return appropriate warning for day 30', () => {
    const warning = getEdgeCaseWarning(30);
    expect(warning).toContain('30');
    expect(warning).toContain('February');
  });

  it('should return appropriate warning for day 31', () => {
    const warning = getEdgeCaseWarning(31);
    expect(warning).toContain('31');
    expect(warning).toContain('Feb');
  });

  it('should return null for non-edge case days', () => {
    expect(getEdgeCaseWarning(15)).toBeNull();
    expect(getEdgeCaseWarning(28)).toBeNull();
  });
});
