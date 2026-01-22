import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { corsHeaders } from '../_shared/auth.ts'

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
      headers: { ...corsHeaders, 'Content-Type': 'application/problem+json' },
    }
  )
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // ... existing logic ...

    if (error) {
        if (error.code === 'PGRST116') { // JSON code for 0 rows
            return errorResponse(404, 'Not Found', 'Scholarship not found')
        }
        console.error('DB Error:', error)
        return errorResponse(500, 'Internal Server Error', 'Database query failed')
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    console.error('Unexpected Error:', err)
    return errorResponse(500, 'Internal Server Error', 'An unexpected error occurred')
  }
})
