
export interface Task {
  id: string;
  type?: 'Posts' | 'Stories' | 'Reels';
  title?: string;
  task_type?: string;
  deliverable: string;
  status: 'content review' | 'post content' | 'content draft' | 'completed' | 'pending';
  progress: number;
  nextDeadline: string;
  feedback?: string;
  hasFeedback?: boolean;
}

export interface DetailedCampaign {
  id: string;
  title: string;
  brand: string;
  status: 'invited' | 'active' | 'completed' | 'pending';
  taskCount: number;
  dueDate: string;
  platforms: string[];
  amount: number;
  overallProgress: number;
  tasks: Task[];
  completedTasks: number;
  originalStatus?: string; // Store the original database status for filtering
  isWaitingForRequirements?: boolean;
}

// Add Campaign type export for TaskWorkflowCard
export interface Campaign {
  id: string;
  title: string;
  brand: string;
  status: string;
  taskCount: number;
  dueDate: string;
  platforms: string[];
  amount: number;
  overall_progress: number;
  tasks: Task[];
  completedTasks: number;
}

export type CampaignTab = 'Active' | 'Completed' | 'Requests';
