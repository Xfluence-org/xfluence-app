-- Fix infinite recursion by removing cross-table policy references
-- Drop the problematic policies first
DROP POLICY IF EXISTS "Public can view campaigns for invitations" ON campaigns;
DROP POLICY IF EXISTS "Public can access invitations by token" ON campaign_participants;
DROP POLICY IF EXISTS "Public can claim invitations" ON campaign_participants;

-- Create simple, non-recursive policies for campaign_participants
CREATE POLICY "Anyone can view campaign participants with invitation token" 
ON campaign_participants 
FOR SELECT 
TO public
USING (invitation_token IS NOT NULL);

CREATE POLICY "Anyone can update campaign participants with invitation token" 
ON campaign_participants 
FOR UPDATE 
TO public
USING (invitation_token IS NOT NULL)
WITH CHECK (invitation_token IS NOT NULL);

-- Create simple policy for campaigns that doesn't reference other tables
CREATE POLICY "Public campaigns are viewable" 
ON campaigns 
FOR SELECT 
TO public
USING (is_public = true AND status = 'published');

-- Create a security definer function to safely check campaign access for invitations
CREATE OR REPLACE FUNCTION public.can_access_campaign_via_invitation(campaign_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM campaign_participants cp 
    WHERE cp.campaign_id = campaign_id_param 
    AND cp.invitation_token IS NOT NULL
  );
$$;

-- Now create a safe policy for campaigns using the function
CREATE POLICY "Campaigns accessible via invitations" 
ON campaigns 
FOR SELECT 
TO public
USING (public.can_access_campaign_via_invitation(id));