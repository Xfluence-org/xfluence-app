
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
  status: 'invitation' | 'active' | 'completed';
  progress?: number;
  workflow?: string[];
  currentStep?: number;
}
