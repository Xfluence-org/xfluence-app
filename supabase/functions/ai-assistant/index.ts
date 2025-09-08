import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, sessionId, newChat = false } = await req.json();
    console.log('Received AI assistant request', { sessionId, newChat });

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Use service role for full access
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized');
    }

    console.log('Authenticated user:', user.id);

    // Get user profile for context
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('user_type, name')
      .eq('id', user.id)
      .single();

    let currentSessionId = sessionId;
    let chatHistory: any[] = [];

    // Handle session management
    if (newChat || !sessionId) {
      // Create new chat session
      const { data: newSession, error: sessionError } = await supabaseClient
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: `Chat ${new Date().toLocaleDateString()}`
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        throw new Error('Failed to create chat session');
      }

      currentSessionId = newSession.id;
      console.log('Created new session:', currentSessionId);
    } else {
      // Load existing chat history
      const { data: existingMessages, error: historyError } = await supabaseClient
        .from('chat_messages')
        .select('role, content, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (historyError) {
        console.error('Error loading chat history:', historyError);
      } else {
        chatHistory = existingMessages || [];
        console.log(`Loaded ${chatHistory.length} messages from history`);
      }
    }

    // Save user message to database
    const userMessage = messages[messages.length - 1]; // Get the latest user message
    if (userMessage && userMessage.role === 'user') {
      const { error: saveUserError } = await supabaseClient
        .from('chat_messages')
        .insert({
          session_id: currentSessionId,
          role: 'user',
          content: userMessage.content
        });

      if (saveUserError) {
        console.error('Error saving user message:', saveUserError);
      }
    }

    // Prepare system prompt
    const systemPrompt = `You are an expert AI marketing assistant specializing in influencer marketing and social media campaigns. You help brands, agencies, and influencers optimize their marketing strategies.

Your expertise includes:
- Influencer discovery and vetting
- Campaign strategy and planning
- Content optimization for viral potential
- ROI analysis and performance metrics
- Platform-specific best practices (Instagram, TikTok, YouTube, etc.)
- Influencer relationship management
- Budget allocation and pricing strategies
- Compliance and FTC guidelines
- Trend analysis and market insights

${profile ? `User Context:
- User Type: ${profile.user_type || 'Unknown'}
- Name: ${profile.name || 'User'}` : ''}

Guidelines:
- Keep responses concise and actionable
- Provide specific, data-driven recommendations when possible
- Focus on practical solutions for influencer marketing challenges
- Consider current social media trends and best practices
- Be helpful for both beginners and experienced marketers
- Always prioritize authentic, compliant marketing practices

Answer the user's question with expertise in influencer marketing and social media strategy.`;

    // Combine system prompt, chat history, and new messages
    const llmMessages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.map(msg => ({ role: msg.role, content: msg.content })),
      ...messages.filter(msg => msg.role !== 'system') // Exclude system messages from frontend
    ];

    // Limit context to last 20 messages to avoid token limits
    const contextMessages = llmMessages.slice(0, 1).concat(llmMessages.slice(-19));

    console.log(`Sending ${contextMessages.length} messages to DeepSeek`);

    // Call DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('DEEPSEEK_API_KEY')}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: contextMessages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Save AI response to database
    const { error: saveAiError } = await supabaseClient
      .from('chat_messages')
      .insert({
        session_id: currentSessionId,
        role: 'assistant',
        content: aiResponse
      });

    if (saveAiError) {
      console.error('Error saving AI response:', saveAiError);
    }

    // Update session timestamp
    const { error: updateError } = await supabaseClient
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', currentSessionId);

    if (updateError) {
      console.error('Error updating session:', updateError);
    }

    // Store interaction in llm_interactions for analytics
    const { error: insertError } = await supabaseClient
      .from('llm_interactions')
      .insert({
        user_id: user.id,
        call_type: 'ai_assistant_chat',
        input_messages: contextMessages,
        raw_output: {
          content: aiResponse,
          model: 'deepseek-chat',
          tokens_used: data.usage?.total_tokens || 0,
          session_id: currentSessionId
        }
      });

    if (insertError) {
      console.error('Error storing interaction:', insertError);
    }

    return new Response(JSON.stringify({
      message: aiResponse,
      sessionId: currentSessionId,
      success: true
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error in AI Assistant Edge Function:', error);
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 400
    });
  }
});

console.log("🤖 AI Marketing Assistant with Chat History Running...");