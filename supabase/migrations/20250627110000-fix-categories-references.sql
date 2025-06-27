
-- Update the get_brand_campaigns function to use categories array instead of category
CREATE OR REPLACE FUNCTION get_brand_campaigns(
  brand_filter text DEFAULT 'all'
)
RETURNS TABLE (
  campaign_id uuid,
  campaign_title text,
  campaign_status text,
  budget integer,
  spent integer,
  applicants bigint,
  accepted bigint,
  due_date date,
  platforms text[],
  categories text[],
  progress integer
) AS $$
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
    COALESCE(c.categories, ARRAY['General']::text[]) as categories,
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
  GROUP BY c.id, c.title, c.status, c.budget, c.amount, c.due_date, c.categories
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
