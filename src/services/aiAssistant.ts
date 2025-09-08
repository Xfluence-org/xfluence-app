import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantResponse {
  message: string;
  sessionId: string;
  error?: string;
  success: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  updated_at: string;
  created_at: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export const aiAssistantService = {
  async sendMessage(
    messages: Message[], 
    sessionId?: string,
    newChat: boolean = false
  ): Promise<AIAssistantResponse> {
    try {
      // Get the current session to ensure user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('You must be logged in to use the AI assistant');
      }

      // Call the Edge Function with session management
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          messages,
          sessionId,
          newChat
        }
      });

      if (error) {
        throw error;
      }

      return data as AIAssistantResponse;
    } catch (error) {
      return {
        message: '',
        sessionId: '',
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get AI response'
      };
    }
  },

  // Load recent chat sessions (last 7 days)
  async getRecentChats(): Promise<ChatSession[]> {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data, error } = await (supabase as any)
        .from('chat_sessions')
        .select('id, title, updated_at, created_at')
        .gte('updated_at', sevenDaysAgo.toISOString())
        .order('updated_at', { ascending: false })
        .limit(20);
        
      if (error) {
        console.error('Error loading recent chats:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getRecentChats:', error);
      return [];
    }
  },

  // Load chat history for a specific session
  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('chat_messages')
        .select('id, role, content, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error('Error loading chat history:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getChatHistory:', error);
      return [];
    }
  },

  // Delete a chat session
  async deleteChat(sessionId: string): Promise<boolean> {
    try {
      const { error } = await (supabase as any)
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);
        
      if (error) {
        console.error('Error deleting chat:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in deleteChat:', error);
      return false;
    }
  },

  // Update chat session title
  async updateChatTitle(sessionId: string, title: string): Promise<boolean> {
    try {
      const { error } = await (supabase as any)
        .from('chat_sessions')
        .update({ title })
        .eq('id', sessionId);
        
      if (error) {
        console.error('Error updating chat title:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in updateChatTitle:', error);
      return false;
    }
  },

  // Helper function to format conversation history for the API
  formatConversationHistory(messages: Array<{ sender: 'user' | 'assistant'; content: string }>): Message[] {
    return messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
  },

  // Generate a title for a chat based on the first user message
  generateChatTitle(firstMessage: string): string {
    const words = firstMessage.split(' ').slice(0, 6);
    return words.join(' ') + (firstMessage.split(' ').length > 6 ? '...' : '');
  }
};