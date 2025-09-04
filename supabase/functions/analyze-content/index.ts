import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const { fileName, fileType, fileSize } = await req.json()
    
    // Mock analysis based on file type and characteristics
    let score = Math.floor(Math.random() * 30) + 70; // 70-100 score
    let insights = [];
    let recommendations = [];
    
    // Analyze based on file type
    if (fileType.startsWith('image/')) {
      insights = [
        "High visual appeal with good color balance",
        "Composition follows rule of thirds effectively",
        "Good lighting and contrast ratios"
      ];
      recommendations = [
        "Consider adding more engaging captions",
        "Optimize posting time for better reach",
        "Add relevant hashtags for discovery"
      ];
    } else if (fileType.startsWith('video/')) {
      score += 5; // Videos typically score higher
      insights = [
        "Video content shows strong engagement potential",
        "Good pacing and visual storytelling",
        "Clear audio quality detected"
      ];
      recommendations = [
        "Add captions for accessibility",
        "Consider creating shorter clips for social media",
        "Include call-to-action in first 3 seconds"
      ];
    } else if (fileType.includes('text') || fileName.endsWith('.txt')) {
      insights = [
        "Content shows good keyword density",
        "Readable tone and structure",
        "Appropriate length for target audience"
      ];
      recommendations = [
        "Add more emotional hooks in opening",
        "Include more specific examples",
        "Consider breaking into shorter paragraphs"
      ];
    } else {
      insights = [
        "File format suitable for content analysis",
        "Good file size for web distribution",
        "Content structure appears well-organized"
      ];
      recommendations = [
        "Consider format optimization for better performance",
        "Add metadata for better discoverability",
        "Test across different platforms"
      ];
    }

    // Adjust score based on file size (optimal range)
    if (fileSize > 10 * 1024 * 1024) { // > 10MB
      score -= 5;
      recommendations.push("Consider compressing file for faster loading");
    }

    const analysisResult = {
      score,
      insights,
      recommendations,
      analysisDate: new Date().toISOString(),
      fileName
    };

    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in analyze-content function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})