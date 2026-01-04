import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, expectedTarget } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[validate-redirect] Checking URL: ${url}`);
    console.log(`[validate-redirect] Expected target: ${expectedTarget}`);

    // Fetch with redirect: "manual" to see the actual redirect response
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "manual",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RedirectValidator/1.0)"
      }
    });

    const status = response.status;
    const location = response.headers.get("location");

    console.log(`[validate-redirect] Status: ${status}, Location: ${location}`);

    // Check if it's a redirect (301, 302, 307, 308)
    const isRedirect = [301, 302, 307, 308].includes(status);
    
    let ok = false;
    let message = "";

    if (isRedirect) {
      if (location) {
        // Check if redirect target matches expected (normalize URLs for comparison)
        const normalizedLocation = normalizeUrl(location);
        const normalizedExpected = expectedTarget ? normalizeUrl(expectedTarget) : null;
        
        if (normalizedExpected && normalizedLocation.includes(normalizedExpected)) {
          ok = true;
          message = `Redirect to ${location}`;
        } else if (!normalizedExpected) {
          ok = true;
          message = `Redirect to ${location}`;
        } else {
          ok = false;
          message = `Redirects to ${location}, expected ${expectedTarget}`;
        }
      } else {
        ok = false;
        message = "Redirect without Location header";
      }
    } else if (status === 200) {
      // No redirect, but page exists
      ok = false;
      message = "No redirect (200 OK)";
    } else if (status === 404) {
      ok = false;
      message = "Page not found (404)";
    } else {
      ok = false;
      message = `Unexpected status`;
    }

    return new Response(
      JSON.stringify({
        status,
        ok,
        message,
        location,
        isRedirect,
        url
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[validate-redirect] Error:", errorMessage);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        status: 0,
        ok: false,
        message: "Connection failed"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Normalize URL for comparison (remove protocol, trailing slashes, etc.)
function normalizeUrl(url: string): string {
  try {
    // Handle relative URLs
    if (url.startsWith("/")) {
      return url.replace(/\/+$/, "").toLowerCase();
    }
    
    const parsed = new URL(url);
    return (parsed.pathname + parsed.search).replace(/\/+$/, "").toLowerCase();
  } catch {
    return url.replace(/\/+$/, "").toLowerCase();
  }
}