
-- Update the get_brand_campaigns function to handle category array properly
CREATE OR REPLACE FUNCTION public.get_brand_campaigns(brand_filter text DEFAULT 'all'::text)
RETURNS TABLE(campaign_id uuid, campaign_title text, campaign_status text, budget integer, spent integer, applicants bigint, accepted bigint, due_date date, platforms text[], category text, progress integer)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as campaign_id,
    c.title as campaign_title,
    c.status as campaign_status,
    COALESCE(c.budget::integer, c.amount::integer, 0) as budget,
    0 as spent,
    COUNT(cp.id) as applicants,
    COUNT(cp.id) FILTER (WHERE cp.status IN ('accepted', 'active')) as accepted,
    c.due_date::date,
    ARRAY['Instagram', 'TikTok']::text[] as platforms,
    COALESCE(
      CASE 
        WHEN array_length(c.category, 1) > 0 THEN c.category[1] 
        ELSE 'General' 
      END, 
      'General'
    ) as category,
    CASE 
      WHEN c.status = 'completed' THEN 100
      WHEN c.status = 'active' THEN 75
      WHEN c.status = 'published' THEN 50
      ELSE 25
    END as progress
  FROM public.campaigns c
  JOIN public.brand_users bu ON c.brand_id = bu.brand_id
  LEFT JOIN public.campaign_participants cp ON c.id = cp.campaign_id
  WHERE bu.user_id = auth.uid() 
  AND c.status = 'active'
  GROUP BY c.id, c.title, c.status, c.budget, c.amount, c.due_date, c.category
  ORDER BY c.created_at DESC;
END;
$$;

-- Update the get_opportunities function to handle category array properly
CREATE OR REPLACE FUNCTION get_opportunities(
  search_query text DEFAULT '',
  category_filter text DEFAULT '',
  min_compensation integer DEFAULT 0,
  max_compensation integer DEFAULT 999999999,
  platform_filter text DEFAULT ''
)
RETURNS TABLE (
  id uuid,
  title text,
  brand_name text,
  description text,
  category text,
  compensation_min integer,
  compensation_max integer,
  requirements jsonb,
  created_at timestamptz,
  due_date date,
  application_deadline date,
  has_applied boolean
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;
