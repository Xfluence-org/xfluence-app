-- Fix the get_campaign_active_influencers function type mismatch too
CREATE OR REPLACE FUNCTION public.get_campaign_active_influencers(campaign_id_param uuid)
 RETURNS TABLE(id uuid, influencer_id uuid, current_stage text, accepted_at timestamp with time zone, status text, influencer_name text, influencer_handle text, followers_count integer, engagement_rate numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
  BEGIN
    RETURN QUERY
    SELECT
      cp.id,
      cp.influencer_id,
      cp.current_stage,
      cp.accepted_at,
      cp.status,
      COALESCE(p.name, 'Influencer User') as influencer_name,
      COALESCE('@' || LOWER(REPLACE(p.name, ' ', '')), '@user_' ||
  SUBSTRING(cp.influencer_id::text, 1, 8)) as influencer_handle,
      -- Generate consistent follower count (cast bigint to integer)
      COALESCE(
        ia.followers_count::integer,
        15000 + (ABS(HASHTEXT(cp.influencer_id::text)) % 35000)
      ) as followers_count,
      -- Generate consistent engagement rate
      COALESCE(
        ia.engagement_rate,
        ROUND((3.0 + (ABS(HASHTEXT(cp.influencer_id::text || 'engagement'))
   % 400) / 100.0)::numeric, 1)
      ) as engagement_rate
    FROM public.campaign_participants cp
    LEFT JOIN public.profiles p ON cp.influencer_id = p.id
    LEFT JOIN public.instagram_accounts ia ON p.id = ia.user_id
    WHERE cp.campaign_id = campaign_id_param
      AND cp.status = 'accepted'
      AND cp.current_stage IN ('content_creation', 'content_review',
  'publish_analytics')
    ORDER BY cp.accepted_at DESC;
  END;
  $function$;