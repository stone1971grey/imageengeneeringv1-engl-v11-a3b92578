import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, pageSlug } = await req.json();
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'imageUrl is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('[generate-og-image] Processing image:', imageUrl);
    
    // Check if the image is from Supabase storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const isSupabaseImage = imageUrl.includes(supabaseUrl || '') && imageUrl.includes('/storage/v1/object/');
    
    let ogImageUrl = imageUrl;
    
    if (isSupabaseImage) {
      // Use Supabase's built-in image transformation
      // Add transformation parameters for 1200x630 OG image size
      const url = new URL(imageUrl);
      url.searchParams.set('width', '1200');
      url.searchParams.set('height', '630');
      url.searchParams.set('resize', 'cover'); // Cover maintains aspect ratio and crops
      url.searchParams.set('quality', '85');
      ogImageUrl = url.toString();
      
      console.log('[generate-og-image] Generated Supabase transform URL:', ogImageUrl);
    } else {
      // For external images, we'll need to download, resize, and upload
      // For now, we'll just use the original URL
      console.log('[generate-og-image] External image, using original URL');
      
      // TODO: Implement download -> resize -> upload for external images
      // This would require:
      // 1. Fetch the image
      // 2. Use a library like sharp (not available in Deno) or Canvas API
      // 3. Resize to 1200x630
      // 4. Upload to og-images bucket
      // 5. Return the new URL
    }

    return new Response(
      JSON.stringify({ 
        ogImageUrl,
        width: 1200,
        height: 630,
        isTransformed: isSupabaseImage
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[generate-og-image] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});