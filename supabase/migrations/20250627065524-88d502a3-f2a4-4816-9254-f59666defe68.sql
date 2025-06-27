
-- Fix the database function (removes regex issue)
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
    COALESCE(c.budget::integer, c.amount::integer, 0) as budget,
    0 as spent,
    COUNT(cp.id) as applicants,
    COUNT(cp.id) FILTER (WHERE cp.status IN ('accepted', 'active')) as accepted,
    c.due_date::date,
    ARRAY['Instagram', 'TikTok']::text[] as platforms,
    COALESCE(c.category, 'General') as category,
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
  GROUP BY c.id, c.title, c.status, c.budget, c.amount, c.due_date, c.category
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample brands (safely)
INSERT INTO public.brands (name, created_at) 
SELECT 'Nike', NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.brands WHERE name = 'Nike');

INSERT INTO public.brands (name, created_at) 
SELECT 'Adidas', NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.brands WHERE name = 'Adidas');

INSERT INTO public.brands (name, created_at) 
SELECT 'Samsung', NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.brands WHERE name = 'Samsung');

-- Link your specific user to brands (so you can see campaigns)
INSERT INTO public.brand_users (user_id, brand_id, role)
SELECT 
  '9750447d-2583-4581-a223-0b77c751d6c8'::uuid,
  b.id,
  'admin'
FROM public.brands b 
WHERE b.name IN ('Nike', 'Adidas', 'Samsung')
  AND NOT EXISTS (
    SELECT 1 FROM public.brand_users bu 
    WHERE bu.user_id = '9750447d-2583-4581-a223-0b77c751d6c8'::uuid AND bu.brand_id = b.id
  );

-- Update existing campaigns with proper budgets
UPDATE public.campaigns SET
  budget = CASE 
    WHEN title ILIKE '%Air Max%' THEN 15000
    WHEN title ILIKE '%Summer%' THEN 20000
    WHEN title ILIKE '%Galaxy%' THEN 12000
    WHEN title ILIKE '%Nike%' THEN 18000
    WHEN title ILIKE '%Fitness%' THEN 25000
    ELSE 10000
  END
WHERE budget IS NULL;

-- Insert additional sample campaigns (no fake participants)
INSERT INTO public.campaigns (brand_id, title, description, category, amount, budget, status, due_date, application_deadline, created_at)
SELECT 
  b.id,
  campaign_data.title,
  campaign_data.description,
  campaign_data.category,
  campaign_data.amount,
  campaign_data.budget,
  campaign_data.status,
  campaign_data.due_date::date,
  (campaign_data.due_date::date - interval '7 days')::date,
  campaign_data.created_at::timestamptz
FROM public.brands b
CROSS JOIN (
  VALUES 
    ('Nike', 'Spring Running Campaign', 'Promote new running gear for spring season', 'Fitness', 300000, 35000, 'active', '2025-08-15', '2025-06-15 10:00:00'),
    ('Nike', 'Back to School Athletic', 'Athletic wear for students returning to school', 'Fashion', 180000, 22000, 'published', '2025-09-01', '2025-06-10 14:30:00'),
    ('Adidas', 'Soccer World Cup Prep', 'Soccer gear promotion for upcoming tournaments', 'Sports', 500000, 60000, 'active', '2025-07-30', '2025-06-12 09:15:00'),
    ('Samsung', 'Galaxy Watch Campaign', 'Fitness tracking with Galaxy Watch features', 'Technology', 220000, 28000, 'published', '2025-08-20', '2025-06-14 16:45:00')
) AS campaign_data(brand_name, title, description, category, amount, budget, status, due_date, created_at)
WHERE b.name = campaign_data.brand_name
  AND NOT EXISTS (
    SELECT 1 FROM public.campaigns c 
    WHERE c.brand_id = b.id AND c.title = campaign_data.title
  );
