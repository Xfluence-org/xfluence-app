-- Check campaign participants and their current stage
SELECT 
    cp.id as participant_id,
    c.title as campaign_title,
    p.name as influencer_name,
    cp.status as participant_status,
    cp.current_stage,
    cp.created_at
FROM campaign_participants cp
JOIN campaigns c ON cp.campaign_id = c.id
JOIN profiles p ON cp.influencer_id = p.id
ORDER BY cp.created_at DESC;

-- Check tasks and their workflow states
SELECT 
    ct.id as task_id,
    ct.title as task_title,
    c.title as campaign_title,
    p.name as influencer_name,
    ct.status as task_status,
    ct.progress,
    tws.phase,
    tws.status as phase_status,
    tws.created_at as phase_started,
    tws.completed_at as phase_completed
FROM campaign_tasks ct
LEFT JOIN campaigns c ON ct.campaign_id = c.id
LEFT JOIN profiles p ON ct.influencer_id = p.id
LEFT JOIN task_workflow_states tws ON ct.id = tws.task_id
ORDER BY ct.created_at DESC, tws.created_at;

-- Check activity logs
SELECT 
    al.id,
    al.activity_type,
    al.description,
    p.name as performed_by,
    al.created_at,
    ct.title as task_title
FROM activity_logs al
LEFT JOIN profiles p ON al.user_id = p.id
LEFT JOIN campaign_tasks ct ON al.task_id = ct.id
ORDER BY al.created_at DESC
LIMIT 20;

-- Check content requirements shared
SELECT 
    cr.id,
    c.title as campaign_title,
    cr.content_type,
    cr.shared_at,
    p.name as shared_to,
    LEFT(cr.requirements, 100) as requirements_preview
FROM content_requirements cr
JOIN campaigns c ON cr.campaign_id = c.id
JOIN profiles p ON cr.influencer_id = p.id
ORDER BY cr.shared_at DESC;

-- Check task uploads (content submissions)
SELECT 
    tu.id,
    ct.title as task_title,
    p.name as uploaded_by,
    tu.file_name,
    tu.status,
    tu.created_at
FROM task_uploads tu
JOIN campaign_tasks ct ON tu.task_id = ct.id
JOIN profiles p ON tu.uploaded_by = p.id
ORDER BY tu.created_at DESC;

-- Check content reviews
SELECT 
    tcr.id,
    ct.title as task_title,
    tcr.status as review_status,
    tcr.feedback,
    p.name as reviewed_by,
    tcr.created_at
FROM task_content_reviews tcr
JOIN campaign_tasks ct ON tcr.task_id = ct.id
LEFT JOIN profiles p ON tcr.reviewed_by = p.id
ORDER BY tcr.created_at DESC;

-- Check published content and analytics
SELECT 
    tpc.id,
    ct.title as task_title,
    tpc.platform,
    tpc.post_url,
    tpc.published_at,
    ta.impressions,
    ta.engagement_rate,
    ta.likes,
    ta.comments
FROM task_published_content tpc
JOIN campaign_tasks ct ON tpc.task_id = ct.id
LEFT JOIN task_analytics ta ON tpc.id = ta.published_content_id
ORDER BY tpc.published_at DESC;