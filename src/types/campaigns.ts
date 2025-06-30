
export interface Task {
  id: string;
  type: 'Posts' | 'Stories' | 'Reels';
  deliverable: string;
  status: 'content review' | 'post content' | 'content draft' | 'completed' | 'pending';
  progress: number;
  nextDeadline: string;
  feedback?: string;
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

export type CampaignTab = 'Active' | 'Completed' | 'Requests';
