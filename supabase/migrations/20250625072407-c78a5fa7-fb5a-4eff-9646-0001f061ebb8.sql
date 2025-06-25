
-- Add application tracking fields
ALTER TABLE public.campaign_participants
ADD COLUMN application_message text,
ADD COLUMN ai_match_score integer DEFAULT 0; -- 0-100 AI compatibility score

-- Add index for faster opportunity queries
CREATE INDEX idx_campaigns_public ON public.campaigns(is_public, created_at) WHERE is_public = true;
CREATE INDEX idx_campaigns_search ON public.campaigns USING gin(to_tsvector('english', title || ' ' || description || ' ' || category));
