
export interface TaskDetail {
  id: string;
  title: string;
  platform: string;
  brand: string;
  dueDate: string;
  status: {
    contentRequirement: boolean;
    contentReview: boolean;
    publishContent: boolean;
    contentAnalytics: boolean;
    currentStep: 'contentRequirement' | 'contentReview' | 'publishContent' | 'contentAnalytics';
  };
  description: string;
  deliverables: string[];
  aiScore: number;
  feedbacks: {
    id: string;
    from: string;
    message: string;
    timestamp: string;
  }[];
  uploads: {
    id: string;
    filename: string;
    uploadedAt: string;
  }[];
}
