-- 🛡️ SafeTap Supabase Profiles Schema Reset
-- Run this in the SQL Editor to fix 400/406 column mismatch errors

-- 1. Drop existing table to clear column conflicts
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. Create Minimal Production Table
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 3. Security: Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Allow users to fetch their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- 5. Policy: Allow users to insert/update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR ALL 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
