
export interface Opportunity {
  id: string;
  title: string;
  brand: string;
  compensation: {
    min?: number;
    max: number;
    type: 'fixed' | 'range';
  };
  category: string[];
  platforms: string[];
  deliverables: {
    posts?: number;
    stories?: number;
    reels?: number;
  };
  postedAt: string;
  description?: string;
  requirements?: string[];
  timeline?: string;
}
