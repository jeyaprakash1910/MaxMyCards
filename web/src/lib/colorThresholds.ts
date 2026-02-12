/**
 * Color thresholds for due date visualization.
 * These determine when cards transition from yellow (warning) to green (safe).
 */

export const DUE_COLOR_THRESHOLDS = {
  /**
   * PAST view: Days after the due date has passed
   * - MIN_SAFE (1): Just passed due date, start transitioning from yellow
   * - MAX_SAFE (22): ~3 weeks past due, fully green (unlikely to still be unpaid)
   */
  PAST: {
    MIN_SAFE: 1,
    MAX_SAFE: 22,
  },

  /**
   * CURRENT view: Days until the due date
   * - MIN_SAFE (20): ~3 weeks before due, start transitioning from yellow
   * - MAX_SAFE (52): ~7 weeks before due (typical cycle ~31 days + grace ~21 days)
   * 
   * Reasoning: 52 days = average billing cycle (31) + average grace period (21)
   * This means cards just after statement close are green, transitioning to yellow
   * as the due date approaches.
   */
  CURRENT: {
    MIN_SAFE: 20,
    MAX_SAFE: 52,
  },

  /**
   * NEXT view: Days until the future due date
   * - MIN_SAFE (36): ~5 weeks before due, start transitioning from yellow
   * - MAX_SAFE (82): ~12 weeks before due (current cycle + next cycle + grace)
   * 
   * Reasoning: 82 days ≈ current cycle (31) + next cycle (31) + grace (20)
   * This provides a longer comfort zone since the due date is far in the future.
   */
  NEXT: {
    MIN_SAFE: 36,
    MAX_SAFE: 82,
  },
} as const;

/**
 * Standard colors used across the app
 */
export const COLORS = {
  RED: '#f87171',         // Overdue or very urgent
  YELLOW: '#eab308',      // Warning zone
  FOREST_GREEN: '#228b22', // Safe zone
} as const;
