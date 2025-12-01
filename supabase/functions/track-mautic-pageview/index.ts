import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PageviewRequest {
  email: string;
  pageUrl: string;
  pageTitle: string;
}

async function getMauticAccessToken() {
  const baseUrl = Deno.env.get("MAUTIC_BASE_URL");
  const username = Deno.env.get("MAUTIC_USERNAME");
  const password = Deno.env.get("MAUTIC_PASSWORD");

  if (!baseUrl || !username || !password) {
    throw new Error("Mautic credentials not configured");
  }

  // Mautic Basic Auth
  const authString = btoa(`${username}:${password}`);
  
  return { baseUrl, authString };
}

async function findOrCreateContact(email: string, baseUrl: string, authString: string) {
  console.log("Searching for contact:", email);
  
  // Search for existing contact
  const searchResponse = await fetch(
    `${baseUrl}/api/contacts?search=email:${encodeURIComponent(email)}`,
    {
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!searchResponse.ok) {
    console.error("Failed to search contacts:", await searchResponse.text());
    throw new Error("Failed to search contacts in Mautic");
  }

  const searchData = await searchResponse.json();
  console.log("Search response:", searchData);

  // If contact exists, return it
  if (searchData.total > 0 && searchData.contacts) {
    const contactId = Object.keys(searchData.contacts)[0];
    console.log("Found existing contact:", contactId);
    return contactId;
  }

  // Create new contact if not found
  console.log("Creating new contact for:", email);
  const createResponse = await fetch(`${baseUrl}/api/contacts/new`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${authString}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
    }),
  });

  if (!createResponse.ok) {
    console.error("Failed to create contact:", await createResponse.text());
    throw new Error("Failed to create contact in Mautic");
  }

  const createData = await createResponse.json();
  console.log("Created new contact:", createData);
  return createData.contact.id;
}

async function trackPageview(
  contactId: string,
  pageUrl: string,
  pageTitle: string,
  baseUrl: string,
  authString: string
) {
  console.log("Tracking pageview for contact:", contactId, "URL:", pageUrl);

  // Add pageview to contact
  const response = await fetch(
    `${baseUrl}/api/contacts/${contactId}/events/add`,
    {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventName: "pageview",
        eventType: "pageview",
        eventProperties: {
          url: pageUrl,
          title: pageTitle,
          timestamp: new Date().toISOString(),
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to track pageview:", errorText);
    throw new Error(`Failed to track pageview: ${errorText}`);
  }

  const data = await response.json();
  console.log("Pageview tracked successfully:", data);
  return data;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, pageUrl, pageTitle }: PageviewRequest = await req.json();

    if (!email || !pageUrl) {
      throw new Error("Email and pageUrl are required");
    }

    console.log("Processing pageview tracking for:", email, pageUrl);

    // Get Mautic credentials
    const { baseUrl, authString } = await getMauticAccessToken();

    // Find or create contact
    const contactId = await findOrCreateContact(email, baseUrl, authString);

    // Track pageview
    const result = await trackPageview(
      contactId,
      pageUrl,
      pageTitle || pageUrl,
      baseUrl,
      authString
    );

    return new Response(
      JSON.stringify({ 
        success: true, 
        contactId,
        message: "Pageview tracked successfully",
        result 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in track-mautic-pageview:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
