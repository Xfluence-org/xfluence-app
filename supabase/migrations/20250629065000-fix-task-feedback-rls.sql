-- Drop existing policies for task_feedback
DROP POLICY IF EXISTS "Users can view feedback for their tasks" ON public.task_feedback;
DROP POLICY IF EXISTS "Users can create feedback for their tasks" ON public.task_feedback;

-- Create new policies that allow both brand and influencer access
CREATE POLICY "Users can view feedback for their tasks" 
  ON public.task_feedback 
  FOR SELECT 
  USING (
    EXISTS(
      SELECT 1 FROM public.campaign_tasks ct 
      WHERE ct.id = task_feedback.task_id 
      AND (
        ct.influencer_id = auth.uid() 
        OR EXISTS(
          SELECT 1 FROM public.campaigns c
          JOIN public.brand_users bu ON c.brand_id = bu.brand_id
          WHERE c.id = ct.campaign_id AND bu.user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create feedback for their tasks" 
  ON public.task_feedback 
  FOR INSERT 
  WITH CHECK (
    EXISTS(
      SELECT 1 FROM public.campaign_tasks ct 
      WHERE ct.id = task_feedback.task_id 
      AND (
        ct.influencer_id = auth.uid() 
        OR EXISTS(
          SELECT 1 FROM public.campaigns c
          JOIN public.brand_users bu ON c.brand_id = bu.brand_id
          WHERE c.id = ct.campaign_id AND bu.user_id = auth.uid()
        )
      )
    )
  );

-- Also ensure task_feedback table has RLS enabled
ALTER TABLE public.task_feedback ENABLE ROW LEVEL SECURITY;