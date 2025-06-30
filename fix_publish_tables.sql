-- First, let's update the task_published_content table structure
ALTER TABLE public.task_published_content
ADD COLUMN IF NOT EXISTS influencer_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS post_url TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update the column from published_url to post_url if needed
-- First check if published_url exists and post_url doesn't
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_published_content' AND column_name = 'published_url') 
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'task_published_content' AND column_name = 'post_url') THEN
        ALTER TABLE public.task_published_content RENAME COLUMN published_url TO post_url;
    END IF;
END $$;

-- Create the task_analytics table
CREATE TABLE IF NOT EXISTS public.task_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  published_content_id UUID REFERENCES public.task_published_content(id) ON DELETE CASCADE,
  impressions INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  reach INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on task_analytics
ALTER TABLE public.task_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for task_analytics
CREATE POLICY "Users can view analytics for their content"
  ON public.task_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.task_published_content tpc
      JOIN public.campaign_tasks ct ON tpc.task_id = ct.id
      JOIN public.campaigns c ON ct.campaign_id = c.id
      JOIN public.brand_users bu ON c.brand_id = bu.brand_id
      WHERE tpc.id = task_analytics.published_content_id
      AND (bu.user_id = auth.uid() OR ct.influencer_id = auth.uid())
    )
  );

CREATE POLICY "Influencers can manage their analytics"
  ON public.task_analytics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.task_published_content tpc
      JOIN public.campaign_tasks ct ON tpc.task_id = ct.id
      WHERE tpc.id = task_analytics.published_content_id
      AND ct.influencer_id = auth.uid()
    )
  );

-- Create an index for performance
CREATE INDEX IF NOT EXISTS idx_task_analytics_published_content_id ON public.task_analytics(published_content_id);

-- Update the influencer insert policy to include the new columns
DROP POLICY IF EXISTS "Influencers can insert their published content" ON public.task_published_content;

CREATE POLICY "Influencers can insert their published content"
  ON public.task_published_content FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaign_tasks ct
      WHERE ct.id = task_id AND ct.influencer_id = auth.uid()
    )
  );

-- Add update policy for influencers
CREATE POLICY "Influencers can update their published content"
  ON public.task_published_content FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.campaign_tasks ct
      WHERE ct.id = task_published_content.task_id AND ct.influencer_id = auth.uid()
    )
  );