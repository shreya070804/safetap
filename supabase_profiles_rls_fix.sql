-- 🛡️ SafeTap Backend Security Fix: Resolve 403 Forbidden on Profiles
-- Apply this EXACT script to your Supabase SQL Editor

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 🛠️ Policy 1: Grant INSERT permission (Fixes the 403 on signup)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 🛠️ Policy 2: Grant SELECT permission (Fixes the 403 on login/init)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Verify:
-- 1. Table must match exactly (id: uuid pk, email: text)
-- 2. No other NOT NULL columns without defaults should exist.
