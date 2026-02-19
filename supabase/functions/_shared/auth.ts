import { createClient, User } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

// Default CORS headers for public API
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Change to specific domain in production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
}

export async function validateUser(req: Request): Promise<User> {
  const authHeader = req.headers.get('Authorization')
  
  if (!authHeader) {
    throw new Error('Missing Authorization header')
  }

  // Create client with the user's JWT
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  )

  // Verify token via Supabase Auth
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Invalid Token')
  }

  return user
}
