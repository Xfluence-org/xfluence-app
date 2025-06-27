
-- Add RLS policies for brand creation and management
CREATE POLICY "Users can create their own brands" ON public.brands
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view all brands" ON public.brands
FOR SELECT USING (true);

-- Add RLS policies for brand_users table
CREATE POLICY "Users can create brand associations" ON public.brand_users
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their brand associations" ON public.brand_users
FOR SELECT USING (user_id = auth.uid());

-- Update campaigns table to allow brand users to create campaigns
DROP POLICY IF EXISTS "Brand users can manage their campaigns" ON public.campaigns;
CREATE POLICY "Brand users can manage their campaigns" ON public.campaigns
FOR ALL USING (
  brand_id IN (
    SELECT brand_id FROM public.brand_users WHERE user_id = auth.uid()
  )
);
