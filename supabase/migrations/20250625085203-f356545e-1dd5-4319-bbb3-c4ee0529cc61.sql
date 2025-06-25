
-- Complete corrected function for influencer campaigns
CREATE OR REPLACE FUNCTION get_influencer_campaigns(
  tab_filter text DEFAULT 'active' -- 'active', 'completed', 'requests'
)
RETURNS TABLE (
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
) AS $$
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
      -- CORRECTED FILTERING LOGIC:
      (tab_filter = 'active' AND cp.status IN ('active', 'accepted')) OR
      (tab_filter = 'completed' AND cp.status = 'completed') OR  
      (tab_filter = 'requests' AND cp.status IN ('invited', 'applied'))
    )
  GROUP BY c.id, c.title, b.name, cp.status, c.due_date, c.amount
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_influencer_campaigns TO authenticated;
