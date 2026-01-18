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
  try {
    const data = {
        countries: COUNTRIES,
        levels: LEVELS,
        version: "v1"
    };

    return new Response(JSON.stringify(data), {
      headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600' // 1 hour cache
      },
      status: 200,
    })

  } catch (err) {
    console.error('Unexpected Error:', err)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
    });
  }
})
