
-- Create campaign tasks table
CREATE TABLE public.campaign_tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE,
  influencer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_type text NOT NULL, -- 'Posts', 'Stories', 'Reels'
  title text NOT NULL,
  description text,
  deliverable_count integer DEFAULT 1, -- number of posts/stories/reels required
  status text DEFAULT 'content_requirement', 
  -- 'content_requirement', 'content_review', 'post_content', 'content_analytics'
  progress integer DEFAULT 0, -- 0-100
  next_deadline date,
  ai_score integer DEFAULT 0, -- 0-100
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create task feedback/messages table
CREATE TABLE public.task_feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid REFERENCES public.campaign_tasks(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_type text NOT NULL, -- 'brand' or 'influencer'
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create task file uploads table
CREATE TABLE public.task_uploads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid REFERENCES public.campaign_tasks(id) ON DELETE CASCADE,
  uploader_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_url text NOT NULL, -- Supabase Storage URL
  file_size bigint,
  mime_type text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.campaign_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_uploads ENABLE ROW LEVEL SECURITY;

-- RLS policies for campaign_tasks
CREATE POLICY "Users can view tasks for their campaigns" 
  ON public.campaign_tasks 
  FOR SELECT 
  USING (influencer_id = auth.uid());

CREATE POLICY "Users can update their own tasks" 
  ON public.campaign_tasks 
  FOR UPDATE 
  USING (influencer_id = auth.uid());

-- RLS policies for task_feedback
CREATE POLICY "Users can view feedback for their tasks" 
  ON public.task_feedback 
  FOR SELECT 
  USING (
    EXISTS(
      SELECT 1 FROM public.campaign_tasks ct 
      WHERE ct.id = task_id AND ct.influencer_id = auth.uid()
    )
  );

CREATE POLICY "Users can create feedback for their tasks" 
  ON public.task_feedback 
  FOR INSERT 
  WITH CHECK (
    EXISTS(
      SELECT 1 FROM public.campaign_tasks ct 
      WHERE ct.id = task_id AND ct.influencer_id = auth.uid()
    )
  );

-- RLS policies for task_uploads
CREATE POLICY "Users can view uploads for their tasks" 
  ON public.task_uploads 
  FOR SELECT 
  USING (
    EXISTS(
      SELECT 1 FROM public.campaign_tasks ct 
      WHERE ct.id = task_id AND ct.influencer_id = auth.uid()
    )
  );

CREATE POLICY "Users can create uploads for their tasks" 
  ON public.task_uploads 
  FOR INSERT 
  WITH CHECK (
    EXISTS(
      SELECT 1 FROM public.campaign_tasks ct 
      WHERE ct.id = task_id AND ct.influencer_id = auth.uid()
    ) AND uploader_id = auth.uid()
  );

CREATE POLICY "Users can delete their own uploads" 
  ON public.task_uploads 
  FOR DELETE 
  USING (uploader_id = auth.uid());
