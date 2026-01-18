import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
      headers: { 'Content-Type': 'application/problem+json' },
    }
  )
}

Deno.serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse ID from URL path or Query param
    // Support /functions/v1/scholarship-detail/UUID or ?id=UUID
    const url = new URL(req.url)
    let id = url.searchParams.get('id')
    
    if (!id) {
        // Try to extract from path
        const pathParts = url.pathname.split('/')
        const lastPart = pathParts[pathParts.length - 1]
        // Check if last part is a UUID-like string
        if (lastPart && lastPart.length > 20) {
            id = lastPart
        }
    }

    if (!id) {
        return errorResponse(400, 'Bad Request', 'Missing scholarship ID')
    }

    // UUID Validation (Simple regex)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
        return errorResponse(400, 'Bad Request', 'Invalid UUID format')
    }

    // Query DB
    const { data, error } = await supabase
      .from('scholarships')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
        if (error.code === 'PGRST116') { // JSON code for 0 rows
            return errorResponse(404, 'Not Found', 'Scholarship not found')
        }
        console.error('DB Error:', error)
        return errorResponse(500, 'Internal Server Error', 'Database query failed')
    }

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    console.error('Unexpected Error:', err)
    return errorResponse(500, 'Internal Server Error', 'An unexpected error occurred')
  }
})
