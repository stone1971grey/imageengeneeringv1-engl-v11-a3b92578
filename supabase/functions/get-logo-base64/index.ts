import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ImageRequest {
  imageUrl?: string;
  imageType?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body for dynamic image URL (optional)
    let imageUrl = "https://github.com/stone1971grey/imageengeneeringv1-engl-v11/blob/main/Logo-test-iQ-IE_V7.png?raw=true";
    let imageType = "image/png";

    if (req.method === "POST") {
      try {
        const body: ImageRequest = await req.json();
        if (body.imageUrl) {
          imageUrl = body.imageUrl;
          console.log("Using custom image URL:", imageUrl);
        }
        if (body.imageType) {
          imageType = body.imageType;
        }
      } catch {
        console.log("No body provided, using default logo");
      }
    }

    console.log("Fetching image from:", imageUrl);
    
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      console.error("Failed to fetch image:", response.status, response.statusText);
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch image", 
          status: response.status,
          url: imageUrl 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const imageBuffer = await response.arrayBuffer();
    
    // Convert to base64
    const base64 = btoa(
      new Uint8Array(imageBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );
    
    // Create data URI with correct MIME type
    const dataUri = `data:${imageType};base64,${base64}`;
    
    console.log("Successfully converted image to base64");
    console.log("Base64 length:", base64.length);
    console.log("Image type:", imageType);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        dataUri,
        base64,
        imageType,
        length: base64.length,
        sourceUrl: imageUrl
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
