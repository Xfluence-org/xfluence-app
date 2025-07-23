import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantResponse {
  message: string;
  error?: string;
}

export const aiAssistantService = {
  async sendMessage(
    messages: Message[], 
    campaignId?: string
  ): Promise<AIAssistantResponse> {
    try {
      // Get the current session to ensure user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('You must be logged in to use the AI assistant');
      }

      // If no campaignId provided, fetch the most recent campaign
      let activeCampaignId = campaignId;
      if (!activeCampaignId) {
        console.log('Fetching most recent campaign...');
        const { data: campaigns, error: campaignError } = await supabase
          .from('campaigns')
          .select('id, title, created_at')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (campaignError) {
          console.error('Error fetching campaign:', campaignError);
        } else if (campaigns && campaigns.length > 0) {
          activeCampaignId = campaigns[0].id;
          console.log('Found campaign:', campaigns[0]);
        } else {
          console.log('No campaigns found in database');
        }
      }

      console.log('Calling AI assistant with campaignId:', activeCampaignId);
      
      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          messages,
          campaignId: activeCampaignId
        }
      });

      if (error) {
        throw error;
      }

      return data as AIAssistantResponse;
    } catch (error) {
      console.error('AI Assistant error:', error);
      return {
        message: '',
        error: error instanceof Error ? error.message : 'Failed to get AI response'
      };
    }
  },

  // Helper function to format conversation history for the API
  formatConversationHistory(messages: Array<{ sender: 'user' | 'assistant'; content: string }>): Message[] {
    return messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
  }
};