
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCampaignDetail = (campaignId: string | null) => {
  return useQuery({
    queryKey: ['campaign-detail', campaignId],
    queryFn: async () => {
      if (!campaignId) return null;
      
      console.log('Fetching campaign detail for:', campaignId);
      
      // Fetch campaign data
      const { data: campaignData, error: campaignError } = await supabase
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
          llm_campaign,
          brands (
            name,
            logo_url
          )
        `)
        .eq('id', campaignId)
        .single();

      if (campaignError) {
        console.error('Error fetching campaign detail:', campaignError);
        throw campaignError;
      }

      // Fetch LLM interactions for this campaign
      const { data: llmInteractions, error: llmError } = await supabase
        .from('llm_interactions')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (llmError) {
        console.error('Error fetching LLM interactions:', llmError);
      }

      console.log('Fetched campaign detail:', campaignData);
      console.log('Fetched LLM interactions:', llmInteractions);
      
      return {
        ...campaignData,
        budget: campaignData.budget || campaignData.amount || 0,
        category: campaignData.category,
        llmInteractions: llmInteractions || []
      };
    },
    enabled: !!campaignId
  });
};
