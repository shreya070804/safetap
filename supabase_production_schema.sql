-- 🛡️ SafeTap FINAL Production SQL Schema (Reset)
-- Run this in your Supabase SQL Editor to clean all 400/403/406 errors

-- 1. PROFILES: RESET & CORRECT
DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Profiles Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- 2. ALERTS: RESET & CORRECT
DROP TABLE IF EXISTS alerts CASCADE;
CREATE TABLE alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  lat float8,
  lng float8,
  status text DEFAULT 'active',
  resolved boolean DEFAULT false,
  type text DEFAULT 'SOS',
  message text,
  location text, -- Optional
  timestamp timestamptz DEFAULT now()
);

-- Alerts Security
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own alerts" 
ON alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own alerts" 
ON alerts FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 3. CONTACTS: SUPPORT FOR OPERATIVE NETWORK
DROP TABLE IF EXISTS contacts CASCADE;
CREATE TABLE contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Contacts Security
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own contacts" 
ON contacts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
