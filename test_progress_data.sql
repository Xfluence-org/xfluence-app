-- First, let's see what campaigns exist
SELECT id, title, status, created_at 
FROM campaigns 
ORDER BY created_at DESC 
LIMIT 5;

-- Check if we have any participants
SELECT COUNT(*) as participant_count FROM campaign_participants;

-- Check if we have any tasks
SELECT COUNT(*) as task_count FROM campaign_tasks;

-- Check workflow states
SELECT COUNT(*) as workflow_state_count FROM task_workflow_states;

-- Check activity logs
SELECT COUNT(*) as activity_count FROM activity_logs;