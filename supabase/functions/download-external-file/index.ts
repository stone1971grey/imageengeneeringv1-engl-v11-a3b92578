import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileUrl, targetPath, bucketId = 'page-images' } = await req.json();

    if (!fileUrl || !targetPath) {
      return new Response(
        JSON.stringify({ success: false, error: 'fileUrl and targetPath are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[DownloadExternalFile] Downloading: ${fileUrl}`);
    console.log(`[DownloadExternalFile] Target: ${bucketId}/${targetPath}`);

    // Download the file
    const response = await fetch(fileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ContentAutomation/1.0)',
      },
    });

    if (!response.ok) {
      console.error(`[DownloadExternalFile] Failed to fetch: ${response.status}`);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to download file: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const arrayBuffer = await response.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    console.log(`[DownloadExternalFile] Downloaded ${fileData.length} bytes, type: ${contentType}`);

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Upload to storage
    const { data, error } = await supabase.storage
      .from(bucketId)
      .upload(targetPath, fileData, {
        contentType,
        upsert: true, // Overwrite if exists
      });

    if (error) {
      console.error(`[DownloadExternalFile] Upload error:`, error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketId)
      .getPublicUrl(targetPath);

    console.log(`[DownloadExternalFile] Uploaded successfully: ${urlData.publicUrl}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        path: targetPath,
        publicUrl: urlData.publicUrl,
        size: fileData.length,
        contentType,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('[DownloadExternalFile] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
