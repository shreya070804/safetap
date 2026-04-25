-- 🛡️ SafeTap Profiles Schema Alignment
-- Run this in your Supabase SQL Editor to add the missing onboarding columns.

-- 1. Ensure columns exist for Onboarding
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS blood_type text,
ADD COLUMN IF NOT EXISTS allergies text,
ADD COLUMN IF NOT EXISTS physician text,
ADD COLUMN IF NOT EXISTS emergency_contact text,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user',
ADD COLUMN IF NOT EXISTS guardian_id uuid REFERENCES auth.users(id);

-- 2. Verify RLS (Ensures upsert doesn't fail with 403)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;
CREATE POLICY "Users can manage own profile" 
ON profiles FOR ALL 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Public profile visibility" ON profiles;
CREATE POLICY "Public profile visibility" 
ON profiles FOR SELECT 
TO authenticated 
USING (true);
