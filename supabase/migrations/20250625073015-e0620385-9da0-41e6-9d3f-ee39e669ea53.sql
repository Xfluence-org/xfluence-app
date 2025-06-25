
-- Insert more realistic opportunity data
UPDATE public.campaigns SET
  compensation_min = CASE 
    WHEN title = 'Summertime Collection Launch' THEN 250000  -- $2,500-$3,000
    WHEN title = 'Holiday Drinks Campaign' THEN 120000      -- $1,200-$1,500  
    WHEN title = 'Fitness Motivation' THEN 200000           -- $2,000-$2,500
    WHEN title = 'Galaxy S25 Review' THEN 180000             -- $1,800-$2,200
  END,
  compensation_max = amount,
  is_public = CASE WHEN title IN ('Summertime Collection Launch', 'Holiday Drinks Campaign') THEN true ELSE false END,
  description = CASE
    WHEN title = 'Summertime Collection Launch' THEN 'Promote Nike''s new summer collection focusing on activewear and lifestyle pieces.'
    WHEN title = 'Holiday Drinks Campaign' THEN 'Showcase Starbucks holiday drink menu with creative content.'
    WHEN title = 'Fitness Motivation' THEN 'Feature Adidas spring collection in authentic lifestyle content.'
    WHEN title = 'Galaxy S25 Review' THEN 'Create engaging reviews of Samsung''s latest Galaxy S25 smartphone.'
  END,
  category = CASE
    WHEN title LIKE '%Collection%' OR title LIKE '%Fitness%' THEN 'Fitness'
    WHEN title LIKE '%Drinks%' THEN 'Food & Drinks'  
    WHEN title LIKE '%Galaxy%' THEN 'Technology'
    ELSE 'Lifestyle'
  END,
  application_deadline = due_date - interval '7 days',
  target_reach = 10000,
  target_engagement_rate = 3.0;

-- Add one more public opportunity for variety
INSERT INTO public.campaigns (brand_id, title, description, category, compensation_min, compensation_max, requirements, due_date, status, is_public, target_reach, target_engagement_rate, application_deadline)
SELECT 
  b.id,
  'Spring Collection Launch',
  'Feature Adidas spring collection in authentic lifestyle content.',
  'Fitness',
  200000,
  250000,
  '{"posts": 2, "stories": 3, "reels": 1}'::jsonb,
  '2025-08-15'::date,
  'published',
  true,
  15000,
  4.0,
  '2025-08-08'::date
FROM public.brands b WHERE b.name = 'Adidas';
