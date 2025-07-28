import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { handle, userId } = await req.json()
    
    console.log('Fetching Instagram profile for handle:', handle)
    
    if (!handle) {
      return new Response(
        JSON.stringify({ error: 'Instagram handle is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const cleanHandle = handle.replace('@', '').trim().toLowerCase()
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if account already exists (check within last 24 hours for freshness)
    const { data: existingAccount } = await supabase
      .from('instagram_accounts')
      .select('*')
      .eq('username', cleanHandle)
      .gte('last_synced_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .single()

    if (existingAccount) {
      console.log(`Returning cached Instagram data for ${cleanHandle}`)
      return new Response(
        JSON.stringify({ success: true, data: existingAccount, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch from Instagram API
    const rapidApiKey = Deno.env.get('RAPIDAPI_KEY')
    console.log('RAPIDAPI_KEY available:', !!rapidApiKey)
    if (!rapidApiKey) {
      console.error('RAPIDAPI_KEY environment variable not set')
      throw new Error('RAPIDAPI_KEY not configured')
    }

    console.log(`Fetching fresh Instagram data for ${cleanHandle}`)
    
    const apiResponse = await fetch(
      `https://instagram-looter2.p.rapidapi.com/search?query=${encodeURIComponent(cleanHandle)}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': rapidApiKey,
          'X-RapidAPI-Host': 'instagram-looter2.p.rapidapi.com',
        }
      }
    )

    if (!apiResponse.ok) {
      throw new Error(`Instagram API request failed: ${apiResponse.status}`)
    }

    const apiData = await apiResponse.json()
    
    if (!apiData.data?.user) {
      throw new Error('Instagram profile not found')
    }

    const userProfile = apiData.data.user
    
    // Prepare data for instagram_accounts table
    const accountData = {
      user_id: userId || null,
      username: cleanHandle,
      instagram_user_id: userProfile.pk || cleanHandle,
      followers_count: userProfile.follower_count || 0,
      following_count: userProfile.following_count || 0,
      media_count: userProfile.media_count || 0,
      engagement_rate: userProfile.engagement_rate || null,
      reach: userProfile.reach || null,
      impressions: userProfile.impressions || null,
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Upsert the data
    const { data: savedAccount, error: dbError } = await supabase
      .from('instagram_accounts')
      .upsert(accountData, { onConflict: 'username' })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error(`Database error: ${dbError.message}`)
    }

    console.log(`Successfully saved Instagram profile for ${cleanHandle}`)

    return new Response(
      JSON.stringify({ success: true, data: savedAccount, cached: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to fetch Instagram profile',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})