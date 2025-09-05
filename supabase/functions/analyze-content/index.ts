import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

// ===== Function to get index ID by name =====
async function getIndexIdByName(indexName, apiKey) {
  try {
    const response = await fetch("https://api.twelvelabs.io/v1.3/indexes", {
      method: "GET",
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch indexes: ${response.status}`);
    }
    const data = await response.json();
    const indexes = data.data || [];
    for (const idx of indexes) {
      if ((idx.name || idx.index_name) === indexName) {
        return idx._id || idx.id;
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching indexes:", error);
    return null;
  }
}

// ===== Function to monitor task status =====
async function waitForTaskCompletion(taskId, apiKey) {
  const maxAttempts = 60; // 5 minutes max
  const sleepInterval = 5000; // 5 seconds
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`https://api.twelvelabs.io/v1.3/tasks/${taskId}`, {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`Task status check failed: ${response.status}`);
      }
      const task = await response.json();
      console.log(`  Status=${task.status}`);
      if (task.status === "ready" || task.status === "done") {
        return task;
      }
      if (task.status === "failed" || task.status === "error") {
        throw new Error(`Indexing failed with status ${task.status}`);
      }
      // Wait before next check
      await new Promise((resolve) => setTimeout(resolve, sleepInterval));
    } catch (error) {
      console.error(`Task monitoring error (attempt ${i + 1}):`, error);
      if (i === maxAttempts - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, sleepInterval));
    }
  }
  throw new Error("Task completion timeout");
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const twelveLabs_API = Deno.env.get("TWELVE_LABS_API_KEY");

    if (!twelveLabs_API || !supabaseUrl || !supabaseKey) {
      throw new Error("Missing required environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Invalid or expired token');
    }

    // Parse request body - now expects user-provided strategy inputs
    const { 
      videoUrl, 
      contentPurpose, 
      targetAudience, 
      brandGuidelines, 
      creativeApproach,
      platformGoals,
      fileName 
    } = await req.json();

    console.log('Standalone video analysis request:', {
      videoUrl,
      contentPurpose,
      targetAudience,
      brandGuidelines,
      creativeApproach,
      platformGoals,
      fileName
    });

    // Validate required inputs
    if (!videoUrl || !contentPurpose || !targetAudience) {
      throw new Error('Missing required fields: videoUrl, contentPurpose, and targetAudience are required');
    }

    // Set your desired index name
    const desiredIndexName = "my-second-index";

    // Automatically fetch the index ID by its name
    const indexId = await getIndexIdByName(desiredIndexName, twelveLabs_API);
    if (!indexId) {
      throw new Error(`No index found with name '${desiredIndexName}'.`);
    }

    console.log(`Using existing index: ${desiredIndexName} (id=${indexId})`);

    // Upload video to the fetched index using FormData
    const formData = new FormData();
    formData.append('index_id', indexId);
    formData.append('video_url', videoUrl);
    formData.append('language', 'en');

    const taskResponse = await fetch("https://api.twelvelabs.io/v1.3/tasks", {
      method: "POST",
      headers: {
        'x-api-key': twelveLabs_API
      },
      body: formData
    });

    if (!taskResponse.ok) {
      const errorText = await taskResponse.text();
      throw new Error(`Task creation failed: ${taskResponse.status} - ${errorText}`);
    }

    const task = await taskResponse.json();
    const twelveLabsTaskId = task._id;
    console.log(`Task id=${twelveLabsTaskId}, Video id=${task.video_id}`);

    // Monitor indexing
    console.log("Monitoring task completion...");
    const completedTask = await waitForTaskCompletion(twelveLabsTaskId, twelveLabs_API);
    if (completedTask.status !== "ready") {
      throw new Error(`Indexing failed with status ${completedTask.status}`);
    }

    console.log(`The unique identifier of your video is ${completedTask.video_id}.`);

    // Generate analysis using user-provided strategy inputs
    const analysisPrompt = `AI Content Analysis - Comprehensive Video Evaluation

Analyze this video content against the user-defined strategy and goals:

USER-PROVIDED STRATEGY:
1. CONTENT PURPOSE: "${contentPurpose}"
2. TARGET AUDIENCE: "${targetAudience}"
3. BRAND GUIDELINES: "${brandGuidelines || 'Not specified'}"
4. CREATIVE APPROACH: "${creativeApproach || 'Not specified'}"
5. PLATFORM GOALS: "${platformGoals || 'General engagement'}"

Provide a detailed analysis following EXACTLY this format:

Brand Alignment [X]% 
- Assess how well the video aligns with the stated brand guidelines and creative approach
- Rate based on consistency with user's brand vision

Visual Quality [X]%
- Evaluate technical execution (resolution, stability, lighting)
- Assess professional production standards
- Consider platform optimization

Content Relevance [X]%
- Measure alignment with stated content purpose
- Evaluate target audience appropriateness
- Assess message clarity and effectiveness

Engagement Potential [X]%
- Predict performance based on platform goals
- Evaluate hook effectiveness and retention factors
- Assess call-to-action clarity (if applicable)

Strengths
- [Strength 1] - [Specific example and why it works for the target audience]
- [Strength 2] - [Specific example and alignment with content purpose]
- [Strength 3] - [Specific example and technical/creative merit]

AI Suggestions
- [Suggestion 1] - [Specific improvement with expected impact]
- [Suggestion 2] - [Strategic adjustment based on user's goals]
- [Suggestion 3] - [Technical or creative enhancement]

Overall Score: [X]/100

Scoring Breakdown:
- Brand Alignment: [X]/25 points
- Visual Quality: [X]/25 points  
- Content Relevance: [X]/25 points
- Engagement Potential: [X]/25 points

Key Insights:
- How well does this video serve the stated content purpose?
- Is the target audience likely to engage with this content?
- What specific improvements would maximize impact for the user's goals?

Provide honest, constructive feedback that helps the user improve their content strategy.`;

    console.log('Analysis Prompt:', analysisPrompt);

    const summaryResponse = await fetch("https://api.twelvelabs.io/v1.3/summarize", {
      method: "POST",
      headers: {
        'x-api-key': twelveLabs_API,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        video_id: completedTask.video_id,
        type: "summary",
        prompt: analysisPrompt
      })
    });

    if (!summaryResponse.ok) {
      const errorText = await summaryResponse.text();
      throw new Error(`Summary generation failed: ${summaryResponse.status} - ${errorText}`);
    }

    const resSummary = await summaryResponse.json();
    const analysisText = resSummary.summary;
    console.log('Analysis result:', resSummary);

    // Parse analysis results
    const parseAnalysis = (text) => {
      const scores = {};
      const strengths = [];
      const suggestions = [];

      const brandMatch = text.match(/Brand Alignment\s*\[?(\d+)\]?%/i);
      const visualMatch = text.match(/Visual Quality\s*\[?(\d+)\]?%/i);
      const relevanceMatch = text.match(/Content Relevance\s*\[?(\d+)\]?%/i);
      const engagementMatch = text.match(/Engagement Potential\s*\[?(\d+)\]?%/i);

      scores.brand_alignment = brandMatch ? parseInt(brandMatch[1]) : 0;
      scores.visual_quality = visualMatch ? parseInt(visualMatch[1]) : 0;
      scores.content_relevance = relevanceMatch ? parseInt(relevanceMatch[1]) : 0;
      scores.engagement_potential = engagementMatch ? parseInt(engagementMatch[1]) : 0;

      const overallMatch = text.match(/Overall Score.*?(\d+)\/100/i);
      const overallScore = overallMatch ? parseInt(overallMatch[1]) : 
        Math.round((scores.brand_alignment + scores.visual_quality + scores.content_relevance + scores.engagement_potential) / 4);

      // Extract strengths
      const strengthsSection = text.match(/Strengths[\s\S]*?(?=AI Suggestions|Overall|$)/i);
      if (strengthsSection) {
        const matches = strengthsSection[0].match(/[-•]\s*([^\n]+)/g);
        if (matches) {
          matches.forEach((match) => {
            const strength = match.replace(/^[-•]\s*/, '').trim();
            if (strength && !strength.toLowerCase().includes('strengths')) {
              strengths.push(strength);
            }
          });
        }
      }

      // Extract suggestions
      const suggestionsSection = text.match(/AI Suggestions[\s\S]*?(?=Overall|Key Insights|$)/i);
      if (suggestionsSection) {
        const matches = suggestionsSection[0].match(/[-•]\s*([^\n]+)/g);
        if (matches) {
          matches.forEach((match) => {
            const suggestion = match.replace(/^[-•]\s*/, '').trim();
            if (suggestion && !suggestion.toLowerCase().includes('suggestions')) {
              suggestions.push(suggestion);
            }
          });
        }
      }

      const recommendation = overallScore >= 85 ? 'approved' : overallScore >= 70 ? 'revision' : 'rejected';

      return {
        overallScore,
        scores,
        strengths: strengths.length > 0 ? strengths : [
          "Professional video quality",
          "Clear visual presentation",
          "Good content structure"
        ],
        suggestions: suggestions.length > 0 ? suggestions : [
          "Consider optimizing for better engagement"
        ],
        recommendation,
        contentType: 'video',
        userStrategy: {
          contentPurpose,
          targetAudience,
          brandGuidelines,
          creativeApproach,
          platformGoals
        }
      };
    };

    const parsedAnalysis = parseAnalysis(analysisText);

    // Log interaction for analytics
    await supabase.from('llm_interactions').insert({
      user_id: user.id,
      call_type: 'standalone_content_analysis',
      input_messages: JSON.stringify({
        prompt: analysisPrompt,
        video_url: videoUrl,
        user_strategy: {
          contentPurpose,
          targetAudience,
          brandGuidelines,
          creativeApproach,
          platformGoals
        },
        twelve_labs_task_id: twelveLabsTaskId,
        twelve_labs_video_id: completedTask.video_id
      }),
      raw_output: JSON.stringify({
        raw_analysis: analysisText,
        parsed_analysis: parsedAnalysis
      })
    });

    console.log('Standalone analysis complete');

    return new Response(JSON.stringify({
      success: true,
      taskId: twelveLabsTaskId,
      videoId: completedTask.video_id,
      indexId: indexId,
      analysis: parsedAnalysis,
      rawAnalysis: analysisText
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});

console.log("🚀 Standalone Video Analysis Server Running...");