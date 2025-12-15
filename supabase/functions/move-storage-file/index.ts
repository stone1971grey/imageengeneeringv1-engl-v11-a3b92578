import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sourcePath, destPath, bucketId } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || Deno.env.get("VITE_SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Download the file from source
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucketId)
      .download(sourcePath);
    
    if (downloadError) {
      throw new Error(`Download failed: ${downloadError.message}`);
    }
    
    // Upload to new location
    const { error: uploadError } = await supabase.storage
      .from(bucketId)
      .upload(destPath, fileData, { upsert: true });
    
    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }
    
    // Delete the old file
    const { error: deleteError } = await supabase.storage
      .from(bucketId)
      .remove([sourcePath]);
    
    if (deleteError) {
      console.warn(`Delete warning: ${deleteError.message}`);
    }
    
    return new Response(
      JSON.stringify({ success: true, newPath: destPath }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
