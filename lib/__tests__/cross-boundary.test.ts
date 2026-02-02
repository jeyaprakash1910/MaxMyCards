/**
 * Cross-Boundary Tests
 * 
 * These tests ensure that mobile and web implementations produce
 * IDENTICAL outputs for identical inputs.
 * 
 * This prevents logic divergence between platforms.
 */

import * as mobileUtils from '../cycleUtils';
import * as webUtils from '../../web/src/lib/cycleUtils';

describe('Cross-Boundary: Mobile vs Web Logic', () => {
  describe('getCurrentCycle', () => {
    it('should produce identical results for wrapping cycle', () => {
      const refDate = new Date(2024, 0, 20); // Jan 20, 2024
      const cycleStartDay = 14;
      const cycleEndDay = 13;
      
      const mobileResult = mobileUtils.getCurrentCycle(cycleStartDay, cycleEndDay, refDate);
      const webResult = webUtils.getCurrentCycle(cycleStartDay, cycleEndDay, refDate);
      
      expect(mobileResult.cycleStart.getTime()).toBe(webResult.cycleStart.getTime());
      expect(mobileResult.cycleEnd.getTime()).toBe(webResult.cycleEnd.getTime());
      expect(mobileResult.daysLeftInCycle).toBe(webResult.daysLeftInCycle);
    });

    it('should produce identical results for same-month cycle', () => {
      const refDate = new Date(2024, 0, 15); // Jan 15, 2024
      const cycleStartDay = 1;
      const cycleEndDay = 31;
      
      const mobileResult = mobileUtils.getCurrentCycle(cycleStartDay, cycleEndDay, refDate);
      const webResult = webUtils.getCurrentCycle(cycleStartDay, cycleEndDay, refDate);
      
      expect(mobileResult.cycleStart.getTime()).toBe(webResult.cycleStart.getTime());
      expect(mobileResult.cycleEnd.getTime()).toBe(webResult.cycleEnd.getTime());
      expect(mobileResult.daysLeftInCycle).toBe(webResult.daysLeftInCycle);
    });

    it('should produce identical results for February edge case', () => {
      const refDate = new Date(2024, 1, 15); // Feb 15, 2024 (leap year)
      const cycleStartDay = 1;
      const cycleEndDay = 31;
      
      const mobileResult = mobileUtils.getCurrentCycle(cycleStartDay, cycleEndDay, refDate);
      const webResult = webUtils.getCurrentCycle(cycleStartDay, cycleEndDay, refDate);
      
      // Both should clamp to Feb 29
      expect(mobileResult.cycleEnd.getDate()).toBe(29);
      expect(webResult.cycleEnd.getDate()).toBe(29);
      expect(mobileResult.cycleStart.getTime()).toBe(webResult.cycleStart.getTime());
      expect(mobileResult.cycleEnd.getTime()).toBe(webResult.cycleEnd.getTime());
    });
  });

  describe('getNextDueDate', () => {
    it('should produce identical results for future due date', () => {
      const cycleEnd = new Date(2024, 0, 13); // Jan 13, 2024
      const dueDateDays = 21;
      
      const mobileResult = mobileUtils.getNextDueDate(cycleEnd, dueDateDays);
      const webResult = webUtils.getNextDueDate(cycleEnd, dueDateDays);
      
      expect(mobileResult.dueDate.getTime()).toBe(webResult.dueDate.getTime());
      expect(mobileResult.daysUntilDue).toBe(webResult.daysUntilDue);
    });

    it('should allow negative daysUntilDue for overdue (no clamping)', () => {
      const pastCycleEnd = new Date(2020, 0, 1); // Jan 1, 2020 (definitely past)
      const dueDateDays = 15;
      
      const mobileResult = mobileUtils.getNextDueDate(pastCycleEnd, dueDateDays);
      const webResult = webUtils.getNextDueDate(pastCycleEnd, dueDateDays);
      
      // Both should have negative daysUntilDue
      expect(mobileResult.daysUntilDue).toBeLessThan(0);
      expect(webResult.daysUntilDue).toBeLessThan(0);
      expect(mobileResult.daysUntilDue).toBe(webResult.daysUntilDue);
    });
  });

  describe('getPastCycle', () => {
    it('should produce identical results', () => {
      const refDate = new Date(2024, 1, 20); // Feb 20, 2024
      const cycleStartDay = 14;
      const cycleEndDay = 13;
      
      const mobileResult = mobileUtils.getPastCycle(cycleStartDay, cycleEndDay, refDate);
      const webResult = webUtils.getPastCycle(cycleStartDay, cycleEndDay, refDate);
      
      expect(mobileResult.cycleStart.getTime()).toBe(webResult.cycleStart.getTime());
      expect(mobileResult.cycleEnd.getTime()).toBe(webResult.cycleEnd.getTime());
    });
  });

  describe('getNextCycle', () => {
    it('should produce identical results', () => {
      const refDate = new Date(2024, 0, 20); // Jan 20, 2024
      const cycleStartDay = 14;
      const cycleEndDay = 13;
      
      const mobileResult = mobileUtils.getNextCycle(cycleStartDay, cycleEndDay, refDate);
      const webResult = webUtils.getNextCycle(cycleStartDay, cycleEndDay, refDate);
      
      expect(mobileResult.cycleStart.getTime()).toBe(webResult.cycleStart.getTime());
      expect(mobileResult.cycleEnd.getTime()).toBe(webResult.cycleEnd.getTime());
    });
  });

  describe('dueDateDaysToDayOfMonth', () => {
    it('should produce identical results', () => {
      const cycleEnd = new Date(2024, 0, 15); // Jan 15, 2024
      const dueDateDays = 20;
      
      const mobileResult = mobileUtils.dueDateDaysToDayOfMonth(cycleEnd, dueDateDays);
      const webResult = webUtils.dueDateDaysToDayOfMonth(cycleEnd, dueDateDays);
      
      expect(mobileResult).toBe(webResult);
    });
  });

  describe('dueDayOfMonthToDays', () => {
    it('should produce identical results for same month case', () => {
      const cycleEnd = new Date(2024, 0, 10); // Jan 10, 2024
      const dueDayOfMonth = 15;
      
      const mobileResult = mobileUtils.dueDayOfMonthToDays(cycleEnd, dueDayOfMonth);
      const webResult = webUtils.dueDayOfMonthToDays(cycleEnd, dueDayOfMonth);
      
      // Should use Jan 15 (same month) = 5 days
      expect(mobileResult).toBe(5);
      expect(webResult).toBe(5);
      expect(mobileResult).toBe(webResult);
    });

    it('should produce identical results for next month case', () => {
      const cycleEnd = new Date(2024, 0, 20); // Jan 20, 2024
      const dueDayOfMonth = 15;
      
      const mobileResult = mobileUtils.dueDayOfMonthToDays(cycleEnd, dueDayOfMonth);
      const webResult = webUtils.dueDayOfMonthToDays(cycleEnd, dueDayOfMonth);
      
      // 15th already passed, should use Feb 15
      expect(mobileResult).toBe(webResult);
    });
  });

  describe('formatCycleRange', () => {
    it('should produce identical formatted strings', () => {
      const cycleStart = new Date(2024, 0, 14); // Jan 14, 2024
      const cycleEnd = new Date(2024, 1, 13); // Feb 13, 2024
      
      const mobileResult = mobileUtils.formatCycleRange(cycleStart, cycleEnd);
      const webResult = webUtils.formatCycleRange(cycleStart, cycleEnd);
      
      expect(mobileResult).toBe(webResult);
    });
  });

  describe('formatDueDate', () => {
    it('should produce identical formatted strings', () => {
      const dueDate = new Date(2024, 1, 3); // Feb 3, 2024
      
      const mobileResult = mobileUtils.formatDueDate(dueDate);
      const webResult = webUtils.formatDueDate(dueDate);
      
      expect(mobileResult).toBe(webResult);
    });
  });

  describe('ordinalDay', () => {
    it('should produce identical ordinal strings', () => {
      const testCases = [1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 31];
      
      testCases.forEach((day) => {
        const mobileResult = mobileUtils.ordinalDay(day);
        const webResult = webUtils.ordinalDay(day);
        expect(mobileResult).toBe(webResult);
      });
    });
  });

  describe('Complex Scenario: Full Card Lifecycle', () => {
    it('should produce identical outputs for realistic card configuration', () => {
      // Realistic scenario: HDFC Regalia card
      // Cycle: 14th to 13th, Due 21 days after cycle end
      const refDate = new Date(2024, 0, 25); // Jan 25, 2024
      const cycleStartDay = 14;
      const cycleEndDay = 13;
      const dueDateDays = 21;
      
      // Get current cycle (both platforms)
      const mobileCycle = mobileUtils.getCurrentCycle(cycleStartDay, cycleEndDay, refDate);
      const webCycle = webUtils.getCurrentCycle(cycleStartDay, cycleEndDay, refDate);
      
      expect(mobileCycle.cycleStart.getTime()).toBe(webCycle.cycleStart.getTime());
      expect(mobileCycle.cycleEnd.getTime()).toBe(webCycle.cycleEnd.getTime());
      expect(mobileCycle.daysLeftInCycle).toBe(webCycle.daysLeftInCycle);
      
      // Get due date (both platforms)
      const mobileDue = mobileUtils.getNextDueDate(mobileCycle.cycleEnd, dueDateDays);
      const webDue = webUtils.getNextDueDate(webCycle.cycleEnd, dueDateDays);
      
      expect(mobileDue.dueDate.getTime()).toBe(webDue.dueDate.getTime());
      expect(mobileDue.daysUntilDue).toBe(webDue.daysUntilDue);
      
      // Get past and next cycles (both platforms)
      const mobilePast = mobileUtils.getPastCycle(cycleStartDay, cycleEndDay, refDate);
      const webPast = webUtils.getPastCycle(cycleStartDay, cycleEndDay, refDate);
      
      expect(mobilePast.cycleStart.getTime()).toBe(webPast.cycleStart.getTime());
      expect(mobilePast.cycleEnd.getTime()).toBe(webPast.cycleEnd.getTime());
      
      const mobileNext = mobileUtils.getNextCycle(cycleStartDay, cycleEndDay, refDate);
      const webNext = webUtils.getNextCycle(cycleStartDay, cycleEndDay, refDate);
      
      expect(mobileNext.cycleStart.getTime()).toBe(webNext.cycleStart.getTime());
      expect(mobileNext.cycleEnd.getTime()).toBe(webNext.cycleEnd.getTime());
    });
  });
});

/**
 * These tests will FAIL if:
 * 1. Web uses old clamping logic (Math.max(0, ...))
 * 2. Web uses Math.ceil instead of Math.floor
 * 3. Web doesn't clamp dates for February
 * 4. Any formula differs between platforms
 * 
 * If these tests pass, mobile and web are using the SAME logic.
 */
