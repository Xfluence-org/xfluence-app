
export type CampaignTab = 'Active' | 'Completed' | 'Requests';

export interface DetailedCampaign {
  id: string;
  title: string;
  brand: string;
  status: 'invited' | 'active' | 'completed' | 'pending' | 'rejected' | 'approved';
  taskCount: number;
  dueDate: string;
  platforms: string[];
  amount: number;
  overallProgress: number;
  completedTasks: number;
  tasks: CampaignTask[];
  originalStatus?: string;
}

export interface CampaignTask {
  id: string;
  type: 'Posts' | 'Stories' | 'Reels';
  deliverable: string;
  status: 'content review' | 'post content' | 'content draft' | 'completed' | 'pending';
  progress: number;
  nextDeadline: string;
  feedback?: string;
}
