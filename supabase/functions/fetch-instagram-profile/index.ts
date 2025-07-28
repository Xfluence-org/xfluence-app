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
    console.log('=== FETCH INSTAGRAM PROFILE FUNCTION START ===')
    console.log('Request method:', req.method)
    console.log('Request headers:', Object.fromEntries(req.headers.entries()))
    
    const body = await req.json()
    console.log('Request body:', body)
    
    const { handle, userId } = body
    
    console.log('Fetching Instagram profile for handle:', handle, 'userId:', userId)
    
    if (!handle) {
      console.error('No handle provided')
      return new Response(
        JSON.stringify({ success: false, error: 'Instagram handle is required' }),
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
    console.log('Environment variables available:', Object.keys(Deno.env.toObject()))
    
    if (!rapidApiKey) {
      console.error('RAPIDAPI_KEY environment variable not set')
      return new Response(
        JSON.stringify({ success: false, error: 'RAPIDAPI_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Fetching fresh Instagram data for ${cleanHandle}`)
    
    const apiUrl = `https://instagram-looter2.p.rapidapi.com/search?query=${encodeURIComponent(cleanHandle)}`
    console.log('API URL:', apiUrl)
    
    const apiResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': rapidApiKey,
        'X-RapidAPI-Host': 'instagram-looter2.p.rapidapi.com',
      }
    })
    
    console.log('API Response status:', apiResponse.status)
    console.log('API Response headers:', Object.fromEntries(apiResponse.headers.entries()))

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text()
      console.error('API Response error:', errorText)
      return new Response(
        JSON.stringify({ success: false, error: `Instagram API request failed: ${apiResponse.status} - ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const apiData = await apiResponse.json()
    console.log('API Response data:', JSON.stringify(apiData, null, 2))
    
    if (!apiData.data?.user) {
      console.error('No user data found in API response')
      return new Response(
        JSON.stringify({ success: false, error: 'Instagram profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
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
    console.error('=== FUNCTION ERROR ===')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('=== END ERROR ===')
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to fetch Instagram profile'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})