
-- Update the get_opportunities function to properly exclude applications the user has already made
CREATE OR REPLACE FUNCTION public.get_opportunities(
  search_query text DEFAULT ''::text,
  category_filter text DEFAULT ''::text,
  min_compensation integer DEFAULT 0,
  max_compensation integer DEFAULT 999999999,
  platform_filter text DEFAULT ''::text
)
RETURNS TABLE(
  id uuid,
  title text,
  brand_name text,
  description text,
  category text,
  compensation_min integer,
  compensation_max integer,
  requirements jsonb,
  created_at timestamp with time zone,
  due_date date,
  application_deadline date,
  has_applied boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    b.name as brand_name,
    c.description,
    COALESCE(
      CASE 
        WHEN array_length(c.category, 1) > 0 THEN c.category[1] 
        ELSE 'General' 
      END, 
      'General'
    ) as category,
    c.compensation_min,
    c.compensation_max,
    c.requirements,
    c.created_at,
    c.due_date,
    c.application_deadline,
    EXISTS(
      SELECT 1 FROM public.campaign_participants cp 
      WHERE cp.campaign_id = c.id 
      AND cp.influencer_id = auth.uid()
    ) as has_applied
  FROM public.campaigns c
  JOIN public.brands b ON c.brand_id = b.id
  WHERE c.is_public = true 
    AND c.status = 'published'
    AND c.application_deadline > CURRENT_DATE
    -- Exclude campaigns where user has already applied (regardless of status)
    AND NOT EXISTS(
      SELECT 1 FROM public.campaign_participants cp 
      WHERE cp.campaign_id = c.id 
      AND cp.influencer_id = auth.uid()
    )
    AND (search_query = '' OR (
      c.title ILIKE '%' || search_query || '%' OR
      b.name ILIKE '%' || search_query || '%' OR
      COALESCE(c.category[1], '') ILIKE '%' || search_query || '%' OR
      COALESCE(c.description, '') ILIKE '%' || search_query || '%'
    ))
    AND (category_filter = '' OR c.category[1] ILIKE category_filter)
    AND COALESCE(c.compensation_max, 0) >= min_compensation
    AND COALESCE(c.compensation_min, 0) <= max_compensation
  ORDER BY c.created_at DESC;
END;
$$;
