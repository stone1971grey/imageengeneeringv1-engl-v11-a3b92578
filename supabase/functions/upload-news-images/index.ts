import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// News images to upload
const NEWS_IMAGES = [
  {
    url: 'https://www.image-engineering.de/content/news/2020/25_anniversary/Horrem_building.jpg',
    filename: 'horrem-building.jpg',
    alt: 'Image Engineering Horrem building headquarters'
  },
  {
    url: 'https://www.image-engineering.de/content/news/2020/25_anniversary/Cologne_office.jpg',
    filename: 'cologne-office.jpg',
    alt: 'The original Image Engineering office in Cologne, Germany'
  },
  {
    url: 'https://www.image-engineering.de/content/news/2020/25_anniversary/lab_old.jpg',
    filename: 'lab-old.jpg',
    alt: 'The original Image Engineering test laboratory'
  },
  {
    url: 'https://www.image-engineering.de/content/news/2020/25_anniversary/lab_new.jpg',
    filename: 'lab-new.jpg',
    alt: 'Our modern state-of-the-art test laboratory'
  },
  {
    url: 'https://www.image-engineering.de/content/library/2025-content/30_year_anniversary/introducing_nicola.png',
    filename: 'introducing-nicola.png',
    alt: 'From left to right: Maik Müller (Nynomic), Dietmar Wüller, Nicola Best, Uwe Artmann'
  }
];

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const uploadedImages: { filename: string; url: string; alt: string }[] = [];
    const errors: { filename: string; error: string }[] = [];
    
    for (const image of NEWS_IMAGES) {
      try {
        console.log(`Downloading: ${image.url}`);
        
        // Download the image
        const response = await fetch(image.url);
        if (!response.ok) {
          throw new Error(`Failed to download: ${response.status}`);
        }
        
        const imageBlob = await response.blob();
        const arrayBuffer = await imageBlob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        const storagePath = `News/IE-30th-Anniversary/${image.filename}`;
        
        console.log(`Uploading to: ${storagePath}`);
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('page-images')
          .upload(storagePath, uint8Array, {
            contentType: imageBlob.type || 'image/jpeg',
            upsert: true
          });
        
        if (uploadError) {
          throw new Error(uploadError.message);
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('page-images')
          .getPublicUrl(storagePath);
        
        // Create file_segment_mappings entry
        await supabase.from('file_segment_mappings').upsert({
          file_path: storagePath,
          bucket_id: 'page-images',
          segment_ids: [],
          alt_text: image.alt
        }, { onConflict: 'file_path' });
        
        uploadedImages.push({
          filename: image.filename,
          url: publicUrl,
          alt: image.alt
        });
        
        console.log(`Successfully uploaded: ${image.filename}`);
        
      } catch (error) {
        console.error(`Error uploading ${image.filename}:`, error);
        errors.push({
          filename: image.filename,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        uploaded: uploadedImages,
        errors: errors
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
    
  } catch (error) {
    console.error('Error in upload-news-images:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
