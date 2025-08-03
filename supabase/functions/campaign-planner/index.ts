import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchParams } = await req.json();
    
    console.log('Campaign planner request received:', searchParams);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    // Create the campaign strategy prompt
    const prompt = `Create a comprehensive influencer marketing campaign strategy based on these parameters:

Campaign Goals: ${searchParams.goals}
Description: ${searchParams.campaign_description}
Categories: ${searchParams.categories?.join(', ')}
Total Influencers: ${searchParams.total_influencers}
Influencer Tiers: ${searchParams.follower_tier?.join(', ')}
Content Types: ${searchParams.content_type?.join(', ')}
Budget Range: $${searchParams.budget_min} - $${searchParams.budget_max}

Please provide a detailed strategy including:
1. Influencer allocation by tier and category
2. Content strategy and distribution
3. Search tactics and hashtag recommendations
4. Justification for the approach
5. Expected outcomes and KPIs

Format your response as a structured JSON object with clear sections for each component.`;

    // Call DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('DEEPSEEK_API_KEY')}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert influencer marketing strategist. Provide detailed, actionable campaign strategies in structured JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('DeepSeek response received:', aiResponse);

    // Try to parse JSON from the response
    let parsedStrategy;
    try {
      // Extract JSON from the response if it's wrapped in markdown or text
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedStrategy = JSON.parse(jsonMatch[0]);
      } else {
        parsedStrategy = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.log('Failed to parse as JSON, returning raw response');
      parsedStrategy = {
        raw_response: aiResponse,
        parsed: false
      };
    }

    return new Response(JSON.stringify(parsedStrategy), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in campaign-planner function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});