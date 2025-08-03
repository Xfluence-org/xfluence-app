import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const tiers = {
  'nano': [1000, 10000],
  'micro': [10000, 50000],
  'mid': [50000, 500000],
  'macro': [500000, 1000000],
  'mega': [1000000, 10000000]
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

    // Validate required parameters
    const required_keys = ['goals', 'campaign_description', 'categories', 'total_influencers', 'follower_tier', 'content_type', 'budget_min', 'budget_max'];
    const missing = required_keys.filter(key => !searchParams[key]);
    if (missing.length > 0) {
      throw new Error(`Missing required parameters: ${missing.join(', ')}`);
    }

    const categories = searchParams.categories || [];
    const follower_tiers = searchParams.follower_tier || [];
    const content_types = searchParams.content_type || [];

    const valid_tiers_str = follower_tiers
      .filter(tier => tiers[tier])
      .map(tier => `${tier} (${tiers[tier][0].toLocaleString()}-${tiers[tier][1].toLocaleString()} followers)`)
      .join(', ');

    const system_prompt = `You are a world-class marketing strategist, an expert in crafting highly detailed and actionable influencer campaign plans. Your task is to create a comprehensive SEARCH and STRATEGY PLAN to find and engage the ideal influencers based on the user's campaign goals and constraints.

INSTRUCTIONS:
1. Perform a deep analysis of the user's goals, campaign description, and constraints.
2. Develop a coherent and multi-faceted marketing campaign strategy.
3. Provide a rich list of actionable search tactics.
4. Create a logical allocation of influencers across the specified categories and tiers. The sum of allocations must match the total_influencers.
5. Develop a detailed content strategy, including content distribution mix with rationale, and platform-specific creative approaches for Instagram.
6. Provide a thorough justification for all strategic choices, linking them back to the campaign goals.

REFERENCE - Influencer Tiers (based on follower count):
${valid_tiers_str || "User has not specified tiers - recommend appropriate tiers based on campaign goals."}

OUTPUT REQUIREMENTS:
- Return ONLY a single, valid JSON object.
- The JSON must strictly follow the structure specified in the human prompt.
- Do not include any markdown formatting, comments, or text outside the JSON structure.
- Ensure all brackets and quotes are properly closed.
- All allocation and percentage numbers must be integers.
- The sum of category allocations must equal the total_influencers.
- The sum of content type percentages must equal 100.`;

    // Build the JSON structure template
    const category_alloc_items = categories.map(cat => `      "${cat}": <integer>`);
    const category_allocation_str = category_alloc_items.join(',\n');

    const tier_items_inner = follower_tiers.map(tier => `          "${tier}": <integer>`).join(',\n');
    const tier_allocation_items = categories.map(cat => `      "${cat}": {\n${tier_items_inner}\n      }`);
    const tier_allocation_str = tier_allocation_items.join(',\n');

    const content_dist_items = content_types.map(ctype => `      "${ctype}": {\n        "percentage": <integer>,\n        "purpose": "string"\n      }`);
    const content_dist_str = content_dist_items.join(',\n');

    const platform_strat_items = content_types.map(ctype => `      "${ctype}": {\n        "creative_approach": "string",\n        "best_practices": ["string", "string"]\n      }`);
    const platform_strat_str = platform_strat_items.join(',\n');

    const human_prompt = `Create a comprehensive influencer search plan based on these details:

Campaign Details:
- Goals: ${searchParams.goals}
- Campaign Description: ${searchParams.campaign_description}
- Target Categories: ${categories.join(', ')}
- Desired Number of Influencers: ${searchParams.total_influencers}
- Target Follower Tiers: ${follower_tiers.join(', ')}
- Budget Range: $${searchParams.budget_min} to $${searchParams.budget_max}
- Content Type: ${content_types.join(', ')}

Return a JSON object with this exact structure, replacing placeholder values:

{
  "search_strategy_summary": "string (concise high-level strategy summary)",
  "influencer_allocation": {
    "total_influencers": ${searchParams.total_influencers},
    "allocation_by_category": {
${category_allocation_str}
    },
    "allocation_by_tier": {
${tier_allocation_str}
    }
  },
  "content_strategy": {
    "content_distribution": {
      "rationale": "string (explain content mix choices)",
${content_dist_str}
    },
    "platform_specific_strategies": {
${platform_strat_str}
    }
  },
  "actionable_search_tactics": {
    "niche_hashtags": ["string", "string"],
    "platform_tools": ["string", "string"]
  },
  "justification": "string (detailed strategic explanation)"
}`;

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
          { role: 'system', content: system_prompt },
          { role: 'user', content: human_prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      throw new Error(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    const plan_str = data.choices[0].message.content;
    
    console.log('DeepSeek response received:', plan_str);

    let plan;
    try {
      plan = JSON.parse(plan_str);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      throw new Error('Failed to parse campaign plan from AI response');
    }

    // Log the interaction to llm_interactions table
    const log_entry = {
      user_id: user.id,
      call_type: 'campaign_planner',
      input_messages: [
        { role: 'system', content: system_prompt },
        { role: 'user', content: human_prompt }
      ],
      raw_output: plan,
      timestamp: new Date().toISOString()
    };

    const { error: logError } = await supabaseClient
      .from('llm_interactions')
      .insert(log_entry);

    if (logError) {
      console.error('Error logging to llm_interactions:', logError);
      // Don't fail the request if logging fails
    }

    console.log('Campaign plan generated and logged successfully');

    return new Response(JSON.stringify(plan), {
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