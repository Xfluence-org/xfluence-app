
-- Create brand_users table to link users to brands they can manage
CREATE TABLE public.brand_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id uuid REFERENCES public.brands(id) ON DELETE CASCADE,
  role text DEFAULT 'admin', -- 'admin', 'manager', etc.
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, brand_id)
);

-- Enable RLS on brand_users table
ALTER TABLE public.brand_users ENABLE ROW LEVEL SECURITY;

-- RLS policy for brand_users (users can only see their own brand associations)
CREATE POLICY "Users can view their own brand associations" ON public.brand_users
FOR SELECT USING (user_id = auth.uid());

-- Add the enhanced RLS policies you requested

-- Brands: Allow brand users to manage their own brands
CREATE POLICY "Brand users can manage their brands" ON public.brands 
FOR ALL USING (
  id IN (
    SELECT brand_id FROM public.brand_users WHERE user_id = auth.uid()
  )
);

-- Campaigns: Allow brand users to manage their campaigns
CREATE POLICY "Brand users can manage their campaigns" ON public.campaigns
FOR ALL USING (
  brand_id IN (
    SELECT brand_id FROM public.brand_users WHERE user_id = auth.uid()
  )
);

-- Campaign Participants: Allow brands to view/manage participants in their campaigns
CREATE POLICY "Brands can manage participants in their campaigns" ON public.campaign_participants
FOR ALL USING (
  campaign_id IN (
    SELECT c.id FROM public.campaigns c 
    JOIN public.brand_users bu ON c.brand_id = bu.brand_id 
    WHERE bu.user_id = auth.uid()
  )
);

-- Campaign Participants: Allow influencers to apply to campaigns
CREATE POLICY "Influencers can apply to campaigns" ON public.campaign_participants
FOR INSERT WITH CHECK (influencer_id = auth.uid());

-- Sample data: Create brand user associations for testing
-- Note: You'll need to replace with actual user IDs after users register
INSERT INTO public.brand_users (user_id, brand_id)
SELECT auth.uid(), b.id
FROM public.brands b
WHERE auth.uid() IS NOT NULL AND b.name IN ('Nike', 'Samsung')
LIMIT 2;
