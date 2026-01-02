import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SISTRIX_BASE_URL = 'https://api.sistrix.com';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SISTRIX_API_KEY = Deno.env.get('SISTRIX_API_KEY');
    if (!SISTRIX_API_KEY) {
      console.error('SISTRIX_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'SISTRIX API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, domain, url, keyword, country = 'de', mobile = false, history = false } = await req.json();
    console.log(`SISTRIX API request: action=${action}, domain=${domain}, country=${country}`);

    let endpoint = '';
    const params = new URLSearchParams();
    params.append('api_key', SISTRIX_API_KEY);
    params.append('format', 'json');

    switch (action) {
      case 'credits':
        // Check remaining API credits
        endpoint = '/credits';
        break;

      case 'visibilityindex':
        // Get domain visibility index
        if (!domain) {
          return new Response(
            JSON.stringify({ error: 'Domain is required for visibilityindex' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        endpoint = '/domain.visibilityindex';
        params.append('domain', domain);
        params.append('country', country);
        if (mobile) params.append('mobile', 'true');
        if (history) params.append('history', 'true');
        break;

      case 'visibilityindex.overview':
        // Get visibility overview for all countries
        if (!domain) {
          return new Response(
            JSON.stringify({ error: 'Domain is required for visibilityindex.overview' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        endpoint = '/domain.visibilityindex.overview';
        params.append('domain', domain);
        break;

      case 'kwcount.seo':
        // Get keyword count for domain
        if (!domain) {
          return new Response(
            JSON.stringify({ error: 'Domain is required for kwcount.seo' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        endpoint = '/domain.kwcount.seo';
        params.append('domain', domain);
        params.append('country', country);
        if (history) params.append('history', 'true');
        break;

      case 'kwcount.seo.top10':
        // Get top 10 keyword count
        if (!domain) {
          return new Response(
            JSON.stringify({ error: 'Domain is required for kwcount.seo.top10' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        endpoint = '/domain.kwcount.seo.top10';
        params.append('domain', domain);
        params.append('country', country);
        if (history) params.append('history', 'true');
        break;

      case 'ranking.distribution':
        // Get ranking distribution
        if (!domain) {
          return new Response(
            JSON.stringify({ error: 'Domain is required for ranking.distribution' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        endpoint = '/domain.ranking.distribution';
        params.append('domain', domain);
        params.append('country', country);
        break;

      case 'competitors.seo':
        // Get SEO competitors
        if (!domain) {
          return new Response(
            JSON.stringify({ error: 'Domain is required for competitors.seo' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        endpoint = '/domain.competitors.seo';
        params.append('domain', domain);
        params.append('country', country);
        break;

      case 'opportunities':
        // Get keyword opportunities
        if (!domain) {
          return new Response(
            JSON.stringify({ error: 'Domain is required for opportunities' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        endpoint = '/domain.opportunities';
        params.append('domain', domain);
        params.append('country', country);
        break;

      case 'traffic.estimation':
        // Get traffic estimation
        if (!domain) {
          return new Response(
            JSON.stringify({ error: 'Domain is required for traffic.estimation' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        endpoint = '/domain.traffic.estimation';
        params.append('domain', domain);
        params.append('country', country);
        break;

      case 'keyword.seo':
        // Get keyword rankings for a specific keyword
        if (!keyword) {
          return new Response(
            JSON.stringify({ error: 'Keyword is required for keyword.seo' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        endpoint = '/keyword.seo';
        params.append('kw', keyword);
        params.append('country', country);
        break;

      case 'url.visibilityindex':
        // Get visibility for specific URL
        if (!url) {
          return new Response(
            JSON.stringify({ error: 'URL is required for url.visibilityindex' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        endpoint = '/domain.visibilityindex';
        params.append('url', url);
        params.append('country', country);
        break;

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    const requestUrl = `${SISTRIX_BASE_URL}${endpoint}?${params.toString()}`;
    console.log(`Calling SISTRIX API: ${endpoint}`);

    const response = await fetch(requestUrl);
    const data = await response.json();

    if (!response.ok) {
      console.error('SISTRIX API error:', data);
      return new Response(
        JSON.stringify({ error: 'SISTRIX API error', details: data }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for SISTRIX error response
    if (data.status === 'error' || data.error) {
      console.error('SISTRIX returned error:', data);
      return new Response(
        JSON.stringify({ error: data.error_message || 'SISTRIX API error', details: data }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`SISTRIX API success: ${action}`);
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('SISTRIX API error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
