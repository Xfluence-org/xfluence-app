import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CampaignTab } from '@/types/campaigns';

export const useCampaignData = (tabFilter: CampaignTab) => {
  return useQuery({
    queryKey: ['campaigns', tabFilter],
    queryFn: async () => {
      console.log('useCampaignData - temporarily disabled for marketplace hiding');
      
      // For beta, we're hiding marketplace functionality
      // Return empty array to prevent errors
      return [];
    }
  });
};