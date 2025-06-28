
-- Update the get_influencer_campaigns function to properly handle status filtering
CREATE OR REPLACE FUNCTION public.get_influencer_campaigns(tab_filter text DEFAULT 'active'::text)
RETURNS TABLE(
  campaign_id uuid,
  campaign_title text,
  brand_name text,
  campaign_status text,
  task_count bigint,
  due_date date,
  platforms text[],
  amount integer,
  overall_progress integer,
  completed_tasks bigint,
  tasks jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as campaign_id,
    c.title as campaign_title,
    b.name as brand_name,
    cp.status as campaign_status,
    COUNT(ct.id) as task_count,
    c.due_date,
    ARRAY['Instagram', 'TikTok']::text[] as platforms,
    c.amount,
    COALESCE(AVG(ct.progress)::integer, 0) as overall_progress,
    COUNT(ct.id) FILTER (WHERE ct.status = 'content_analytics') as completed_tasks,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', ct.id,
          'type', ct.task_type,
          'deliverable', ct.deliverable_count || ' ' || ct.task_type,
          'status', ct.status,
          'progress', ct.progress,
          'nextDeadline', ct.next_deadline,
          'feedback', (
            SELECT tf.message 
            FROM public.task_feedback tf 
            WHERE tf.task_id = ct.id 
            ORDER BY tf.created_at DESC 
            LIMIT 1
          )
        ) ORDER BY ct.created_at
      ) FILTER (WHERE ct.id IS NOT NULL),
      '[]'::jsonb
    ) as tasks
  FROM public.campaign_participants cp
  JOIN public.campaigns c ON cp.campaign_id = c.id
  JOIN public.brands b ON c.brand_id = b.id
  LEFT JOIN public.campaign_tasks ct ON c.id = ct.campaign_id AND ct.influencer_id = cp.influencer_id
  WHERE cp.influencer_id = auth.uid()
    AND (
      (tab_filter = 'active' AND cp.status IN ('active', 'approved', 'accepted')) OR
      (tab_filter = 'completed' AND cp.status = 'completed') OR  
      (tab_filter = 'requests' AND cp.status IN ('invited', 'applied', 'pending', 'rejected'))
    )
  GROUP BY c.id, c.title, b.name, cp.status, c.due_date, c.amount
  ORDER BY c.created_at DESC;
END;
$$;

-- Update the get_opportunities function to exclude applications the user has already made
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
    -- Exclude campaigns where user has already applied
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
