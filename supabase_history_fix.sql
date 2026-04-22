-- 🛡️ SafeTap FINAL Schema Synchronization
-- Resolves column mismatch (latitude/longitude vs lat/lng) and ensures total query alignment

-- 1. Alerts Table Synchronization
-- We rename or add columns to match the 'latitude' and 'longitude' fields used in Dispatch JS.
ALTER TABLE alerts RENAME COLUMN lat TO latitude;
ALTER TABLE alerts RENAME COLUMN lng TO longitude;

-- Ensure maps_link exists for history rendering
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='alerts' AND column_name='maps_link') THEN
    ALTER TABLE alerts ADD COLUMN maps_link text;
  END IF;
END $$;

-- 2. RLS Security Refresh
-- Crucial for History rendering (.select())
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Allow users to see only their own history
DROP POLICY IF EXISTS "Users can view own alerts" ON alerts;
CREATE POLICY "Users can view own alerts" 
ON alerts FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Allow users to trigger alerts (Required for .insert())
DROP POLICY IF EXISTS "Users can insert own alerts" ON alerts;
CREATE POLICY "Users can insert own alerts" 
ON alerts FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 3. Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp_desc ON alerts(timestamp DESC);
