-- Fix RLS to allow anonymous access to campaign data for invitations
DROP POLICY IF EXISTS "Anyone can view public opportunities" ON campaigns;
DROP POLICY IF EXISTS "Anyone can view published opportunities" ON campaigns;

CREATE POLICY "Public can view campaigns for invitations" 
ON campaigns 
FOR SELECT 
USING (
  -- Allow public access if this campaign has invitation tokens
  EXISTS (
    SELECT 1 FROM campaign_participants cp 
    WHERE cp.campaign_id = campaigns.id 
    AND cp.invitation_token IS NOT NULL
  )
  OR 
  -- Or if it's a public published campaign
  (is_public = true AND status = 'published')
);