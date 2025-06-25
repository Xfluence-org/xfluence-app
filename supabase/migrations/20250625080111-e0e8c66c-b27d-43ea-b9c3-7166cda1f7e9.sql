
-- Update existing campaigns to match the exact hardcoded campaign data
UPDATE public.campaigns SET
  title = CASE 
    WHEN title = 'Summertime Collection Launch' THEN 'Air Max Campaign'
    WHEN title = 'Holiday Drinks Campaign' THEN 'Holiday Drinks Campaign' -- Keep as is
    WHEN title = 'Spring Collection Launch' THEN 'Summer Collection Launch' -- Rename this one
    ELSE title
  END,
  amount = CASE 
    WHEN title = 'Summertime Collection Launch' THEN 250000  -- $2,500 (Air Max Campaign)
    WHEN title = 'Spring Collection Launch' THEN 300000     -- $3,000 (Summer Collection Launch)  
    WHEN title = 'Holiday Drinks Campaign' THEN 150000      -- Keep $1,500
    ELSE amount
  END,
  due_date = CASE
    WHEN title = 'Summertime Collection Launch' THEN '2025-06-12'::date  -- Air Max Campaign due date
    WHEN title = 'Spring Collection Launch' THEN '2025-05-15'::date      -- Summer Collection Launch due date  
    ELSE due_date
  END,
  requirements = CASE
    WHEN title = 'Summertime Collection Launch' 
      THEN '{"posts": 1, "stories": 3, "reels": 1, "platforms": ["Instagram", "TikTok"]}'::jsonb
    WHEN title = 'Spring Collection Launch'
      THEN '{"posts": 2, "stories": 5, "platforms": ["Instagram", "TikTok"]}'::jsonb
    ELSE requirements
  END,
  -- Make these campaigns not public (they're for active/completed tabs, not opportunities)
  is_public = false
WHERE title IN ('Summertime Collection Launch', 'Spring Collection Launch', 'Holiday Drinks Campaign');

-- Update campaign participants to match the hardcoded statuses
UPDATE public.campaign_participants SET
  status = CASE 
    -- Air Max Campaign (Nike) should be "invited" status  
    WHEN EXISTS(SELECT 1 FROM public.campaigns c JOIN public.brands b ON c.brand_id = b.id 
                WHERE c.id = campaign_id AND c.title = 'Air Max Campaign' AND b.name = 'Nike') 
    THEN 'invited'
    -- Summer Collection Launch (Adidas) should be "completed" status
    WHEN EXISTS(SELECT 1 FROM public.campaigns c JOIN public.brands b ON c.brand_id = b.id 
                WHERE c.id = campaign_id AND c.title = 'Summer Collection Launch' AND b.name = 'Adidas') 
    THEN 'completed'
    ELSE status
  END,
  -- Set progress to match hardcoded values
  progress = CASE
    WHEN EXISTS(SELECT 1 FROM public.campaigns c JOIN public.brands b ON c.brand_id = b.id 
                WHERE c.id = campaign_id AND c.title = 'Air Max Campaign' AND b.name = 'Nike') 
    THEN 33  -- 33% progress for Air Max Campaign
    WHEN EXISTS(SELECT 1 FROM public.campaigns c JOIN public.brands b ON c.brand_id = b.id 
                WHERE c.id = campaign_id AND c.title = 'Summer Collection Launch' AND b.name = 'Adidas') 
    THEN 100 -- 100% progress for completed Summer Collection Launch
    ELSE progress
  END
WHERE campaign_id IN (
  SELECT c.id FROM public.campaigns c 
  JOIN public.brands b ON c.brand_id = b.id 
  WHERE (c.title = 'Air Max Campaign' AND b.name = 'Nike') 
     OR (c.title = 'Summer Collection Launch' AND b.name = 'Adidas')
     OR (c.title = 'Holiday Drinks Campaign' AND b.name = 'Starbucks')
);
