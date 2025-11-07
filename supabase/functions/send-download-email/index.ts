import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

interface ResendResponse {
  id?: string;
  error?: { message: string };
}

async function sendEmail(apiKey: string, emailData: {
  from: string;
  to: string[];
  subject: string;
  html: string;
}): Promise<ResendResponse> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailData),
  });

  return await response.json();
}

const apiKey = Deno.env.get("RESEND_API_KEY") || "";

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
        
        // Format dl_type for Mautic
        const dlTypeFormatted = downloadType === "whitepaper" 
          ? "Whitepaper" 
          : downloadType === "conference" 
          ? "Conference paper" 
          : "Video";
        
        // Construct download URL if not provided
        const baseUrl = Deno.env.get("SUPABASE_URL")?.replace('/rest/v1', '') || 'https://preview--imageengeneeringv1-engl-v11.lovable.app';
        const dlUrl = downloadUrl || `${baseUrl}/${downloadType}/${itemId || 'download'}`;
        
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

    // Send email
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error("RESEND_API_KEY is not set");
      // Still return success since DB and Mautic worked
      return new Response(
        JSON.stringify({ success: true, warning: "Email service not configured" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    console.log("Sending download email to:", email);

    let emailSubject = "";
    let emailContent = "";
    let buttonText = "";
    let downloadLink = "";

    // Customize email based on download type
    if (downloadType === "whitepaper") {
      emailSubject = "Your Whitepaper is Ready";
      buttonText = "Download Whitepaper";
      downloadLink = `${Deno.env.get("SUPABASE_URL")?.replace('/rest/v1', '') || 'https://your-project.supabase.co'}/whitepaper_download`;
      emailContent = `
        <h2 style="color: #1e293b; font-size: 24px; margin-bottom: 16px;">Your Whitepaper is Ready</h2>
        <p style="color: #475569; font-size: 16px; margin-bottom: 16px;">Dear ${firstName} ${lastName},</p>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">Thank you for your interest in our whitepaper. We're excited to share this comprehensive resource with you.</p>
      `;
    } else if (downloadType === "conference") {
      emailSubject = "Your Conference Paper is Ready";
      buttonText = "Download Conference Paper";
      downloadLink = `${Deno.env.get("SUPABASE_URL")?.replace('/rest/v1', '') || 'https://your-project.supabase.co'}/conference_paper_download`;
      emailContent = `
        <h2 style="color: #1e293b; font-size: 24px; margin-bottom: 16px;">Your Conference Paper is Ready</h2>
        <p style="color: #475569; font-size: 16px; margin-bottom: 16px;">Dear ${firstName} ${lastName},</p>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">Thank you for your interest in our conference paper. We're excited to share this comprehensive resource with you.</p>
      `;
    } else {
      emailSubject = "Your Video is Ready";
      buttonText = "Stream Video";
      downloadLink = `${Deno.env.get("SUPABASE_URL")?.replace('/rest/v1', '') || 'https://your-project.supabase.co'}/video_download`;
      emailContent = `
        <h2 style="color: #1e293b; font-size: 24px; margin-bottom: 16px;">Your Video is Ready</h2>
        <p style="color: #475569; font-size: 16px; margin-bottom: 16px;">Dear ${firstName} ${lastName},</p>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">Thank you for your interest in our video content. We're excited to share this comprehensive resource with you.</p>
      `;
    }

    const emailResponse = await sendEmail(apiKey, {
      from: "Image Engineering <onboarding@resend.dev>",
      to: [email],
      subject: emailSubject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white;">
              <!-- Header -->
              <div style="background: linear-gradient(to right, #0f172a, #1e293b); padding: 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Image Engineering</h1>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 32px;">
                ${emailContent}
                
                <!-- CTA Box -->
                <div style="background-color: #f3f3f5; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; text-align: center; margin: 32px 0;">
                  <h3 style="color: #1e293b; font-size: 20px; margin: 0 0 8px 0;">Access Your ${downloadType === "video" ? "Video" : "Document"}</h3>
                  <p style="color: #64748b; font-size: 12px; margin: 0 0 24px 0;">Click the button below to ${downloadType === "video" ? "watch" : "download"} your requested ${downloadType === "video" ? "video" : "document"}</p>
                  <a href="${downloadLink}" style="display: inline-block; background-color: #f5743a; color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">${buttonText}</a>
                </div>
                
                <!-- Additional Info -->
                <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 24px;">
                  <div style="border-left: 4px solid #f5743a; background-color: #f3f3f5; padding: 16px; border-radius: 0 8px 8px 0;">
                    <p style="color: #475569; font-size: 12px; margin: 0; line-height: 1.6;">
                      <strong style="color: #1e293b;">Stay Connected:</strong> We'd be delighted to keep you informed about our latest ${downloadType === "video" ? "videos" : "publications"}, upcoming events, new products, and industry insights in automotive imaging and camera testing technology.
                    </p>
                  </div>
                </div>
                
                <!-- Closing -->
                <div style="margin-top: 32px;">
                  <p style="color: #64748b; font-size: 14px; margin: 0 0 16px 0;">Best regards,</p>
                  <p style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0;">The Image Engineering Team</p>
                  <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">Experts in Automotive Imaging Standards</p>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #0f172a; padding: 24px 32px; text-align: center;">
                <p style="color: #94a3b8; font-size: 10px; margin: 0 0 8px 0;">info@image-engineering.de</p>
                <p style="color: #94a3b8; font-size: 10px; margin: 0 0 8px 0;">© 2024 Image Engineering. All rights reserved.</p>
                <p style="color: #64748b; font-size: 10px; margin: 0;">Leading provider of automotive camera testing solutions</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
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
