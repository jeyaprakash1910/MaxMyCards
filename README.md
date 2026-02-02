# Credit Card Status

Track your credit cards - billing cycles, due dates, and days remaining.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase/schema.sql` in the SQL Editor
3. Create a Storage bucket `card-images` (optional, for catalog images)

### 3. Environment

Copy `.env.example` to `.env` and add your Supabase URL and anon key:

```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Run the mobile app (Expo)

```bash
npm start
```

Scan the QR code with Expo Go on your Android phone.

### 5. Run the website (Next.js)

```bash
cd web
cp .env.local.example .env.local
# edit .env.local and set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev
```

Open `http://localhost:3000`.

### 5. Seed card catalog (optional)

1. Create a Storage bucket `card-images` in Supabase (public for reads)
2. Upload images from the `Credit Cards` folder
3. Edit `supabase/seed-catalog.sql` – replace `REPLACE_WITH_STORAGE_URL` with actual image URLs
4. Run the SQL in Supabase SQL Editor

## Deployment notes (website)

- **Vercel**: deploy the `web/` folder as the project root (set it as the “Root Directory” in Vercel project settings).
- **Supabase Auth**: add your deployed site URLs to Supabase dashboard → Authentication → URL Configuration (Site URL + Redirect URLs).

## Features

- Email login/signup
- Add credit cards (pick from catalog or custom name)
- Cycle start/end day, due date (days after cycle end)
- Home list: days left in cycle, days until due
- Sort by due soonest or due later
- Edit and delete cards
