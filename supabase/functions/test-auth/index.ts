import { validateUser } from '../_shared/auth.ts'

Deno.serve(async (req) => {
  try {
    const user = await validateUser(req)

    return new Response(
      JSON.stringify({ 
        message: `Hello ${user.email}!`,
        user_id: user.id,
        role: user.role
      }),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    )
  }
})
