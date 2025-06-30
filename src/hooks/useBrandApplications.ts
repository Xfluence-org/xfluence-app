
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BrandApplication {
  application_id: string;
  campaign_id: string;
  campaign_title: string;
  influencer_name: string;
  influencer_handle: string;
  followers_count: number;
  platform: string;
  applied_at: string;
  application_status: string;
  engagement_rate: number;
  average_views: number;
  niche: string[];
  ai_score: number;
  application_message: string;
  influencer_profile_url: string;
}

export const useBrandApplications = (limit: number = 10) => {
  return useQuery({
    queryKey: ['brand-applications', limit],
    staleTime: 0,
    refetchOnMount: 'always',
    queryFn: async () => {
      console.log('Fetching brand applications');
      
      const { data, error } = await supabase.rpc('get_brand_applications', {
        limit_count: limit
      });

      if (error) {
        console.error('Error fetching brand applications:', error);
        throw error;
      }

      console.log('Fetched brand applications:', data);
      return data || [];
    }
  });
};
