
-- Create task workflow states table
CREATE TABLE public.task_workflow_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.campaign_tasks(id) ON DELETE CASCADE,
  phase TEXT NOT NULL CHECK (phase IN ('content_requirement', 'content_review', 'publish_analytics')),
  status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task content drafts table  
CREATE TABLE public.task_content_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.campaign_tasks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  ai_generated BOOLEAN DEFAULT TRUE,
  brand_edited BOOLEAN DEFAULT FALSE,
  shared_with_influencer BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task content reviews table
CREATE TABLE public.task_content_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.campaign_tasks(id) ON DELETE CASCADE,
  upload_id UUID REFERENCES public.task_uploads(id) ON DELETE CASCADE,
  ai_commentary TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  feedback TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create task published content table
CREATE TABLE public.task_published_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.campaign_tasks(id) ON DELETE CASCADE,
  published_url TEXT NOT NULL,
  platform TEXT,
  analytics_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update campaign_tasks table with new columns
ALTER TABLE public.campaign_tasks 
ADD COLUMN current_phase TEXT DEFAULT 'content_requirement' CHECK (current_phase IN ('content_requirement', 'content_review', 'publish_analytics')),
ADD COLUMN phase_visibility JSONB DEFAULT '{"content_requirement": false, "content_review": false, "publish_analytics": false}'::jsonb;

-- Update task_feedback table with phase column
ALTER TABLE public.task_feedback 
ADD COLUMN phase TEXT CHECK (phase IN ('content_requirement', 'content_review', 'publish_analytics'));

-- Enable RLS on new tables
ALTER TABLE public.task_workflow_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_content_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_content_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_published_content ENABLE ROW LEVEL SECURITY;

-- RLS policies for task_workflow_states
CREATE POLICY "Users can view workflow states for their tasks"
  ON public.task_workflow_states FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_tasks ct
      JOIN public.campaigns c ON ct.campaign_id = c.id
      JOIN public.brand_users bu ON c.brand_id = bu.brand_id
      WHERE ct.id = task_workflow_states.task_id
      AND (bu.user_id = auth.uid() OR ct.influencer_id = auth.uid())
    )
  );

CREATE POLICY "Brand users can manage workflow states"
  ON public.task_workflow_states FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_tasks ct
      JOIN public.campaigns c ON ct.campaign_id = c.id
      JOIN public.brand_users bu ON c.brand_id = bu.brand_id
      WHERE ct.id = task_workflow_states.task_id AND bu.user_id = auth.uid()
    )
  );

-- RLS policies for task_content_drafts
CREATE POLICY "Users can view content drafts for their tasks"
  ON public.task_content_drafts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_tasks ct
      JOIN public.campaigns c ON ct.campaign_id = c.id
      JOIN public.brand_users bu ON c.brand_id = bu.brand_id
      WHERE ct.id = task_content_drafts.task_id
      AND (bu.user_id = auth.uid() OR (ct.influencer_id = auth.uid() AND shared_with_influencer = true))
    )
  );

CREATE POLICY "Brand users can manage content drafts"
  ON public.task_content_drafts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_tasks ct
      JOIN public.campaigns c ON ct.campaign_id = c.id
      JOIN public.brand_users bu ON c.brand_id = bu.brand_id
      WHERE ct.id = task_content_drafts.task_id AND bu.user_id = auth.uid()
    )
  );

-- RLS policies for task_content_reviews
CREATE POLICY "Users can view content reviews for their tasks"
  ON public.task_content_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_tasks ct
      JOIN public.campaigns c ON ct.campaign_id = c.id
      JOIN public.brand_users bu ON c.brand_id = bu.brand_id
      WHERE ct.id = task_content_reviews.task_id
      AND (bu.user_id = auth.uid() OR ct.influencer_id = auth.uid())
    )
  );

CREATE POLICY "Brand users can manage content reviews"
  ON public.task_content_reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_tasks ct
      JOIN public.campaigns c ON ct.campaign_id = c.id
      JOIN public.brand_users bu ON c.brand_id = bu.brand_id
      WHERE ct.id = task_content_reviews.task_id AND bu.user_id = auth.uid()
    )
  );

-- RLS policies for task_published_content
CREATE POLICY "Users can view published content for their tasks"
  ON public.task_published_content FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_tasks ct
      JOIN public.campaigns c ON ct.campaign_id = c.id
      JOIN public.brand_users bu ON c.brand_id = bu.brand_id
      WHERE ct.id = task_published_content.task_id
      AND (bu.user_id = auth.uid() OR ct.influencer_id = auth.uid())
    )
  );

CREATE POLICY "Influencers can insert their published content"
  ON public.task_published_content FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaign_tasks ct
      WHERE ct.id = task_published_content.task_id AND ct.influencer_id = auth.uid()
    )
  );

CREATE POLICY "Brand users can manage published content"
  ON public.task_published_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_tasks ct
      JOIN public.campaigns c ON ct.campaign_id = c.id
      JOIN public.brand_users bu ON c.brand_id = bu.brand_id
      WHERE ct.id = task_published_content.task_id AND bu.user_id = auth.uid()
    )
  );

-- Create updated_at trigger for new tables
CREATE TRIGGER update_task_workflow_states_updated_at
  BEFORE UPDATE ON public.task_workflow_states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_content_drafts_updated_at
  BEFORE UPDATE ON public.task_content_drafts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_published_content_updated_at
  BEFORE UPDATE ON public.task_published_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_task_workflow_states_task_id ON public.task_workflow_states(task_id);
CREATE INDEX idx_task_content_drafts_task_id ON public.task_content_drafts(task_id);
CREATE INDEX idx_task_content_reviews_task_id ON public.task_content_reviews(task_id);
CREATE INDEX idx_task_published_content_task_id ON public.task_published_content(task_id);
