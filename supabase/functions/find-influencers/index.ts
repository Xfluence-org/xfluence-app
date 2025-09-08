import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

interface InfluencerSearchParams {
  city: string;
  category: string;
  minFollowers: string; // e.g., "10k", "100k", "1M"
  maxFollowers: string;
  numberOfInfluencers: number; // Always 5
}

interface TavilySearchResult {
  title: string;
  content: string;
  url: string;
}

interface TavilyResponse {
  results: TavilySearchResult[];
}

interface ExtractedInfluencer {
  fullName: string;
  username: string;
  bio?: string;
  followerCount?: string;
  category?: string;
  location?: string;
}

interface SearchResponse {
  success: boolean;
  influencers: ExtractedInfluencer[];
  totalFound: number;
  searchParams: InfluencerSearchParams;
  searchTime: number;
  rawResearch?: string; // For debugging
}

// Helper function to call Tavily API
async function searchWithTavily(query: string): Promise<TavilyResponse> {
  const tavilyApiKey = Deno.env.get('TAVILY_API_KEY');
  if (!tavilyApiKey) {
    throw new Error('TAVILY_API_KEY environment variable is required');
  }

  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: tavilyApiKey,
      query: query,
      search_depth: 'advanced',
      max_results: 10
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Tavily API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// Helper function to extract influencers using DeepSeek
async function extractInfluencersWithLLM(rawContext: string, searchParams: InfluencerSearchParams): Promise<ExtractedInfluencer[]> {
  const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');
  if (!deepseekApiKey) {
    throw new Error('DEEPSEEK_API_KEY environment variable is required');
  }

  const extractionPrompt = `You are an expert data extractor. Your task is to analyze the following text from web search results about Instagram influencers and extract ONLY the names and Instagram usernames of the influencers mentioned.

**Instructions:**
1. Carefully read the text below, which is compiled from multiple online articles and lists.
2. Extract every mention of Instagram influencer from ${searchParams.city} in the ${searchParams.category} category.
3. For each influencer you find, provide:
   - Their full name (if available)
   - Their Instagram username (handle, e.g., @username). This is the most important piece of information.
   - Brief bio or description (if mentioned)
   - Follower count (if mentioned)
4. Remove any duplicates. If the same influencer is mentioned multiple times, list them only once.
5. Focus on influencers with follower counts between ${searchParams.minFollowers} and ${searchParams.maxFollowers}.
6. Return the data as a JSON array with objects containing: fullName, username, bio, followerCount, category, location

**Text to Analyze:**
${rawContext}

**Your Output (JSON array only):**`;

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${deepseekApiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful and precise data extraction assistant. Always return valid JSON.'
        },
        {
          role: 'user',
          content: extractionPrompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.1
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  try {
    // Clean the content by removing markdown code blocks
    let cleanContent = content.trim();
    
    // Remove markdown code block markers
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Try to parse the cleaned JSON response
    const parsed = JSON.parse(cleanContent);
    return Array.isArray(parsed) ? parsed : [];
  } catch (parseError) {
    console.error('Failed to parse LLM response as JSON:', content);
    // Fallback: try to extract JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        console.error('Failed to extract JSON from response');
      }
    }
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const startTime = Date.now();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
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

    console.log('🔍 Step 1: Researching with Tavily...');
    console.log('Authenticated user:', user.id);

    // Parse request body
    const searchParams: InfluencerSearchParams = await req.json();
    
    console.log('Influencer search request:', {
      userId: user.id,
      searchParams
    });

    // Validate required parameters
    if (!searchParams.city || !searchParams.category || !searchParams.minFollowers || !searchParams.maxFollowers) {
      throw new Error('Missing required parameters: city, category, minFollowers, maxFollowers');
    }

    // Lock numberOfInfluencers to 5
    searchParams.numberOfInfluencers = 5;

    // Step 1: Research with Tavily
    const searchQuery = `Find ${searchParams.city} ${searchParams.category} influencers on Instagram with between ${searchParams.minFollowers} and ${searchParams.maxFollowers} followers.`;
    
    console.log('Search query:', searchQuery);
    
    const researchResults = await searchWithTavily(searchQuery);
    
    if (!researchResults.results || researchResults.results.length === 0) {
      throw new Error('No results found from Tavily search');
    }

    console.log(`✅ Gathered ${researchResults.results.length} search results.`);

    // Combine all content from search results
    let rawContext = "";
    for (const res of researchResults.results) {
      rawContext += `### Source: ${res.title} ###\n${res.content}\n\n`;
    }

    console.log('🤖 Step 2: Sending data to LLM for analysis and extraction...');

    // Step 2: Extract influencers using LLM
    const extractedInfluencers = await extractInfluencersWithLLM(rawContext, searchParams);
    
    const searchTime = Date.now() - startTime;
    
    console.log(`🎯 Step 3: Extraction complete - found ${extractedInfluencers.length} influencers`);
    
    const response: SearchResponse = {
      success: true,
      influencers: extractedInfluencers,
      totalFound: extractedInfluencers.length,
      searchParams,
      searchTime,
      rawResearch: rawContext.substring(0, 1000) + '...' // First 1000 chars for debugging
    };

    // Log the search for analytics
    try {
      await supabase.from('influencer_searches').insert({
        user_id: user.id,
        search_params: searchParams,
        results_count: extractedInfluencers.length,
        search_time_ms: searchTime
      });
    } catch (error) {
      console.error('Error logging search:', error);
      // Don't fail the request if logging fails
    }

    // Log interaction for analytics
    try {
      await supabase.from('llm_interactions').insert({
        user_id: user.id,
        call_type: 'influencer_discovery',
        input_messages: JSON.stringify({
          search_params: searchParams,
          search_query: searchQuery
        }),
        raw_output: JSON.stringify({
          results_count: extractedInfluencers.length,
          search_time_ms: searchTime,
          tavily_results: researchResults.results.length
        })
      });
    } catch (error) {
      console.error('Error logging interaction:', error);
      // Don't fail the request if logging fails
    }

    console.log(`Influencer discovery complete: ${extractedInfluencers.length} results in ${searchTime}ms`);

    return new Response(JSON.stringify(response), {
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
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});

console.log("🔍 Real Influencer Discovery API Server Running...");