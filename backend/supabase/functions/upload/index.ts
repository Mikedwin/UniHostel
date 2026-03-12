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
    const cloudName = Deno.env.get('CLOUDINARY_CLOUD_NAME')!
    const apiKey = Deno.env.get('CLOUDINARY_API_KEY')!
    const apiSecret = Deno.env.get('CLOUDINARY_API_SECRET')!

    const { image, folder = 'unihostel' } = await req.json()

    if (!image || !image.startsWith('data:image')) {
      return new Response(
        JSON.stringify({ error: 'Invalid image data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Upload to Cloudinary
    const formData = new FormData()
    formData.append('file', image)
    formData.append('upload_preset', 'ml_default')
    formData.append('folder', folder)

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    )

    const cloudinaryData = await cloudinaryResponse.json()

    if (!cloudinaryResponse.ok) {
      throw new Error(cloudinaryData.error?.message || 'Upload failed')
    }

    return new Response(
      JSON.stringify({
        url: cloudinaryData.secure_url,
        public_id: cloudinaryData.public_id
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
