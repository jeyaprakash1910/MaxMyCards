# Credit Card Status — Complete Project Documentation

> **Purpose of this document**: provide enough detail for an AI reviewer (or any developer) who has never seen this codebase to understand every file, every flow, every algorithm, every data type, every config choice, and every known gap.

---

## 1. Product overview

**Credit Card Status** helps users track their credit cards' billing cycles and payment due dates. Users enter each card's:

- Billing **cycle start day** (1–31)
- Billing **cycle end day** (1–31)
- **Due date** expressed as N days after cycle end

The app then shows:

- Which billing cycle is active right now (and for past/next periods)
- How many days are left in the cycle
- The exact due date and how many days remain (or if overdue)
- Color-coded urgency (red/yellow/green gradient)

There are **two client applications** sharing the same Supabase backend:

| App | Tech | Location in repo |
|-----|------|------------------|
| Mobile | Expo + React Native | repo root (`app/`, `lib/`, `components/`) |
| Web | Next.js (App Router) | `web/` folder |

---

## 2. Repository structure (every file, annotated)

```
CreditCardStatus/
│
├── .env.example                 # Template for mobile Expo env vars
├── .gitignore                   # Ignores node_modules, .expo, .env, dist, logs, certs
├── .npmrc                       # Contains: legacy-peer-deps=true
├── app.json                     # Expo app config (name, icons, splash, plugins)
├── babel.config.js              # Babel config: preset expo + module-resolver alias @→.
├── jest.config.js               # Jest config: ts-jest, roots in lib/, path alias
├── package.json                 # Mobile dependencies + test scripts
├── package-lock.json            # Lockfile
├── tsconfig.json                # TS strict mode, path alias @/*→./*
├── README.md                    # Quick setup + feature list
├── SETUP_GUIDE.md               # Beginner-friendly step-by-step setup (250 lines)
├── TESTING.md                   # Guide for running Jest tests
├── IMPLEMENTATION_SUMMARY.md    # Changelog of "date fixes & UX improvements"
├── summary.md                   # THIS FILE
│
├── assets/                      # Expo app icons + splash
│   ├── adaptive-icon.png
│   ├── icon.png
│   └── splash-icon.png
│
├── Credit Cards/                # Local card PNGs to upload to Supabase Storage
│   ├── Airtel Axis.png
│   ├── Amazon Pay ICICI.png
│   ├── Axis Privilege.png
│   ├── HDFC Millennia.png
│   ├── HDFC Swiggy.png
│   ├── ICICI Coral Rupay.png
│   ├── Jupiter CSB edge RUPAY.png
│   ├── RBL Indian Oil.png
│   ├── Scapia Federal.png
│   └── YES BANK KreditPe ACE.png
│
├── supabase/
│   ├── schema.sql               # DDL: card_catalog + credit_cards + RLS policies
│   └── seed-catalog.sql         # INSERT for 10 catalog cards (placeholder URLs)
│
├── app/                         # ── MOBILE: Expo Router screens ──
│   ├── _layout.tsx              # Root stack layout
│   ├── index.tsx                # Session gate (redirects to auth or app)
│   ├── (auth)/
│   │   ├── _layout.tsx          # Auth stack layout
│   │   └── login.tsx            # Login / signup screen
│   └── (app)/
│       ├── _layout.tsx          # App stack layout
│       ├── index.tsx            # Home dashboard (list, filter, sort)
│       ├── add-card.tsx         # Add card screen
│       └── edit-card/
│           └── [id].tsx         # Edit / delete card screen
│
├── lib/                         # ── MOBILE: shared logic ──
│   ├── supabase.ts              # Supabase client + env validation
│   ├── auth.ts                  # signUp, signIn, signOut, getSession
│   ├── catalog.ts               # fetchCardCatalog, searchCatalog
│   ├── types.ts                 # CreditCard, CreditCardWithComputed
│   ├── cycleUtils.ts            # Cycle/due math + statement status
│   ├── dateValidation.ts        # Day-of-month clamping utilities
│   ├── colorThresholds.ts       # DUE_COLOR_THRESHOLDS + COLORS constants
│   └── __tests__/
│       ├── cycleUtils.test.ts   # 35+ unit tests for cycle logic
│       └── dateValidation.test.ts # Unit tests for date validation
│
├── components/                  # ── MOBILE: React Native UI ──
│   ├── CardListItem.tsx         # Card row with cycle/due display + color
│   ├── FilterSortBar.tsx        # Month + sort + direction controls
│   └── SortToggle.tsx           # Legacy sort toggle (unused in main flow)
│
└── web/                         # ── WEB: Next.js application ──
    ├── .gitignore               # Standard Next.js ignores
    ├── eslint.config.mjs        # ESLint: next/core-web-vitals + typescript
    ├── middleware.ts             # Supabase session refresh middleware
    ├── next.config.ts           # Turbopack root config
    ├── package.json             # Web dependencies (Next 16, @supabase/ssr, Tailwind)
    ├── package-lock.json
    ├── postcss.config.mjs       # PostCSS with @tailwindcss/postcss
    ├── README.md                # Web-specific setup guide
    ├── tsconfig.json            # TS strict, path alias @/*→./src/*
    │
    ├── public/                  # Static assets (SVG icons from Next.js template)
    │   ├── file.svg
    │   ├── globe.svg
    │   ├── next.svg
    │   ├── vercel.svg
    │   └── window.svg
    │
    └── src/
        ├── app/
        │   ├── layout.tsx       # Root HTML layout (Geist font, metadata)
        │   ├── globals.css      # Tailwind import + CSS variables
        │   ├── favicon.ico
        │   ├── page.tsx         # Landing page (/)
        │   ├── login/
        │   │   └── page.tsx     # Login / signup page (/login)
        │   └── app/
        │       ├── layout.tsx   # Auth-protected layout (/app/*)
        │       ├── page.tsx     # Dashboard server component (/app)
        │       ├── DashboardClient.tsx  # Client interactive dashboard
        │       ├── add/
        │       │   └── page.tsx # Add card page (/app/add)
        │       └── cards/
        │           └── [id]/
        │               └── page.tsx  # Edit/delete page (/app/cards/:id)
        │
        ├── components/
        │   ├── AppNavbar.tsx    # Authenticated app navbar with logout
        │   ├── SiteNavbar.tsx   # Public landing navbar
        │   ├── CardForm.tsx     # Shared add/edit form (catalog + cycle + due)
        │   ├── CardListItem.tsx # Card row for dashboard
        │   ├── DayGrid.tsx      # Reusable 1-31 day picker grid
        │   └── FilterSortBar.tsx# Month/sort/order controls
        │
        └── lib/
            ├── types.ts         # CreditCard, CreditCardWithComputed (same shape)
            ├── catalog.ts       # CatalogCard type + searchCatalog()
            ├── cycleUtils.ts    # Cycle/due math (web-specific copy)
            ├── dashboardLogic.ts# computeCard, sortCards, getDaysToDue
            └── supabase/
                ├── env.ts       # Env validation for web
                ├── client.ts    # createSupabaseBrowserClient()
                └── server.ts    # createSupabaseServerClient()
```

---

## 3. Supabase backend (shared by both apps)

### 3.1 Database tables

#### `card_catalog`

Public reference data. Users pick from this when adding a card.

```sql
create table if not exists card_catalog (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  image_url  text,
  bank       text,
  created_at timestamptz default now()
);

-- RLS: anyone can read
alter table card_catalog enable row level security;
create policy "Allow public read on card_catalog"
  on card_catalog for select using (true);
```

#### `credit_cards`

Per-user card data. Each row stores the billing config.

```sql
create table if not exists credit_cards (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  name            text not null,
  image_url       text,
  catalog_id      uuid references card_catalog(id) on delete set null,
  cycle_start_day int not null check (cycle_start_day between 1 and 31),
  cycle_end_day   int not null check (cycle_end_day between 1 and 31),
  due_date_days   int not null check (due_date_days > 0),
  created_at      timestamptz default now()
);

-- RLS: users can only CRUD their own rows
alter table credit_cards enable row level security;
create policy "Users can do all on own credit_cards"
  on credit_cards for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### 3.2 Catalog seed data (`supabase/seed-catalog.sql`)

Inserts 10 Indian credit cards (Airtel Axis, Amazon Pay ICICI, HDFC Millennia, etc.) with `REPLACE_WITH_STORAGE_URL` placeholders. The user is expected to upload PNGs from `Credit Cards/` to Supabase Storage and paste real URLs.

### 3.3 Optional: Storage bucket

- Name: `card-images`
- Access: public for reads
- Purpose: host catalog card images

### 3.4 Auth

Both apps use Supabase email/password auth. No OAuth providers are configured.

---

## 4. Mobile app (Expo / React Native) — file-by-file

### 4.1 Configuration files

#### `package.json`
- **Name**: `credit-card-status`
- **Entry**: `expo-router/entry`
- **Scripts**: `start`, `android`, `ios`, `test`, `test:watch`, `test:coverage`
- **Key dependencies**: expo 54, react 19.1, react-native 0.81.5, @supabase/supabase-js 2.45, expo-router 6, expo-secure-store 15, expo-image-picker 17
- **Dev dependencies**: jest 29.7, ts-jest 29.1, @types/jest 29.5, typescript 5.9, babel-plugin-module-resolver

#### `app.json`
- App name: "Credit Card Status"
- Slug: `credit-card-status`
- Scheme: `creditcardstatus`
- New architecture enabled
- Splash background: `#1a1a2e` (dark navy)
- Plugins: `expo-router`, `expo-image-picker` (with camera + photo permissions)
- Bundle ID / package: `com.creditcardstatus.app`

#### `babel.config.js`
- Preset: `babel-preset-expo`
- Plugin: `module-resolver` with alias `@` → `.` (repo root)

#### `tsconfig.json`
- Extends `expo/tsconfig.base`
- Strict mode enabled
- Path alias: `@/*` → `./*`

#### `jest.config.js`
- Preset: `ts-jest`
- Test environment: `node`
- Roots: `lib/`
- Test match: `**/__tests__/**/*.test.ts`
- Path alias: `@/` → repo root
- Coverage: collects from `lib/` excluding tests and `.d.ts`

#### `.npmrc`
Contains `legacy-peer-deps=true` to resolve peer dependency conflicts.

#### `.env.example`
```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key_here
```

### 4.2 Routing & screens

The mobile app uses `expo-router` file-system routing with two route groups.

#### `app/_layout.tsx` — Root layout
- Renders a `<Stack>` with headers hidden
- Sets status bar style to "light"

#### `app/index.tsx` — Session gate
- On mount, calls `getSession()` (which calls `supabase.auth.getSession()`)
- If session exists → `router.replace('/(app)')`
- If no session or error → `router.replace('/(auth)/login')`
- Shows a centered `<ActivityIndicator>` while checking

#### `app/(auth)/_layout.tsx` — Auth layout
- Simple `<Stack>` with headers hidden

#### `app/(auth)/login.tsx` — Login screen
**State**: `email`, `password`, `isSignUp` (toggle), `loading`

**Validation**:
- Email must not be empty
- Password must be >= 6 characters

**Sign up flow**:
- Calls `signUp(email, password)` → `supabase.auth.signUp({ email, password })`
- Shows alert: "Account created! Please sign in."
- Does NOT auto-login (user must sign in manually; may need email confirmation)

**Sign in flow**:
- Calls `signIn(email, password)` → `supabase.auth.signInWithPassword({ email, password })`
- On success: `router.replace('/(app)')`

**Error normalization**:
- "Email not confirmed" → friendly message about checking inbox
- "Invalid login credentials" → suggests creating account first

**Styling**: Dark theme (`#1a1a2e` background, `#16213e` card, `#6366f1` indigo buttons)

#### `app/(app)/_layout.tsx` — App layout
- `<Stack>` defining screens: `index`, `add-card`, `edit-card/[id]`

#### `app/(app)/index.tsx` — Home dashboard

This is the most complex screen.

**Data loading**:
- Uses `useFocusEffect` so data refreshes when navigating back
- Calls `supabase.auth.getUser()` to get current user
- Queries: `supabase.from('credit_cards').select('*').eq('user_id', user.id).order('created_at', { ascending: false })`
- Maps each row through `computeCard()` to produce `CreditCardWithComputed`

**`computeCard()` function** (defined inline in this file):
- Calls `getCurrentCycle(start, end)` → current cycle dates + days left
- Calls `getNextDueDate(cycleEnd, dueDays)` → current due date + days until due
- Calls `getPastCycle(start, end)` → past cycle dates
- Calls `getNextCycle(start, end)` → next cycle dates
- Derives `pastDueDate` = pastCycleEnd + due_date_days
- Derives `nextDueDate` = nextCycleEnd + due_date_days

**Month filter**: `past | current | next`
**Sort by**: `due | cycle`
**Sort direction**: `asc | desc`

When month changes, default sort resets:
- Past → due asc
- Current → due desc
- Next → due asc

**Sorting** (`sortCards()` function):
- For "due" sort: computes month-aware "days to due" per card
- For "cycle" sort: sorts by the relevant cycle end date

**UI elements**:
- Header: title + Logout button (with confirmation Alert)
- `<FilterSortBar>` component
- `<FlatList>` with `<CardListItem>` rows
- Pull-to-refresh
- FAB button ("+") navigating to `/(app)/add-card`

#### `app/(app)/add-card.tsx` — Add card screen

**Catalog loading**:
- On mount: `fetchCardCatalog()` → `supabase.from('card_catalog').select('id, name, image_url, bank').order('name')`
- Shows filtered catalog (max 8 items) as tappable rows

**Card selection**:
- Tapping a catalog card fills: `name`, `imageUrl`, `catalogId`
- Typing a custom name clears catalog linkage

**Cycle picker**:
- Two rows of day chips (1–31) for start day
- Two rows of day chips (1–31) for end day

**Due date picker** (two modes):
- **By days**: preset options `[14, 15, 18, 20, 21, 24, 25, 28, 30]` plus current value; shows which day-of-month it falls on
- **By date**: 31 day chips; converts selected day-of-month to days-after-end using `dueDayOfMonthToDays()`; shows "X days after cycle end"

**Save**:
- Validates card name
- Gets current user
- Inserts row into `credit_cards`
- Navigates back on success

#### `app/(app)/edit-card/[id].tsx` — Edit / delete screen

**Loading**:
- Reads card by ID: `supabase.from('credit_cards').select('*').eq('id', id).single()`
- Loads catalog in parallel

**Editing**:
- Same UI as add-card (cycle pickers, due date modes, catalog selection)
- Updates via: `supabase.from('credit_cards').update({...}).eq('id', id)`

**Deleting**:
- Confirmation Alert
- Wrapped in try/catch: `supabase.from('credit_cards').delete().eq('id', id)`
- Shows error alert on failure
- Navigates back only on success

### 4.3 Core logic libraries

#### `lib/supabase.ts` — Supabase client

```typescript
import 'react-native-url-polyfill/auto';
```

- Reads `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` from env
- **Validates at startup**: throws a clear error listing missing variables and referencing `.env.example`
- Creates `ExpoSecureStoreAdapter` using `expo-secure-store` for `getItem`/`setItem`/`removeItem`
- Creates Supabase client with: `autoRefreshToken: true`, `persistSession: true`, `detectSessionInUrl: false`

#### `lib/auth.ts` — Auth wrappers

Four thin functions:
- `signUp(email, password)` → `supabase.auth.signUp()`
- `signIn(email, password)` → `supabase.auth.signInWithPassword()`
- `signOut()` → `supabase.auth.signOut()`
- `getSession()` → `supabase.auth.getSession()` → returns session or null

All throw on error.

#### `lib/catalog.ts` — Catalog helpers

- `CatalogCard` type: `{ id, name, image_url, bank }`
- `fetchCardCatalog()`: queries `card_catalog`, ordered by name, returns `[]` on error
- `searchCatalog(cards, query)`: case-insensitive filter on `name` and `bank`

#### `lib/types.ts` — Data types

```typescript
type CreditCard = {
  id: string;
  user_id: string;
  name: string;
  image_url: string | null;
  catalog_id: string | null;
  cycle_start_day: number;     // 1-31
  cycle_end_day: number;       // 1-31
  due_date_days: number;       // days after cycle end
  created_at: string;
};

type CreditCardWithComputed = CreditCard & {
  cycleStart: Date;
  cycleEnd: Date;
  daysLeftInCycle: number;
  dueDate: Date;
  daysUntilDue: number;        // can be negative (overdue)
  pastCycleStart: Date;
  pastCycleEnd: Date;
  pastDueDate: Date;
  nextCycleStart: Date;
  nextCycleEnd: Date;
  nextDueDate: Date;
};
```

#### `lib/dateValidation.ts` — Day-of-month edge case handling

Prevents JavaScript `Date` from silently rolling over invalid dates (e.g., `new Date(2024, 1, 31)` becomes Mar 2).

Functions:
- `getMaxDayInMonth(year, month)` — uses `new Date(year, month+1, 0).getDate()` trick
- `isValidDayForMonth(day, year, month)` — checks `day <= maxDay`
- `clampDayToMonth(day, year, month)` — `Math.min(Math.max(1, day), maxDay)`
- `isDayEdgeCase(day)` — true for 29, 30, 31
- `getEdgeCaseWarning(day)` — user-friendly warning strings

#### `lib/cycleUtils.ts` — Core billing cycle math

This is the most critical module. All date calculations happen here.

**`getCurrentCycle(cycleStartDay, cycleEndDay, refDate?)`**

Handles two cases:
1. **Wrapping cycle** (end < start, e.g., 14→13):
   - If today >= start day: cycle is [start this month, end next month]
   - If today < start day: cycle is [start last month, end this month]
2. **Same-month cycle** (end >= start, e.g., 1→31):
   - Both dates in current month

All days are **clamped** via `clampDayToMonth()` before constructing Date objects.

Returns: `{ cycleStart, cycleEnd, daysLeftInCycle }` where `daysLeftInCycle` uses `Math.floor` and clamps at 0.

**`getPastCycle(startDay, endDay, refDate?)`**
- Gets current cycle, then shifts both start/end back by 1 month
- Clamps days after shifting (e.g., Mar 31 → Feb 28/29)

**`getNextCycle(startDay, endDay, refDate?)`**
- Same as past but shifts forward 1 month

**`getNextDueDate(cycleEnd, dueDateDays)`**
- `dueDate = cycleEnd + dueDateDays`
- `daysUntilDue = Math.floor((dueDate - today) / oneDay)` — **allows negative** (overdue)

**`getStatementStatus(cycleEnd)`**
- Returns `{ closed: boolean, daysUntilClose?: number, daysSinceClosed?: number }`
- Used by CardListItem to display "Statement closes in X days" / "Statement closed X days ago"

**Conversion helpers**:
- `dueDateDaysToDayOfMonth(cycleEnd, days)` — adds days, returns `.getDate()`
- `dueDayOfMonthToDays(cycleEnd, dayOfMonth)` — constructs date on next month with that day, returns difference in days

**Display helpers**:
- `formatCycleRange(start, end)` — `en-IN` locale, `{ day, month }`
- `formatDueDate(dueDate)` — `en-IN` locale, `{ day, month, year }`
- `ordinalDay(n)` — returns "1st", "2nd", "3rd", "4th", etc.

#### `lib/colorThresholds.ts` — Color constants

```typescript
const DUE_COLOR_THRESHOLDS = {
  PAST:    { MIN_SAFE: 1,  MAX_SAFE: 22 },   // days after due
  CURRENT: { MIN_SAFE: 20, MAX_SAFE: 52 },   // days until due
  NEXT:    { MIN_SAFE: 36, MAX_SAFE: 82 },   // days until due
};

const COLORS = {
  RED: '#f87171',
  YELLOW: '#eab308',
  FOREST_GREEN: '#228b22',
};
```

Reasoning is documented in comments:
- 52 = average cycle (31) + average grace period (21)
- 82 = current cycle + next cycle + grace

### 4.4 UI components

#### `components/CardListItem.tsx`

Displays a single card row. Receives `card` (computed) and `month` filter.

**Date selection by month tab**:
- past → `pastCycleStart`, `pastCycleEnd`, `pastDueDate`
- current → `cycleStart`, `cycleEnd`, `dueDate`
- next → `nextCycleStart`, `nextCycleEnd`, `nextDueDate`

**Statement status** (current view only):
- Uses `getStatementStatus(cycleEnd)` to show:
  - "Statement closes in X days"
  - "Statement closes today"
  - "Statement closed X days ago"

**Due display**:
- Current: shows "Overdue" if `daysUntilDue <= 0`, "Due today" if 0 (note: currently unreachable due to `<= 0` check order), or "X days"
- Past: shows "Overdue" if past due date is before today, otherwise "X days"
- Next: shows "X days"

**Color functions** (use thresholds from `colorThresholds.ts`):
- `getPastDueColor(daysToDue)`: RED if <= 0, else YELLOW→GREEN gradient
- `getCurrentDueColor(daysToDue)`: RED if <= 0, else YELLOW→GREEN gradient
- `getNextDueColor(daysToDue)`: no red, YELLOW→GREEN gradient only

Color interpolation: `lerpColor()` converts hex→RGB, linearly interpolates, converts back.

**Image/placeholder**: shows card image if `image_url` exists, otherwise a colored initial letter.

#### `components/FilterSortBar.tsx`

Controls for the home screen. Exports types and a default-sort helper.

Types:
- `MonthFilter = 'past' | 'current' | 'next'`
- `SortBy = 'due' | 'cycle'`
- `SortDir = 'asc' | 'desc'`

`getDefaultSortForMonth(month)`:
- past → `{ sortBy: 'due', sortDir: 'asc' }`
- current → `{ sortBy: 'due', sortDir: 'desc' }`
- next → `{ sortBy: 'due', sortDir: 'asc' }`

UI: three sections (Month, Sort by, Order) rendered as horizontal button rows.

#### `components/SortToggle.tsx`

An earlier sort UI with 4 options: `due_soonest`, `due_later`, `cycle_soonest`, `cycle_later`. **Currently unused** — the main flow uses `FilterSortBar` instead.

### 4.5 Tests

#### `lib/__tests__/cycleUtils.test.ts`

~35 test cases organized in `describe` blocks:
- `getCurrentCycle`: wrapping cycles, same-month cycles, February edge cases (leap year and non-leap), daysLeftInCycle accuracy
- `getPastCycle`: previous cycle, February edge case
- `getNextCycle`: next cycle, April 31→30 clamping
- `getNextDueDate`: basic calculation, negative daysUntilDue for overdue, floor vs ceil
- `dueDateDaysToDayOfMonth`: month boundary, same month
- `dueDayOfMonthToDays`: conversion accuracy
- `getStatementStatus`: open statement, closed statement, closing today

Also includes commented-out Jest config instructions.

#### `lib/__tests__/dateValidation.test.ts`

Tests for:
- `getMaxDayInMonth`: 31-day months, 30-day months, Feb leap/non-leap
- `isValidDayForMonth`: valid and invalid cases (day 0, 32, Apr 31, Feb 30, Feb 29 non-leap)
- `clampDayToMonth`: identity for valid, clamp for over/under, extreme values
- `isDayEdgeCase`: true for 29-31, false for 1-28
- `getEdgeCaseWarning`: correct warning text or null

---

## 5. Web app (Next.js) — file-by-file

### 5.1 Configuration

#### `web/package.json`
- **Name**: `web`
- **Dependencies**: next 16.1.6, react 19.2.3, @supabase/ssr 0.8, @supabase/supabase-js 2.93
- **Dev**: tailwindcss 4, @tailwindcss/postcss, eslint-config-next, typescript 5

#### `web/tsconfig.json`
- Target ES2017, strict, bundler module resolution
- Path alias: `@/*` → `./src/*`

#### `web/next.config.ts`
- Turbopack enabled with `root: __dirname`

#### `web/postcss.config.mjs`
- Single plugin: `@tailwindcss/postcss`

#### `web/eslint.config.mjs`
- Uses `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`

#### `web/.gitignore`
- Standard Next.js ignores: `.next/`, `node_modules/`, `.env*`, etc.

### 5.2 Supabase wiring (web)

#### `web/src/lib/supabase/env.ts`
- Reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Throws** immediately if either is missing with an actionable error message

#### `web/src/lib/supabase/client.ts`
- `createSupabaseBrowserClient()`: uses `createBrowserClient()` from `@supabase/ssr`
- Used by client components

#### `web/src/lib/supabase/server.ts`
- `createSupabaseServerClient()`: uses `createServerClient()` from `@supabase/ssr`
- Reads cookies via `next/headers`
- Cookies are **read-only** in server components; middleware handles refresh
- `setAll()` is a no-op (middleware writes cookies instead)

#### `web/middleware.ts`
- Runs on every non-static request (matcher excludes `_next/static`, images, etc.)
- Creates a Supabase server client with cookie read/write
- Calls `supabase.auth.getUser()` to trigger session refresh
- Updated cookies are attached to the response

### 5.3 Routes & pages

#### `/` — Landing page (`web/src/app/page.tsx`)
- Static marketing page with `SiteNavbar`
- Hero section: title, description, CTA buttons
- Preview mockup showing example cards
- Feature highlights: "Cycle status", "Due timeline"
- Footer

#### `/login` — Auth page (`web/src/app/login/page.tsx`)
- Client component (`'use client'`)
- Toggle between sign-up and sign-in
- Same validation as mobile (email required, password >= 6)
- Same error normalization (email not confirmed, invalid credentials)
- On sign-in success: `router.replace('/app')` + `router.refresh()`
- Shows inline notice/error banners (not native alerts)
- Links to "/" (back) and "/app" (go to app)

#### `/app` layout (`web/src/app/app/layout.tsx`)
- **Server component** that checks auth
- Calls `supabase.auth.getUser()` server-side
- If no user → `redirect('/login')`
- Renders `AppNavbar` + children

#### `/app` — Dashboard (`web/src/app/app/page.tsx` + `DashboardClient.tsx`)

**Server component** (`page.tsx`):
- Gets user, queries `credit_cards`, passes to client component

**Client component** (`DashboardClient.tsx`):
- Receives `initialCards` from server
- Same filter/sort state as mobile: month, sortBy, sortDir
- Computes cards using `computeCard()` from `dashboardLogic.ts`
- Sorts using `sortCards()` from `dashboardLogic.ts`
- Shows: refresh button, "+ Add" link, FilterSortBar, card list, empty/error states

#### `/app/add` — Add card (`web/src/app/app/add/page.tsx`)
- Client component using shared `<CardForm>` component
- Defaults: `cycleStartDay: 14`, `cycleEndDay: 13`, `dueDateDays: 21`
- On submit: gets user, inserts into `credit_cards`, navigates to `/app`

#### `/app/cards/[id]` — Edit card (`web/src/app/app/cards/[id]/page.tsx`)
- Client component using shared `<CardForm>`
- Loads card by ID on mount
- On submit: updates card
- On delete: deletes card (shows error if fails), navigates to `/app`

### 5.4 Web components

#### `AppNavbar.tsx`
- Sticky header with: "Credit Card Status" link, "Dashboard"/"Add card" nav, "+ Add" button, Logout button
- Logout: calls `supabase.auth.signOut()`, redirects to `/login`

#### `SiteNavbar.tsx`
- Public landing navbar with: logo link, "Sign in" link, "Open web app" button

#### `CardForm.tsx`
- Shared form used by add + edit pages
- Props: `title`, `initialValue`, `submitLabel`, `onSubmit`, optional `onDelete`, `submitting`
- Catalog: loads from `card_catalog`, shows search + grid of catalog cards
- "Use custom name" button clears catalog linkage
- Cycle pickers: uses `<DayGrid>` component for start/end days
- Due date: same "By days" / "By date" toggle as mobile
- Delete button appears only when `onDelete` is provided

#### `CardListItem.tsx` (web)
- Wrapped in a `<Link>` to `/app/cards/{id}` (unlike mobile where it's a `<TouchableOpacity>` with `onPress`)
- Shows card image or initial letter
- Shows cycle range, cycle status text, due date with color
- Color functions are **inline** (not from `colorThresholds.ts`) — uses same magic numbers as the older mobile code
- "Edit →" text on hover

#### `DayGrid.tsx`
- Reusable grid of buttons 1–31 for selecting a day
- Props: `value`, `onChange`, `label`

#### `FilterSortBar.tsx` (web)
- Same controls as mobile: Month (Past/Current/Next), Sort by (Due/Cycle), Order (↑/↓)
- Uses a generic `TabButton` sub-component

### 5.5 Web logic libraries

#### `web/src/lib/types.ts`
- Identical shape to mobile `lib/types.ts`
- `CreditCard` and `CreditCardWithComputed`

#### `web/src/lib/catalog.ts`
- `CatalogCard` type
- `searchCatalog()` function (same logic as mobile)

#### `web/src/lib/cycleUtils.ts`
- **Separate copy** from mobile `lib/cycleUtils.ts`
- Contains: `getCurrentCycle`, `getPastCycle`, `getNextCycle`, `getNextDueDate`, `formatCycleRange`, `formatDueDate`, `dueDateDaysToDayOfMonth`, `dueDayOfMonthToDays`, `ordinalDay`
- **Key differences from mobile version**:
  - Does NOT import or use `clampDayToMonth` (no date validation)
  - `getNextDueDate` clamps `daysUntilDue` to 0 with `Math.max(0, ...)` (no overdue support)
  - Uses `Math.ceil` instead of `Math.floor` for days calculations
  - No `getStatementStatus()` function

#### `web/src/lib/dashboardLogic.ts`
- Exports: `MonthFilter`, `SortBy`, `SortDir` types
- `getDefaultSortForMonth()` — same defaults as mobile
- `computeCard()` — same algorithm as mobile's inline version
- `getDaysToDue()` — month-aware days-to-due
- `sortCards()` — same in-memory sort

---

## 6. How date/cycle math works (algorithm explanation)

### 6.1 The problem

Credit cards have billing cycles like "14th to 13th" meaning:
- The cycle starts on the 14th of one month
- The cycle ends on the 13th of the next month
- The payment is due N days after the cycle ends

Complications:
- Cycles can wrap across months
- February has 28/29 days
- Some months have 30 days, others 31
- JavaScript `Date(2024, 1, 31)` silently becomes March 2

### 6.2 The solution

1. **Determine if wrapping**: if `endDay < startDay`, the cycle crosses a month boundary
2. **Determine which cycle we're in**: if today >= startDay, we're in [thisMonth/startDay → nextMonth/endDay]; otherwise [prevMonth/startDay → thisMonth/endDay]
3. **Clamp days** (mobile only): before constructing Date objects, clamp `startDay` and `endDay` to the valid range for their target month using `clampDayToMonth()`
4. **Past/next cycles**: shift current cycle by ±1 month, re-clamp

### 6.3 Due date calculation

```
dueDate = cycleEnd + due_date_days
daysUntilDue = floor((dueDate - today) / 86400000)
```

Mobile allows negative (overdue). Web clamps to 0.

### 6.4 Color gradient

For each month view, a "days to due" value maps to a color:
- Below threshold minimum → YELLOW (or RED for overdue)
- Above threshold maximum → FOREST_GREEN
- In between → linear interpolation (lerp) in RGB space

---

## 7. Setup instructions

### 7.1 Supabase (required first)
1. Create account at supabase.com
2. Create new project
3. Copy **Project URL** and **anon key** from Settings → API
4. Go to SQL Editor → run `supabase/schema.sql`
5. (Optional) Create Storage bucket `card-images`, upload PNGs, update URLs in `seed-catalog.sql`, run it

### 7.2 Mobile app
```bash
# Install
npm install

# Create env
cp .env.example .env
# Edit .env with your Supabase URL and key

# Run
npm start
# Scan QR with Expo Go on Android
```

### 7.3 Web app
```bash
cd web
npm install

# Create env
# Create web/.env.local with:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...

npm run dev
# Open http://localhost:3000
```

### 7.4 Tests
```bash
# From repo root
npm test              # run all tests
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

---

## 8. Known issues and gaps (for reviewers)

### 8.1 Critical: web/mobile date logic divergence

The web app (`web/src/lib/cycleUtils.ts`) is an **older copy** of the mobile date logic. Specifically:
- **No day-of-month clamping**: web does not use `clampDayToMonth()`. A card with `cycle_end_day = 31` viewed in February will silently roll to March on web but correctly show Feb 28/29 on mobile.
- **No overdue support**: web clamps `daysUntilDue` to 0. A card that is past due shows "0 days" on web but correctly shows negative/"Overdue" on mobile.
- **No statement status**: web does not have `getStatementStatus()` and does not show "Statement closes in X days" messaging.
- **Web CardListItem uses hardcoded color thresholds** instead of the centralized `colorThresholds.ts`.

### 8.2 Mobile "Due today" is unreachable

In `components/CardListItem.tsx`, the current-view due display checks:
```typescript
card.daysUntilDue <= 0 ? ' · Overdue' : card.daysUntilDue === 0 ? ' · Due today' : ...
```
Since `<= 0` catches 0 before the `=== 0` check, "Due today" never renders.

### 8.3 Edge-case warnings not surfaced in UI

`lib/dateValidation.ts` generates warnings for days 29–31 (e.g., "Day 31 will be adjusted in months with fewer days") but neither the add-card nor edit-card screens display these warnings to users.

### 8.4 `dueDayOfMonthToDays()` always targets next month

The conversion always constructs the due date as `new Date(cycleEnd.year, cycleEnd.month + 1, dayOfMonth)`. If the cycle ends early in a month and the due day-of-month is later in the same month, this skips the current month and picks next month instead.

### 8.5 Unused code

- `components/SortToggle.tsx`: not imported anywhere in the active flow
- `expo-image-picker`: configured in `app.json` but no in-app image upload flow exists

### 8.6 No tests for web logic

Tests only cover the mobile `lib/` code. The web `web/src/lib/cycleUtils.ts` (which has different behavior) has no test coverage.

### 8.7 Home screen double-filters by user_id

The home screen query explicitly filters `.eq('user_id', user.id)` AND relies on Supabase RLS. Both are active; the explicit filter is redundant but harmless (defense in depth).

### 8.8 No offline support

Both apps require an active internet connection. There is no local cache or offline queue.

---

## 9. Design decisions worth noting

| Decision | Rationale |
|----------|-----------|
| `expo-secure-store` for auth tokens | Native secure storage (Keychain/Keystore) instead of AsyncStorage |
| RLS on all tables | Server-side enforcement; client can't bypass |
| `due_date_days` stored as "days after end" | Avoids needing to recompute when cycle shifts |
| Color gradient instead of fixed thresholds | Provides proportional urgency signal |
| Server-side initial load on web dashboard | Faster first paint; client hydrates interactively |
| Middleware for session refresh (web) | Keeps cookies fresh without requiring client-side logic |
| Clamping dates at computation time (mobile) | DB stores intent (e.g., 31); display adapts per month |
| Two separate cycle utility files | Web was created after mobile; hasn't been synced yet |

---

## 10. Dependency versions (as of current code)

### Mobile (root `package.json`)
| Package | Version |
|---------|---------|
| expo | ^54.0.32 |
| react | 19.1.0 |
| react-native | 0.81.5 |
| expo-router | ~6.0.22 |
| @supabase/supabase-js | ^2.45.0 |
| expo-secure-store | ~15.0.8 |
| expo-image-picker | ~17.0.10 |
| typescript | ~5.9.2 |
| jest | ^29.7.0 |
| ts-jest | ^29.1.0 |

### Web (`web/package.json`)
| Package | Version |
|---------|---------|
| next | 16.1.6 |
| react | 19.2.3 |
| @supabase/ssr | ^0.8.0 |
| @supabase/supabase-js | ^2.93.3 |
| tailwindcss | ^4 |
| typescript | ^5 |
