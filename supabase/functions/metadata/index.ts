import { corsHeaders } from '../_shared/auth.ts'

// Reference Data for V1
const COUNTRIES = [
    "France",
    "USA",
    "United Kingdom",
    "Canada",
    "Germany",
    "Australia",
    "Japan",
    "China",
    "Global"
];

const LEVELS = [
    "High School",
    "Bachelor",
    "Master",
    "PhD",
    "Post-Doc",
    "Bootcamp",
    "Vocational Training"
];

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const data = {
        countries: COUNTRIES,
        levels: LEVELS,
        version: "v1"
    };

    return new Response(JSON.stringify(data), {
      headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600' // 1 hour cache
      },
      status: 200,
    })

  } catch (err) {
    console.error('Unexpected Error:', err)
    return new Response(
      JSON.stringify({ error: "Internal Server Error", message: err.message }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})