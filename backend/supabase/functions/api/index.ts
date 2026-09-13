// Deno Edge Function for UniHostel
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get MongoDB connection from environment
    const MONGO_URI = Deno.env.get('MONGO_URI')
    
    if (!MONGO_URI) {
      throw new Error('MONGO_URI not configured')
    }

    const url = new URL(req.url)
    const path = url.pathname
    
    return new Response(
      JSON.stringify({ 
        status: 'ok',
        message: 'UniHostel API on Supabase Edge Functions',
        path,
        note: 'Full Express app too large for Edge Functions. Consider Render/Railway for complete backend.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
