import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SISTRIX_BASE_URL = 'https://api.sistrix.com';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SISTRIX_API_KEY = Deno.env.get('SISTRIX_API_KEY');
    if (!SISTRIX_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'SISTRIX API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: any = {};

    // Test 1: Credits (should always work)
    console.log('Testing: credits');
    const creditsRes = await fetch(`${SISTRIX_BASE_URL}/credits?api_key=${SISTRIX_API_KEY}&format=json`);
    results.credits = await creditsRes.json();

    // Test 2: Visibility Index
    console.log('Testing: visibilityindex');
    const visRes = await fetch(`${SISTRIX_BASE_URL}/domain.visibilityindex?api_key=${SISTRIX_API_KEY}&format=json&domain=image-engineering.de&country=de`);
    results.visibilityindex = await visRes.json();

    // Test 3: Keyword count
    console.log('Testing: kwcount.seo');
    const kwRes = await fetch(`${SISTRIX_BASE_URL}/domain.kwcount.seo?api_key=${SISTRIX_API_KEY}&format=json&domain=image-engineering.de&country=de`);
    results.kwcount = await kwRes.json();

    // Test 4: Opportunities
    console.log('Testing: opportunities');
    const oppRes = await fetch(`${SISTRIX_BASE_URL}/domain.opportunities?api_key=${SISTRIX_API_KEY}&format=json&domain=image-engineering.de&country=de&limit=5`);
    results.opportunities = await oppRes.json();

    // Test 5: keyword.domain.seo - Core for Relaunch Dashboard
    console.log('Testing: keyword.domain.seo');
    const keywordRes = await fetch(`${SISTRIX_BASE_URL}/keyword.domain.seo?api_key=${SISTRIX_API_KEY}&format=json&domain=image-engineering.de&country=de&limit=10`);
    results.keywordDomainSeo = await keywordRes.json();

    console.log('All tests completed');

    return new Response(
      JSON.stringify(results, null, 2),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Test error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
