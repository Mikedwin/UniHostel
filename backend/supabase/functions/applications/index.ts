import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateAccessCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'UNI-'
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://fvkucgyqvuroxbrjdpkx.supabase.co'
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(p => p)
    const action = pathParts[pathParts.length - 1]

    // POST /applications - Create application
    if (req.method === 'POST' && action === 'applications') {
      const { hostel_id, student_id, room_type, semester, student_name, contact_number } = await req.json()

      const { data: roomTypes } = await supabase
        .from('room_types')
        .select('price')
        .eq('hostel_id', hostel_id)
        .eq('type', room_type)
        .single()

      if (!roomTypes) {
        return new Response(
          JSON.stringify({ error: 'Room type not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        )
      }

      const hostelFee = roomTypes.price
      const commissionPercent = 5
      const adminCommission = Math.round(hostelFee * (commissionPercent / 100))
      const totalAmount = hostelFee + adminCommission

      const { data: application, error } = await supabase
        .from('applications')
        .insert({
          hostel_id,
          student_id,
          room_type,
          semester,
          student_name,
          contact_number,
          status: 'pending',
          payment_status: 'pending',
          hostel_fee: hostelFee,
          admin_commission: adminCommission,
          total_amount: totalAmount
        })
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ message: 'Application submitted', application }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
      )
    }

    // GET /applications/student/:studentId
    if (req.method === 'GET' && pathParts.includes('student')) {
      const studentId = pathParts[pathParts.length - 1]

      const { data: applications, error } = await supabase
        .from('applications')
        .select(`
          *,
          hostels (id, name, location)
        `)
        .eq('student_id', studentId)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })

      if (error) throw error

      return new Response(
        JSON.stringify(applications),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /applications/manager/:managerId
    if (req.method === 'GET' && pathParts.includes('manager')) {
      const managerId = pathParts[pathParts.length - 1]

      const { data: hostels } = await supabase
        .from('hostels')
        .select('id')
        .eq('manager_id', managerId)

      const hostelIds = hostels?.map(h => h.id) || []

      const { data: applications, error } = await supabase
        .from('applications')
        .select(`
          *,
          hostels (id, name, location),
          users!applications_student_id_fkey (id, name, email)
        `)
        .in('hostel_id', hostelIds)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })

      if (error) throw error

      return new Response(
        JSON.stringify(applications),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PATCH /applications/:id/status
    if (req.method === 'PATCH' && pathParts.includes('status')) {
      const applicationId = pathParts[pathParts.length - 2]
      const { action: statusAction } = await req.json()

      const { data: app } = await supabase
        .from('applications')
        .select('*')
        .eq('id', applicationId)
        .single()

      if (!app) {
        return new Response(
          JSON.stringify({ error: 'Application not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        )
      }

      if (statusAction === 'approve_for_payment') {
        const { error } = await supabase
          .from('applications')
          .update({ status: 'approved_for_payment' })
          .eq('id', applicationId)

        if (error) throw error

        return new Response(
          JSON.stringify({ message: 'Application approved for payment' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (statusAction === 'reject') {
        const { error } = await supabase
          .from('applications')
          .update({ status: 'rejected' })
          .eq('id', applicationId)

        if (error) throw error

        return new Response(
          JSON.stringify({ message: 'Application rejected' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (statusAction === 'final_approve') {
        const accessCode = generateAccessCode()

        const { error: updateError } = await supabase
          .from('applications')
          .update({
            status: 'approved',
            access_code: accessCode,
            access_code_issued_at: new Date().toISOString(),
            final_approved_at: new Date().toISOString()
          })
          .eq('id', applicationId)

        if (updateError) throw updateError

        const { error: roomError } = await supabase.rpc('increment_room_occupancy', {
          p_hostel_id: app.hostel_id,
          p_room_type: app.room_type
        })

        if (roomError) throw roomError

        if (roomError) {
          console.error('Room occupancy update failed:', roomError)
          return new Response(
            JSON.stringify({ error: 'Failed to update room occupancy', details: roomError.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          )
        }

        return new Response(
          JSON.stringify({ message: 'Application approved', access_code: accessCode }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
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
