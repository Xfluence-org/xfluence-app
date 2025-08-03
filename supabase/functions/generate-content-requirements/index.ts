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
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
    if (!deepseekApiKey) {
      throw new Error('DEEPSEEK_API_KEY not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the Authorization header to verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    // Verify the user's session
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid or expired token');
    }

    const { campaignId } = await req.json();
    
    console.log('Content requirements generation request received for campaign:', campaignId);

    // Fetch the campaign plan from llm_interactions table
    const { data: campaignPlan, error: planError } = await supabase
      .from('llm_interactions')
      .select('raw_output')
      .eq('campaign_id', campaignId)
      .eq('call_type', 'campaign_planner')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (planError || !campaignPlan) {
      console.error('Error fetching campaign plan:', planError);
      throw new Error('Campaign plan not found');
    }

    console.log('Fetched campaign plan from Supabase');

    // Extract the plan data
    let planData = campaignPlan.raw_output;
    if (typeof planData === 'string') {
      planData = JSON.parse(planData);
    }

    // Add campaign name if not present
    if (!planData.campaign_name) {
      planData.campaign_name = planData.search_strategy_summary?.split('.')[0] || 'Campaign';
    }

    // Construct the prompt for DeepSeek
    const systemPrompt = `You are an expert influencer marketing strategist and project manager. Your task is to analyze the provided campaign plan and generate comprehensive deliverable requirements that will ensure campaign success.`;

    const humanPrompt = `
**Campaign Plan Details:**
${JSON.stringify(planData, null, 2)}

**Your Task:**
Based on this campaign plan, generate detailed deliverable requirements organized into multiple bullet points under the following categories. Each category should have 4-8 specific, actionable bullet points.

**Required Categories:**

1. **Content Creation Requirements**
2. **Technical Specifications**
3. **Timeline & Scheduling Requirements**
4. **Performance Metrics & KPIs**
5. **Legal & Compliance Requirements**
6. **Brand Guidelines & Messaging**
7. **Approval Process Requirements**
8. **Reporting & Analytics Requirements**
9. **Budget & Payment Terms**
10. **Quality Assurance Standards**

**Output Format:**
Provide your response as a valid JSON object with the following structure:
{
    "campaign_name": "extracted from input",
    "generated_deliverables": {
        "content_creation_requirements": ["bullet point 1", "bullet point 2", ...],
        "technical_specifications": ["bullet point 1", "bullet point 2", ...],
        "timeline_scheduling": ["bullet point 1", "bullet point 2", ...],
        "performance_metrics_kpis": ["bullet point 1", "bullet point 2", ...],
        "legal_compliance": ["bullet point 1", "bullet point 2", ...],
        "brand_guidelines_messaging": ["bullet point 1", "bullet point 2", ...],
        "approval_process": ["bullet point 1", "bullet point 2", ...],
        "reporting_analytics": ["bullet point 1", "bullet point 2", ...],
        "budget_payment_terms": ["bullet point 1", "bullet point 2", ...],
        "quality_assurance": ["bullet point 1", "bullet point 2", ...]
    },
    "metadata": {
        "generated_date": "${new Date().toISOString()}",
        "total_categories": 10,
        "model_used": "deepseek-chat",
        "source": "supabase_llm_interactions"
    }
}

Each bullet point should be specific, measurable, and actionable. Use professional language suitable for campaign briefs and contracts. Make sure to consider the campaign's target audience, platforms, and objectives.`;

    // Call DeepSeek API
    console.log('Calling DeepSeek API for content requirements generation');
    
    const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: humanPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4096,
        response_format: { type: "json_object" }
      }),
    });

    if (!deepseekResponse.ok) {
      throw new Error(`DeepSeek API error: ${deepseekResponse.status}`);
    }

    const deepseekData = await deepseekResponse.json();
    const generatedContent = deepseekData.choices[0].message.content;
    
    console.log('DeepSeek response received');

    // Parse the JSON response
    let deliverables;
    try {
      deliverables = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Error parsing DeepSeek response:', parseError);
      throw new Error('Invalid JSON response from AI');
    }

    // Log the interaction to the database
    const { error: logError } = await supabase
      .from('llm_interactions')
      .insert({
        user_id: user.id,
        campaign_id: campaignId,
        call_type: 'content_requirements_generation',
        input_messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: humanPrompt }
        ],
        raw_output: deliverables
      });

    if (logError) {
      console.error('Error logging interaction:', logError);
    }

    console.log('Content requirements generated and logged successfully');

    return new Response(JSON.stringify(deliverables), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-content-requirements function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});