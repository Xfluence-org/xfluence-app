# How to Access Feedback on Brand/Agency Side

## Navigation Path:

### Method 1: From Campaign Details (Primary Path)
1. **Login as Brand/Agency**
2. **Go to Campaigns** → `/brand/campaigns`
3. **Click on a Campaign** to open Campaign Details Modal
4. **Go to "Influencers" tab**
5. **Find an Active Influencer** (one who has received content requirements)
6. **Click "View Tasks"** button → Opens BrandTaskViewModal
7. **The modal shows tasks but needs to be clicked individually**

### Method 2: From Progress Dashboard
1. **Login as Brand/Agency**
2. **Go to Progress** → `/brand/progress`
3. **Find a task and click on it**
4. **This should open task details with feedback**

## Current Issues:

### Issue 1: BrandTaskViewModal doesn't show feedback directly
The BrandTaskViewModal shows a list of tasks but doesn't include the TaskWorkflowManager directly. Users need to click on individual tasks to see the feedback.

### Issue 2: No direct task detail view
When clicking "View Tasks" from the Active Influencers section, it opens BrandTaskViewModal which shows a list of tasks. To see the feedback, users would need to click on each task individually.

## Solution Needed:

The BrandTaskViewModal should either:
1. Show the feedback conversation directly for each task
2. OR have a clear way to open the task detail (TaskDetailModal) where the TaskWorkflowManager with feedback is displayed

Currently, the feedback conversation is only visible if:
- The brand user opens a specific task's TaskDetailModal
- The TaskDetailModal recognizes them as a brand user (isBrand = true)
- The TaskWorkflowManager is rendered with the TaskFeedbackSection