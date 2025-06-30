-- Fix progress calculation for campaigns and tasks

-- 1. Create a function to calculate task progress based on workflow states
CREATE OR REPLACE FUNCTION calculate_task_progress(task_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    completed_phases INTEGER;
    total_phases INTEGER;
    progress_value INTEGER;
BEGIN
    -- Count total phases (should always be 3)
    SELECT COUNT(*) INTO total_phases
    FROM task_workflow_states
    WHERE task_id = task_id_param;
    
    -- Count completed phases
    SELECT COUNT(*) INTO completed_phases
    FROM task_workflow_states
    WHERE task_id = task_id_param
    AND status = 'completed';
    
    -- Calculate progress percentage
    IF total_phases > 0 THEN
        progress_value := ROUND((completed_phases::DECIMAL / total_phases) * 100);
    ELSE
        progress_value := 0;
    END IF;
    
    RETURN progress_value;
END;
$$;

-- 2. Create a trigger function to update task progress when workflow states change
CREATE OR REPLACE FUNCTION update_task_progress_on_workflow_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    new_progress INTEGER;
BEGIN
    -- Calculate the new progress
    new_progress := calculate_task_progress(NEW.task_id);
    
    -- Update the task progress
    UPDATE campaign_tasks
    SET progress = new_progress,
        updated_at = NOW()
    WHERE id = NEW.task_id;
    
    RETURN NEW;
END;
$$;

-- 3. Create trigger to automatically update progress when workflow states change
DROP TRIGGER IF EXISTS update_task_progress_trigger ON task_workflow_states;
CREATE TRIGGER update_task_progress_trigger
AFTER INSERT OR UPDATE OF status ON task_workflow_states
FOR EACH ROW
EXECUTE FUNCTION update_task_progress_on_workflow_change();

-- 4. Update existing task progress based on current workflow states
UPDATE campaign_tasks ct
SET progress = calculate_task_progress(ct.id),
    updated_at = NOW()
WHERE EXISTS (
    SELECT 1 FROM task_workflow_states tws
    WHERE tws.task_id = ct.id
);

-- 5. Update get_brand_campaigns function to show real progress
CREATE OR REPLACE FUNCTION public.get_brand_campaigns(brand_filter text DEFAULT 'all'::text)
RETURNS TABLE(
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
    progress integer,
    is_public boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as campaign_id,
    c.title as campaign_title,
    c.status as campaign_status,
    COALESCE(c.budget::integer, c.amount::integer, 0) as budget,
    0 as spent,
    COUNT(DISTINCT cp.id) as applicants,
    COUNT(DISTINCT cp.id) FILTER (WHERE cp.status IN ('accepted', 'active')) as accepted,
    c.due_date::date,
    ARRAY['Instagram', 'TikTok']::text[] as platforms,
    COALESCE(
      CASE 
        WHEN array_length(c.category, 1) > 0 THEN c.category[1] 
        ELSE 'General' 
      END, 
      'General'
    ) as category,
    -- Calculate real progress based on task completion
    COALESCE(
      ROUND(AVG(ct.progress))::integer,
      CASE 
        WHEN c.status = 'completed' THEN 100
        WHEN c.status = 'active' AND EXISTS (
          SELECT 1 FROM campaign_tasks ct2 
          WHERE ct2.campaign_id = c.id
        ) THEN 0  -- If there are tasks but no progress
        WHEN c.status = 'published' THEN 0
        ELSE 0
      END
    ) as progress,
    c.is_public
  FROM public.campaigns c
  JOIN public.brand_users bu ON c.brand_id = bu.brand_id
  LEFT JOIN public.campaign_participants cp ON c.id = cp.campaign_id
  LEFT JOIN public.campaign_tasks ct ON c.id = ct.campaign_id
  WHERE bu.user_id = auth.uid() 
    AND (
      CASE 
        WHEN brand_filter = 'active' THEN c.status IN ('draft', 'published', 'active')
        WHEN brand_filter = 'completed' THEN c.status = 'completed'
        WHEN brand_filter = 'archived' THEN c.status = 'archived'
        ELSE true
      END
    )
  GROUP BY c.id, c.title, c.status, c.budget, c.amount, c.due_date, c.category, c.is_public
  ORDER BY c.created_at DESC;
END;
$$;

-- 6. Also update the get_influencer_campaigns function to ensure it uses the progress field
CREATE OR REPLACE FUNCTION public.get_influencer_campaigns(status_filter text DEFAULT 'all'::text)
RETURNS TABLE(
    campaign_id uuid, 
    campaign_title text, 
    campaign_status text, 
    budget integer, 
    earnings integer, 
    due_date date, 
    platforms text[], 
    category text, 
    participant_status text, 
    overall_progress integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as campaign_id,
    c.title as campaign_title,
    c.status as campaign_status,
    COALESCE(c.budget::integer, c.amount::integer, 0) as budget,
    cp.compensation_value as earnings,
    c.due_date::date,
    ARRAY['Instagram', 'TikTok']::text[] as platforms,
    COALESCE(
      CASE 
        WHEN array_length(c.category, 1) > 0 THEN c.category[1] 
        ELSE 'General' 
      END, 
      'General'
    ) as category,
    cp.status as participant_status,
    COALESCE(ROUND(AVG(ct.progress))::integer, 0) as overall_progress
  FROM public.campaigns c
  JOIN public.campaign_participants cp ON c.id = cp.campaign_id
  LEFT JOIN public.campaign_tasks ct ON c.id = ct.campaign_id AND ct.influencer_id = cp.influencer_id
  WHERE cp.influencer_id = auth.uid()
    AND (
      CASE 
        WHEN status_filter = 'active' THEN cp.status IN ('accepted', 'active')
        WHEN status_filter = 'completed' THEN cp.status = 'completed'
        WHEN status_filter = 'applied' THEN cp.status = 'applied'
        ELSE true
      END
    )
  GROUP BY c.id, c.title, c.status, c.budget, c.amount, c.due_date, c.category, cp.status, cp.compensation_value
  ORDER BY c.created_at DESC;
END;
$$;