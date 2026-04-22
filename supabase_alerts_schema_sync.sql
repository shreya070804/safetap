-- 🛡️ SafeTap Schema Synchronization: SOS Table Fix
-- Run this in your Supabase SQL Editor to resolve 400 Bad Request errors

-- 1. Ensure columns match the latest frontend payload
-- We use latitude/longitude (full names) and maps_link to match the latest JS
ALTER TABLE alerts 
ADD COLUMN IF NOT EXISTS latitude float8,
ADD COLUMN IF NOT EXISTS longitude float8,
ADD COLUMN IF NOT EXISTS maps_link text,
ADD COLUMN IF NOT EXISTS accuracy numeric; -- Optional but good for audits

-- 2. Audit & Verification
-- Ensure required fields have defaults to prevent missing-column errors on insert
ALTER TABLE alerts 
  ALTER COLUMN status SET DEFAULT 'active',
  ALTER COLUMN resolved SET DEFAULT false,
  ALTER COLUMN type SET DEFAULT 'SOS',
  ALTER COLUMN timestamp SET DEFAULT now();

-- 3. Cleanup Legacy Fields (Optional)
-- Only run if you want to remove the shorthand 'lat'/'lng'
-- ALTER TABLE alerts DROP COLUMN IF EXISTS lat;
-- ALTER TABLE alerts DROP COLUMN IF EXISTS lng;

COMMENT ON COLUMN alerts.maps_link IS 'Ready-to-use Google Maps coordination link';
