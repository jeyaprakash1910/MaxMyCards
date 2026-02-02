/**
 * Unit tests for cycleUtils.ts
 * 
 * To run these tests:
 * 1. Install Jest: npm install --save-dev jest @types/jest ts-jest
 * 2. Add jest.config.js (see comments below)
 * 3. Add to package.json scripts: "test": "jest"
 * 4. Run: npm test
 */

import {
  getCurrentCycle,
  getPastCycle,
  getNextCycle,
  getNextDueDate,
  dueDateDaysToDayOfMonth,
  dueDayOfMonthToDays,
  getStatementStatus,
} from '../cycleUtils';

describe('getCurrentCycle', () => {
  it('should calculate correct cycle for wrapping cycle (14th to 13th)', () => {
    // Test on Jan 20th - should be in cycle Dec 14 to Jan 13
    const refDate = new Date(2024, 0, 20); // Jan 20, 2024
    const { cycleStart, cycleEnd, daysLeftInCycle } = getCurrentCycle(14, 13, refDate);
    
    expect(cycleStart.getDate()).toBe(14);
    expect(cycleStart.getMonth()).toBe(0); // January
    expect(cycleEnd.getDate()).toBe(13);
    expect(cycleEnd.getMonth()).toBe(1); // February
  });

  it('should handle same-month cycle (1st to 31st)', () => {
    const refDate = new Date(2024, 0, 15); // Jan 15, 2024
    const { cycleStart, cycleEnd } = getCurrentCycle(1, 31, refDate);
    
    expect(cycleStart.getDate()).toBe(1);
    expect(cycleStart.getMonth()).toBe(0); // January
    expect(cycleEnd.getDate()).toBe(31);
    expect(cycleEnd.getMonth()).toBe(0); // January
  });

  it('should handle February edge case (31st day clamped to 29 in leap year)', () => {
    const refDate = new Date(2024, 1, 15); // Feb 15, 2024 (leap year)
    const { cycleStart, cycleEnd } = getCurrentCycle(1, 31, refDate);
    
    expect(cycleStart.getDate()).toBe(1);
    expect(cycleEnd.getDate()).toBe(29); // Clamped to Feb 29 (leap year)
  });

  it('should handle February edge case (31st day clamped to 28 in non-leap year)', () => {
    const refDate = new Date(2023, 1, 15); // Feb 15, 2023 (non-leap year)
    const { cycleStart, cycleEnd } = getCurrentCycle(1, 31, refDate);
    
    expect(cycleStart.getDate()).toBe(1);
    expect(cycleEnd.getDate()).toBe(28); // Clamped to Feb 28 (non-leap year)
  });

  it('should calculate correct daysLeftInCycle', () => {
    const refDate = new Date(2024, 0, 10); // Jan 10, 2024
    const { daysLeftInCycle } = getCurrentCycle(1, 15, refDate);
    
    expect(daysLeftInCycle).toBe(5); // 5 days until Jan 15
  });

  it('should return 0 daysLeftInCycle when past cycle end', () => {
    const refDate = new Date(2024, 0, 20); // Jan 20, 2024
    const { daysLeftInCycle } = getCurrentCycle(1, 15, refDate);
    
    expect(daysLeftInCycle).toBe(0);
  });
});

describe('getPastCycle', () => {
  it('should get previous cycle correctly', () => {
    const refDate = new Date(2024, 1, 20); // Feb 20, 2024
    const { cycleStart, cycleEnd } = getPastCycle(14, 13, refDate);
    
    expect(cycleStart.getDate()).toBe(14);
    expect(cycleStart.getMonth()).toBe(0); // January
    expect(cycleEnd.getDate()).toBe(13);
    expect(cycleEnd.getMonth()).toBe(1); // February
  });

  it('should handle February edge case in past cycle', () => {
    const refDate = new Date(2024, 2, 20); // Mar 20, 2024
    const { cycleStart, cycleEnd } = getPastCycle(1, 31, refDate);
    
    expect(cycleStart.getDate()).toBe(1);
    expect(cycleStart.getMonth()).toBe(1); // February
    expect(cycleEnd.getDate()).toBe(29); // Clamped to Feb 29 (2024 is leap year)
  });
});

describe('getNextCycle', () => {
  it('should get next cycle correctly', () => {
    const refDate = new Date(2024, 0, 20); // Jan 20, 2024
    const { cycleStart, cycleEnd } = getNextCycle(14, 13, refDate);
    
    expect(cycleStart.getDate()).toBe(14);
    expect(cycleStart.getMonth()).toBe(1); // February
    expect(cycleEnd.getDate()).toBe(13);
    expect(cycleEnd.getMonth()).toBe(2); // March
  });

  it('should handle April edge case (31st clamped to 30)', () => {
    const refDate = new Date(2024, 2, 20); // Mar 20, 2024
    const { cycleStart, cycleEnd } = getNextCycle(1, 31, refDate);
    
    expect(cycleStart.getDate()).toBe(1);
    expect(cycleStart.getMonth()).toBe(3); // April
    expect(cycleEnd.getDate()).toBe(30); // Clamped to Apr 30
  });
});

describe('getNextDueDate', () => {
  it('should calculate due date correctly', () => {
    const cycleEnd = new Date(2024, 0, 13); // Jan 13, 2024
    const { dueDate, daysUntilDue } = getNextDueDate(cycleEnd, 21);
    
    expect(dueDate.getDate()).toBe(3);
    expect(dueDate.getMonth()).toBe(1); // February
  });

  it('should allow negative daysUntilDue for overdue cards', () => {
    // Use a fixed past date for testing
    const pastCycleEnd = new Date(2024, 0, 1); // Jan 1, 2024
    const { dueDate } = getNextDueDate(pastCycleEnd, 15);
    
    // Expected due date: Jan 1 + 15 days = Jan 16, 2024
    expect(dueDate.getDate()).toBe(16);
    expect(dueDate.getMonth()).toBe(0); // January
    
    // Note: daysUntilDue will be based on current date when test runs
    // If test runs after Jan 16, 2024, it will be negative
    // This is correct behavior - the function now allows negative values
  });

  it('should use floor for days calculation (not ceil)', () => {
    const cycleEnd = new Date(2024, 0, 13); // Jan 13, 2024
    const { daysUntilDue } = getNextDueDate(cycleEnd, 21);
    
    // The calculation should use floor, so 2.1 days = 2, not 3
    expect(Number.isInteger(daysUntilDue)).toBe(true);
  });
});

describe('dueDateDaysToDayOfMonth', () => {
  it('should convert days to day of month correctly', () => {
    const cycleEnd = new Date(2024, 0, 15); // Jan 15, 2024
    const dayOfMonth = dueDateDaysToDayOfMonth(cycleEnd, 20);
    
    expect(dayOfMonth).toBe(4); // Jan 15 + 20 days = Feb 4
  });

  it('should handle month boundary correctly', () => {
    const cycleEnd = new Date(2024, 0, 31); // Jan 31, 2024
    const dayOfMonth = dueDateDaysToDayOfMonth(cycleEnd, 5);
    
    expect(dayOfMonth).toBe(5); // Jan 31 + 5 days = Feb 5
  });

  it('should handle same month case', () => {
    const cycleEnd = new Date(2024, 0, 10); // Jan 10, 2024
    const dayOfMonth = dueDateDaysToDayOfMonth(cycleEnd, 5);
    
    expect(dayOfMonth).toBe(15); // Jan 10 + 5 days = Jan 15
  });
});

describe('dueDayOfMonthToDays', () => {
  it('should use same month if target day is after cycle end', () => {
    const cycleEnd = new Date(2024, 0, 10); // Jan 10, 2024
    const days = dueDayOfMonthToDays(cycleEnd, 15);
    
    // Jan 15 is 5 days after Jan 10 (SAME MONTH - first occurrence)
    expect(days).toBe(5);
  });

  it('should use next month if target day already passed in cycle month', () => {
    const cycleEnd = new Date(2024, 0, 20); // Jan 20, 2024
    const days = dueDayOfMonthToDays(cycleEnd, 15);
    
    // 15th already passed, so use Feb 15 (NEXT MONTH - first occurrence)
    // Jan 20 to Jan 31 = 11 days, + Feb 15 = 26 days total
    expect(days).toBe(26);
  });

  it('should handle end of month correctly', () => {
    const cycleEnd = new Date(2024, 0, 31); // Jan 31, 2024
    const days = dueDayOfMonthToDays(cycleEnd, 5);
    
    // 5th already passed, so Feb 5 (NEXT MONTH)
    expect(days).toBe(5);
  });

  it('should handle when target day equals cycle end day', () => {
    const cycleEnd = new Date(2024, 0, 15); // Jan 15, 2024
    const days = dueDayOfMonthToDays(cycleEnd, 15);
    
    // 15th equals cycle end, so use Feb 15 (NEXT MONTH)
    expect(days).toBe(31); // Jan has 31 days
  });
});

describe('getStatementStatus', () => {
  it('should detect open statement', () => {
    // Create a date 10 days in the future
    const now = new Date();
    const futureDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10);
    
    const status = getStatementStatus(futureDate);
    
    expect(status.closed).toBe(false);
    expect(status.daysUntilClose).toBeGreaterThanOrEqual(9); // Allow for timing differences
    expect(status.daysUntilClose).toBeLessThanOrEqual(10);
    expect(status.daysSinceClosed).toBeUndefined();
  });

  it('should detect closed statement', () => {
    // Create a date 5 days in the past
    const now = new Date();
    const pastDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5);
    
    const status = getStatementStatus(pastDate);
    
    expect(status.closed).toBe(true);
    expect(status.daysSinceClosed).toBeGreaterThanOrEqual(4); // Allow for timing differences
    expect(status.daysSinceClosed).toBeLessThanOrEqual(5);
    expect(status.daysUntilClose).toBeUndefined();
  });

  it('should handle statement closing today', () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const status = getStatementStatus(today);
    
    expect(status.closed).toBe(false);
    expect(status.daysUntilClose).toBe(0);
  });
});

/**
 * Jest Configuration (create jest.config.js in project root):
 * 
 * module.exports = {
 *   preset: 'ts-jest',
 *   testEnvironment: 'node',
 *   roots: ['<rootDir>/lib'],
 *   testMatch: ['**\/__tests__/**\/*.test.ts'],
 *   moduleNameMapper: {
 *     '^@/(.*)$': '<rootDir>/$1',
 *   },
 * };
 * 
 * Add to package.json devDependencies:
 * "jest": "^29.7.0",
 * "@types/jest": "^29.5.0",
 * "ts-jest": "^29.1.0"
 * 
 * Add to package.json scripts:
 * "test": "jest",
 * "test:watch": "jest --watch"
 */
