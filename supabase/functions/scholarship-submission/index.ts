import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { validateUser } from '../_shared/auth.ts'
import { validateSubmission } from './validation.ts'

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
  // Only allow POST
  if (req.method !== 'POST') {
    return errorResponse(405, 'Method Not Allowed', 'Only POST is supported')
  }

  try {
    // 1. Auth Validation
    const user = await validateUser(req)

    // 2. Parse Body
    const body = await req.json()
    
    // 3. Input Validation
    const validationErrors = validateSubmission(body)
    if (validationErrors.length > 0) {
        return errorResponse(400, 'Bad Request', validationErrors.join(', '))
    }

    const { name, source_url, amount_min, amount_max, deadline_at, status, ...rest } = body

    // 4. Status Determination (Admin Override)
    let finalStatus = 'SUBMITTED'
    const isAdmin = user.app_metadata?.role === 'admin' || user.app_metadata?.role === 'service_role'
    
    if (isAdmin && status) {
        const allowedStatuses = ['DRAFT', 'SUBMITTED', 'VERIFIED', 'DEPRECATED', 'ARCHIVED']
        if (allowedStatuses.includes(status)) {
            finalStatus = status
        }
    }

    // 5. Prepare Payload
    // Store metadata like submitted_by in the JSONB 'data' column
    const dataPayload = {
        ...rest,
        meta: {
            submitted_by: user.id,
            submitted_at: new Date().toISOString(),
            admin_override: finalStatus !== 'SUBMITTED'
        }
    }

    // 6. DB Insertion (Using Service Role to enforce/allow status)
    const adminSupabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data, error } = await adminSupabase
        .from('scholarships')
        .insert({
            name,
            source_url,
            amount_min,
            amount_max,
            deadline_at,
            status: finalStatus,
            data: dataPayload
        })
        .select('id, status')
        .single()

    if (error) {
        console.error('DB Insert Error:', error)
        if (error.code === '23505') { // Unique violation
            return errorResponse(409, 'Conflict', 'This source URL is already registered')
        }
        return errorResponse(500, 'Internal Server Error', 'Failed to create submission')
    }

    // 5. Success Response
    return new Response(JSON.stringify(data), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
    })

  } catch (err) {
    if (err.message === 'Missing Authorization header' || err.message === 'Invalid Token') {
        return errorResponse(401, 'Unauthorized', err.message)
    }
    console.error('Unexpected Error:', err)
    return errorResponse(500, 'Internal Server Error', 'An unexpected error occurred')
  }
})
