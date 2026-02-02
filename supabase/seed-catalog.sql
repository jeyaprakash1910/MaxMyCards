-- Seed card_catalog with your 10 cards
-- 1. First upload images from "Credit Cards" folder to Supabase Storage:
--    - Go to Storage -> card-images bucket -> Upload
--    - Upload each PNG file
-- 2. Copy the public URL for each image (click file -> Copy URL)
-- 3. Replace the placeholder URLs below with your actual Storage URLs
-- 4. Run this SQL in Supabase SQL Editor

insert into card_catalog (name, image_url, bank) values
  ('Airtel Axis', 'REPLACE_WITH_STORAGE_URL', 'Axis'),
  ('Amazon Pay ICICI', 'REPLACE_WITH_STORAGE_URL', 'ICICI'),
  ('Axis Privilege', 'REPLACE_WITH_STORAGE_URL', 'Axis'),
  ('HDFC Millennia', 'REPLACE_WITH_STORAGE_URL', 'HDFC'),
  ('HDFC Swiggy', 'REPLACE_WITH_STORAGE_URL', 'HDFC'),
  ('ICICI Coral Rupay', 'REPLACE_WITH_STORAGE_URL', 'ICICI'),
  ('Jupiter CSB edge RUPAY', 'REPLACE_WITH_STORAGE_URL', 'CSB'),
  ('RBL Indian Oil', 'REPLACE_WITH_STORAGE_URL', 'RBL'),
  ('Scapia Federal', 'REPLACE_WITH_STORAGE_URL', 'Federal'),
  ('YES BANK KreditPe ACE', 'REPLACE_WITH_STORAGE_URL', 'YES BANK');
