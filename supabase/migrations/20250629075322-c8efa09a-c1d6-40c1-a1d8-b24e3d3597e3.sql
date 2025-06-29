
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view workflow states for their tasks" ON public.task_workflow_states;
DROP POLICY IF EXISTS "Brand users can manage workflow states" ON public.task_workflow_states;
DROP POLICY IF EXISTS "Users can view content drafts for their tasks" ON public.task_content_drafts;
DROP POLICY IF EXISTS "Brand users can manage content drafts" ON public.task_content_drafts;
DROP POLICY IF EXISTS "Users can view content reviews for their tasks" ON public.task_content_reviews;
DROP POLICY IF EXISTS "Brand users can manage content reviews" ON public.task_content_reviews;
DROP POLICY IF EXISTS "Users can view published content for their tasks" ON public.task_published_content;
DROP POLICY IF EXISTS "Influencers can insert their published content" ON public.task_published_content;
DROP POLICY IF EXISTS "Brand users can manage published content" ON public.task_published_content;
DROP POLICY IF EXISTS "Users can view tasks for their campaigns" ON public.campaign_tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.campaign_tasks;

-- Enable RLS on workflow-related tables (skip if already enabled)
ALTER TABLE public.task_workflow_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_content_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_content_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_published_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_tasks ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for task_workflow_states
CREATE POLICY "Users can view workflow states for their tasks" ON public.task_workflow_states
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.campaign_tasks ct
            JOIN public.campaigns c ON ct.campaign_id = c.id
            LEFT JOIN public.brand_users bu ON c.brand_id = bu.brand_id
            WHERE ct.id = task_id 
            AND (ct.influencer_id = auth.uid() OR bu.user_id = auth.uid())
        )
    );

CREATE POLICY "System can manage workflow states" ON public.task_workflow_states
    FOR ALL USING (true);

-- Create RLS policies for task_content_drafts
CREATE POLICY "Users can view content drafts for their tasks" ON public.task_content_drafts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.campaign_tasks ct
            JOIN public.campaigns c ON ct.campaign_id = c.id
            LEFT JOIN public.brand_users bu ON c.brand_id = bu.brand_id
            WHERE ct.id = task_id 
            AND (ct.influencer_id = auth.uid() OR (bu.user_id = auth.uid() AND shared_with_influencer = true))
        )
    );

CREATE POLICY "Brands can manage content drafts" ON public.task_content_drafts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.campaign_tasks ct
            JOIN public.campaigns c ON ct.campaign_id = c.id
            JOIN public.brand_users bu ON c.brand_id = bu.brand_id
            WHERE ct.id = task_id AND bu.user_id = auth.uid()
        )
    );

-- Create RLS policies for task_content_reviews
CREATE POLICY "Users can view content reviews for their tasks" ON public.task_content_reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.campaign_tasks ct
            JOIN public.campaigns c ON ct.campaign_id = c.id
            LEFT JOIN public.brand_users bu ON c.brand_id = bu.brand_id
            WHERE ct.id = task_id 
            AND (ct.influencer_id = auth.uid() OR bu.user_id = auth.uid())
        )
    );

CREATE POLICY "Brands can manage content reviews" ON public.task_content_reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.campaign_tasks ct
            JOIN public.campaigns c ON ct.campaign_id = c.id
            JOIN public.brand_users bu ON c.brand_id = bu.brand_id
            WHERE ct.id = task_id AND bu.user_id = auth.uid()
        )
    );

-- Create RLS policies for task_published_content
CREATE POLICY "Users can view published content for their tasks" ON public.task_published_content
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.campaign_tasks ct
            JOIN public.campaigns c ON ct.campaign_id = c.id
            LEFT JOIN public.brand_users bu ON c.brand_id = bu.brand_id
            WHERE ct.id = task_id 
            AND (ct.influencer_id = auth.uid() OR bu.user_id = auth.uid())
        )
    );

CREATE POLICY "Influencers can create published content" ON public.task_published_content
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.campaign_tasks ct
            WHERE ct.id = task_id AND ct.influencer_id = auth.uid()
        )
    );

CREATE POLICY "Brands can manage published content" ON public.task_published_content
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.campaign_tasks ct
            JOIN public.campaigns c ON ct.campaign_id = c.id
            JOIN public.brand_users bu ON c.brand_id = bu.brand_id
            WHERE ct.id = task_id AND bu.user_id = auth.uid()
        )
    );

-- Create comprehensive RLS policies for campaign_tasks
CREATE POLICY "Users can view tasks for their campaigns" ON public.campaign_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            LEFT JOIN public.brand_users bu ON c.brand_id = bu.brand_id
            WHERE c.id = campaign_id 
            AND (influencer_id = auth.uid() OR bu.user_id = auth.uid())
        )
    );

CREATE POLICY "Brands can manage tasks" ON public.campaign_tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            JOIN public.brand_users bu ON c.brand_id = bu.brand_id
            WHERE c.id = campaign_id AND bu.user_id = auth.uid()
        )
    );

CREATE POLICY "Influencers can update their tasks" ON public.campaign_tasks
    FOR UPDATE USING (influencer_id = auth.uid());
