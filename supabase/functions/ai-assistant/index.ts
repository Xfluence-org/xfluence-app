import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, campaignId } = await req.json()
    console.log('Received request with campaignId:', campaignId)
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      console.error('Auth error:', userError)
      throw new Error('Unauthorized')
    }
    console.log('Authenticated user:', user.id)

    // Fetch campaign context
    console.log('Fetching campaign data for ID:', campaignId)
    const { data: campaignData, error: campaignError } = await supabaseClient
      .rpc('get_campaign_llm_data', { campaign_id_param: campaignId })
    
    if (campaignError) {
      console.error('Campaign fetch error:', campaignError)
      throw campaignError
    }
    
    console.log('Campaign data received:', JSON.stringify(campaignData))
    
    // Also fetch basic campaign info for better context
    const { data: campaignInfo, error: infoError } = await supabaseClient
      .from('campaigns')
      .select('title, description, budget, amount, status')
      .eq('id', campaignId)
      .single()
    
    if (!infoError && campaignInfo) {
      console.log('Campaign info:', JSON.stringify(campaignInfo))
    }

    // Prepare system prompt with campaign context
    const systemPrompt = `You are a helpful AI marketing assistant. 
Keep your responses concise and directly address the user's question.

${campaignInfo ? `Current Campaign Information:
- Title: ${campaignInfo.title}
- Description: ${campaignInfo.description || 'No description'}
- Budget: $${campaignInfo.budget ? (campaignInfo.budget / 100).toFixed(2) : 'Not set'}
- Amount per influencer: $${campaignInfo.amount ? (campaignInfo.amount / 100).toFixed(2) : 'Not set'}
- Status: ${campaignInfo.status}` : ''}

${campaignData && Object.keys(campaignData).length > 0 ? `\nAdditional Campaign Context:\n${JSON.stringify(campaignData, null, 2)}` : ''}`

    console.log('System prompt created:', systemPrompt)

    // Prepare messages for DeepSeek
    const llmMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ]

    // Call DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('DEEPSEEK_API_KEY')}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: llmMessages,
        temperature: 0.5
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('DeepSeek API error:', response.status, errorText)
      throw new Error(`DeepSeek API error: ${response.statusText}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    // Store interaction in database
    const { error: insertError } = await supabaseClient
      .from('llm_interactions')
      .insert({
        campaign_id: campaignId,
        user_id: user.id,
        call_type: 'chat_interaction',
        input_messages: llmMessages,
        raw_output: { content: aiResponse }
      })

    if (insertError) {
      console.error('Error storing interaction:', insertError)
    }

    return new Response(
      JSON.stringify({ message: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in Edge Function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})