-- 🛡️ SafeTap Global Security & Connectivity Fix
-- Apply this in your Supabase SQL Editor to resolve the 403 Forbidden error.

-- 1. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- 2. Profiles: Allow users to manage their own profile (Fixes Onboarding 403)
DROP POLICY IF EXISTS "Users can manage own profile" ON profiles;
CREATE POLICY "Users can manage own profile" 
ON profiles FOR ALL 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Profiles: Allow profile visibility for joined queries
DROP POLICY IF EXISTS "Public profile visibility" ON profiles;
CREATE POLICY "Public profile visibility" 
ON profiles FOR SELECT 
TO authenticated 
USING (true);

-- 4. Alerts: Allow users to manage their own alerts
DROP POLICY IF EXISTS "Users can manage own alerts" ON alerts;
CREATE POLICY "Users can manage own alerts" 
ON alerts FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Contacts: Allow users to manage their own contacts
DROP POLICY IF EXISTS "Users can manage own contacts" ON contacts;
CREATE POLICY "Users can manage own contacts" 
ON contacts FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Caregivers: Allow them to see alerts from everyone (Tactical Monitor)
DROP POLICY IF EXISTS "Caregivers can view alerts" ON alerts;
CREATE POLICY "Caregivers can view alerts" 
ON alerts FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'caregiver'
  )
);
