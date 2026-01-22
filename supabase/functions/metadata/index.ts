import { corsHeaders } from '../_shared/auth.ts'

// Reference Data for V1
const COUNTRIES = [
// ... same ...
];

const LEVELS = [
// ... same ...
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
