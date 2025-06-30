-- Debug Workflow States for Task Acceptance Issues

-- 1. Check all workflow states for a specific task
-- Replace 'YOUR_TASK_ID' with the actual task ID
SELECT 
    tws.*,
    ct.status as task_status,
    ct.progress as task_progress
FROM task_workflow_states tws
LEFT JOIN campaign_tasks ct ON ct.id = tws.task_id
WHERE tws.task_id = 'YOUR_TASK_ID'
ORDER BY 
    CASE tws.phase 
        WHEN 'content_requirement' THEN 1
        WHEN 'content_review' THEN 2
        WHEN 'publish_analytics' THEN 3
    END;

-- 2. Check if all required phases exist for a task
SELECT 
    task_id,
    COUNT(*) as phase_count,
    STRING_AGG(phase || ':' || status, ', ' ORDER BY phase) as phases_status
FROM task_workflow_states
WHERE task_id = 'YOUR_TASK_ID'
GROUP BY task_id;

-- 3. Fix missing workflow states (if needed)
-- This will create any missing phases for a task
INSERT INTO task_workflow_states (task_id, phase, status)
VALUES 
    ('YOUR_TASK_ID', 'content_requirement', 'in_progress'),
    ('YOUR_TASK_ID', 'content_review', 'not_started'),
    ('YOUR_TASK_ID', 'publish_analytics', 'not_started')
ON CONFLICT (task_id, phase) DO UPDATE
SET status = EXCLUDED.status
WHERE task_workflow_states.status = 'not_started';

-- 4. Check participant status
SELECT 
    cp.id,
    cp.influencer_id,
    cp.current_stage,
    cp.status,
    ct.id as task_id,
    ct.status as task_status
FROM campaign_participants cp
LEFT JOIN campaign_tasks ct ON ct.campaign_id = cp.campaign_id AND ct.influencer_id = cp.influencer_id
WHERE ct.id = 'YOUR_TASK_ID';

-- 5. Check if there are any constraints preventing updates
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'task_workflow_states'::regclass;

-- 6. Manual fix if workflow is stuck
-- Update content_requirement to in_progress if it's not_started
UPDATE task_workflow_states
SET status = 'in_progress'
WHERE task_id = 'YOUR_TASK_ID'
AND phase = 'content_requirement'
AND status = 'not_started';

-- 7. Check the actual columns in the tables
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('task_workflow_states', 'campaign_tasks', 'campaign_participants')
AND column_name IN ('status', 'phase', 'current_stage', 'current_phase', 'phase_visibility')
ORDER BY table_name, ordinal_position;

-- 8. Check recent feedback to see if acceptance was recorded
SELECT 
    tf.*,
    p.name as sender_name
FROM task_feedback tf
LEFT JOIN profiles p ON p.id = tf.sender_id
WHERE tf.task_id = 'YOUR_TASK_ID'
AND tf.phase = 'content_requirement'
ORDER BY tf.created_at DESC
LIMIT 10;