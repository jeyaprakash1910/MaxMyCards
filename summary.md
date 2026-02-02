## Credit Card Status — Project Summary (current)

### What this repo contains
This repository currently contains:
- **Mobile app (Expo / React Native)** in the repo root (`app/`, `lib/`, `components/`)
- **Web app (Next.js)** inside `web/`
- **Shared Supabase backend** schema in `supabase/`

Both apps use the same Supabase tables and implement the same core product:
- Track credit cards by storing:
  - **Billing cycle start day** (1–31)
  - **Billing cycle end day** (1–31)
  - **Payment due date** as **N days after cycle end**
- Compute and display:
  - Billing cycle ranges (**Past / Current / Next**)
  - Due dates and days remaining (including overdue)
  - Sort/filter by month and due/cycle metrics

---

### Tech stack
#### Mobile (root)
- **Expo + React Native**
- **TypeScript** (`strict: true`)
- **Navigation**: `expo-router`
- **Supabase**:
  - Auth: email/password
  - Postgres: RLS-protected tables
  - Storage: optional for catalog images
- **Session persistence**: Supabase auth stored in **`expo-secure-store`**
- **Testing**: **Jest + ts-jest** unit tests for date/cycle math

#### Web (`web/`)
- **Next.js (App Router)** + **React**
- **Tailwind CSS**
- **Supabase SSR** (`@supabase/ssr`)
  - Middleware refreshes sessions and writes cookies

---

## Shared backend (Supabase)

### Database schema (`supabase/schema.sql`)

#### `card_catalog` (public reference data)
- Columns: `id`, `name`, `image_url`, `bank`, `created_at`
- RLS enabled
- Policy: **public read** (anyone can `select`)

#### `credit_cards` (per-user)
- Columns:
  - `id`
  - `user_id` (FK to `auth.users`)
  - `name`
  - `image_url` (optional)
  - `catalog_id` (optional FK to `card_catalog`)
  - `cycle_start_day` (1–31)
  - `cycle_end_day` (1–31)
  - `due_date_days` (> 0)
  - `created_at`
- RLS enabled
- Policy: users can **CRUD only their own rows** (`auth.uid() = user_id`)

### Optional: Storage for images
Docs reference a Supabase Storage bucket:
- Bucket name: `card-images`
- Intended: **public reads** (so apps can display catalog images)

`supabase/seed-catalog.sql` can seed `card_catalog` once you replace `REPLACE_WITH_STORAGE_URL` with real public image URLs (images are provided locally in `Credit Cards/`).

---

## Mobile app (Expo / React Native)

### Key folders/files
- Routes:
  - `app/index.tsx`: session gate → routes to `/(app)` or `/(auth)/login`
  - `app/(auth)/login.tsx`: login/sign-up UI
  - `app/(app)/index.tsx`: dashboard (list + month filter + sorting)
  - `app/(app)/add-card.tsx`: create a card
  - `app/(app)/edit-card/[id].tsx`: edit/delete a card
- Core logic:
  - `lib/supabase.ts`: Supabase client with SecureStore adapter **and env validation**
  - `lib/auth.ts`: `signUp`, `signIn`, `signOut`, `getSession`
  - `lib/catalog.ts`: fetch/search catalog
  - `lib/cycleUtils.ts`: cycle math + due math + statement status
  - `lib/dateValidation.ts`: day-of-month clamping helpers
  - `lib/colorThresholds.ts`: centralized colors + threshold constants
  - `lib/types.ts`: `CreditCard`, `CreditCardWithComputed`
- UI components:
  - `components/FilterSortBar.tsx`
  - `components/CardListItem.tsx`
  - `components/SortToggle.tsx` (present but not used in main flow)

### Environment variables (mobile)
The mobile app requires:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

`lib/supabase.ts` now validates these at startup and throws a clear error if missing (references `.env.example`).

### App flow (mobile)
#### Startup gate
`app/index.tsx`:
- calls `getSession()` → `supabase.auth.getSession()`
- if session exists → `/(app)`
- else → `/(auth)/login`

#### Auth
`app/(auth)/login.tsx`:
- Toggle between sign-up and sign-in
- Password length validated (>= 6)
- Normalizes common Supabase errors (e.g., email not confirmed, invalid credentials)

#### Dashboard / list
`app/(app)/index.tsx`:
- Fetches current user via `supabase.auth.getUser()`
- Reads `credit_cards` filtered by `user_id`
- Builds `CreditCardWithComputed` per row (current/past/next cycles & due dates)
- UI features:
  - Month: **Past / Current / Next**
  - Sort by: **Due / Cycle**
  - Order: **Asc / Desc**
  - Pull-to-refresh
  - FAB to add card
- Logout calls `signOut()` and navigates back to login.

#### Create card
`app/(app)/add-card.tsx`:
- Loads `card_catalog` and lets user pick or type a custom name
- Stores:
  - `name`, optional `image_url`, optional `catalog_id`
  - `cycle_start_day`, `cycle_end_day`, `due_date_days`
- **Shows edge-case warnings** when selecting days 29-31 ⭐ **NEW**
  - Example: "Day 31 will be adjusted in months with fewer days (Feb, Apr, Jun, Sep, Nov)"
- Due date picker has two modes:
  - **By days**: choose `due_date_days`
  - **By date**: choose day-of-month and convert to `due_date_days`
    - **Fixed:** Now uses first occurrence after cycle end (may be same month)

#### Edit/delete card
`app/(app)/edit-card/[id].tsx`:
- Loads the card by `id`
- Updates fields similarly to Add
- **Shows edge-case warnings** for days 29-31 ⭐ **NEW**
- Delete:
  - Uses try/catch for error handling ✅ **FIXED**
  - Shows alert on failure ✅ **FIXED**
  - Navigates back only on success ✅ **FIXED**

---

## Date, cycle, and status logic (mobile)

### Date validation utilities (`lib/dateValidation.ts`)
Purpose: avoid JS `Date` rollover bugs such as **Feb 31 → Mar 2/3**.

Exports:
- `getMaxDayInMonth(year, month)`
- `isValidDayForMonth(day, year, month)`
- `clampDayToMonth(day, year, month)`
- `isDayEdgeCase(day)` (days 29–31)
- `getEdgeCaseWarning(day)`

### Cycle calculations (`lib/cycleUtils.ts`)
#### `getCurrentCycle(startDay, endDay, refDate?)`
- Supports “wrapping” cycles like 14 → 13
- **Clamps** day-of-month before constructing dates using `clampDayToMonth`
- Returns `{ cycleStart, cycleEnd, daysLeftInCycle }`
- `daysLeftInCycle` uses **`Math.floor`** and clamps at 0

#### `getPastCycle(...)` / `getNextCycle(...)`
- Shifts the computed current cycle by -1/+1 month
- Clamps day-of-month after shifting so Feb/Apr edge cases remain valid

### Due date calculations
#### `getNextDueDate(cycleEnd, dueDateDays)`
- Computes `dueDate = cycleEnd + dueDateDays`
- Returns `daysUntilDue` using **`Math.floor`**
- **Allows negative values** (overdue) instead of clamping to 0

#### Statement status (`getStatementStatus(cycleEnd)`)
Returns:
- `{ closed: boolean, daysUntilClose?: number, daysSinceClosed?: number }`

Used by `components/CardListItem.tsx` to show:
- “Statement closes in X days / today / closed X days ago” (Current tab)

### Due color thresholds (`lib/colorThresholds.ts`)
Defines:
- `COLORS`: `RED`, `YELLOW`, `FOREST_GREEN`
- `DUE_COLOR_THRESHOLDS` for Past/Current/Next with documented reasoning

`components/CardListItem.tsx` uses these thresholds and shows **RED** for overdue in current view.

---

## Testing (root)
The repo includes comprehensive Jest-based unit tests:

### Test Files (`lib/__tests__/`)
1. **`cycleUtils.test.ts`** - 36 test cases
   - Normal cycles (14→13, 1→31)
   - February edge cases (leap year vs non-leap year)
   - Month boundaries (28, 29, 30, 31 day months)
   - Overdue calculations (negative days)
   - Past/current/next cycle shifting
   - Statement status detection

2. **`dateValidation.test.ts`** - Date validation helpers
   - Max days per month (including leap years)
   - Valid day detection
   - Day clamping logic
   - Edge case warnings

3. **`cross-boundary.test.ts`** ⭐ **NEW** - 11 test cases, 50+ assertions
   - **Critical:** Verifies mobile and web produce **identical outputs**
   - Tests all functions with same inputs on both platforms
   - Prevents future logic divergence
   - Full lifecycle tests with realistic card configurations

### Test Scripts (`package.json`)
- `npm test` - Run all tests
- `npm run test:watch` - Auto-rerun on file changes
- `npm run test:coverage` - Generate coverage report

### Test Coverage
- **Total:** 47 test cases
- **Focus:** Date math correctness for financial app
- **Platform verification:** Cross-boundary tests ensure mobile = web

See `TESTING.md` for detailed testing guide.

---

## Web app (Next.js) — `web/`

### ⚠️ Architecture Change: Shared Logic
**IMPORTANT:** Web now **re-exports** mobile's financial logic instead of duplicating it.

**File:** `web/src/lib/cycleUtils.ts`
```typescript
// Re-exports from mobile implementation
export * from '../../../lib/cycleUtils';
export * from '../../../lib/dateValidation';
export * from '../../../lib/colorThresholds';
```

This ensures **identical** calculations on both platforms. See `ARCHITECTURE_FIX.md` for migration plan.

### Key routes (from `web/README.md`)
- `/` landing page
- `/login` sign in / sign up
- `/app` dashboard (requires login)
- `/app/add` add card
- `/app/cards/[id]` edit / delete

### Supabase auth/session handling (web)
- `web/src/lib/supabase/env.ts` validates:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `web/middleware.ts` refreshes Supabase sessions and writes updated cookies.
- `web/src/app/app/layout.tsx` checks `supabase.auth.getUser()` server-side and redirects to `/login` if no user.

### Dashboard and CRUD (web)
- `web/src/app/app/page.tsx` (server component):
  - queries `credit_cards` for the signed-in user and passes to a client component
- `web/src/app/app/DashboardClient.tsx`:
  - client filtering/sorting/refresh
  - uses `web/src/lib/dashboardLogic.ts` for compute + sort
  - **Now uses shared cycleUtils** - same logic as mobile
- `web/src/components/CardForm.tsx`:
  - shared form used by `/app/add` and `/app/cards/[id]`
  - supports catalog selection and the same due-date “days vs date” UI

---

## Setup / run

### Supabase (required for both apps)
- Create a Supabase project
- Run `supabase/schema.sql` in Supabase SQL Editor

### Mobile
- `npm install`
- create `.env` from `.env.example`
- `npm start`

### Web
- `cd web`
- `npm install`
- create `web/.env.local` (see `web/README.md`)
- `npm run dev` (open `http://localhost:3000`)

---

## Recent Fixes & Improvements ✅

### Critical Issues Resolved (Round 1)
1. ✅ **Overdue semantics** - Now allows negative values, no longer clamps to 0
2. ✅ **Date validation** - Feb 31 correctly clamps to 28/29, no silent rollover
3. ✅ **Color logic** - Extracted to constants, documented thresholds
4. ✅ **Statement status** - Shows "Statement closes in X days" messaging
5. ✅ **Environment validation** - Clear errors if env vars missing
6. ✅ **Delete error handling** - Shows alerts on failure
7. ✅ **Unit tests** - Comprehensive test coverage for date math

### Critical Issues Resolved (Round 2)
1. ✅ **Logic divergence eliminated** - Web now re-exports mobile logic (single source of truth)
2. ✅ **"Due today" bug fixed** - Condition order corrected (`=== 0` before `< 0`)
3. ✅ **Due date conversion fixed** - Uses first occurrence after cycle end, not always next month
4. ✅ **Edge warnings visible** - Users now see warnings for days 29-31
5. ✅ **Cross-boundary tests** - Verify mobile and web produce identical outputs

### Documentation Added
- `IMPLEMENTATION_SUMMARY.md` - First round fixes
- `NEW_CRITIQUES_FIXES.md` - Second round fixes
- `ARCHITECTURE_FIX.md` - Logic divergence fix + monorepo migration plan
- `TESTING.md` - Testing guide and philosophy

### Known Minor Gaps
- **Unused component**: `components/SortToggle.tsx` exists but main flow uses `FilterSortBar`
- **Image upload**: `expo-image-picker` configured but no in-app upload flow implemented (uses URLs only)

These are low-priority and don't affect core functionality.
