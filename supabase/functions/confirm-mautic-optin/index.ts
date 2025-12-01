import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OptinConfirmRequest {
  email: string;
}

async function getMauticCredentials() {
  const baseUrl = Deno.env.get("MAUTIC_BASE_URL");
  const username = Deno.env.get("MAUTIC_USERNAME");
  const password = Deno.env.get("MAUTIC_PASSWORD");

  if (!baseUrl || !username || !password) {
    throw new Error("Mautic credentials not configured");
  }

  const authString = btoa(`${username}:${password}`);
  return { baseUrl, authString };
}

async function findContact(email: string, baseUrl: string, authString: string) {
  console.log("Searching for contact:", email);
  
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
    const errorText = await searchResponse.text();
    console.error("Failed to search contacts:", errorText);
    throw new Error("Failed to search contacts in Mautic");
  }

  const searchData = await searchResponse.json();
  console.log("Search response total:", searchData.total);

  if (searchData.total > 0 && searchData.contacts) {
    const contactId = Object.keys(searchData.contacts)[0];
    const contact = searchData.contacts[contactId];
    console.log("Found contact:", contactId, "Current marketing_optin:", contact.fields?.all?.marketing_optin);
    return { contactId, contact };
  }

  return null;
}

async function updateMarketingOptin(contactId: string, baseUrl: string, authString: string) {
  console.log("Updating marketing_optin to 'confirmed' for contact:", contactId);
  
  const updateResponse = await fetch(
    `${baseUrl}/api/contacts/${contactId}/edit`,
    {
      method: "PATCH",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        marketing_optin: "confirmed",
        optin_confirmed: new Date().toISOString(),
      }),
    }
  );

  if (!updateResponse.ok) {
    const errorText = await updateResponse.text();
    console.error("Failed to update contact:", errorText);
    throw new Error(`Failed to update marketing_optin: ${errorText}`);
  }

  const updateData = await updateResponse.json();
  console.log("✅ marketing_optin updated successfully to 'confirmed'");
  return updateData;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: OptinConfirmRequest = await req.json();

    if (!email) {
      console.error("No email provided");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Email is required" 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Processing opt-in confirmation for:", email);

    // Get Mautic credentials
    const { baseUrl, authString } = await getMauticCredentials();

    // Find contact
    const contactData = await findContact(email, baseUrl, authString);

    if (!contactData) {
      console.log("Contact not found for email:", email);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Contact not found in Mautic" 
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { contactId, contact } = contactData;
    
    // Check current status
    const currentStatus = contact.fields?.all?.marketing_optin;
    console.log("Current marketing_optin status:", currentStatus);

    // Update marketing_optin to confirmed
    const result = await updateMarketingOptin(contactId, baseUrl, authString);

    return new Response(
      JSON.stringify({ 
        success: true, 
        contactId,
        previousStatus: currentStatus,
        newStatus: "confirmed",
        message: "Marketing opt-in confirmed successfully"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in confirm-mautic-optin:", error);
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
