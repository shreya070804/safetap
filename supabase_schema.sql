-- 🛡️ SafeTap MASTER Production Schema
-- This file contains the complete database structure, RLS policies, and indexes.

-- 1. PROFILES: Core Biometric & User Data
DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  onboarding_completed boolean DEFAULT false,
  role text DEFAULT 'user', -- 'user' (operative) or 'caregiver' (guardian)
  blood_type text,
  physician text,
  emergency_contact text,
  allergies text,
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- 2. CONTACTS: Emergency Circle / Trusted Responders
DROP TABLE IF EXISTS contacts CASCADE;
CREATE TABLE contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own contacts" 
ON contacts FOR ALL TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_contacts_user_id ON contacts(user_id);

-- 3. ALERTS: SOS Incident Logs & Telemetry
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
  location text, -- Geocoded address string
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can trigger own alerts" 
ON alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own alerts" 
ON alerts FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_timestamp ON alerts(timestamp DESC);

-- 4. HEALTH DATA (Optional: For Wearable Sync History)
DROP TABLE IF EXISTS health_data CASCADE;
CREATE TABLE health_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  steps integer,
  heart_rate integer,
  activity_level text,
  recorded_at timestamptz DEFAULT now()
);

ALTER TABLE health_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own health data" 
ON health_data FOR ALL TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);
