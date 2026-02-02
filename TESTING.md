# Testing Guide

This project includes unit tests for critical date calculation logic.

## Setup

Install Jest dependencies:

```bash
npm install
```

The following dependencies are configured in `package.json`:
- `jest` - Testing framework
- `ts-jest` - TypeScript support for Jest
- `@types/jest` - TypeScript definitions for Jest

## Running Tests

Run all tests:
```bash
npm test
```

Run tests in watch mode (auto-rerun on file changes):
```bash
npm run test:watch
```

Run tests with coverage report:
```bash
npm run test:coverage
```

## Test Files

Tests are located in `lib/__tests__/`:

- `cycleUtils.test.ts` - Tests for billing cycle calculations
- `dateValidation.test.ts` - Tests for date validation helpers

## Test Coverage

The tests cover:

### Critical Date Calculations
- ✅ Normal billing cycles (e.g., 14th to 13th)
- ✅ Same-month cycles (e.g., 1st to 31st)
- ✅ February edge cases (leap year and non-leap year)
- ✅ Month boundaries (30-day and 31-day months)
- ✅ Overdue calculations (negative days)
- ✅ Past/current/next cycle shifting

### Date Validation
- ✅ Maximum days per month (including leap years)
- ✅ Valid day detection
- ✅ Day clamping to valid ranges
- ✅ Edge case detection (days 29-31)
- ✅ Warning message generation

## Why These Tests Matter

Credit card billing involves complex date math with several edge cases:

1. **Month boundaries**: Feb (28/29 days), Apr/Jun/Sep/Nov (30 days), others (31 days)
2. **Leap years**: February can have 28 or 29 days
3. **Wrapping cycles**: Cycles that span two months (e.g., 14th to 13th)
4. **Overdue semantics**: Negative days for past-due dates
5. **Date arithmetic**: JavaScript Date rollover can silently corrupt calculations

These tests ensure correctness for all combinations and prevent silent failures.

## Continuous Testing

Consider running tests:
- Before committing changes (`git commit`)
- In CI/CD pipeline
- When modifying date-related code
- When adding new features that use dates

## Future Test Additions

Consider adding:
- Integration tests for Supabase queries
- Component tests for React Native screens
- E2E tests for critical user flows
