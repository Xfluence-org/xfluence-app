-- Debug query for campaign progress calculation
-- This query shows the full picture of campaigns, tasks, workflow states, and progress calculations

-- 1. Show all campaigns with their tasks and workflow states
WITH campaign_task_details AS (
    SELECT 
        c.id AS campaign_id,
        c.name AS campaign_name,
        c.status AS campaign_status,
        c.progress AS campaign_progress,
        t.id AS task_id,
        t.name AS task_name,
        t.status AS task_status,
        tw.id AS workflow_id,
        tw.stage AS workflow_stage,
        tw.status AS workflow_status,
        tw.created_at AS workflow_created_at,
        tw.updated_at AS workflow_updated_at,
        -- Calculate progress for each task based on workflow stage
        CASE 
            WHEN tw.stage = 'completed' THEN 100
            WHEN tw.stage = 'content_approved' THEN 90
            WHEN tw.stage = 'content_review' THEN 70
            WHEN tw.stage = 'content_uploaded' THEN 50
            WHEN tw.stage = 'content_creation' THEN 30
            WHEN tw.stage = 'brand_approved' THEN 10
            WHEN tw.stage = 'brand_review' THEN 5
            ELSE 0
        END AS calculated_task_progress
    FROM campaigns c
    LEFT JOIN tasks t ON c.id = t.campaign_id
    LEFT JOIN task_workflows tw ON t.id = tw.task_id
    ORDER BY c.id, t.id, tw.created_at DESC
),

-- 2. Get the latest workflow state for each task (to handle multiple workflow records)
latest_workflow_per_task AS (
    SELECT DISTINCT ON (task_id)
        campaign_id,
        campaign_name,
        campaign_status,
        campaign_progress,
        task_id,
        task_name,
        task_status,
        workflow_id,
        workflow_stage,
        workflow_status,
        workflow_created_at,
        workflow_updated_at,
        calculated_task_progress
    FROM campaign_task_details
    WHERE task_id IS NOT NULL
    ORDER BY task_id, workflow_created_at DESC
),

-- 3. Calculate average progress per campaign
campaign_progress_calculation AS (
    SELECT 
        campaign_id,
        campaign_name,
        campaign_status,
        campaign_progress AS stored_campaign_progress,
        COUNT(DISTINCT task_id) AS total_tasks,
        COUNT(DISTINCT CASE WHEN workflow_id IS NOT NULL THEN task_id END) AS tasks_with_workflow,
        ROUND(AVG(COALESCE(calculated_task_progress, 0))::numeric, 2) AS calculated_campaign_progress
    FROM latest_workflow_per_task
    GROUP BY campaign_id, campaign_name, campaign_status, campaign_progress
)

-- Final output showing all details
SELECT 
    '=== CAMPAIGN SUMMARY ===' AS section,
    campaign_id,
    campaign_name,
    campaign_status,
    stored_campaign_progress,
    total_tasks,
    tasks_with_workflow,
    calculated_campaign_progress,
    CASE 
        WHEN stored_campaign_progress = calculated_campaign_progress THEN 'MATCH'
        ELSE 'MISMATCH'
    END AS progress_check
FROM campaign_progress_calculation

UNION ALL

SELECT 
    '=== TASK DETAILS ===' AS section,
    campaign_id::text,
    campaign_name || ' > ' || task_name AS campaign_name,
    task_status AS campaign_status,
    calculated_task_progress::numeric AS stored_campaign_progress,
    1 AS total_tasks,
    CASE WHEN workflow_id IS NOT NULL THEN 1 ELSE 0 END AS tasks_with_workflow,
    calculated_task_progress AS calculated_campaign_progress,
    CASE 
        WHEN workflow_stage IS NULL THEN 'NO WORKFLOW'
        ELSE workflow_stage || ' (' || workflow_status || ')'
    END AS progress_check
FROM latest_workflow_per_task

ORDER BY section DESC, campaign_id, campaign_name;

-- Additional debugging queries

-- Check if there are any tasks without workflows
SELECT 
    '--- Tasks without workflows ---' AS query_type,
    t.id AS task_id,
    t.name AS task_name,
    t.campaign_id,
    c.name AS campaign_name,
    t.status AS task_status,
    t.created_at
FROM tasks t
JOIN campaigns c ON t.campaign_id = c.id
LEFT JOIN task_workflows tw ON t.id = tw.task_id
WHERE tw.id IS NULL
ORDER BY t.created_at DESC;

-- Check if there are multiple workflow records per task
SELECT 
    '--- Tasks with multiple workflow records ---' AS query_type,
    t.id AS task_id,
    t.name AS task_name,
    COUNT(tw.id) AS workflow_count,
    array_agg(tw.stage ORDER BY tw.created_at) AS workflow_stages,
    array_agg(tw.created_at ORDER BY tw.created_at) AS workflow_dates
FROM tasks t
JOIN task_workflows tw ON t.id = tw.task_id
GROUP BY t.id, t.name
HAVING COUNT(tw.id) > 1
ORDER BY workflow_count DESC;

-- Check the actual trigger function calculation
SELECT 
    '--- Manual progress calculation per campaign ---' AS query_type,
    c.id AS campaign_id,
    c.name AS campaign_name,
    c.progress AS stored_progress,
    (
        SELECT ROUND(AVG(
            CASE tw.stage
                WHEN 'completed' THEN 100
                WHEN 'content_approved' THEN 90
                WHEN 'content_review' THEN 70
                WHEN 'content_uploaded' THEN 50
                WHEN 'content_creation' THEN 30
                WHEN 'brand_approved' THEN 10
                WHEN 'brand_review' THEN 5
                ELSE 0
            END
        )::numeric, 2)
        FROM tasks t
        LEFT JOIN task_workflows tw ON t.id = tw.task_id
        WHERE t.campaign_id = c.id
    ) AS manually_calculated_progress
FROM campaigns c
WHERE EXISTS (SELECT 1 FROM tasks WHERE campaign_id = c.id)
ORDER BY c.id;

-- Check recent workflow updates and their impact
SELECT 
    '--- Recent workflow updates ---' AS query_type,
    tw.id AS workflow_id,
    tw.task_id,
    t.name AS task_name,
    c.id AS campaign_id,
    c.name AS campaign_name,
    tw.stage AS new_stage,
    tw.created_at,
    tw.updated_at,
    c.progress AS campaign_progress_after_update
FROM task_workflows tw
JOIN tasks t ON tw.task_id = t.id
JOIN campaigns c ON t.campaign_id = c.id
WHERE tw.created_at > NOW() - INTERVAL '1 day'
ORDER BY tw.created_at DESC
LIMIT 20;