-- 🛡️ SafeTap Supabase SOS Schema Fix & Security
-- Run this in your Supabase SQL Editor to resolve 406 errors and enable RLS

-- 1. Table Optimization & Constraints
-- Ensure required fields have valid defaults to prevent "Missing Column" errors
ALTER TABLE alerts 
  ALTER COLUMN status SET DEFAULT 'active',
  ALTER COLUMN resolved SET DEFAULT false,
  ALTER COLUMN type SET DEFAULT 'SOS',
  ALTER COLUMN timestamp SET DEFAULT now(),
  ALTER COLUMN created_at SET DEFAULT now();

-- 2. Handle Design Redundancy
-- Lat/Lng are the primary tracking fields. 
-- Set 'location' (text) to optional so the insert doesn't fail if address isn't geocoded yet.
ALTER TABLE alerts ALTER COLUMN location DROP NOT NULL;
ALTER TABLE alerts ALTER COLUMN message DROP NOT NULL;

-- 3. Security: Enable Row Level Security (RLS)
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Allow authenticated users to insert their own alerts
-- This ensures that User A cannot trigger an SOS for User B.
DROP POLICY IF EXISTS "Users can trigger their own SOS" ON alerts;
CREATE POLICY "Users can trigger their own SOS" 
ON alerts FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 5. Policy: Allow users to view their own alert history
-- Note: You may need a separate policy for caregivers to see these alerts.
DROP POLICY IF EXISTS "Users can view their own alerts" ON alerts;
CREATE POLICY "Users can view their own alerts" 
ON alerts FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- 6. Suggested Improvements: Performance & Analytics
-- Index user_id for faster history lookups
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
-- Index timestamp for temporal sorting (History screen)
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts(timestamp DESC);

-- COMMENT: Why 406 occurred?
-- Your frontend used .insert().select(). This requires a SELECT policy to be present 
-- so Supabase can read the row it just created. Without the SELECT policy above, 
-- the response was empty, causing PostgREST to return a 406 (Not Acceptable) 
-- when the client expected the created object back.
