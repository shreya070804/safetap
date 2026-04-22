-- 🛡️ SafeTap Backend Security Fix: Resolve 403 Forbidden on Profiles
-- Apply this EXACT script to your Supabase SQL Editor

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 1. INSIGHT: Allow authenticated users to CREATE their own profile row
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 2. INSIGHT: Allow authenticated users to READ their own profile row
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Ensure NO extra columns are required if not provided in the payload
-- By default, id and email are currently matched in the frontend
