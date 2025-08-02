-- Fix workflow progression for stuck tasks
-- This will identify tasks that have approved content but are stuck in content_review phase

-- First, let's create a function to fix stuck workflow states
CREATE OR REPLACE FUNCTION fix_stuck_workflow_states()
RETURNS VOID AS $$
DECLARE
    task_record RECORD;
    upload_count INTEGER;
    approved_count INTEGER;
BEGIN
    -- Find tasks that have approved content reviews but are still in content_review phase
    FOR task_record IN 
        SELECT DISTINCT ct.id as task_id
        FROM campaign_tasks ct
        JOIN task_uploads tu ON tu.task_id = ct.id
        JOIN task_content_reviews tcr ON tcr.upload_id = tu.id
        WHERE tcr.status = 'approved'
        AND ct.current_phase = 'content_requirement'
        AND EXISTS (
            SELECT 1 FROM task_workflow_states tws 
            WHERE tws.task_id = ct.id 
            AND tws.phase = 'content_review' 
            AND tws.status = 'in_progress'
        )
    LOOP
        -- Count total uploads for this task
        SELECT COUNT(*) INTO upload_count
        FROM task_uploads 
        WHERE task_id = task_record.task_id;
        
        -- Count approved reviews for this task
        SELECT COUNT(*) INTO approved_count
        FROM task_content_reviews tcr
        JOIN task_uploads tu ON tu.id = tcr.upload_id
        WHERE tu.task_id = task_record.task_id
        AND tcr.status = 'approved';
        
        -- If all uploads are approved, fix the workflow
        IF upload_count = approved_count AND upload_count > 0 THEN
            -- Complete content review phase
            UPDATE task_workflow_states 
            SET status = 'completed', updated_at = NOW()
            WHERE task_id = task_record.task_id 
            AND phase = 'content_review';
            
            -- Start publish analytics phase
            UPDATE task_workflow_states 
            SET status = 'in_progress', updated_at = NOW()
            WHERE task_id = task_record.task_id 
            AND phase = 'publish_analytics';
            
            -- Update task phase and visibility
            UPDATE campaign_tasks 
            SET 
                current_phase = 'publish_analytics',
                status = 'publish_analytics',
                phase_visibility = jsonb_build_object(
                    'content_requirement', true,
                    'content_review', true,
                    'publish_analytics', true
                )
            WHERE id = task_record.task_id;
            
            RAISE NOTICE 'Fixed workflow for task: %', task_record.task_id;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the fix function
SELECT fix_stuck_workflow_states();

-- Also ensure that the progress trigger works correctly
-- Update the trigger function to also update the current_phase if needed
CREATE OR REPLACE FUNCTION update_task_progress_on_workflow_change()
RETURNS TRIGGER AS $$
DECLARE
    new_progress INTEGER;
    completed_phases INTEGER;
    total_phases INTEGER;
    review_status TEXT;
    publish_status TEXT;
BEGIN
    -- Calculate the new progress
    new_progress := calculate_task_progress(NEW.task_id);
    
    -- Get current phase statuses
    SELECT status INTO review_status
    FROM task_workflow_states 
    WHERE task_id = NEW.task_id AND phase = 'content_review';
    
    SELECT status INTO publish_status
    FROM task_workflow_states 
    WHERE task_id = NEW.task_id AND phase = 'publish_analytics';
    
    -- Determine current phase based on workflow states
    DECLARE
        current_phase_value TEXT;
        new_status TEXT;
        new_visibility JSONB;
    BEGIN
        IF publish_status = 'completed' THEN
            current_phase_value := 'publish_analytics';
            new_status := 'completed';
            new_visibility := jsonb_build_object(
                'content_requirement', true,
                'content_review', true, 
                'publish_analytics', true
            );
        ELSIF publish_status = 'in_progress' THEN
            current_phase_value := 'publish_analytics';
            new_status := 'publish_analytics';
            new_visibility := jsonb_build_object(
                'content_requirement', true,
                'content_review', true,
                'publish_analytics', true
            );
        ELSIF review_status = 'completed' THEN
            current_phase_value := 'content_review';
            new_status := 'content_review';
            new_visibility := jsonb_build_object(
                'content_requirement', true,
                'content_review', true,
                'publish_analytics', false
            );
        ELSE
            current_phase_value := 'content_requirement';
            new_status := 'content_requirement';
            new_visibility := jsonb_build_object(
                'content_requirement', true,
                'content_review', false,
                'publish_analytics', false
            );
        END IF;
        
        -- Update the task progress and phase info
        UPDATE campaign_tasks
        SET 
            progress = new_progress,
            current_phase = current_phase_value,
            status = new_status,
            phase_visibility = new_visibility,
            updated_at = NOW()
        WHERE id = NEW.task_id;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS trigger_update_task_progress ON task_workflow_states;
CREATE TRIGGER trigger_update_task_progress
    AFTER INSERT OR UPDATE ON task_workflow_states
    FOR EACH ROW
    EXECUTE FUNCTION update_task_progress_on_workflow_change();