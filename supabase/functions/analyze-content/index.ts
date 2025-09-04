import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Analyzing file:', file.name, 'Type:', file.type, 'Size:', file.size);

    // Simulate AI analysis with realistic results
    const analysisResults = {
      overall_score: Math.floor(Math.random() * 30) + 70, // 70-100
      key_insights: [
        "Strong visual composition with good color balance",
        "Engaging content that aligns with current trends",
        "High potential for audience engagement",
        "Professional quality and execution"
      ],
      recommendations: [
        "Consider adding more interactive elements",
        "Optimize posting time for maximum reach",
        "Include trending hashtags for better discovery",
        "Add a clear call-to-action"
      ],
      metrics: {
        engagement_potential: Math.floor(Math.random() * 20) + 80,
        reach_score: Math.floor(Math.random() * 25) + 75,
        trend_alignment: Math.floor(Math.random() * 15) + 85,
        quality_score: Math.floor(Math.random() * 10) + 90
      },
      analyzed_at: new Date().toISOString(),
      file_name: file.name,
      file_type: file.type
    };

    return new Response(JSON.stringify(analysisResults), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});