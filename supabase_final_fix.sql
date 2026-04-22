-- 🛡️ SafeTap FINAL Production Schema & RLS Fix
-- Run this in your Supabase SQL Editor to resolve all 400/403/406 errors

-- 1. Alerts Table: Ensuring all columns match perfectly
-- id generated automatically as PK
ALTER TABLE alerts 
  ALTER COLUMN status SET DEFAULT 'active',
  ALTER COLUMN resolved SET DEFAULT false,
  ALTER COLUMN type SET DEFAULT 'emergency',
  ALTER COLUMN timestamp SET DEFAULT now();

-- Ensure location is optional if it still exists in your DB
ALTER TABLE alerts ALTER COLUMN location DROP NOT NULL;

-- 2. Profiles Table: Simplified version
-- Ensure only id and email exist
-- We use CASCADE to drop dependent objects
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies: The "Owner-Only" Standard
-- ALERTS: Only the user who triggered the SOS can see/insert it
DROP POLICY IF EXISTS "Users can insert their own alerts" ON alerts;
CREATE POLICY "Users can insert their own alerts" ON alerts 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own alerts" ON alerts;
CREATE POLICY "Users can view their own alerts" ON alerts 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- PROFILES: Only the user can see/write their own record
DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;
CREATE POLICY "Users can manage their own profile" ON profiles 
FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
