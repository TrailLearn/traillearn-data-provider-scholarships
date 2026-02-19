// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/auth.ts'

// RFC 7807 Error Helper
const errorResponse = (status: number, title: string, detail: string) => {
  return new Response(
    JSON.stringify({
      type: `https://api.traillearn.com/errors/${status}`,
      title,
      status,
      detail,
    }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Init Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 2. Parse Query Params
    const url = new URL(req.url)
    const MAX_LIMIT = 100
    let limit = parseInt(url.searchParams.get('limit') ?? '20')
    let offset = parseInt(url.searchParams.get('offset') ?? '0')
    
    const country = url.searchParams.get('country')
    const level = url.searchParams.get('level')
    const minHealthScoreParam = url.searchParams.get('min_health_score')

    // Validation
    if (isNaN(limit) || limit < 1) limit = 20
    if (limit > MAX_LIMIT) limit = MAX_LIMIT
    if (isNaN(offset) || offset < 0) offset = 0

    let minHealthScore = 0
    if (minHealthScoreParam) {
      minHealthScore = parseInt(minHealthScoreParam)
      if (isNaN(minHealthScore) || minHealthScore < 0 || minHealthScore > 100) {
        return errorResponse(400, 'Invalid Parameter', 'min_health_score must be an integer between 0 and 100')
      }
    }

    // 3. Build Query
    let query = supabase
      .from('scholarships')
      .select('*', { count: 'exact' })
      .eq('status', 'VERIFIED')
      .gte('health_score', minHealthScore)

    // Advanced Filters
    if (country) {
      // Filter inside JSONB: data -> eligibility -> destination_country
      query = query.filter('data->eligibility->destination_country', 'eq', country)
    }

    if (level) {
      // Filter inside JSONB: data -> eligibility -> level (supports string or array containing the value)
      // If it's an array, we use 'cs' (contains). If it's a string, 'eq'. 
      // To be safe and support both, we can try to use a more flexible filter or check the structure.
      // For V1, we'll assume it might be a single value or an array.
      // Supabase filter for "JSONB contains" is '.contains'
      query = query.filter('data->eligibility->level', 'cs', JSON.stringify([level]))
    }

    query = query.range(offset, offset + limit - 1)

    // 4. Execute Query
    const { data, error, count } = await query

    if (error) {
      console.error('DB Error:', error)
      return errorResponse(500, 'Internal Server Error', 'Database query failed')
    }

    // 5. Construct Response with Pagination Metadata
    const headers = new Headers(corsHeaders)
    headers.set('Content-Type', 'application/json')
    headers.set('Content-Range', `${offset}-${offset + (data?.length ?? 0) - 1}/${count}`)
    headers.set('X-Total-Count', count?.toString() ?? '0')

    return new Response(JSON.stringify(data), {
      headers,
      status: 200,
    })

  } catch (err) {
    console.error('Unexpected Error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', message: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
