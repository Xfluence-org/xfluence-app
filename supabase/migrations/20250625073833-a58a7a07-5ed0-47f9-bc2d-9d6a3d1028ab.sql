
-- Function to get opportunities with search and filters
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
    c.category,
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
      COALESCE(c.category, '') ILIKE '%' || search_query || '%' OR
      COALESCE(c.description, '') ILIKE '%' || search_query || '%'
    ))
    AND (category_filter = '' OR c.category ILIKE category_filter)
    AND COALESCE(c.compensation_max, 0) >= min_compensation
    AND COALESCE(c.compensation_min, 0) <= max_compensation
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_opportunities TO authenticated;
