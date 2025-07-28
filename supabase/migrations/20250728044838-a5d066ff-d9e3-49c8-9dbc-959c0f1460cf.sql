-- Clear cached Instagram data to force fresh fetch with new edge function
TRUNCATE TABLE instagram_accounts RESTART IDENTITY CASCADE;

-- Fix the get_brand_applications function data type issue
-- The issue is likely a column type mismatch, let's check and fix the function
DROP FUNCTION IF EXISTS get_brand_applications(limit_count integer);

CREATE OR REPLACE FUNCTION get_brand_applications(limit_count integer DEFAULT 50)
RETURNS TABLE (
    application_id TEXT,
    campaign_id UUID,
    campaign_title TEXT,
    influencer_id UUID,
    influencer_name TEXT,
    influencer_handle TEXT,
    followers_count BIGINT,  -- Changed from INTEGER to BIGINT
    platform TEXT,
    influencer_profile_url TEXT,
    applied_at TIMESTAMP WITH TIME ZONE,
    application_status TEXT,
    engagement_rate NUMERIC,
    average_views BIGINT,    -- Changed from INTEGER to BIGINT
    niche TEXT,
    ai_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ca.id::TEXT as application_id,
        ca.campaign_id,
        c.title as campaign_title,
        ia.id as influencer_id,
        p.name as influencer_name,
        ia.handle as influencer_handle,
        ia.followers_count,
        'Instagram' as platform,
        ia.profile_url as influencer_profile_url,
        ca.created_at as applied_at,
        ca.status as application_status,
        ia.engagement_rate,
        ia.average_views,
        ia.niche,
        ca.ai_score
    FROM campaign_applications ca
    JOIN campaigns c ON ca.campaign_id = c.id
    JOIN influencer_accounts ia ON ca.influencer_id = ia.id
    JOIN profiles p ON ia.user_id = p.id
    WHERE c.brand_id IN (
        SELECT brand_id 
        FROM brand_users 
        WHERE user_id = auth.uid()
    )
    ORDER BY ca.created_at DESC
    LIMIT limit_count;
END;
$$;