-- Fix the data type mismatch in get_brand_applications function
DROP FUNCTION IF EXISTS get_brand_applications(limit_count integer);

CREATE OR REPLACE FUNCTION get_brand_applications(limit_count integer DEFAULT 50)
RETURNS TABLE (
    application_id TEXT,
    campaign_id UUID,
    campaign_title TEXT,
    influencer_id UUID,
    influencer_name TEXT,
    influencer_handle TEXT,
    followers_count BIGINT,
    platform TEXT,
    influencer_profile_url TEXT,
    applied_at TIMESTAMP WITH TIME ZONE,
    application_status TEXT,
    engagement_rate NUMERIC,
    average_views BIGINT,
    niche TEXT,
    ai_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cp.id::TEXT as application_id,
        cp.campaign_id,
        c.title as campaign_title,
        cp.influencer_id,
        p.name as influencer_name,
        COALESCE(ia.username, p.email) as influencer_handle,
        COALESCE(ia.followers_count, 0::bigint) as followers_count,
        'Instagram' as platform,
        COALESCE(ia.profile_picture, '') as influencer_profile_url,
        cp.created_at as applied_at,
        cp.status as application_status,
        COALESCE(ia.engagement_rate, 0::numeric) as engagement_rate,
        0::bigint as average_views,
        COALESCE(p.name, 'General') as niche,
        COALESCE(cp.ai_match_score::numeric, 0::numeric) as ai_score  -- Cast to numeric
    FROM campaign_participants cp
    JOIN campaigns c ON cp.campaign_id = c.id
    LEFT JOIN instagram_accounts ia ON cp.influencer_id = ia.user_id
    LEFT JOIN profiles p ON cp.influencer_id = p.id
    WHERE c.brand_id IN (
        SELECT brand_id 
        FROM brand_users 
        WHERE user_id = auth.uid()
    )
    AND cp.status IN ('pending', 'accepted', 'active')
    ORDER BY cp.created_at DESC
    LIMIT limit_count;
END;
$$;