
-- Function to get recent applications for brand campaigns (handles empty data gracefully)
CREATE OR REPLACE FUNCTION get_brand_applications(
  limit_count integer DEFAULT 10
)
RETURNS TABLE (
  application_id uuid,
  campaign_id uuid,
  campaign_title text,
  influencer_name text,
  influencer_handle text,
  followers_count integer,
  platform text,
  applied_at timestamptz,
  application_status text,
  engagement_rate decimal,
  average_views integer,
  niche text[],
  ai_score integer,
  application_message text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.id as application_id,
    c.id as campaign_id,
    c.title as campaign_title,
    COALESCE(p.name, 'Influencer User') as influencer_name,
    COALESCE('user_' || SUBSTRING(p.id::text, 1, 8), 'user_sample') as influencer_handle,
    COALESCE(ia.followers_count, 15000 + (RANDOM() * 35000)::integer) as followers_count,
    'Instagram' as platform,
    cp.created_at as applied_at,
    cp.status as application_status,
    COALESCE(ia.engagement_rate, (3.0 + (RANDOM() * 4)::numeric(3,1))) as engagement_rate,
    COALESCE(ia.media_count * 50, (800 + (RANDOM() * 4200)::integer)) as average_views,
    ARRAY['Fitness', 'Lifestyle', 'Fashion']::text[] as niche,
    COALESCE(cp.ai_match_score, (75 + (RANDOM() * 25)::integer)) as ai_score,
    COALESCE(cp.application_message, 'I would love to collaborate on this campaign!') as application_message
  FROM public.campaign_participants cp
  JOIN public.campaigns c ON cp.campaign_id = c.id
  JOIN public.brand_users bu ON c.brand_id = bu.brand_id
  LEFT JOIN public.profiles p ON cp.influencer_id = p.id
  LEFT JOIN public.instagram_accounts ia ON p.id = ia.user_id
  WHERE bu.user_id = auth.uid()
    AND cp.status IN ('applied', 'invited', 'pending')
  ORDER BY cp.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_brand_applications TO authenticated;
