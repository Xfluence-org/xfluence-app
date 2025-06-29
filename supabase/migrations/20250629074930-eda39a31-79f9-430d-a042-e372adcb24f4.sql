
-- Update the assign_influencers_to_campaign function to handle existing workflow states
CREATE OR REPLACE FUNCTION public.assign_influencers_to_campaign(campaign_id_param uuid, content_type_param text, category_param text, tier_param text, assignments jsonb)
 RETURNS uuid[]
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    assignment_record JSONB;
    assignment_id UUID;
    assignment_ids UUID[] := '{}';
    participant_record RECORD;
    task_record RECORD;
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
        IF assignment_record->>'type' = 'applicant' THEN
            PERFORM create_assignment_tasks(assignment_id);
            
            -- Initialize workflow states for ALL created tasks (only if they don't exist)
            FOR task_record IN 
                SELECT id 
                FROM public.campaign_tasks 
                WHERE content_assignment_id = assignment_id
            LOOP
                -- Initialize workflow states for each task (using INSERT ... ON CONFLICT DO NOTHING)
                INSERT INTO public.task_workflow_states (task_id, phase, status) VALUES
                (task_record.id, 'content_requirement', 'in_progress'),
                (task_record.id, 'content_review', 'not_started'),
                (task_record.id, 'publish_analytics', 'not_started')
                ON CONFLICT (task_id, phase) DO NOTHING;
                
                -- Set initial phase visibility (false = not visible to influencer initially)
                UPDATE public.campaign_tasks 
                SET 
                    current_phase = 'content_requirement',
                    phase_visibility = '{"content_requirement": false, "content_review": false, "publish_analytics": false}'::jsonb
                WHERE id = task_record.id;
            END LOOP;
        END IF;
    END LOOP;
    
    RETURN assignment_ids;
END;
$function$;

-- Also update the trigger function to use ON CONFLICT to prevent duplicates
CREATE OR REPLACE FUNCTION public.initialize_task_workflow()
RETURNS TRIGGER AS $$
BEGIN
    -- Initialize workflow states for new tasks (using INSERT ... ON CONFLICT DO NOTHING)
    INSERT INTO public.task_workflow_states (task_id, phase, status) VALUES
    (NEW.id, 'content_requirement', 'in_progress'),
    (NEW.id, 'content_review', 'not_started'),
    (NEW.id, 'publish_analytics', 'not_started')
    ON CONFLICT (task_id, phase) DO NOTHING;
    
    -- Set default phase visibility if not already set
    IF NEW.phase_visibility IS NULL THEN
        UPDATE public.campaign_tasks 
        SET phase_visibility = '{"content_requirement": false, "content_review": false, "publish_analytics": false}'::jsonb
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
