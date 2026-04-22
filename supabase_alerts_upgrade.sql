-- 🛡️ SafeTap Database Upgrade: SOS Metadata Enhancement
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor) to fix "Column not found" errors

-- 1. Add Accuracy tracking for GPS precision auditing
ALTER TABLE alerts 
ADD COLUMN IF NOT EXISTS accuracy numeric;

-- 2. Add Google Maps direct link for faster responder coordination
ALTER TABLE alerts 
ADD COLUMN IF NOT EXISTS google_maps_link text;

-- 3. Optimization: Comment columns for documentation
COMMENT ON COLUMN alerts.accuracy IS 'GPS precision in meters at time of dispatch';
COMMENT ON COLUMN alerts.google_maps_link IS 'Ready-to-use URL for first responders';
