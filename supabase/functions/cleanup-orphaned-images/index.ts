import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CleanupResult {
  totalSegmentsChecked: number;
  segmentsModified: number;
  imagesRemoved: number;
  details: Array<{
    pageSlug: string;
    language: string;
    segmentId: string;
    segmentType: string;
    removedUrls: string[];
  }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[cleanup-orphaned-images] Starting cleanup process');

    // Get all page_content entries with page_segments
    const { data: pageContents, error: fetchError } = await supabase
      .from('page_content')
      .select('id, page_slug, language, content_value, section_key')
      .eq('section_key', 'page_segments');

    if (fetchError) {
      console.error('[cleanup-orphaned-images] Error fetching page_content:', fetchError);
      throw fetchError;
    }

    console.log(`[cleanup-orphaned-images] Found ${pageContents?.length || 0} page_content entries to check`);

    const result: CleanupResult = {
      totalSegmentsChecked: 0,
      segmentsModified: 0,
      imagesRemoved: 0,
      details: [],
    };

    // Process each page_content entry
    for (const pageContent of pageContents || []) {
      try {
        const segments = JSON.parse(pageContent.content_value || '[]');
        let modified = false;
        const modifiedSegments = [];

        for (const segment of segments) {
          result.totalSegmentsChecked++;
          const removedUrls: string[] = [];

          // Extract all image URLs from segment based on type
          let cleanedSegment = { ...segment };

          // Handle different segment types
          if (segment.type === 'banner' && segment.data?.images) {
            const cleanedImages = [];
            for (const image of segment.data.images) {
              if (image.url) {
                const exists = await checkImageExists(supabase, image.url);
                if (exists) {
                  cleanedImages.push(image);
                } else {
                  console.log(`[cleanup-orphaned-images] Removing broken image: ${image.url}`);
                  removedUrls.push(image.url);
                  result.imagesRemoved++;
                  modified = true;
                }
              } else {
                cleanedImages.push(image);
              }
            }
            cleanedSegment.data.images = cleanedImages;
          }

          if (segment.type === 'product-hero-gallery' && segment.data?.images) {
            const cleanedImages = [];
            for (const image of segment.data.images) {
              if (image.url) {
                const exists = await checkImageExists(supabase, image.url);
                if (exists) {
                  cleanedImages.push(image);
                } else {
                  console.log(`[cleanup-orphaned-images] Removing broken image: ${image.url}`);
                  removedUrls.push(image.url);
                  result.imagesRemoved++;
                  modified = true;
                }
              } else {
                cleanedImages.push(image);
              }
            }
            cleanedSegment.data.images = cleanedImages;
          }

          if (segment.type === 'full-hero' && segment.data?.hero_image_url) {
            const exists = await checkImageExists(supabase, segment.data.hero_image_url);
            if (!exists) {
              console.log(`[cleanup-orphaned-images] Removing broken hero image: ${segment.data.hero_image_url}`);
              removedUrls.push(segment.data.hero_image_url);
              cleanedSegment.data.hero_image_url = '';
              cleanedSegment.data.hero_image_metadata = null;
              result.imagesRemoved++;
              modified = true;
            }
          }

          if (segment.type === 'product-hero' && segment.data?.product_image_url) {
            const exists = await checkImageExists(supabase, segment.data.product_image_url);
            if (!exists) {
              console.log(`[cleanup-orphaned-images] Removing broken product image: ${segment.data.product_image_url}`);
              removedUrls.push(segment.data.product_image_url);
              cleanedSegment.data.product_image_url = '';
              cleanedSegment.data.product_image_metadata = null;
              result.imagesRemoved++;
              modified = true;
            }
          }

          if (segment.type === 'image-text' && segment.data?.image_url) {
            const exists = await checkImageExists(supabase, segment.data.image_url);
            if (!exists) {
              console.log(`[cleanup-orphaned-images] Removing broken image-text image: ${segment.data.image_url}`);
              removedUrls.push(segment.data.image_url);
              cleanedSegment.data.image_url = '';
              cleanedSegment.data.image_metadata = null;
              result.imagesRemoved++;
              modified = true;
            }
          }

          modifiedSegments.push(cleanedSegment);

          if (removedUrls.length > 0) {
            result.details.push({
              pageSlug: pageContent.page_slug,
              language: pageContent.language,
              segmentId: String(segment.id),
              segmentType: segment.type,
              removedUrls,
            });
          }
        }

        // Update page_content if any segments were modified
        if (modified) {
          const { error: updateError } = await supabase
            .from('page_content')
            .update({
              content_value: JSON.stringify(modifiedSegments),
              updated_at: new Date().toISOString(),
            })
            .eq('id', pageContent.id);

          if (updateError) {
            console.error(`[cleanup-orphaned-images] Error updating page_content ${pageContent.id}:`, updateError);
          } else {
            result.segmentsModified++;
            console.log(`[cleanup-orphaned-images] Updated page_content for ${pageContent.page_slug} (${pageContent.language})`);
          }
        }
      } catch (parseError) {
        console.error(`[cleanup-orphaned-images] Error processing page_content ${pageContent.id}:`, parseError);
      }
    }

    console.log('[cleanup-orphaned-images] Cleanup complete:', result);

    return new Response(
      JSON.stringify({
        success: true,
        result,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[cleanup-orphaned-images] Fatal error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Helper function to check if image exists in Storage
async function checkImageExists(supabase: any, imageUrl: string): Promise<boolean> {
  try {
    // Extract file path from URL
    const urlParts = imageUrl.split('/storage/v1/object/public/page-images/');
    if (urlParts.length < 2) {
      console.log(`[cleanup-orphaned-images] Invalid URL format: ${imageUrl}`);
      return false;
    }
    
    const filePath = decodeURIComponent(urlParts[1]);
    
    // Check if file exists in Storage
    const { data, error } = await supabase.storage
      .from('page-images')
      .list(filePath.split('/').slice(0, -1).join('/'), {
        search: filePath.split('/').pop(),
      });

    if (error) {
      console.log(`[cleanup-orphaned-images] Error checking file ${filePath}:`, error);
      return false;
    }

    const exists = data && data.length > 0;
    console.log(`[cleanup-orphaned-images] File ${filePath} exists: ${exists}`);
    return exists;
  } catch (error) {
    console.error(`[cleanup-orphaned-images] Error in checkImageExists for ${imageUrl}:`, error);
    return false;
  }
}
