-- Fix infinite recursion in RLS policies by using security definer functions

-- First, create a security definer function to check if user has access to a campaign
CREATE OR REPLACE FUNCTION public.user_has_campaign_access(campaign_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    -- Check if user is a brand user for this campaign
    SELECT 1 
    FROM campaigns c
    JOIN brand_users bu ON c.brand_id = bu.brand_id
    WHERE c.id = campaign_id_param 
    AND bu.user_id = user_id_param
  )
  OR EXISTS (
    -- Check if user is assigned as influencer to tasks in this campaign
    SELECT 1 
    FROM campaign_tasks ct
    WHERE ct.campaign_id = campaign_id_param 
    AND ct.influencer_id = user_id_param
  )
  OR EXISTS (
    -- Check if campaign is public and published
    SELECT 1 
    FROM campaigns c
    WHERE c.id = campaign_id_param
    AND c.is_public = true 
    AND c.status = 'published'
  );
$$;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view campaigns they participate in" ON public.campaigns;

-- Create a new policy using the security definer function
CREATE POLICY "Users can view accessible campaigns" 
ON public.campaigns 
FOR SELECT 
USING (public.user_has_campaign_access(id, auth.uid()));

-- Also ensure the campaign_tasks policy is simple and doesn't cause recursion
DROP POLICY IF EXISTS "Influencers can view their assigned tasks" ON public.campaign_tasks;

CREATE POLICY "Users can view their tasks" 
ON public.campaign_tasks 
FOR SELECT 
USING (
  influencer_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 
    FROM campaigns c
    JOIN brand_users bu ON c.brand_id = bu.brand_id
    WHERE c.id = campaign_tasks.campaign_id 
    AND bu.user_id = auth.uid()
  )
);