# Changes Made - Complete History

This document records all changes made to the Credit Card Status application to address critical bugs, improve code quality, and enhance user experience.

---

## Table of Contents
1. [Round 1: Critical Date & UX Fixes](#round-1-critical-date--ux-fixes)
2. [Round 2: Logic Divergence & Semantic Fixes](#round-2-logic-divergence--semantic-fixes)
3. [Web Build Fix](#web-build-fix)
4. [Summary Statistics](#summary-statistics)

---

## Round 1: Critical Date & UX Fixes

### Date: Initial Implementation
**Status:** ✅ Completed

### Issues Addressed

#### 1. Overdue Semantics - Clamping to Zero
**Problem:** Current view clamped `daysUntilDue` to 0, hiding overdue information.

**Files Modified:**
- `lib/cycleUtils.ts`

**Changes Made:**
```typescript
// BEFORE
const daysUntilDue = Math.max(0, Math.ceil(...));

// AFTER
const daysUntilDue = Math.floor(...); // Allows negative values
```

**Impact:** Users now see negative values for overdue cards, providing accurate urgency information.

---

#### 2. Invalid Day-of-Month Combinations
**Problem:** Selecting day 31 for February silently rolled over to March 2/3, breaking calculations.

**Files Created:**
- `lib/dateValidation.ts` - Date validation utilities

**Functions Added:**
- `getMaxDayInMonth(year, month)` - Returns correct max day (handles leap years)
- `isValidDayForMonth(day, year, month)` - Validates if day exists in month
- `clampDayToMonth(day, year, month)` - Clamps invalid days to valid range
- `isDayEdgeCase(day)` - Detects days 29-31
- `getEdgeCaseWarning(day)` - Returns user-friendly warnings

**Files Modified:**
- `lib/cycleUtils.ts` - Updated to use date clamping
  - `getCurrentCycle()` - Clamps days before creating Date objects
  - `getPastCycle()` - Clamps when shifting months backward
  - `getNextCycle()` - Clamps when shifting months forward

**Impact:** Feb 31 now becomes Feb 28/29 instead of rolling to March. Same for other months with fewer days.

---

#### 3. Math.ceil vs Math.floor
**Problem:** Using `Math.ceil()` showed "3 days" when 2.1 days remained - misleading urgency.

**Files Modified:**
- `lib/cycleUtils.ts`

**Changes Made:**
```typescript
// Changed from Math.ceil to Math.floor
const daysLeftInCycle = Math.floor(...);
const daysUntilDue = Math.floor(...);
```

**Impact:** More accurate day calculations, doesn't inflate remaining time.

---

#### 4. Magic Numbers in Color Logic
**Problem:** Hardcoded thresholds (22, 52, 82) with no explanation.

**Files Created:**
- `lib/colorThresholds.ts`

**Constants Defined:**
```typescript
export const DUE_COLOR_THRESHOLDS = {
  PAST: { MIN_SAFE: 1, MAX_SAFE: 22 },
  CURRENT: { MIN_SAFE: 20, MAX_SAFE: 52 },
  NEXT: { MIN_SAFE: 36, MAX_SAFE: 82 }
}

export const COLORS = {
  RED: '#f87171',
  YELLOW: '#eab308',
  FOREST_GREEN: '#228b22'
}
```

**Files Modified:**
- `components/CardListItem.tsx` - Replaced magic numbers with named constants

**Impact:** Code is maintainable, thresholds are documented with reasoning.

---

#### 5. Statement Status Messaging
**Problem:** Users couldn't tell if statement had closed.

**Files Modified:**
- `lib/cycleUtils.ts` - Added `getStatementStatus(cycleEnd)` function
- `components/CardListItem.tsx` - Display statement status

**New Function:**
```typescript
export function getStatementStatus(cycleEnd: Date): {
  closed: boolean;
  daysUntilClose?: number;
  daysSinceClosed?: number;
}
```

**Display Messages:**
- "Statement closes in X days" (before cycle end)
- "Statement closes today" (on cycle end day)
- "Statement closed X days ago" (after cycle end)

**Impact:** Users now have clarity on billing cycle status.

---

#### 6. Environment Variable Validation
**Problem:** Missing env vars caused cryptic runtime failures.

**Files Modified:**
- `lib/supabase.ts`

**Changes Made:**
```typescript
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}\n\n` +
    'Please create a .env file with these variables.\n' +
    'See .env.example for the required format.'
  );
}
```

**Impact:** Developers get immediate, clear feedback instead of mysterious auth failures.

---

#### 7. Silent Delete Failures
**Problem:** Delete operation didn't handle errors, navigated back regardless of success.

**Files Modified:**
- `app/(app)/edit-card/[id].tsx`

**Changes Made:**
```typescript
// BEFORE
await supabase.from('credit_cards').delete().eq('id', id);
router.back();

// AFTER
try {
  const { error } = await supabase.from('credit_cards').delete().eq('id', id);
  if (error) throw error;
  router.back();
} catch (e: unknown) {
  Alert.alert('Error', msg);
}
```

**Impact:** Users know if deletion failed and can retry.

---

#### 8. Comprehensive Unit Tests
**Problem:** No tests for complex cycle calculations - high risk for finance app.

**Files Created:**
- `jest.config.js`
- `lib/__tests__/cycleUtils.test.ts` (36 test cases)
- `lib/__tests__/dateValidation.test.ts` (11 test cases)
- `TESTING.md`

**Test Coverage:**
- Normal cycles (14→13, 1→31)
- Same-month cycles
- February edge cases (leap year and non-leap year)
- Month boundaries (28, 29, 30, 31 day months)
- Overdue calculations (negative days)
- Past/current/next cycle shifting
- Statement status detection
- Date validation helpers

**Package.json Updates:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "@types/jest": "^29.5.0",
    "ts-jest": "^29.1.0"
  }
}
```

**Impact:** Critical date logic is now verified with automated tests.

---

### Documentation Created (Round 1)
- `IMPLEMENTATION_SUMMARY.md` - Detailed implementation guide
- `TESTING.md` - Testing philosophy and guide

---

## Round 2: Logic Divergence & Semantic Fixes

### Date: Second Implementation
**Status:** ✅ Completed

### Issues Addressed

#### 1. Logic Divergence - Split Reality
**Problem:** Mobile and web had different implementations of financial logic.

**Before:**
- Mobile: `lib/cycleUtils.ts` (correct, with fixes)
- Web: `web/src/lib/cycleUtils.ts` (old, broken - clamps to 0, uses ceil, no validation)

**Solution Attempted:**
Make web re-export from mobile:
```typescript
// web/src/lib/cycleUtils.ts
export * from '../../../lib/cycleUtils';
export * from '../../../lib/dateValidation';
export * from '../../../lib/colorThresholds';
```

**Issue Encountered:** Next.js/Turbopack couldn't resolve imports outside web directory.

**Final Solution:**
Copied shared files into web directory:
- `web/src/lib/colorThresholds.ts`
- `web/src/lib/dateValidation.ts`
- `web/src/lib/cycleUtils.ts` (full implementation)

**Files Modified:**
- `web/src/lib/cycleUtils.ts` - Now contains full implementation (copied from mobile)

**Impact:** Mobile and web now use identical logic. Cross-boundary tests verify this.

---

#### 2. "Due Today" Bug - Condition Order
**Problem:** Checking `<= 0` before `=== 0` meant "Due today" never triggered.

**Files Modified:**
- `components/CardListItem.tsx`

**Changes Made:**
```typescript
// BEFORE
card.daysUntilDue <= 0 
  ? "Overdue" 
  : card.daysUntilDue === 0  // NEVER REACHED!
  ? "Due today"
  : `${card.daysUntilDue} days`

// AFTER
card.daysUntilDue === 0
  ? "Due today"              // CHECKED FIRST
  : card.daysUntilDue < 0
  ? "Overdue"
  : `${card.daysUntilDue} days`
```

**Impact:** Users now see "Due today" when payment is due same day - psychologically important distinction.

---

#### 3. Due Date Conversion - First Occurrence Logic
**Problem:** Always used next month, even when due day exists in same month.

**Example of Bug:**
- Cycle ends: Jan 10
- User selects: 15th as due day
- Old logic: Feb 15 (36 days) ❌
- Correct: Jan 15 (5 days) ✅

**Files Modified:**
- `lib/cycleUtils.ts` - `dueDayOfMonthToDays()` function
- `lib/__tests__/cycleUtils.test.ts` - Updated test expectations

**Changes Made:**
```typescript
export function dueDayOfMonthToDays(cycleEnd: Date, dueDayOfMonth: number): number {
  // Try same month first
  const sameMonthDue = new Date(cycleEnd.getFullYear(), cycleEnd.getMonth(), dueDayOfMonth);
  
  // If target day is after cycle end in same month, use it
  if (sameMonthDue > cycleEnd) {
    return Math.round((sameMonthDue.getTime() - cycleEnd.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  // Otherwise, use next month
  const nextMonthDue = new Date(cycleEnd.getFullYear(), cycleEnd.getMonth() + 1, dueDayOfMonth);
  return Math.round((nextMonthDue.getTime() - cycleEnd.getTime()) / (1000 * 60 * 60 * 24));
}
```

**Impact:** More accurate due dates, potentially 30+ days shorter in many cases.

---

#### 4. Edge-Case Warnings - Now Visible
**Problem:** Warning functions existed but were never shown to users.

**Files Modified:**
- `app/(app)/add-card.tsx`
- `app/(app)/edit-card/[id].tsx`

**Changes Made:**
```typescript
{isDayEdgeCase(cycleStartDay) && (
  <Text style={styles.warningText}>
    {getEdgeCaseWarning(cycleStartDay)}
  </Text>
)}
```

**Warning Examples:**
- Day 29: "Day 29 will be adjusted to 28 in non-leap year February"
- Day 30: "Day 30 will be adjusted to 28/29 in February"
- Day 31: "Day 31 will be adjusted in months with fewer days (Feb, Apr, Jun, Sep, Nov)"

**Styling:**
```typescript
warningText: {
  color: '#f59e0b',      // Amber/orange
  fontSize: 12,
  fontStyle: 'italic',
}
```

**Impact:** Users understand edge case behavior, builds trust through transparency.

---

#### 5. Cross-Boundary Tests
**Problem:** No verification that mobile and web produce identical outputs.

**Files Created:**
- `lib/__tests__/cross-boundary.test.ts` (11 test cases, 50+ assertions)

**Test Coverage:**
- All cycle calculation functions (mobile vs web)
- Overdue calculations (negative values)
- Date conversion functions
- Format functions
- Full lifecycle test with realistic card configuration

**Example Test:**
```typescript
it('should produce identical results for wrapping cycle', () => {
  const refDate = new Date(2024, 0, 20);
  const mobileResult = mobileUtils.getCurrentCycle(14, 13, refDate);
  const webResult = webUtils.getCurrentCycle(14, 13, refDate);
  
  expect(mobileResult.cycleStart.getTime()).toBe(webResult.cycleStart.getTime());
  expect(mobileResult.cycleEnd.getTime()).toBe(webResult.cycleEnd.getTime());
  expect(mobileResult.daysLeftInCycle).toBe(webResult.daysLeftInCycle);
});
```

**Impact:** Prevents future logic divergence, CI can catch platform differences.

---

### Documentation Created (Round 2)
- `NEW_CRITIQUES_FIXES.md` - Second round implementation summary
- `ARCHITECTURE_FIX.md` - Logic divergence fix + monorepo migration plan

---

## Web Build Fix

### Date: Most Recent
**Status:** ✅ Completed

### Issue
Next.js/Turbopack couldn't resolve imports that go outside the `web/` directory:
```
Module not found: Can't resolve '../../../lib/colorThresholds'
```

### Solution
**Copied shared files into web directory** instead of using cross-directory imports:

1. ✅ `lib/colorThresholds.ts` → `web/src/lib/colorThresholds.ts`
2. ✅ `lib/dateValidation.ts` → `web/src/lib/dateValidation.ts`
3. ✅ Updated `web/src/lib/cycleUtils.ts` to contain full implementation

### Files Modified
- `web/src/lib/cycleUtils.ts` - Changed from re-exports to full implementation
- `ARCHITECTURE_FIX.md` - Updated with sync process documentation

### Files Created
- `web/src/lib/colorThresholds.ts` (copied)
- `web/src/lib/dateValidation.ts` (copied)
- `sync-web-logic.sh` - Script to sync mobile logic to web

### Sync Script Created
```bash
#!/bin/bash
# Syncs shared financial logic from mobile to web
cp lib/colorThresholds.ts web/src/lib/
cp lib/dateValidation.ts web/src/lib/
# Manual: Update web/src/lib/cycleUtils.ts implementation
npm test
```

### Impact
- Web app builds successfully
- Files are duplicated but cross-boundary tests ensure identical behavior
- Temporary solution until monorepo migration

---

## Summary Statistics

### Files Created (New)
1. `lib/dateValidation.ts` - Date validation utilities
2. `lib/colorThresholds.ts` - Color threshold constants
3. `lib/__tests__/cycleUtils.test.ts` - Cycle calculation tests
4. `lib/__tests__/dateValidation.test.ts` - Validation tests
5. `lib/__tests__/cross-boundary.test.ts` - Platform comparison tests
6. `jest.config.js` - Jest configuration
7. `web/src/lib/colorThresholds.ts` - Web copy of constants
8. `web/src/lib/dateValidation.ts` - Web copy of validation
9. `TESTING.md` - Testing guide
10. `IMPLEMENTATION_SUMMARY.md` - Round 1 fixes documentation
11. `NEW_CRITIQUES_FIXES.md` - Round 2 fixes documentation
12. `ARCHITECTURE_FIX.md` - Architecture documentation
13. `sync-web-logic.sh` - Sync script
14. `ChangesMade.md` - This file

### Files Modified (Updated)
1. `lib/cycleUtils.ts` - Date clamping, overdue semantics, statement status, due date conversion
2. `lib/supabase.ts` - Environment validation
3. `components/CardListItem.tsx` - Color logic, due today fix, display updates
4. `app/(app)/index.tsx` - Sorting consistency
5. `app/(app)/add-card.tsx` - Edge-case warnings
6. `app/(app)/edit-card/[id].tsx` - Edge-case warnings, delete error handling
7. `web/src/lib/cycleUtils.ts` - Full implementation (synced from mobile)
8. `package.json` - Test scripts and dependencies
9. `summary.md` - Updated with all changes

### Test Coverage
- **Total Test Cases:** 58 (36 + 11 + 11)
- **Cross-Platform Tests:** 11 test cases, 50+ assertions
- **Test Files:** 3
- **Coverage:** Date math, validation, platform consistency

### Critical Bugs Fixed
**Round 1:**
1. ✅ Overdue semantics (clamping)
2. ✅ Date validation (Feb 31 rollover)
3. ✅ Math accuracy (ceil → floor)
4. ✅ Code maintainability (magic numbers)
5. ✅ UX clarity (statement status)
6. ✅ Developer experience (env validation)
7. ✅ Error handling (delete failures)
8. ✅ Code quality (unit tests)

**Round 2:**
1. ✅ Logic divergence (mobile vs web)
2. ✅ "Due today" bug (condition order)
3. ✅ Due date conversion (first occurrence)
4. ✅ Edge warnings (user visibility)
5. ✅ Platform verification (cross-boundary tests)

**Web Build:**
1. ✅ Module resolution (Next.js imports)
2. ✅ File sync process (script created)

### Breaking Changes
**Minor:** Due date conversion now uses first occurrence after cycle end.
- **Example:** Cycle ends Jan 10, due day 15 → was 36 days (Feb 15), now 5 days (Jan 15)
- **Migration:** This is a bug fix - existing cards will show correct due dates after update

### Known Limitations
1. **File Duplication:** Web has copies of shared files - must be manually synced
2. **Temporary Solution:** Until monorepo structure is implemented
3. **Mitigation:** Cross-boundary tests + sync script

### Next Steps
1. **Short-term:** Use `sync-web-logic.sh` when updating financial logic
2. **Long-term:** Migrate to monorepo structure (see `ARCHITECTURE_FIX.md`)
3. **Continuous:** Run `npm test` before commits to verify logic correctness

---

## Verification Checklist

- [x] All tests pass (`npm test`)
- [x] Mobile app builds without errors
- [x] Web app builds without errors (`cd web && npm run dev`)
- [x] Date validation working (Feb 31 → Feb 28/29)
- [x] Overdue cards show negative values
- [x] "Due today" displays correctly
- [x] Edge-case warnings visible in UI
- [x] Statement status messages appear
- [x] Delete errors are caught and displayed
- [x] Cross-boundary tests verify mobile = web
- [x] Documentation updated (`summary.md`, architecture docs)

---

## References

- **Implementation Details:** See `IMPLEMENTATION_SUMMARY.md` and `NEW_CRITIQUES_FIXES.md`
- **Testing Guide:** See `TESTING.md`
- **Architecture Plan:** See `ARCHITECTURE_FIX.md`
- **Project Overview:** See `summary.md`

---

**Last Updated:** February 1, 2026
**Total Lines of Code Changed:** ~1000+
**Total Test Coverage:** 58 test cases
**Build Status:** ✅ All platforms building successfully
