-- health_data table for Google Fit integration
CREATE TABLE IF NOT EXISTS public.health_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    steps INTEGER DEFAULT 0,
    heart_rate INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- RLS Policies
ALTER TABLE public.health_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own health data" 
ON public.health_data FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own health data" 
ON public.health_data FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own health data" 
ON public.health_data FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Caregivers can view health data of members they are linked to
-- (Assuming we have a profiles table that stores who the caregiver is)
-- But since we use Caregiver.fetchOperatives(), it likely queries public profiles.
-- For now, allow caregivers (role = 'caregiver') to read all health_data for the demo.
CREATE POLICY "Caregivers can view all health data"
ON public.health_data FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'caregiver'
  )
);
