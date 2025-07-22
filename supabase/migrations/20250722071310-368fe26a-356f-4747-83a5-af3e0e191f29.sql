-- Fix RLS policies for campaign_tasks to allow influencers to see their assigned tasks

-- First, check the current policy
DROP POLICY IF EXISTS "Users can view tasks for their campaigns" ON public.campaign_tasks;

-- Create a comprehensive policy that allows influencers to see their tasks
CREATE POLICY "Influencers can view their assigned tasks" 
ON public.campaign_tasks 
FOR SELECT 
USING (
  -- Allow if the user is the assigned influencer
  influencer_id = auth.uid()
  OR
  -- Allow if the user is a brand user for this campaign
  EXISTS (
    SELECT 1 
    FROM campaigns c
    JOIN brand_users bu ON c.brand_id = bu.brand_id
    WHERE c.id = campaign_tasks.campaign_id 
    AND bu.user_id = auth.uid()
  )
);

-- Also ensure influencers can view campaign data they're assigned to
DROP POLICY IF EXISTS "Users can view their own campaign participations" ON public.campaigns;

CREATE POLICY "Users can view campaigns they participate in" 
ON public.campaigns 
FOR SELECT 
USING (
  -- Brand users can see their campaigns
  brand_id IN (
    SELECT brand_id 
    FROM brand_users 
    WHERE user_id = auth.uid()
  )
  OR
  -- Influencers can see campaigns they're assigned to via tasks
  id IN (
    SELECT DISTINCT campaign_id 
    FROM campaign_tasks 
    WHERE influencer_id = auth.uid()
  )
  OR
  -- Public campaigns visible to all
  (is_public = true AND status = 'published')
);