
-- Function to get campaigns for brand dashboard (UPDATED FOR YOUR TABLE)
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
  category text,
  progress integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as campaign_id,
    c.title as campaign_title,
    c.status as campaign_status,
    CASE 
      WHEN c.budget IS NOT NULL AND c.budget ~ '^[0-9]+$' THEN c.budget::integer
      ELSE COALESCE(c.amount::integer, 0)
    END as budget,
    0 as spent,  -- You don't have a spent column yet, defaulting to 0
    COUNT(cp.id) as applicants,
    COUNT(cp.id) FILTER (WHERE cp.status IN ('accepted', 'active')) as accepted,
    c.due_date::date,
    ARRAY['Instagram', 'TikTok']::text[] as platforms,
    COALESCE(c.category, 'General') as category,
    CASE 
      WHEN c.status = 'completed' THEN 100
      WHEN c.status = 'active' THEN 50
      WHEN c.status = 'published' THEN 75
      ELSE 25
    END as progress
  FROM public.campaigns c
  JOIN public.brand_users bu ON c.brand_id = bu.brand_id
  LEFT JOIN public.campaign_participants cp ON c.id = cp.campaign_id
  WHERE bu.user_id = auth.uid()
    AND c.status IN ('active', 'published', 'completed', 'draft')
  GROUP BY c.id, c.title, c.status, c.budget, c.amount, c.due_date, c.category
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_brand_campaigns TO authenticated;
