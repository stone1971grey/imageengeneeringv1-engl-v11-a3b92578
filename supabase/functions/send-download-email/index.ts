import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DownloadEmailRequest {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  position: string;
  downloadType: "whitepaper" | "conference" | "video";
  title: string;
  itemId?: string;
  consent?: boolean;
  categoryTag?: string;
  titleTag?: string;
  downloadUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, email, company, position, downloadType, title, itemId, consent, categoryTag, titleTag, downloadUrl }: DownloadEmailRequest = await req.json();
    
    console.log("Processing download request for:", email, "type:", downloadType);

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'company', 'position', 'downloadType', 'title'];
    for (const field of requiredFields) {
      if (!eval(field)) {
        console.error(`Missing required field: ${field}`);
        return new Response(
          JSON.stringify({ success: false, error: "missing field" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Format dl_type for display
    const dlTypeFormatted = downloadType === "whitepaper" 
      ? "Whitepaper" 
      : downloadType === "conference" 
      ? "Conference paper" 
      : "Video";
    
    // Construct download URL - use app URL, not Supabase URL
    const baseUrl = 'https://preview--imageengeneeringv1-engl-v11.lovable.app';
    const dlUrl = downloadUrl || `${baseUrl}/whitepaper_download?id=${itemId || 'download'}`;

    // Save to database
    const { error: dbError } = await supabase
      .from('download_requests')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: email,
        company: company,
        position: position,
        download_type: downloadType,
        item_id: itemId || title,
        item_title: title,
        consent: consent ?? true,
        category_tag: categoryTag,
        title_tag: titleTag,
        dl_type: dlTypeFormatted,
        dl_title: title,
        dl_url: dlUrl,
      });

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ success: false, error: "database error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Download request saved to database");

    // Check if contact already exists in event_registrations
    const { data: existingRegistrations, error: checkError } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('email', email);

    if (checkError) {
      console.error("Error checking existing registrations:", checkError);
    }

    const isExistingContact = existingRegistrations && existingRegistrations.length > 0;
    const marketingOptinValue = isExistingContact ? "yes" : "pending";
    
    console.log(`Contact ${email} - Existing: ${isExistingContact}, marketing_optin: ${marketingOptinValue}`);

    // Send to Mautic
    const mauticBaseUrl = Deno.env.get("MAUTIC_BASE_URL");
    const mauticUser = Deno.env.get("MAUTIC_USER");
    const mauticPass = Deno.env.get("MAUTIC_PASS");

    if (mauticBaseUrl && mauticUser && mauticPass) {
      try {
        const basicAuth = btoa(`${mauticUser}:${mauticPass}`);
        
        const mauticData = {
          firstname: firstName,
          lastname: lastName,
          email: email,
          company: company,
          position: position,
          download_type: downloadType,
          item_title: title,
          item_id: itemId || title,
          marketing_optin: marketingOptinValue,
          category_tag: categoryTag,
          title_tag: titleTag,
          dl_type: dlTypeFormatted,
          dl_title: title,
          dl_url: dlUrl,
        };

        const mauticResponse = await fetch(`${mauticBaseUrl}/api/contacts/new`, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${basicAuth}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mauticData),
        });

        if (!mauticResponse.ok) {
          console.error("Mautic API error:", await mauticResponse.text());
        } else {
          console.log("Successfully sent to Mautic");
        }
      } catch (mauticError) {
        console.error("Error sending to Mautic:", mauticError);
        // Don't fail the request if Mautic fails
      }
    }

    // Email sending is handled by Mautic workflows
    console.log("Download request processed successfully - Mautic will handle email notifications");

    return new Response(
      JSON.stringify({ success: true, message: "Download request processed successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-download-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
