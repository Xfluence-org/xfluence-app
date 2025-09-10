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
    for (const idx of indexes){
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
  for(let i = 0; i < maxAttempts; i++){
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
      await new Promise((resolve)=>setTimeout(resolve, sleepInterval));
    } catch (error) {
      console.error(`Task monitoring error (attempt ${i + 1}):`, error);
      if (i === maxAttempts - 1) throw error;
      await new Promise((resolve)=>setTimeout(resolve, sleepInterval));
    }
  }
  throw new Error("Task completion timeout");
}
serve(async (req)=>{
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
    const { videoUrl, contentPurpose, targetAudience, brandGuidelines, creativeApproach, platformGoals, fileName } = await req.json();
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
    // Generate viral analysis using user-provided strategy inputs
    const viralAnalysisPrompt =  `
    ROLE: You are an expert AI Viral Strategist for Instagram Reels. Your sole purpose is to analyze a video and provide a hyper-specific, tactical JSON report on modifications for maximum virality. Ignore all generic advice. Your output must be nothing but a valid JSON object.
    
    USER CONTEXT:
    - Content Purpose: "${contentPurpose}"
    - Brand Guidelines: "${brandGuidelines || 'Not specified'}"
    - Platform Goal: VIRAL GROWTH ON INSTAGRAM
    
    TASK: Analyze the provided video frame-by-frame and second-by-second. Your analysis must be formatted as a JSON object that matches the following TypeScript interface exactly. Return ONLY the raw JSON.
    
    interface ViralAnalysis {
      viralAudit: {
        hookEffectiveness: { score: number; description: string; details: string };
        scrollStoppingPower: { score: number; description: string; details: string };
        audioStrategy: { score: number; description: string; details: string };
      };
      retentionBreakdown: {
        pacing: { score: number; description: string; details: string };
        valueProposition: { score: number; description: string; details: string };
        midVideoHook: { score: number; description: string; details: string };
      };
      platformOptimization: {
        format: { score: number; description: string; details: string };
        onScreenText: { score: number; description: string; details: string };
        callToAction: { score: number; description: string; details: string };
      };
      strengths: Array<{ title: string; description: string; impact: string }>;
      modifications: Array<{ title: string; description: string; priority: "high" | "medium" | "low"; expectedImpact: string }>;
      viralScore: number;
      scoreBreakdown: { hookPotential: number; retentionOptimization: number; platformIntegration: number; trendAlignment: number };
      verdict: string;
      criticalAction: string;
      targetAudienceProfile: {
        inferredDemographics: { ageRange: string; genderLeaning: string; interests: string[] };
        contentPreferences: { style: string; pacing: string; tone: string };
        observedEngagementTriggers: string[];
        potentialAudienceConflicts: string[];
      };
      viralityEssentials: {
        overallScore: number;
        issues: number;
        categories: Array<{
          name: string;
          weight: number;
          criteria: Array<{
            name: string;
            passed: boolean;
            advice: string;
          }>;
        }>;
      };
    }
    
    ANALYSIS INSTRUCTIONS:
    1. DYNAMIC SCORING: Generate all scores based on your analysis of the provided video. Do not use hard-coded example numbers.
    2. SPECIFIC FEEDBACK: For every field, provide specific, actionable feedback based on what you observe in the video.
    3. TARGET AUDIENCE PROFILE: Based on the video's content, style, and messaging, infer who the actual target audience appears to be. Describe their demographics, content preferences, and what triggers their engagement.
    4. TRENDING REFERENCES: Suggest specific trending audio tracks, visual effects, and editing styles currently popular on Instagram Reels.
    5. CRITICAL ACTION: Identify the single most important change that would maximize viral potential.
    6. VIRALITY ESSENTIALS: Evaluate the video against the core pillars of virality. Calculate an overall score and count the number of failed criteria. Only include criteria that can be assessed from the video content itself.
    
    CORE ANALYSIS FRAMEWORK:
    - **Hook (0-3s):** Analyze the opening seconds for scroll-stopping potential. Suggest a stronger hook formula if needed.
    - **Audio:** Evaluate the audio track. Recommend a specific trending sound if the current one is not optimal.
    - **Pacing:** Analyze shot duration and editing rhythm. Recommend specific pacing improvements.
    - **Visuals:** Assess video quality, lighting, and composition.
    - **On-Screen Text:** Determine if key messages are clear for sound-off viewers. Suggest specific text to add.
    - **CTA:** Evaluate the call-to-action. Provide a stronger, conflict-driven alternative.
    - **Platform Optimization:** Check for correct format (9:16 vertical) and safe zone compliance.
    - **Audience Alignment:** Analyze who the video content would actually appeal to versus the stated target audience.
    
    Output nothing but the JSON object.
    `;
    console.log('Viral Analysis Prompt:', viralAnalysisPrompt);
    const summaryResponse = await fetch("https://api.twelvelabs.io/v1.3/summarize", {
      method: "POST",
      headers: {
        'x-api-key': twelveLabs_API,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        video_id: completedTask.video_id,
        type: "summary",
        prompt: viralAnalysisPrompt
      })
    });
    if (!summaryResponse.ok) {
      const errorText = await summaryResponse.text();
      throw new Error(`Summary generation failed: ${summaryResponse.status} - ${errorText}`);
    }
    const resSummary = await summaryResponse.json();
    const analysisText = resSummary.summary;
    console.log('Analysis result:', resSummary);
    // Parse viral analysis results from JSON response
    const parseViralAnalysis = (jsonText) => {
      try {
        // Clean the response text to extract JSON
        const cleanedText = jsonText.trim();
        
        // Try to find JSON object in the response
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON object found in response');
        }
        
        const viralAnalysisData = JSON.parse(jsonMatch[0]);
        
        // Validate and return the viral analysis structure
        return {
          viralAudit: viralAnalysisData.viralAudit || {
            hookEffectiveness: { score: 0, description: "", details: "" },
            scrollStoppingPower: { score: 0, description: "", details: "" },
            audioStrategy: { score: 0, description: "", details: "" }
          },
          retentionBreakdown: viralAnalysisData.retentionBreakdown || {
            pacing: { score: 0, description: "", details: "" },
            valueProposition: { score: 0, description: "", details: "" },
            midVideoHook: { score: 0, description: "", details: "" }
          },
          platformOptimization: viralAnalysisData.platformOptimization || {
            format: { score: 0, description: "", details: "" },
            onScreenText: { score: 0, description: "", details: "" },
            callToAction: { score: 0, description: "", details: "" }
          },
          strengths: viralAnalysisData.strengths || [],
          modifications: viralAnalysisData.modifications || [],
          viralScore: viralAnalysisData.viralScore || 0,
          scoreBreakdown: viralAnalysisData.scoreBreakdown || {
            hookPotential: 0,
            retentionOptimization: 0,
            platformIntegration: 0,
            trendAlignment: 0
          },
          verdict: viralAnalysisData.verdict || "Analysis failed",
          criticalAction: viralAnalysisData.criticalAction || "Review video content",
          viralityEssentials: viralAnalysisData.viralityEssentials || {
            overallScore: 0,
            issues: 0,
            categories: []
          },
          userStrategy: {
            contentPurpose,
            targetAudience,
            brandGuidelines,
            creativeApproach,
            platformGoals
          }
        };
      } catch (error) {
        console.error('Error parsing viral analysis JSON:', error);
        
        // Fallback to basic structure if JSON parsing fails
        return {
          viralAudit: {
            hookEffectiveness: { score: 0, description: "Analysis failed", details: "Unable to parse hook effectiveness" },
            scrollStoppingPower: { score: 0, description: "Analysis failed", details: "Unable to parse scroll stopping power" },
            audioStrategy: { score: 0, description: "Analysis failed", details: "Unable to parse audio strategy" }
          },
          retentionBreakdown: {
            pacing: { score: 0, description: "Analysis failed", details: "Unable to parse pacing" },
            valueProposition: { score: 0, description: "Analysis failed", details: "Unable to parse value proposition" },
            midVideoHook: { score: 0, description: "Analysis failed", details: "Unable to parse mid-video hook" }
          },
          platformOptimization: {
            format: { score: 0, description: "Analysis failed", details: "Unable to parse format optimization" },
            onScreenText: { score: 0, description: "Analysis failed", details: "Unable to parse on-screen text" },
            callToAction: { score: 0, description: "Analysis failed", details: "Unable to parse call to action" }
          },
          strengths: [],
          modifications: [],
          viralScore: 0,
          scoreBreakdown: {
            hookPotential: 0,
            retentionOptimization: 0,
            platformIntegration: 0,
            trendAlignment: 0
          },
          verdict: "Analysis failed",
          criticalAction: "Review video content",
          viralityEssentials: {
            overallScore: 0,
            issues: 0,
            categories: []
          },
          userStrategy: {
            contentPurpose,
            targetAudience,
            brandGuidelines,
            creativeApproach,
            platformGoals
          }
        };
      }
    };
    const parsedViralAnalysis = parseViralAnalysis(analysisText);
    // Save viral analysis to database
    const { data: savedAnalysis, error: saveError } = await supabase.from('content_analyses').insert({
      user_id: user.id,
      video_url: videoUrl,
      file_name: fileName,
      user_strategy: {
        contentPurpose,
        targetAudience,
        brandGuidelines,
        creativeApproach,
        platformGoals
      },
      analysis_result: parsedViralAnalysis,
      twelve_labs_task_id: twelveLabsTaskId,
      twelve_labs_video_id: completedTask.video_id
    }).select().single();
    if (saveError) {
      console.error('Error saving analysis:', saveError);
    // Don't fail the request, just log the error
    }
    // Log interaction for analytics
    await supabase.from('llm_interactions').insert({
      user_id: user.id,
      call_type: 'viral_content_analysis',
      input_messages: JSON.stringify({
        prompt: viralAnalysisPrompt,
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
        parsed_analysis: parsedViralAnalysis
      })
    });
    console.log('Viral analysis complete and saved');
    return new Response(JSON.stringify({
      success: true,
      taskId: twelveLabsTaskId,
      videoId: completedTask.video_id,
      indexId: indexId,
      analysis: parsedViralAnalysis,
      rawAnalysis: analysisText,
      savedAnalysisId: savedAnalysis?.id
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
console.log("🚀 Viral Video Analysis Server Running...");