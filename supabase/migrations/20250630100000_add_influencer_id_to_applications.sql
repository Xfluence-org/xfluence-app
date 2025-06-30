-- Drop and recreate get_brand_applications to include influencer_id
DROP FUNCTION IF EXISTS get_brand_applications(integer);

CREATE OR REPLACE FUNCTION get_brand_applications(
  limit_count integer DEFAULT 10
)
RETURNS TABLE (
  application_id uuid,
  campaign_id uuid,
  campaign_title text,
  influencer_id uuid,
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
  application_message text,
  influencer_profile_url text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.id as application_id,
    c.id as campaign_id,
    c.title as campaign_title,
    cp.influencer_id as influencer_id,
    COALESCE(p.name, 'Influencer User') as influencer_name,
    COALESCE('@' || COALESCE(p.name, 'user_' || SUBSTRING(cp.influencer_id::text, 1, 8)), '@user_sample') as influencer_handle,
    ROUND((15000 + HASHTEXT(cp.influencer_id::text)::numeric % 35000))::integer as followers_count,
    'Instagram' as platform,
    cp.created_at as applied_at,
    cp.status as application_status,
    ROUND((3.0 + (HASHTEXT(cp.influencer_id::text || 'engagement')::numeric % 4000) / 1000), 1)::decimal as engagement_rate,
    ROUND((800 + HASHTEXT(cp.influencer_id::text || 'views')::numeric % 4200))::integer as average_views,
    ARRAY['Fitness', 'Lifestyle', 'Fashion']::text[] as niche,
    ROUND(75 + (HASHTEXT(cp.influencer_id::text || 'score')::numeric % 25))::integer as ai_score,
    COALESCE(cp.application_message, 'I would love to collaborate on this campaign!') as application_message,
    'https://i.pravatar.cc/150?u=' || cp.influencer_id::text as influencer_profile_url
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