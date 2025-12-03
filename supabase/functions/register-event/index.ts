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

    // Construct full image URL for both database and Mautic
    const baseUrl = "https://preview--imageengeneeringv1-engl-v11.lovable.app";
    const fullImageUrl = data.eventImage 
      ? `${baseUrl}${data.eventImage.startsWith('/') ? '' : '/'}${data.eventImage}`
      : '';

    console.log("Processing registration for:", data.email, "Event:", data.eventSlug);
    console.log("Image URL:", fullImageUrl);

    // Check if contact is already registered for any event
    const { data: existingRegistrations, error: checkError } = await supabase
      .from('event_registrations')
      .select('id, event_slug, event_title, event_date, evt_image_url, created_at')
      .eq('email', data.email);

    if (checkError) {
      console.error("Error checking existing registrations:", checkError);
    }

    if (existingRegistrations && existingRegistrations.length > 0) {
      const currentEventRegistration = existingRegistrations.find(
        reg => reg.event_slug === data.eventSlug
      );
      
      if (currentEventRegistration) {
        console.log("Contact already registered for this event:", data.email);
        return new Response(
          JSON.stringify({ 
            error: "already_registered",
            message: "This email is already registered for this event",
            registrationData: {
              eventTitle: data.eventName,
              eventDate: data.eventDate,
              eventTime: data.eventLocation,
              eventImageUrl: fullImageUrl,
              registrationDate: currentEventRegistration.created_at
            }
          }),
          {
            status: 409,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Log other event registrations
      const otherEvents = existingRegistrations.map(reg => reg.event_title).join(', ');
      console.log(`Contact ${data.email} already registered for other events:`, otherEvents);
    }

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
        evt_image_url: fullImageUrl,
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

    // Variable to track if contact exists in Mautic
    let isExistingMauticContact = false;

    // Send to Mautic
    const mauticBaseUrl = Deno.env.get("MAUTIC_BASE_URL");
    const mauticUser = Deno.env.get("MAUTIC_USER") || Deno.env.get("MAUTIC_USERNAME");
    const mauticPass = Deno.env.get("MAUTIC_PASS") || Deno.env.get("MAUTIC_PASSWORD");

    if (mauticBaseUrl && mauticUser && mauticPass) {
      console.log("Sending to Mautic for:", data.email);
      try {
        const basicAuth = btoa(`${mauticUser}:${mauticPass}`);
        
        // First, search for existing contact in Mautic
        const searchResponse = await fetch(
          `${mauticBaseUrl}/api/contacts?search=email:${encodeURIComponent(data.email)}`,
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
          // Update existing contact - update all fields including name changes
          console.log("Updating existing Mautic contact - updating all fields");
          
          // First, fetch existing contact to get current tags and marketing_optin
          const contactResponse = await fetch(`${mauticBaseUrl}/api/contacts/${mauticContactId}`, {
            method: "GET",
            headers: {
              "Authorization": `Basic ${basicAuth}`,
              "Content-Type": "application/json",
            },
          });

          let existingTags: string[] = [];
          let currentMarketingOptin: string | null = null;

          if (contactResponse.ok) {
            const contactData = await contactResponse.json();
            if (contactData.contact && contactData.contact.tags) {
              existingTags = contactData.contact.tags.map((tag: any) => tag.tag || tag);
            }
            currentMarketingOptin = contactData.contact?.fields?.all?.marketing_optin ?? null;
            console.log("Existing tags:", existingTags);
            console.log("Current marketing_optin:", currentMarketingOptin);
          } else {
            console.error("Failed to load existing contact for tag/opt-in check", await contactResponse.text());
          }

          // Add new event tags to existing tags (avoid duplicates)
          const newEventTag = `evt:${data.eventSlug}`;
          const allTags = [...new Set([...existingTags, "evt", newEventTag])];
          console.log("Combined tags:", allTags);
          
          // Get company logo from environment
          const companyLogoUrl = Deno.env.get("COMPANY_LOGO_URL");
          
          const updateData: any = {
            firstname: data.firstName,
            lastname: data.lastName,
            company: data.company,
            position: data.position,
            event_title: data.eventName,
            event_date: data.eventDate,
            event_location: data.eventLocation,
            evt_image_url: fullImageUrl,
            company_logo: companyLogoUrl, // Add company logo for mailings
            tags: allTags, // Use combined tags array
          };

          // Always set marketing_optin to "pending" UNLESS it's already "yes"
          // This ensures empty strings, null, undefined, or any other value gets set to "pending"
          if (currentMarketingOptin !== "yes") {
            updateData.marketing_optin = "pending";
            console.log("Setting marketing_optin to 'pending' (current value was not 'yes')");
          } else {
            console.log("Preserving marketing_optin = 'yes' for existing opted-in contact");
          }

          // Only update these fields if they have values
          if (data.phone) updateData.phone = data.phone;
          if (data.industry) updateData.industry = data.industry;
          if (data.currentTestSystems) updateData.current_test_systems = data.currentTestSystems;
          if (data.automotiveInterests && data.automotiveInterests.length > 0) {
            updateData.automotive_interests = data.automotiveInterests.join(', ');
          }

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
          console.log("Creating new Mautic contact");
          
          // Get company logo from environment
          const companyLogoUrl = Deno.env.get("COMPANY_LOGO_URL");
          
          const createData: any = {
            firstname: data.firstName,
            lastname: data.lastName,
            email: data.email,
            company: data.company,
            position: data.position,
            event_title: data.eventName,
            event_date: data.eventDate,
            event_location: data.eventLocation,
            evt_image_url: fullImageUrl,
            company_logo: companyLogoUrl, // Add company logo for mailings
            phone: data.phone,
            industry: data.industry,
            current_test_systems: data.currentTestSystems,
            automotive_interests: data.automotiveInterests?.join(', '),
            marketing_optin: "pending",
            tags: ["evt", `evt:${data.eventSlug}`],
          };

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
          const errorText = await mauticResponse.text();
          console.error("Mautic API error:", mauticResponse.status, errorText);
        } else {
          const responseData = await mauticResponse.json();
          console.log("Successfully sent to Mautic:", responseData);
        }
      } catch (mauticError) {
        console.error("Error sending to Mautic:", mauticError);
        // Don't fail the request if Mautic fails
      }
    } else {
      console.log("Mautic credentials not configured, skipping Mautic sync");
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        isExistingContact: isExistingMauticContact 
      }),
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
