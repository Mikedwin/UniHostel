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
    const supabase = createClient(supabaseUrl, supabaseKey)

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(p => p)
    const hostelId = pathParts[pathParts.length - 1]

    // GET /hostels - List all hostels
    if (req.method === 'GET' && !hostelId.match(/^[0-9a-f-]{36}$/i)) {
      const location = url.searchParams.get('location')
      const maxPrice = url.searchParams.get('maxPrice')
      
      let query = supabase
        .from('hostels')
        .select(`
          id, name, location, description, hostel_view_image, facilities, is_available, created_at,
          manager_id,
          room_types (id, type, price, total_capacity, occupied_capacity, available, room_image)
        `)
        .eq('is_available', true)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(50)

      if (location) {
        query = query.ilike('location', `%${location}%`)
      }

      const { data: hostels, error } = await query

      if (error) throw error

      return new Response(
        JSON.stringify(hostels),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /hostels/:id - Get single hostel
    if (req.method === 'GET' && hostelId.match(/^[0-9a-f-]{36}$/i)) {
      const { data: hostel, error } = await supabase
        .from('hostels')
        .select(`
          *,
          room_types (*)
        `)
        .eq('id', hostelId)
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify(hostel),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST /hostels - Create hostel (Manager only)
    if (req.method === 'POST') {
      const { name, location, description, hostel_view_image, facilities, room_types, manager_id } = await req.json()

      const { data: hostel, error: hostelError } = await supabase
        .from('hostels')
        .insert({
          manager_id,
          name,
          location,
          description,
          hostel_view_image,
          facilities
        })
        .select()
        .single()

      if (hostelError) throw hostelError

      if (room_types && room_types.length > 0) {
        const roomsToInsert = room_types.map((room: any) => ({
          hostel_id: hostel.id,
          type: room.type,
          price: room.price,
          total_capacity: room.totalCapacity,
          occupied_capacity: 0,
          available: true,
          room_image: room.roomImage
        }))

        const { error: roomsError } = await supabase
          .from('room_types')
          .insert(roomsToInsert)

        if (roomsError) throw roomsError
      }

      return new Response(
        JSON.stringify({ message: 'Hostel created', hostel }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
      )
    }

    // PUT /hostels/:id - Update hostel
    if (req.method === 'PUT' && hostelId) {
      const { name, location, description, hostel_view_image, facilities, is_available } = await req.json()

      const { data: hostel, error } = await supabase
        .from('hostels')
        .update({
          name,
          location,
          description,
          hostel_view_image,
          facilities,
          is_available
        })
        .eq('id', hostelId)
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ message: 'Hostel updated', hostel }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DELETE /hostels/:id - Soft delete hostel
    if (req.method === 'DELETE' && hostelId) {
      const { error } = await supabase
        .from('hostels')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString()
        })
        .eq('id', hostelId)

      if (error) throw error

      return new Response(
        JSON.stringify({ message: 'Hostel deleted' }),
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
