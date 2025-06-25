
-- Drop and recreate RLS policies for campaign_participants to ensure they're correct
DROP POLICY IF EXISTS "Users can view their own campaign participations" ON public.campaign_participants;
DROP POLICY IF EXISTS "Users can update their own campaign participations" ON public.campaign_participants;

CREATE POLICY "Users can view their own campaign participations" ON public.campaign_participants
FOR SELECT USING (influencer_id = auth.uid());

CREATE POLICY "Users can update their own campaign participations" ON public.campaign_participants
FOR UPDATE USING (influencer_id = auth.uid());

-- Create brand_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.brand_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand_id uuid REFERENCES public.brands(id) ON DELETE CASCADE,
  role text DEFAULT 'admin',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, brand_id)
);

-- Enable RLS on brand_users table
ALTER TABLE public.brand_users ENABLE ROW LEVEL SECURITY;

-- Drop and recreate brand_users policies
DROP POLICY IF EXISTS "Users can view their own brand associations" ON public.brand_users;
CREATE POLICY "Users can view their own brand associations" ON public.brand_users
FOR SELECT USING (user_id = auth.uid());

-- Drop and recreate brands policies
DROP POLICY IF EXISTS "Brand users can manage their brands" ON public.brands;
CREATE POLICY "Brand users can manage their brands" ON public.brands 
FOR ALL USING (
  id IN (
    SELECT brand_id FROM public.brand_users WHERE user_id = auth.uid()
  )
);

-- Drop and recreate campaigns policies
DROP POLICY IF EXISTS "Brand users can manage their campaigns" ON public.campaigns;
CREATE POLICY "Brand users can manage their campaigns" ON public.campaigns
FOR ALL USING (
  brand_id IN (
    SELECT brand_id FROM public.brand_users WHERE user_id = auth.uid()
  )
);

-- Drop and recreate campaign_participants policies for brands
DROP POLICY IF EXISTS "Brands can manage participants in their campaigns" ON public.campaign_participants;
CREATE POLICY "Brands can manage participants in their campaigns" ON public.campaign_participants
FOR ALL USING (
  campaign_id IN (
    SELECT c.id FROM public.campaigns c 
    JOIN public.brand_users bu ON c.brand_id = bu.brand_id 
    WHERE bu.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Influencers can apply to campaigns" ON public.campaign_participants;
CREATE POLICY "Influencers can apply to campaigns" ON public.campaign_participants
FOR INSERT WITH CHECK (influencer_id = auth.uid());

-- Insert sample campaign participations for the specific user (only if they don't exist)
INSERT INTO public.campaign_participants (campaign_id, influencer_id, status)
SELECT c.id, '46ec4c99-d347-4c75-a0bb-5c409ed6c8ab'::uuid, 'invited'
FROM public.campaigns c 
JOIN public.brands b ON c.brand_id = b.id
WHERE b.name IN ('Nike', 'Starbucks')
AND NOT EXISTS (
  SELECT 1 FROM public.campaign_participants cp 
  WHERE cp.campaign_id = c.id 
  AND cp.influencer_id = '46ec4c99-d347-4c75-a0bb-5c409ed6c8ab'::uuid
);

-- Insert active campaigns for Adidas and Samsung (only if they don't exist)
INSERT INTO public.campaign_participants (campaign_id, influencer_id, status, progress, current_stage)
SELECT 
  c.id, 
  '46ec4c99-d347-4c75-a0bb-5c409ed6c8ab'::uuid, 
  'active',
  CASE WHEN b.name = 'Adidas' THEN 75 ELSE 50 END,
  CASE WHEN b.name = 'Adidas' THEN 'brand_review' ELSE 'content_draft' END
FROM public.campaigns c 
JOIN public.brands b ON c.brand_id = b.id
WHERE b.name IN ('Adidas', 'Samsung')
AND NOT EXISTS (
  SELECT 1 FROM public.campaign_participants cp 
  WHERE cp.campaign_id = c.id 
  AND cp.influencer_id = '46ec4c99-d347-4c75-a0bb-5c409ed6c8ab'::uuid
);

-- Create sample brand user associations for testing (only if they don't exist)
INSERT INTO public.brand_users (user_id, brand_id)
SELECT '46ec4c99-d347-4c75-a0bb-5c409ed6c8ab'::uuid, b.id
FROM public.brands b
WHERE b.name IN ('Nike', 'Samsung')
AND NOT EXISTS (
  SELECT 1 FROM public.brand_users bu 
  WHERE bu.user_id = '46ec4c99-d347-4c75-a0bb-5c409ed6c8ab'::uuid 
  AND bu.brand_id = b.id
)
LIMIT 2;
