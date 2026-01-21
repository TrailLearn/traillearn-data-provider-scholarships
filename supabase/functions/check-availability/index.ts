import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const USER_AGENT = "TrailLearn-Bot/1.0 (+https://traillearn.com/bot)"
const CONCURRENCY_LIMIT = 5
const MAX_CONTENT_SIZE = 1024 * 1024; // 1MB limit for hash

async function computeHash(text: string): Promise<string> {
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// SSRF Protection: Validate URL
function isSafeUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    // Block local/private loopbacks
    const blocked = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '169.254.169.254'];
    if (blocked.includes(url.hostname)) return false;
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    
    // Block Private IP ranges (basic check)
    // 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
    const hostname = url.hostname;
    if (hostname.startsWith('10.')) return false;
    if (hostname.startsWith('192.168.')) return false;
    if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)) return false;
    
    return true;
  } catch {
    return false;
  }
}

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: scholarships, error: fetchError } = await supabaseClient
      .from('scholarships')
      .select('id, source_url, last_content_hash, last_content_length')
      .neq('status', 'ARCHIVED')

    if (fetchError) throw fetchError

    console.log(`Checking ${scholarships.length} scholarships...`)

    const results = []
    const updates = [] 

    for (let i = 0; i < scholarships.length; i += CONCURRENCY_LIMIT) {
      const batch = scholarships.slice(i, i + CONCURRENCY_LIMIT)
      const batchPromises = batch.map(async (s) => {
        const start = Date.now()
        let statusCode: number | null = null
        let errorMessage: string | null = null
        let newHash: string | null = null
        let newLen: number | null = null
        let significantChange = false

        try {
          if (!isSafeUrl(s.source_url)) {
              throw new Error("Unsafe URL blocked (SSRF Protection)");
          }

          const response = await fetch(s.source_url, {
            method: 'GET',
            headers: { 'User-Agent': USER_AGENT },
            redirect: 'follow',
          })
          statusCode = response.status
          
          if (response.ok) {
            // Memory Safety: Limit text reading size
            // Note: response.text() reads whole body. Ideally we stream, but for V1 limitation is OK.
            // If content-length header > MAX, abort?
            const size = Number(response.headers.get('content-length'));
            if (size && size > MAX_CONTENT_SIZE) {
                 throw new Error(`Content too large (${size} bytes)`);
            }

            let text = await response.text();
            if (text.length > MAX_CONTENT_SIZE) {
                text = text.substring(0, MAX_CONTENT_SIZE); // Truncate for hashing if no header
            }

            // Aggressive Sanitization
            // Remove scripts, styles, comments, and HTML tags to get pure text content
            const cleanText = text
                .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
                .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
                .replace(/<!--[\s\S]*?-->/g, "")
                .replace(/<[^>]+>/g, " ") // Remove all HTML tags
                .replace(/\s+/g, " ") // Normalize whitespace
                .trim();

            newLen = cleanText.length
            newHash = await computeHash(cleanText)

            if (s.last_content_hash && s.last_content_hash !== newHash) {
                const prevLen = s.last_content_length || newLen
                const diff = Math.abs(newLen - prevLen) / (prevLen || 1)
                
                if (diff > 0.10) { 
                    significantChange = true
                    console.log(`Change detected ${s.id}: ${Math.round(diff*100)}%`)
                }
            }
          }

        } catch (e) {
          errorMessage = e.message
          console.error(`Error ${s.source_url}:`, e.message)
        } finally {
          const latency = Date.now() - start
          
          if (newHash && (s.last_content_hash !== newHash)) {
              updates.push({
                  id: s.id,
                  last_content_hash: newHash,
                  last_content_length: newLen,
                  status: significantChange ? 'REVIEW_NEEDED' : undefined 
              })
          }

          return {
            scholarship_id: s.id,
            status_code: statusCode,
            latency_ms: latency,
            error_message: errorMessage,
            checked_at: new Date().toISOString()
          }
        }
      })
      
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
    }

    const { error: insertError } = await supabaseClient.from('url_checks').insert(results)
    if (insertError) throw insertError

    for (const res of results) {
       const updateData = updates.find(u => u.id === res.scholarship_id) || {}
       await supabaseClient
        .from('scholarships')
        .update({ 
            last_check_status: res.status_code,
            ...updateData 
        })
        .eq('id', res.scholarship_id)
    }

    return new Response(JSON.stringify({ success: true, checked: results.length }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    })
  }
})
