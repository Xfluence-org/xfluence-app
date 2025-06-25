
export interface Campaign {
  id: string;
  brand: string;
  title: string;
  amount?: number;
  dueDate: string;
  requirements: {
    posts?: number;
    stories?: number;
    reels?: number;
  };
  status: 'invited' | 'accepted' | 'active' | 'completed' | 'declined';
  progress?: number;
  workflow?: string[];
  currentStep?: number;
  currentStage?: string;
}
