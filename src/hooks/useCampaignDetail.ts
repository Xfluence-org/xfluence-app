import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCampaignDetail = (campaignId: string | null) => {
  return useQuery({
    queryKey: ['campaign-detail', campaignId],
    queryFn: async () => {
      if (!campaignId) return null;
      
      console.log('Fetching campaign detail for:', campaignId);
      
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          id,
          title,
          description,
          category,
          status,
          budget,
          amount,
          due_date,
          created_at,
          brands (
            name,
            logo_url
          )
        `)
        .eq('id', campaignId)
        .single();

      if (error) {
        console.error('Error fetching campaign detail:', error);
        throw error;
      }

      console.log('Fetched campaign detail:', data);
      return {
        ...data,
        budget: data.budget || data.amount || 0,
        // Handle category array properly - keep as array for internal use
        // but provide first element for display compatibility
        category: data.category
      };
    },
    enabled: !!campaignId
  });
};
