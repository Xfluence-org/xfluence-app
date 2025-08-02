# Testing Progress Tracking

## Access Points

The application is running at: http://localhost:8081/

### For Brand/Agency Users:

1. **Brand Progress Dashboard** (Main Progress View)
   - URL: http://localhost:8081/brand/progress
   - Features:
     - Campaign-level progress overview
     - Task-level detailed progress
     - Filter by campaign, phase, or search
     - Real-time progress bars
     - Activity timeline

2. **Campaign Details Modal** (Campaign-specific Progress)
   - URL: http://localhost:8081/brand/campaigns
   - Click on any campaign to open details
   - Navigate to different tabs:
     - **Influencers Tab**: See participant progress
     - **Review Tab**: Review submitted content
     - **Analytics Tab**: View published content metrics

### For Influencer Users:

1. **Task Detail Modal**
   - Access from influencer dashboard
   - Shows:
     - Task phase indicator
     - Progress tab with timeline
     - Requirements, Upload, and Publish tabs

## Progress Tracking Features

### Phase Tracking
The system tracks three main phases:
1. **Content Requirements** (Waiting → In Progress → Completed)
2. **Content Review** (Waiting → In Progress → Completed)
3. **Publish & Analytics** (Waiting → In Progress → Completed)

### Visual Indicators
- **Progress Bars**: Show completion percentage
- **Phase Status Badges**: 
  - Waiting (Blue)
  - In Progress (Yellow)
  - Completed (Green)
- **Timeline View**: Shows chronological activity
- **Activity Logs**: Detailed action history

## Test Scenarios

### Scenario 1: Brand Views Campaign Progress
1. Login as a brand/agency user
2. Navigate to `/brand/progress`
3. Observe:
   - Campaign cards with overall progress
   - Task list with phase indicators
   - Filters working correctly

### Scenario 2: Check Individual Task Progress
1. From brand campaigns page, open a campaign
2. Go to Influencers tab
3. Click "View Progress" on any active influencer
4. See the TaskProgressTracker component showing:
   - Current phase
   - Phase timeline
   - Activity history

### Scenario 3: Influencer Task Progress
1. Login as an influencer
2. Open any assigned task
3. Check the Progress tab showing:
   - Phase progress
   - Timeline of activities
   - Current status

## SQL Queries for Testing

Run these in Supabase SQL editor to see current progress data:

```sql
-- View all task progress
SELECT 
    ct.id,
    ct.title,
    ct.progress,
    ct.status,
    cp.current_stage,
    COUNT(DISTINCT tws.phase) as phases_completed
FROM campaign_tasks ct
JOIN campaign_participants cp ON ct.campaign_id = cp.campaign_id 
    AND ct.influencer_id = cp.influencer_id
LEFT JOIN task_workflow_states tws ON ct.id = tws.task_id 
    AND tws.status = 'completed'
GROUP BY ct.id, ct.title, ct.progress, ct.status, cp.current_stage
ORDER BY ct.created_at DESC;
```