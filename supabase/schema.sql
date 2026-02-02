-- Run this SQL in your Supabase project: SQL Editor -> New query -> Paste -> Run

-- 1. Card catalog (predefined cards - you populate later)
create table if not exists card_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text,
  bank text,
  created_at timestamptz default now()
);

-- Allow anyone to read catalog (no auth required for public reference data)
alter table card_catalog enable row level security;

create policy "Allow public read on card_catalog"
  on card_catalog for select
  using (true);

-- 2. User credit cards
create table if not exists credit_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  image_url text,
  catalog_id uuid references card_catalog(id) on delete set null,
  cycle_start_day int not null check (cycle_start_day between 1 and 31),
  cycle_end_day int not null check (cycle_end_day between 1 and 31),
  due_date_days int not null check (due_date_days > 0),
  created_at timestamptz default now()
);

alter table credit_cards enable row level security;

create policy "Users can do all on own credit_cards"
  on credit_cards for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. Storage bucket for card images (create in Dashboard: Storage -> New bucket -> card-images -> Public)
-- Then add RLS: Storage policies -> New policy -> Allow public read for card-images
-- For uploads: Allow authenticated users to upload to their own folder
