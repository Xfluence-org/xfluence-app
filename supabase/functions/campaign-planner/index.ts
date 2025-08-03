import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl!, supabaseKey!);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchParams } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Campaign planner input:', searchParams);

    const systemPrompt = `You are a strategic influencer marketing expert. Create a CONCISE, actionable campaign strategy focused on WHY this approach will solve the brand's pain points and HOW to execute it step-by-step.

CRITICAL: Your response must be concise, structured, and focused on actionable insights that clearly demonstrate ROI and solve specific problems.

Structure your response as JSON with these exact fields:
{
  "strategy_summary": {
    "core_value_proposition": "One clear sentence explaining why this strategy will solve their main problem",
    "expected_roi": "Specific, realistic outcome they can expect",
    "key_differentiator": "What makes this approach unique and effective"
  },
  "quick_wins": [
    {
      "action": "Specific actionable step",
      "why": "Brief explanation of impact",
      "timeline": "When to execute"
    }
  ],
  "influencer_allocation": {
    "total_influencers": number,
    "allocation_by_tier": {
      "micro": {"count": number, "rationale": "Why this tier"},
      "mid": {"count": number, "rationale": "Why this tier"}
    },
    "allocation_by_category": {
      "primary_category": {"count": number, "impact": "Expected result"}
    }
  },
  "content_strategy": {
    "content_mix": [
      {
        "type": "post/reel/story",
        "percentage": number,
        "purpose": "What this achieves"
      }
    ],
    "key_messages": ["3-5 core messages"],
    "trending_hashtags": ["5-10 relevant hashtags"]
  },
  "success_metrics": {
    "primary_kpi": "Main metric to track",
    "target_reach": number,
    "expected_engagement_rate": "percentage",
    "projected_conversions": "realistic estimate"
  },
  "implementation_roadmap": [
    {
      "week": number,
      "focus": "What to prioritize",
      "deliverables": ["Specific outputs"]
    }
  ]
}

Keep each section focused on RESULTS and ACTIONS, not theory. Be specific about numbers, timelines, and expected outcomes.`;

    const userPrompt = `Create a strategic influencer campaign plan for:

Goals: ${searchParams.goals}
Description: ${searchParams.campaign_description}
Categories: ${searchParams.categories?.join(', ')}
Total Influencers: ${searchParams.total_influencers}
Follower Tiers: ${searchParams.follower_tier?.join(', ')}
Content Types: ${searchParams.content_type?.join(', ')}
Budget Range: $${searchParams.budget_min} - $${searchParams.budget_max}

Focus on creating a strategy that clearly solves the brand's pain points with specific, measurable outcomes. Be concise and actionable.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    console.log('OpenAI response:', data);

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    let aiResponse = data.choices[0].message.content;

    // Parse the JSON response
    let parsedStrategy;
    try {
      // Remove any markdown formatting
      aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      parsedStrategy = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw response:', aiResponse);
      throw new Error('Failed to parse AI response');
    }

    console.log('Parsed strategy:', parsedStrategy);

    return new Response(JSON.stringify(parsedStrategy), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in campaign-planner function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Campaign planner failed to generate strategy'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});