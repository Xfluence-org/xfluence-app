
-- Clear existing Nike Air Max tasks to start fresh
DELETE FROM public.task_uploads 
WHERE task_id IN (
  SELECT ct.id FROM public.campaign_tasks ct
  JOIN public.campaigns c ON ct.campaign_id = c.id
  JOIN public.brands b ON c.brand_id = b.id
  WHERE c.title = 'Nike Air Max Campaign' AND b.name = 'Nike'
);

DELETE FROM public.task_feedback 
WHERE task_id IN (
  SELECT ct.id FROM public.campaign_tasks ct
  JOIN public.campaigns c ON ct.campaign_id = c.id
  JOIN public.brands b ON c.brand_id = b.id
  WHERE c.title = 'Nike Air Max Campaign' AND b.name = 'Nike'
);

DELETE FROM public.campaign_tasks 
WHERE campaign_id IN (
  SELECT c.id FROM public.campaigns c
  JOIN public.brands b ON c.brand_id = b.id
  WHERE c.title = 'Nike Air Max Campaign' AND b.name = 'Nike'
);

-- First, create a test influencer participant for the Nike campaign
INSERT INTO public.campaign_participants (
  campaign_id, 
  influencer_id, 
  status, 
  application_message, 
  ai_match_score,
  accepted_at
)
SELECT 
  c.id,
  '46ec4c99-d347-4c75-a0bb-5c409ed6c8ab', -- Test user ID
  'accepted',
  'I''m excited to work with Nike on showcasing the Air Max collection!',
  85,
  '2025-06-20 10:00:00'
FROM public.campaigns c
JOIN public.brands b ON c.brand_id = b.id
WHERE c.title = 'Nike Air Max Campaign' AND b.name = 'Nike'
ON CONFLICT (campaign_id, influencer_id) DO UPDATE SET
  status = EXCLUDED.status,
  accepted_at = EXCLUDED.accepted_at;

-- Insert Nike Air Max tasks covering ALL workflow stages
INSERT INTO public.campaign_tasks (campaign_id, influencer_id, task_type, title, deliverable_count, status, progress, next_deadline, description)
SELECT 
  c.id,
  '46ec4c99-d347-4c75-a0bb-5c409ed6c8ab', -- Test user ID
  task_data.task_type,
  task_data.task_type,
  task_data.deliverable_count,
  task_data.status,
  task_data.progress,
  task_data.next_deadline::date,
  task_data.description
FROM public.campaigns c
JOIN public.brands b ON c.brand_id = b.id
CROSS JOIN (
  -- STAGE 1: Content Requirement (just started)
  SELECT 'Posts' as task_type, 1 as deliverable_count, 'content_requirement' as status,
         15 as progress, '2025-07-05' as next_deadline,
         'Create 1 Instagram post featuring Air Max sneakers in workout setting' as description
  UNION ALL
  
  -- STAGE 2: Content Review (waiting for brand approval)  
  SELECT 'Stories' as task_type, 3 as deliverable_count, 'content_review' as status,
         40 as progress, '2025-07-08' as next_deadline,
         'Share 3 Instagram stories showing behind-the-scenes Air Max workout content' as description
  UNION ALL
  
  -- STAGE 3: Post Content (approved, ready to post)
  SELECT 'Reels' as task_type, 1 as deliverable_count, 'post_content' as status,
         70 as progress, '2025-07-10' as next_deadline,
         'Create 1 TikTok reel showcasing Air Max performance features' as description
  UNION ALL
  
  -- STAGE 4: Content Analytics (posted, tracking performance)
  SELECT 'Posts' as task_type, 1 as deliverable_count, 'content_analytics' as status,
         95 as progress, '2025-07-15' as next_deadline,
         'Lifestyle post featuring Air Max in daily activities - performance tracking' as description
) AS task_data
WHERE c.title = 'Nike Air Max Campaign' AND b.name = 'Nike';

-- Add stage-appropriate feedback for each task status
INSERT INTO public.task_feedback (task_id, sender_id, sender_type, message)
SELECT 
  ct.id,
  '46ec4c99-d347-4c75-a0bb-5c409ed6c8ab', -- Test user ID
  CASE 
    WHEN ct.status = 'content_requirement' THEN 'influencer'
    ELSE 'brand'
  END,
  CASE 
    -- STAGE 1: Content Requirement feedback
    WHEN ct.status = 'content_requirement' 
      THEN 'I''ve reviewed the brief and will start creating content. Any specific angles you''d like me to focus on?'
    
    -- STAGE 2: Content Review feedback  
    WHEN ct.status = 'content_review'
      THEN 'Great content! Please adjust the lighting in the second story and we''ll approve for publishing.'
    
    -- STAGE 3: Post Content feedback
    WHEN ct.status = 'post_content'
      THEN 'Perfect! Content approved. Please schedule for posting during peak engagement hours (6-8 PM).'
    
    -- STAGE 4: Content Analytics feedback
    WHEN ct.status = 'content_analytics'
      THEN 'Excellent performance! 125% above expected engagement. Great work on this campaign.'
  END
FROM public.campaign_tasks ct
JOIN public.campaigns c ON ct.campaign_id = c.id
JOIN public.brands b ON c.brand_id = b.id
WHERE c.title = 'Nike Air Max Campaign' AND b.name = 'Nike';

-- Add sample file upload for the Content Review task (shows file in review)
INSERT INTO public.task_uploads (task_id, uploader_id, filename, file_url, file_size, mime_type)
SELECT 
  ct.id,
  '46ec4c99-d347-4c75-a0bb-5c409ed6c8ab', -- Test user ID
  'air_max_stories_draft.mp4',
  'https://example.com/uploads/air_max_stories_draft.mp4',
  23654400, -- ~23MB file size
  'video/mp4'
FROM public.campaign_tasks ct
JOIN public.campaigns c ON ct.campaign_id = c.id
JOIN public.brands b ON c.brand_id = b.id
WHERE ct.task_type = 'Stories' 
  AND ct.status = 'content_review'
  AND c.title = 'Nike Air Max Campaign' 
  AND b.name = 'Nike'
LIMIT 1;

-- Add sample file upload for the Published Content task (shows published content)
INSERT INTO public.task_uploads (task_id, uploader_id, filename, file_url, file_size, mime_type)
SELECT 
  ct.id,
  '46ec4c99-d347-4c75-a0bb-5c409ed6c8ab', -- Test user ID
  'air_max_reel_final.mp4',
  'https://example.com/uploads/air_max_reel_final.mp4',
  18432000, -- ~18MB file size
  'video/mp4'
FROM public.campaign_tasks ct
JOIN public.campaigns c ON ct.campaign_id = c.id
JOIN public.brands b ON c.brand_id = b.id
WHERE ct.task_type = 'Reels' 
  AND ct.status = 'post_content'
  AND c.title = 'Nike Air Max Campaign' 
  AND b.name = 'Nike'
LIMIT 1;
