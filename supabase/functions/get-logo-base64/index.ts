import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Fetching logo from Supabase Storage...");
    
    // Fetch the logo from Supabase Storage
    const logoUrl = "https://afrcagkprhtvvucukubf.supabase.co/storage/v1/object/public/page-images/media/logo_ci/1764577403945-Logo-test-iQ-IE_V7.png";
    
    const response = await fetch(logoUrl);
    
    if (!response.ok) {
      console.error("Failed to fetch logo:", response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch logo", status: response.status }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the image as array buffer
    const imageBuffer = await response.arrayBuffer();
    
    // Convert to base64
    const base64 = btoa(
      new Uint8Array(imageBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );
    
    // Create data URI
    const dataUri = `data:image/png;base64,${base64}`;
    
    console.log("Successfully converted logo to base64");
    console.log("Base64 length:", base64.length);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        dataUri,
        base64,
        length: base64.length
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in get-logo-base64 function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
