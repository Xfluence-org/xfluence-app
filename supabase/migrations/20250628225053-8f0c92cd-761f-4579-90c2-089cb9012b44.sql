
-- Drop all existing policies on brand_users table first
DROP POLICY IF EXISTS "Users can create brand associations" ON public.brand_users;
DROP POLICY IF EXISTS "Users can view their brand associations" ON public.brand_users;
DROP POLICY IF EXISTS "Users can view their own brand associations" ON public.brand_users;
DROP POLICY IF EXISTS "Users can update their own brand associations" ON public.brand_users;
DROP POLICY IF EXISTS "Users can create their own brand associations" ON public.brand_users;

-- Create new RLS policies for brand_users table with unique names
CREATE POLICY "brand_users_insert_policy" ON public.brand_users
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "brand_users_select_policy" ON public.brand_users
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "brand_users_update_policy" ON public.brand_users
FOR UPDATE USING (user_id = auth.uid());

-- Drop existing policies on brands table
DROP POLICY IF EXISTS "Users can create their own brands" ON public.brands;
DROP POLICY IF EXISTS "Users can view all brands" ON public.brands;
DROP POLICY IF EXISTS "Users can create brands" ON public.brands;
DROP POLICY IF EXISTS "Brand owners can update their brands" ON public.brands;

-- Create new RLS policies for brands table
CREATE POLICY "brands_insert_policy" ON public.brands
FOR INSERT WITH CHECK (true);

CREATE POLICY "brands_select_policy" ON public.brands
FOR SELECT USING (true);

CREATE POLICY "brands_update_policy" ON public.brands
FOR UPDATE USING (
  id IN (
    SELECT brand_id FROM public.brand_users WHERE user_id = auth.uid()
  )
);
