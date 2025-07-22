-- Phase 1: Add invitation system to campaign_participants table
ALTER TABLE campaign_participants
ADD COLUMN IF NOT EXISTS invitation_token UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS invitation_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS invitation_claimed_at TIMESTAMP WITH TIME ZONE;

-- Drop the unique constraint if it exists (it will prevent multiple NULL influencer_ids)
ALTER TABLE campaign_participants
DROP CONSTRAINT IF EXISTS campaign_participants_campaign_id_influencer_id_key;

-- Add a new unique constraint that allows NULL influencer_id
CREATE UNIQUE INDEX IF NOT EXISTS campaign_participants_unique_with_influencer
ON campaign_participants(campaign_id, influencer_id)
WHERE influencer_id IS NOT NULL;

-- Create invitation_emails table for tracking sent invitations
CREATE TABLE IF NOT EXISTS invitation_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_participant_id UUID REFERENCES campaign_participants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on invitation_emails table
ALTER TABLE invitation_emails ENABLE ROW LEVEL SECURITY;

-- Create policies for invitation_emails
CREATE POLICY "Brands can manage invitation emails for their campaigns"
ON invitation_emails
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM campaign_participants cp
        JOIN campaigns c ON cp.campaign_id = c.id
        JOIN brand_users bu ON c.brand_id = bu.brand_id
        WHERE cp.id = invitation_emails.campaign_participant_id
        AND bu.user_id = auth.uid()
    )
);

-- Add policy for campaign_participants to allow token-based access
CREATE POLICY "Allow access via invitation token"
ON campaign_participants
FOR SELECT
USING (invitation_token IS NOT NULL);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaign_participants_invitation_token
ON campaign_participants(invitation_token)
WHERE invitation_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_invitation_emails_campaign_participant
ON invitation_emails(campaign_participant_id);