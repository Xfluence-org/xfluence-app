
-- Insert sample campaign tasks to match the hardcoded data structure
INSERT INTO public.campaign_tasks (campaign_id, influencer_id, task_type, title, deliverable_count, status, progress, next_deadline)
SELECT 
  c.id,
  '46ec4c99-d347-4c75-a0bb-5c409ed6c8ab'::uuid,
  CASE 
    WHEN c.title = 'Air Max Campaign' AND row_number() OVER (PARTITION BY c.id ORDER BY c.id) = 1 THEN 'Posts'
    WHEN c.title = 'Air Max Campaign' AND row_number() OVER (PARTITION BY c.id ORDER BY c.id) = 2 THEN 'Stories'
    WHEN c.title = 'Air Max Campaign' AND row_number() OVER (PARTITION BY c.id ORDER BY c.id) = 3 THEN 'Reels'
    WHEN c.title = 'Summer Collection Launch' AND row_number() OVER (PARTITION BY c.id ORDER BY c.id) = 1 THEN 'Posts'
    WHEN c.title = 'Summer Collection Launch' AND row_number() OVER (PARTITION BY c.id ORDER BY c.id) = 2 THEN 'Stories'
    WHEN c.title = 'Holiday Drinks Campaign' AND row_number() OVER (PARTITION BY c.id ORDER BY c.id) = 1 THEN 'Posts'
    WHEN c.title = 'Holiday Drinks Campaign' AND row_number() OVER (PARTITION BY c.id ORDER BY c.id) = 2 THEN 'Stories'
    ELSE 'Posts'
  END,
  CASE 
    WHEN c.title = 'Air Max Campaign' AND row_number() OVER (PARTITION BY c.id ORDER BY c.id) = 1 THEN 'Instagram Post'
    WHEN c.title = 'Air Max Campaign' AND row_number() OVER (PARTITION BY c.id ORDER BY c.id) = 2 THEN 'Instagram Stories'
    WHEN c.title = 'Air Max Campaign' AND row_number() OVER (PARTITION BY c.id ORDER BY c.id) = 3 THEN 'TikTok Reel'
    WHEN c.title = 'Summer Collection Launch' AND row_number() OVER (PARTITION BY c.id ORDER BY c.id) = 1 THEN 'Instagram Posts'
    WHEN c.title = 'Summer Collection Launch' AND row_number() OVER (PARTITION BY c.id ORDER BY c.id) = 2 THEN 'Instagram Stories'
    WHEN c.title = 'Holiday Drinks Campaign' AND row_number() OVER (PARTITION BY c.id ORDER BY c.id) = 1 THEN 'Instagram Post'
    WHEN c.title = 'Holiday Drinks Campaign' AND row_number() OVER (PARTITION BY c.id ORDER BY c.id) = 2 THEN 'Instagram Stories'
    ELSE 'Content Task'
  END,
  CASE 
    WHEN c.title = 'Air Max Campaign' AND row_number() OVER (PARTITION BY c.id ORDER BY c.id) = 1 THEN 1
    WHEN c.title = 'Air Max Campaign' AND row_number() OVER (PARTITION BY c.id ORDER BY c.id) = 2 THEN 3
    WHEN c.title = 'Air Max Campaign' AND row_number() OVER (PARTITION BY c.id ORDER BY c.id) = 3 THEN 1
    WHEN c.title = 'Summer Collection Launch' AND row_number() OVER (PARTITION BY c.id ORDER BY c.id) = 1 THEN 2
    WHEN c.title = 'Summer Collection Launch' AND row_number() OVER (PARTITION BY c.id ORDER BY c.id) = 2 THEN 5
    WHEN c.title = 'Holiday Drinks Campaign' AND row_number() OVER (PARTITION BY c.id ORDER BY c.id) = 1 THEN 1
    WHEN c.title = 'Holiday Drinks Campaign' AND row_number() OVER (PARTITION BY c.id ORDER BY c.id) = 2 THEN 2
    ELSE 1
  END,
  CASE 
    WHEN c.title = 'Air Max Campaign' THEN 'content review'
    WHEN c.title = 'Summer Collection Launch' THEN 'completed'
    WHEN c.title = 'Holiday Drinks Campaign' THEN 'pending'
    ELSE 'pending'
  END,
  CASE 
    WHEN c.title = 'Air Max Campaign' THEN 33
    WHEN c.title = 'Summer Collection Launch' THEN 100
    WHEN c.title = 'Holiday Drinks Campaign' THEN 0
    ELSE 0
  END,
  CASE 
    WHEN c.title = 'Air Max Campaign' THEN '2025-06-10'::date
    WHEN c.title = 'Summer Collection Launch' THEN NULL  -- Completed, no deadline
    WHEN c.title = 'Holiday Drinks Campaign' THEN '2025-07-20'::date
    ELSE NULL
  END
FROM public.campaigns c
CROSS JOIN generate_series(1, 
  CASE 
    WHEN c.title = 'Air Max Campaign' THEN 3  -- 3 tasks: 1 Post, 3 Stories, 1 Reel
    WHEN c.title = 'Summer Collection Launch' THEN 2  -- 2 tasks: 2 Posts, 5 Stories
    WHEN c.title = 'Holiday Drinks Campaign' THEN 2  -- 2 tasks: 1 Post, 2 Stories
    ELSE 1
  END
) as task_num
WHERE c.title IN ('Air Max Campaign', 'Summer Collection Launch', 'Holiday Drinks Campaign')
AND NOT EXISTS (
  SELECT 1 FROM public.campaign_tasks ct 
  WHERE ct.campaign_id = c.id 
  AND ct.influencer_id = '46ec4c99-d347-4c75-a0bb-5c409ed6c8ab'::uuid
);
