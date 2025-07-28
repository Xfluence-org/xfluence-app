
// @ts-nocheck
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCampaignDetail = (campaignId: string | null) => {
  return useQuery({
    queryKey: ['campaign-detail', campaignId],
    queryFn: async () => {
      if (!campaignId) return null;
      
      console.log('Fetching campaign detail for:', campaignId);
      
      // Use the new database function to get campaign with LLM data
      const { data: campaignData, error: campaignError } = await supabase
        .rpc('get_campaign_with_llm_data', { campaign_id_param: campaignId })
        .single();

      if (campaignError) {
        console.error('Error fetching campaign detail:', campaignError);
        throw campaignError;
      }

      // Also fetch raw LLM interactions for components that need the full interaction format
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
        brands: {
          name: campaignData.brand_name,
          logo_url: campaignData.brand_logo_url
        },
        llmInteractions: llmInteractions || [],
        // Add the parsed LLM data for easier access
        llm_data: campaignData.llm_data || {}
      };
    },
    enabled: !!campaignId
  });
};
