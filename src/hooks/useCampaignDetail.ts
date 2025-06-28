
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCampaignDetail = (campaignId: string | null) => {
  return useQuery({
    queryKey: ['campaign-detail', campaignId],
    queryFn: async () => {
      if (!campaignId) return null;
      
      console.log('Fetching campaign detail for:', campaignId);
      
      // Fetch campaign data (without llm_campaign field)
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
          is_public,
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
      
      // Extract campaign strategy from LLM interactions
      let llmCampaignData = null;
      if (llmInteractions && llmInteractions.length > 0) {
        // Look for campaign creation interaction or any interaction with campaign data
        for (const interaction of llmInteractions) {
          if (interaction.raw_output && typeof interaction.raw_output === 'object') {
            // Check if this interaction contains campaign strategy data
            if (interaction.raw_output.campaign_name || 
                interaction.raw_output.campaign_objective || 
                interaction.raw_output.target_audience) {
              llmCampaignData = interaction.raw_output;
              break;
            }
          }
        }
      }
      
      return {
        ...campaignData,
        budget: campaignData.budget || campaignData.amount || 0,
        category: campaignData.category,
        is_public: campaignData.is_public || false,
        llm_campaign: llmCampaignData, // Set from LLM interactions
        llmInteractions: llmInteractions || []
      };
    },
    enabled: !!campaignId
  });
};
