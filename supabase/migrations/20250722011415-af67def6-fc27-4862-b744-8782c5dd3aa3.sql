-- Fix RLS policy for invitation token access
-- Allow access to campaign_participants by invitation_token for unauthenticated users

-- Drop the existing policy and create a more permissive one for invitation access
DROP POLICY IF EXISTS "Allow access via invitation token" ON public.campaign_participants;

-- Create a new policy that allows unauthenticated access via invitation token
CREATE POLICY "Allow invitation token access" 
ON public.campaign_participants 
FOR SELECT 
TO anon, authenticated
USING (invitation_token IS NOT NULL);

-- Also ensure we can update participants when claiming invitations
CREATE POLICY "Allow invitation claiming" 
ON public.campaign_participants 
FOR UPDATE 
TO authenticated
USING (invitation_token IS NOT NULL AND influencer_id IS NULL)
WITH CHECK (invitation_token IS NOT NULL);