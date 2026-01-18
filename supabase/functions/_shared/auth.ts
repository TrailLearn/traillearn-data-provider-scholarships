import { createClient, User } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
