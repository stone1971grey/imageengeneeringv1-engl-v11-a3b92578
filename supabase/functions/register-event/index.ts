import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EventRegistrationRequest {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  position: string;
  eventName: string;
  eventSlug: string;
  eventDate?: string;
  eventLocation?: string;
  eventImage?: string;
  phone?: string;
  industry?: string;
  currentTestSystems?: string;
  automotiveInterests?: string[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: EventRegistrationRequest = await req.json();
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'company', 'position', 'eventName', 'eventSlug'];
    for (const field of requiredFields) {
      if (!data[field as keyof EventRegistrationRequest]) {
        console.error(`Missing required field: ${field}`);
        return new Response(
          JSON.stringify({ error: "missing field" }),
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
      .from('event_registrations')
      .insert({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        company: data.company,
        position: data.position,
        event_title: data.eventName,
        event_slug: data.eventSlug,
        event_date: data.eventDate || '',
        event_location: data.eventLocation || '',
        phone: data.phone,
        industry: data.industry,
        current_test_systems: data.currentTestSystems,
        automotive_interests: data.automotiveInterests,
      });

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "database error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Event registration saved to database");

    // Send to Mautic
    const mauticBaseUrl = Deno.env.get("MAUTIC_BASE_URL");
    const mauticUser = Deno.env.get("MAUTIC_USER");
    const mauticPass = Deno.env.get("MAUTIC_PASS");

    if (mauticBaseUrl && mauticUser && mauticPass) {
      try {
        const basicAuth = btoa(`${mauticUser}:${mauticPass}`);
        
        const mauticData = {
          firstname: data.firstName,
          lastname: data.lastName,
          email: data.email,
          company: data.company,
          position: data.position,
          event_title: data.eventName,
          event_date: data.eventDate,
          event_location: data.eventLocation,
          evt_image_url: data.eventImage,
          phone: data.phone,
          industry: data.industry,
          current_test_systems: data.currentTestSystems,
          automotive_interests: data.automotiveInterests?.join(', '),
          marketing_optin: "pending",
          tags: [`evt:${data.eventSlug}`],
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

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in register-event function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
