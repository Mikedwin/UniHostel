import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://fvkucgyqvuroxbrjdpkx.supabase.co'
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const paystackKey = Deno.env.get('PAYSTACK_SECRET_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(p => p)
    const action = pathParts[pathParts.length - 1]

    // POST /payment/initialize - Initialize payment
    if (req.method === 'POST' && action === 'initialize') {
      const { application_id, email, amount } = await req.json()

      const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paystackKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          amount: amount * 100, // Convert to kobo
          metadata: {
            application_id
          }
        })
      })

      const paystackData = await paystackResponse.json()

      if (!paystackData.status) {
        throw new Error(paystackData.message || 'Payment initialization failed')
      }

      return new Response(
        JSON.stringify({
          authorization_url: paystackData.data.authorization_url,
          reference: paystackData.data.reference
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST /payment/verify - Verify payment
    if (req.method === 'POST' && action === 'verify') {
      const { reference } = await req.json()

      const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${paystackKey}`
        }
      })

      const paystackData = await paystackResponse.json()

      if (!paystackData.status || paystackData.data.status !== 'success') {
        return new Response(
          JSON.stringify({ success: false, message: 'Payment verification failed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }

      const applicationId = paystackData.data.metadata.application_id

      const { error } = await supabase
        .from('applications')
        .update({
          payment_status: 'paid',
          status: 'paid_awaiting_final',
          payment_reference: reference
        })
        .eq('id', applicationId)

      if (error) throw error

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment verified successfully',
          application_id: applicationId
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST /payment/webhook - Paystack webhook
    if (req.method === 'POST' && action === 'webhook') {
      const body = await req.json()

      if (body.event === 'charge.success') {
        const reference = body.data.reference
        const applicationId = body.data.metadata.application_id

        await supabase
          .from('applications')
          .update({
            payment_status: 'paid',
            status: 'paid_awaiting_final',
            payment_reference: reference
          })
          .eq('id', applicationId)
      }

      return new Response(
        JSON.stringify({ received: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
