
-- Create a table to store influencer assignments to specific content types
CREATE TABLE public.campaign_content_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  influencer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- Made nullable for manual entries
  content_type TEXT NOT NULL, -- 'Posts', 'Reels', 'Stories' (matching existing convention)
  category TEXT NOT NULL, -- 'Lifestyle', 'Travel', etc.
  tier TEXT NOT NULL, -- 'nano', 'micro', 'macro', 'mega'
  assignment_type TEXT NOT NULL DEFAULT 'applicant', -- 'applicant' or 'manual'
  manual_data JSONB NULL, -- For manually added influencers (stores name, handle, etc.)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_assignment CHECK (
    (assignment_type = 'applicant' AND influencer_id IS NOT NULL) OR
    (assignment_type = 'manual' AND manual_data IS NOT NULL)
  )
);

-- Add RLS policies for campaign content assignments
ALTER TABLE public.campaign_content_assignments ENABLE ROW LEVEL SECURITY;

-- Policy for brands to manage their campaign assignments
CREATE POLICY "Brands can manage their campaign assignments" 
  ON public.campaign_content_assignments 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      JOIN public.brand_users bu ON c.brand_id = bu.brand_id
      WHERE c.id = campaign_content_assignments.campaign_id 
      AND bu.user_id = auth.uid()
    )
  );

-- Policy for influencers to view their assignments
CREATE POLICY "Influencers can view their assignments" 
  ON public.campaign_content_assignments 
  FOR SELECT 
  USING (influencer_id = auth.uid());

-- Update the campaign_tasks table to link with content assignments
ALTER TABLE public.campaign_tasks 
ADD COLUMN content_assignment_id UUID REFERENCES public.campaign_content_assignments(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_campaign_content_assignments_campaign_id ON public.campaign_content_assignments(campaign_id);
CREATE INDEX idx_campaign_content_assignments_influencer_id ON public.campaign_content_assignments(influencer_id);
CREATE INDEX idx_campaign_tasks_content_assignment_id ON public.campaign_tasks(content_assignment_id);

-- Function to create tasks for an influencer assignment
CREATE OR REPLACE FUNCTION create_assignment_tasks(assignment_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    assignment_record RECORD;
    task_stages TEXT[] := ARRAY['content_requirement', 'content_draft', 'content_review', 'post_content', 'report_analytics'];
    stage TEXT;
    stage_index INTEGER := 0;
BEGIN
    -- Get the assignment details
    SELECT * INTO assignment_record 
    FROM public.campaign_content_assignments 
    WHERE id = assignment_id_param;
    
    -- Only create tasks if there's an influencer_id (not for manual entries without profiles)
    IF assignment_record.influencer_id IS NOT NULL THEN
        -- Create tasks for each stage
        FOREACH stage IN ARRAY task_stages
        LOOP
            stage_index := stage_index + 1;
            
            INSERT INTO public.campaign_tasks (
                campaign_id,
                influencer_id,
                content_assignment_id,
                title,
                description,
                task_type,
                status,
                progress
            ) VALUES (
                assignment_record.campaign_id,
                assignment_record.influencer_id,
                assignment_id_param,
                CASE stage
                    WHEN 'content_requirement' THEN 'Content Requirements Review'
                    WHEN 'content_draft' THEN 'Create Content Draft'
                    WHEN 'content_review' THEN 'Content Review & Approval'
                    WHEN 'post_content' THEN 'Publish Content'
                    WHEN 'report_analytics' THEN 'Report Analytics'
                END,
                CASE stage
                    WHEN 'content_requirement' THEN 'Review and understand the content requirements for this ' || assignment_record.content_type
                    WHEN 'content_draft' THEN 'Create and submit a draft of your ' || assignment_record.content_type || ' content'
                    WHEN 'content_review' THEN 'Wait for brand review and make any requested changes'
                    WHEN 'post_content' THEN 'Publish the approved content on your platform'
                    WHEN 'report_analytics' THEN 'Report the performance analytics of your published content'
                END,
                assignment_record.content_type, -- Use the content_type from assignment
                CASE 
                    WHEN stage_index = 1 THEN 'content_requirement'
                    ELSE 'pending'
                END,
                0
            );
        END LOOP;
    END IF;
END;
$$;

-- Function to assign influencers and create their tasks
CREATE OR REPLACE FUNCTION assign_influencers_to_campaign(
    campaign_id_param UUID,
    content_type_param TEXT,
    category_param TEXT,
    tier_param TEXT,
    assignments JSONB
)
RETURNS UUID[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    assignment_record JSONB;
    assignment_id UUID;
    assignment_ids UUID[] := '{}';
    participant_record RECORD;
BEGIN
    -- Loop through each assignment
    FOR assignment_record IN SELECT * FROM jsonb_array_elements(assignments)
    LOOP
        IF assignment_record->>'type' = 'applicant' THEN
            -- Get the participant record to find the influencer_id
            SELECT * INTO participant_record 
            FROM public.campaign_participants 
            WHERE id = (assignment_record->>'id')::UUID;
            
            -- Create the assignment record for applicant
            INSERT INTO public.campaign_content_assignments (
                campaign_id,
                influencer_id,
                content_type,
                category,
                tier,
                assignment_type,
                manual_data
            ) VALUES (
                campaign_id_param,
                participant_record.influencer_id,
                content_type_param,
                category_param,
                tier_param,
                'applicant',
                NULL
            ) RETURNING id INTO assignment_id;
            
            -- Update campaign participant status
            UPDATE public.campaign_participants 
            SET status = 'accepted', accepted_at = now()
            WHERE id = (assignment_record->>'id')::UUID;
            
        ELSIF assignment_record->>'type' = 'manual' THEN
            -- Create the assignment record for manual entry
            INSERT INTO public.campaign_content_assignments (
                campaign_id,
                influencer_id,
                content_type,
                category,
                tier,
                assignment_type,
                manual_data
            ) VALUES (
                campaign_id_param,
                NULL, -- No influencer_id for manual entries
                content_type_param,
                category_param,
                tier_param,
                'manual',
                assignment_record->'data'
            ) RETURNING id INTO assignment_id;
        END IF;
        
        -- Add to return array
        assignment_ids := array_append(assignment_ids, assignment_id);
        
        -- Create tasks for this assignment (only if influencer_id exists)
        PERFORM create_assignment_tasks(assignment_id);
    END LOOP;
    
    RETURN assignment_ids;
END;
$$;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campaign_content_assignments_updated_at 
BEFORE UPDATE ON public.campaign_content_assignments 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
