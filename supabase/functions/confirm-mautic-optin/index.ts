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

async function updateMarketingOptin(contactId: string, baseUrl: string, authString: string, eventTag?: string) {
  console.log("Updating marketing_optin to 'confirmed' for contact:", contactId);
  
  // Build update payload
  const updatePayload: Record<string, any> = {
    marketing_optin: "confirmed",
    optin_confirmed: new Date().toISOString(),
  };
  
  // Add event tag if provided
  if (eventTag) {
    updatePayload.tags = [eventTag];
    console.log("Adding event tag:", eventTag);
  }
  
  const updateResponse = await fetch(
    `${baseUrl}/api/contacts/${contactId}/edit`,
    {
      method: "PATCH",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatePayload),
    }
  );

  if (!updateResponse.ok) {
    const errorText = await updateResponse.text();
    console.error("Failed to update contact:", errorText);
    throw new Error(`Failed to update marketing_optin: ${errorText}`);
  }

  const updateData = await updateResponse.json();
  console.log("✅ marketing_optin updated successfully to 'confirmed'");
  if (eventTag) {
    console.log("✅ Event tag added:", eventTag);
  }
  return updateData;
}

async function findSegmentByName(segmentName: string, baseUrl: string, authString: string) {
  console.log("Searching for segment:", segmentName);
  
  const response = await fetch(
    `${baseUrl}/api/segments?search=${encodeURIComponent(segmentName)}`,
    {
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    console.error("Failed to fetch segments");
    return null;
  }

  const data = await response.json();
  
  if (data.total > 0 && data.lists) {
    for (const id of Object.keys(data.lists)) {
      const segment = data.lists[id];
      if (segment.name === segmentName || segment.alias === segmentName.toLowerCase().replace(/\s+/g, '')) {
        console.log("Found segment:", segment.name, "ID:", id);
        return id;
      }
    }
  }
  
  return null;
}

async function addContactToSegment(contactId: string, segmentId: string, baseUrl: string, authString: string) {
  console.log("Adding contact", contactId, "to segment", segmentId);
  
  const response = await fetch(
    `${baseUrl}/api/segments/${segmentId}/contact/${contactId}/add`,
    {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to add contact to segment:", errorText);
    return false;
  }

  console.log("✅ Contact added to segment successfully");
  return true;
}

// Add engagement points to contact
async function addPointsToContact(contactId: string, points: number, baseUrl: string, authString: string) {
  console.log(`Adding ${points} engagement points to contact ${contactId}`);
  
  const response = await fetch(
    `${baseUrl}/api/contacts/${contactId}/points/plus/${points}`,
    {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to add points:", errorText);
    return false;
  }

  console.log(`✅ Added ${points} engagement points successfully`);
  return true;
}

// Convert event title to slug format
function eventTitleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/-+/g, '_');
}

// Find campaign by name - with optional event-specific matching
async function findCampaignByName(campaignName: string, baseUrl: string, authString: string, eventTitle?: string) {
  console.log("Searching for campaign:", campaignName, eventTitle ? `(event: ${eventTitle})` : '');
  
  const response = await fetch(
    `${baseUrl}/api/campaigns?search=${encodeURIComponent(campaignName)}`,
    {
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    console.error("Failed to fetch campaigns");
    return null;
  }

  const data = await response.json();
  
  if (data.total > 0 && data.campaigns) {
    // If we have an event title, look for event-specific campaign first
    if (eventTitle) {
      const eventSlug = eventTitleToSlug(eventTitle);
      console.log("Looking for event-specific campaign with slug:", eventSlug);
      
      for (const id of Object.keys(data.campaigns)) {
        const campaign = data.campaigns[id];
        const campaignNameLower = campaign.name?.toLowerCase() || '';
        // Match campaign that contains both "Event Confirmation" and the event slug
        if (campaignNameLower.includes(campaignName.toLowerCase()) && 
            campaignNameLower.includes(eventSlug)) {
          console.log("Found event-specific campaign:", campaign.name, "ID:", id);
          return { id, name: campaign.name };
        }
      }
      console.log("No event-specific campaign found for:", eventSlug);
    }
    
    // Fallback: Look for exact match or generic campaign
    for (const id of Object.keys(data.campaigns)) {
      const campaign = data.campaigns[id];
      // Prefer exact match
      if (campaign.name?.toLowerCase() === campaignName.toLowerCase()) {
        console.log("Found exact match campaign:", campaign.name, "ID:", id);
        return { id, name: campaign.name };
      }
    }
    
    console.log("No matching campaign found for:", campaignName);
  }
  
  return null;
}

// Add contact to campaign
async function addContactToCampaign(contactId: string, campaignId: string, baseUrl: string, authString: string) {
  console.log("Adding contact", contactId, "to campaign", campaignId);
  
  const response = await fetch(
    `${baseUrl}/api/campaigns/${campaignId}/contact/${contactId}/add`,
    {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to add contact to campaign:", errorText);
    return false;
  }

  console.log("✅ Contact added to campaign successfully");
  return true;
}

// Remove contact from campaign
async function removeContactFromCampaign(contactId: string, campaignId: string, baseUrl: string, authString: string) {
  console.log("Removing contact", contactId, "from campaign", campaignId);
  
  const response = await fetch(
    `${baseUrl}/api/campaigns/${campaignId}/contact/${contactId}/remove`,
    {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to remove contact from campaign:", errorText);
    return false;
  }

  console.log("✅ Contact removed from campaign successfully");
  return true;
}

// Remove contact from segment
async function removeContactFromSegment(contactId: string, segmentId: string, baseUrl: string, authString: string) {
  console.log("Removing contact", contactId, "from segment", segmentId);
  
  const response = await fetch(
    `${baseUrl}/api/segments/${segmentId}/contact/${contactId}/remove`,
    {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to remove contact from segment:", errorText);
    return false;
  }

  console.log("✅ Contact removed from segment successfully");
  return true;
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

    // Get event info from contact for campaign assignment and tag
    const eventTitle = contact.fields?.all?.event_title;
    console.log("Contact event_title:", eventTitle);

    // Build event tag if event exists (format: evt:event_slug)
    let eventTag: string | undefined;
    if (eventTitle) {
      const eventSlug = eventTitleToSlug(eventTitle);
      eventTag = `evt:${eventSlug}`;
      console.log("Will add event tag:", eventTag);
    }

    // Update marketing_optin to confirmed (with event tag if applicable)
    const result = await updateMarketingOptin(contactId, baseUrl, authString, eventTag);

    // 1. Add +5 engagement points for opt-in confirmation
    let pointsAdded = false;
    try {
      pointsAdded = await addPointsToContact(contactId, 5, baseUrl, authString);
    } catch (e) {
      console.error("Failed to add points:", e);
    }

    // 2. Add contact to "Marketing Allowed" segment
    let marketingSegmentAdded = false;
    const marketingAllowedSegmentId = await findSegmentByName("Marketing Allowed", baseUrl, authString);
    if (marketingAllowedSegmentId) {
      marketingSegmentAdded = await addContactToSegment(contactId, marketingAllowedSegmentId, baseUrl, authString);
    } else {
      console.log("Marketing Allowed segment not found - trying alternative names");
      const alternativeNames = ["Marketing_Allowed", "marketing_allowed", "MarketingAllowed"];
      for (const name of alternativeNames) {
        const altSegmentId = await findSegmentByName(name, baseUrl, authString);
        if (altSegmentId) {
          marketingSegmentAdded = await addContactToSegment(contactId, altSegmentId, baseUrl, authString);
          break;
        }
      }
    }

    // 3. Remove contact from "Needs OptIn" segment
    let needsOptinRemoved = false;
    const needsOptinSegmentId = await findSegmentByName("Needs OptIn", baseUrl, authString);
    if (needsOptinSegmentId) {
      needsOptinRemoved = await removeContactFromSegment(contactId, needsOptinSegmentId, baseUrl, authString);
    }

    // 4. Remove contact from "OptIn" campaign
    let optinCampaignRemoved = false;
    const optinCampaign = await findCampaignByName("OptIn", baseUrl, authString);
    if (optinCampaign) {
      optinCampaignRemoved = await removeContactFromCampaign(contactId, optinCampaign.id, baseUrl, authString);
    }

    // 5. Add contact to "Event Confirmation" campaign (if event_title exists)
    // Pass eventTitle to find event-specific campaign
    let eventCampaignAdded = false;
    let eventCampaignName = null;
    if (eventTitle) {
      // Try to find the event-specific Event Confirmation campaign
      const eventConfirmationCampaign = await findCampaignByName("Event Confirmation", baseUrl, authString, eventTitle);
      if (eventConfirmationCampaign) {
        eventCampaignAdded = await addContactToCampaign(contactId, eventConfirmationCampaign.id, baseUrl, authString);
        eventCampaignName = eventConfirmationCampaign.name;
      } else {
        console.log("No Event Confirmation campaign found for event:", eventTitle);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        contactId,
        previousStatus: currentStatus,
        newStatus: "confirmed",
        pointsAdded,
        marketingSegmentAdded,
        needsOptinRemoved,
        optinCampaignRemoved,
        eventCampaignAdded,
        eventCampaignName,
        eventTagAdded: eventTag || null,
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
