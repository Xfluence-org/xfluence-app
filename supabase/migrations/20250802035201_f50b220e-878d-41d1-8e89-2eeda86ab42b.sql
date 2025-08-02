-- Fix invitation access for public access (before login)
-- Update the RLS policy to allow public access to invitations by token
DROP POLICY IF EXISTS "Allow invitation token access" ON campaign_participants;

CREATE POLICY "Public can access invitations by token" 
ON campaign_participants 
FOR SELECT 
USING (invitation_token IS NOT NULL);

-- Also allow updating invitation after claiming
DROP POLICY IF EXISTS "Allow invitation claiming" ON campaign_participants;

CREATE POLICY "Public can claim invitations" 
ON campaign_participants 
FOR UPDATE 
USING (invitation_token IS NOT NULL)
WITH CHECK (invitation_token IS NOT NULL);