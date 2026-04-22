-- 📡 SafeTap Live Tracking Schema
-- Facilitates continuous real-time monitoring after SOS activation

DROP TABLE IF EXISTS live_locations CASCADE;

CREATE TABLE live_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude float8 NOT NULL,
  longitude float8 NOT NULL,
  timestamp timestamptz DEFAULT now()
);

-- Security: Enable RLS
ALTER TABLE live_locations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own track points
CREATE POLICY "Users can track own live location" 
ON live_locations FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Policy: Caregivers/Authenticated Users can view live tracks
-- (In production, you'd restrict this to specific linked caregivers)
CREATE POLICY "Authorized viewing of live locations" 
ON live_locations FOR SELECT 
TO authenticated 
USING (true);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_live_loc_user_time ON live_locations(user_id, timestamp DESC);
