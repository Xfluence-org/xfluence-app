/**
 * Utility functions for formatting task-related display strings
 */

/**
 * Format task type for display
 */
export const formatTaskType = (taskType: string): string => {
  const typeMap: Record<string, string> = {
    'content_creation': 'Content Creation',
    'content_requirement': 'Content Requirements',
    'content_review': 'Content Review',
    'publish_analytics': 'Publish & Analytics',
    'posts': 'Instagram Posts',
    'reels': 'Instagram Reels',
    'stories': 'Instagram Stories',
    'post': 'Instagram Post',
    'reel': 'Instagram Reel',
    'story': 'Instagram Story'
  };
  
  return typeMap[taskType?.toLowerCase()] || taskType || 'Task';
};

/**
 * Format phase name for display
 */
export const formatPhaseName = (phase: string): string => {
  const phaseMap: Record<string, string> = {
    'content_requirement': 'Content Requirements',
    'content_review': 'Content Review',
    'publish_analytics': 'Publish & Analytics',
    'waiting_for_requirements': 'Waiting for Requirements',
    'content_creation': 'Content Creation',
    'in_review': 'In Review',
    'published': 'Published'
  };
  
  return phaseMap[phase?.toLowerCase()] || phase || 'Unknown';
};

/**
 * Format status for display
 */
export const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'not_started': 'Not Started',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'rejected': 'Rejected',
    'pending': 'Pending',
    'active': 'Active',
    'approved': 'Approved',
    'submitted': 'Submitted for Review',
    'content_requirement': 'Requirements Phase',
    'content_requirements': 'Requirements Phase',
    'content_review': 'Review Phase',
    'publish_analytics': 'Awaiting Publish',
    'invited': 'Invited'
  };
  
  return statusMap[status?.toLowerCase()] || status || 'Unknown';
};

/**
 * Get appropriate color for status
 */
export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'not_started': 'gray',
    'in_progress': 'blue',
    'completed': 'green',
    'rejected': 'red',
    'pending': 'yellow',
    'active': 'blue',
    'approved': 'green',
    'submitted': 'orange',
    'content_requirement': 'purple',
    'content_review': 'orange',
    'publish_analytics': 'teal'
  };
  
  return colorMap[status?.toLowerCase()] || 'gray';
};

/**
 * Format deadline for display
 */
export const formatDeadline = (deadline: string | null | undefined, fallbackDeadline?: string | null): string => {
  const dateToUse = deadline || fallbackDeadline;
  
  if (!dateToUse) {
    return 'Not set';
  }
  
  try {
    const date = new Date(dateToUse);
    const now = new Date();
    const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) {
      return `Overdue by ${Math.abs(diffInDays)} days`;
    } else if (diffInDays === 0) {
      return 'Due today';
    } else if (diffInDays === 1) {
      return 'Due tomorrow';
    } else if (diffInDays <= 7) {
      return `Due in ${diffInDays} days`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format task title based on type and content
 */
export const formatTaskTitle = (task: {
  title?: string;
  task_type?: string;
  description?: string;
}): string => {
  // If there's a custom title, use it
  if (task.title && task.title !== 'Content Creation') {
    return task.title;
  }
  
  // Otherwise, format based on task type
  return formatTaskType(task.task_type || 'content_creation');
};

/**
 * Get appropriate color class for phase
 */
export const getPhaseColor = (phase: string): string => {
  const colorMap: Record<string, string> = {
    'content_requirement': 'bg-purple-100 text-purple-700',
    'content_review': 'bg-orange-100 text-orange-700',
    'publish_analytics': 'bg-teal-100 text-teal-700',
    'waiting_for_requirements': 'bg-yellow-100 text-yellow-700',
    'content_creation': 'bg-blue-100 text-blue-700',
    'in_review': 'bg-orange-100 text-orange-700',
    'published': 'bg-green-100 text-green-700'
  };
  
  return colorMap[phase?.toLowerCase()] || 'bg-gray-100 text-gray-700';
};