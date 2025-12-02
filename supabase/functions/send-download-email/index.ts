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
    
    // Construct download URL - ensure /en/ language prefix is present
    const baseUrl = 'https://preview--imageengeneeringv1-engl-v11.lovable.app';
    let dlUrl = downloadUrl || `${baseUrl}/en/whitepaper/ieee-p2020`;
    
    // Ensure /en/ prefix is present in the URL
    if (dlUrl.startsWith(baseUrl) && !dlUrl.includes('/en/')) {
      const pathPart = dlUrl.replace(baseUrl, '');
      dlUrl = `${baseUrl}/en${pathPart}`;
    }
    
    console.log("downloadUrl received:", downloadUrl);
    console.log("dlUrl being sent to Mautic:", dlUrl);

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

    // Variable to track if contact exists in Mautic
    let isExistingMauticContact = false;

    // Send to Mautic
    const mauticBaseUrl = Deno.env.get("MAUTIC_BASE_URL");
    const mauticUser = Deno.env.get("MAUTIC_USER");
    const mauticPass = Deno.env.get("MAUTIC_PASS");

    if (mauticBaseUrl && mauticUser && mauticPass) {
      try {
        const basicAuth = btoa(`${mauticUser}:${mauticPass}`);
        
        // Map download_type to tag
        const tagMapping: Record<string, string> = {
          "whitepaper": "dl:whitepaper",
          "conference": "dl:conference-paper",
          "video": "dl:video"
        };
        
        const downloadTag = tagMapping[downloadType] || "dl:whitepaper";
        
        // First, search for existing contact in Mautic
        const searchResponse = await fetch(
          `${mauticBaseUrl}/api/contacts?search=email:${encodeURIComponent(email)}`,
          {
            method: "GET",
            headers: {
              "Authorization": `Basic ${basicAuth}`,
              "Content-Type": "application/json",
            },
          }
        );

        let mauticContactId = null;

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          if (searchData.contacts && Object.keys(searchData.contacts).length > 0) {
            const contactId = Object.keys(searchData.contacts)[0];
            mauticContactId = contactId;
            isExistingMauticContact = true;
            console.log(`Found existing Mautic contact with ID: ${contactId}`);
          }
        }

        let mauticResponse;

        if (isExistingMauticContact && mauticContactId) {
          // Update existing contact - update all fields including contact data
          console.log("Updating existing Mautic contact - updating all fields including name/company");
          
          // Get company logo from environment
          const companyLogoUrl = Deno.env.get("COMPANY_LOGO_URL");
          
          const updateData: any = {
            firstname: firstName,
            lastname: lastName,
            company: company,
            position: position,
            download_type: downloadType,
            item_title: title,
            item_id: itemId || title,
            dl_type: dlTypeFormatted,
            dl_title: title,
            dl_url: dlUrl,
            company_logo: companyLogoUrl, // Add company logo for mailings
            tags: [downloadTag], // Mautic will ADD these tags, not replace
          };

          // Only add category and title tags if provided
          if (categoryTag) updateData.category_tag = categoryTag;
          if (titleTag) updateData.title_tag = titleTag;

          // CRITICAL: Do NOT send marketing_optin for existing contacts to preserve their status

          mauticResponse = await fetch(`${mauticBaseUrl}/api/contacts/${mauticContactId}/edit`, {
            method: "PATCH",
            headers: {
              "Authorization": `Basic ${basicAuth}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData),
          });
        } else {
          // Create new contact with all data
          console.log("Creating new Mautic contact with marketing_optin: pending");
          
          // Get company logo from environment
          const companyLogoUrl = Deno.env.get("COMPANY_LOGO_URL");
          
          const createData: any = {
            firstname: firstName,
            lastname: lastName,
            email: email,
            company: company,
            position: position,
            download_type: downloadType,
            item_title: title,
            item_id: itemId || title,
            marketing_optin: "pending", // Only for NEW contacts
            dl_type: dlTypeFormatted,
            dl_title: title,
            dl_url: dlUrl,
            company_logo: companyLogoUrl, // Add company logo for mailings
            tags: [downloadTag]
          };

          if (categoryTag) createData.category_tag = categoryTag;
          if (titleTag) createData.title_tag = titleTag;

          mauticResponse = await fetch(`${mauticBaseUrl}/api/contacts/new`, {
            method: "POST",
            headers: {
              "Authorization": `Basic ${basicAuth}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(createData),
          });
        }

        if (!mauticResponse.ok) {
          console.error("Mautic API error:", await mauticResponse.text());
        } else {
          const responseData = await mauticResponse.json();
          console.log("Successfully sent to Mautic:", responseData);
        }
      } catch (mauticError) {
        console.error("Error sending to Mautic:", mauticError);
        // Don't fail the request if Mautic fails
      }
    }

    // Email sending is handled by Mautic workflows
    console.log("Download request processed successfully - Mautic will handle email notifications");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Download request processed successfully",
        isExistingContact: isExistingMauticContact
      }),
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
