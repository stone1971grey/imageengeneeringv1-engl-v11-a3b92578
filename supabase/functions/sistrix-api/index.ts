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

    const requestBody = await req.json();
    const { action, domain, url, keyword, country = 'de', mobile = false, history = false, limit = 100, offset = 0 } = requestBody;
    console.log(`SISTRIX API request: action=${action}, domain=${domain}, country=${country}, limit=${limit}`);

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

      case 'keyword.domain.seo':
        // Get organic keyword rankings for domain - CORE FOR RELAUNCH DASHBOARD
        // Returns: keyword (kw), position, competition, traffic, url
        // IMPORTANT: mobile=false returns desktop data (typically more keywords)
        if (!domain) {
          return new Response(
            JSON.stringify({ error: 'Domain is required for keyword.domain.seo' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        endpoint = '/keyword.domain.seo';
        params.append('domain', domain);
        params.append('country', country);
        // Default to desktop data (mobile=false) as it typically has more keywords
        params.append('mobile', mobile ? 'true' : 'false');
        if (limit) params.append('limit', String(limit));
        if (offset) params.append('offset', String(offset));
        console.log(`[keyword.domain.seo] domain=${domain}, country=${country}, mobile=${mobile}, limit=${limit}, offset=${offset}`);
        break;

      case 'keyword.seo.metrics':
        // Get keyword metrics (search volume, CPC, clicks) for specific keywords
        // Use for enriching keyword data with search volume
        if (!requestBody.keywords || !Array.isArray(requestBody.keywords)) {
          return new Response(
            JSON.stringify({ error: 'Keywords array is required for keyword.seo.metrics' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        endpoint = '/keyword.seo.metrics';
        // SISTRIX expects kw as JSON array for bulk requests: kw=["kw1","kw2"]
        params.append('kw', JSON.stringify(requestBody.keywords));
        params.append('country', country);
        console.log(`[keyword.seo.metrics] Requesting metrics for ${requestBody.keywords.length} keywords`);
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

      case 'keyword.seo.serpfeatures':
        // Get SERP features for keywords (including AI Overviews)
        // Costs: 1 credit per keyword
        if (!requestBody.keywords || !Array.isArray(requestBody.keywords)) {
          return new Response(
            JSON.stringify({ error: 'Keywords array is required for keyword.seo.serpfeatures' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        // SISTRIX serpfeatures only accepts single keywords, so we need to batch them
        const serpResults: any[] = [];
        for (const kw of requestBody.keywords) {
          const serpParams = new URLSearchParams();
          serpParams.append('api_key', SISTRIX_API_KEY);
          serpParams.append('format', 'json');
          serpParams.append('kw', kw);
          serpParams.append('country', country);
          serpParams.append('show-all-types', 'true');
          
          const serpUrl = `${SISTRIX_BASE_URL}/keyword.seo.serpfeatures?${serpParams.toString()}`;
          console.log(`[SERP Features] Fetching for keyword: ${kw}`);
          
          try {
            const serpResp = await fetch(serpUrl);
            const serpData = await serpResp.json();
            
            // Check for AI Overview in the response
            const features = serpData?.answer?.[0]?.['keyword.seo.serpfeatures'] || serpData?.answer?.[0]?.result || [];
            const hasAIO = features.some((f: any) => 
              f.type?.toLowerCase().includes('ai') || 
              f.type?.toLowerCase().includes('overview') ||
              f.type === 'aio' ||
              f.type === 'ai_overview' ||
              f.type === 'AI Overview'
            );
            
            serpResults.push({
              keyword: kw,
              hasAIO,
              features: features.map((f: any) => f.type || f)
            });
          } catch (e) {
            console.error(`[SERP Features] Error for ${kw}:`, e);
            serpResults.push({ keyword: kw, hasAIO: false, features: [] });
          }
        }
        
        return new Response(
          JSON.stringify({ answer: [{ serpfeatures: serpResults }] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

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

      case 'content-gap':
        // Content Gap Analysis: Find keywords competitors rank for but we don't
        // Strategy: Use local relaunch_url_mappings data + competitor top keywords
        if (!domain) {
          return new Response(
            JSON.stringify({ error: 'Domain is required for content-gap' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (!requestBody.competitorDomain) {
          return new Response(
            JSON.stringify({ error: 'competitorDomain is required for content-gap' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        console.log(`[Content Gap] Analyzing gap between ${domain} and ${requestBody.competitorDomain}`);
        
        // Fetch competitor's top-10 keywords using to_pos=10 filter
        const competitorParams = new URLSearchParams();
        competitorParams.append('api_key', SISTRIX_API_KEY);
        competitorParams.append('format', 'json');
        competitorParams.append('domain', requestBody.competitorDomain);
        competitorParams.append('country', country);
        competitorParams.append('mobile', 'false');
        competitorParams.append('to_pos', '10'); // Only positions 1-10
        competitorParams.append('limit', '100'); // Get up to 100 top-10 keywords
        
        const competitorUrl = `${SISTRIX_BASE_URL}/keyword.domain.seo?${competitorParams.toString()}`;
        console.log(`[Content Gap] API URL: ${competitorUrl.replace(SISTRIX_API_KEY, 'HIDDEN')}`);
        
        const competitorResp = await fetch(competitorUrl);
        const competitorData = await competitorResp.json();
        
        console.log(`[Content Gap] Response status: ${competitorResp.status}`);
        console.log(`[Content Gap] Response keys:`, Object.keys(competitorData || {}));
        console.log(`[Content Gap] Answer array length:`, competitorData?.answer?.length || 0);
        
        // Log first few items for debugging
        if (competitorData?.answer?.length > 0) {
          console.log(`[Content Gap] First 3 items:`, JSON.stringify(competitorData.answer.slice(0, 3)));
        }
        
        if (!competitorResp.ok) {
          console.error('[Content Gap] HTTP error:', competitorResp.status, competitorData);
          return new Response(
            JSON.stringify({ error: 'SISTRIX API request failed', status: competitorResp.status, details: competitorData }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (competitorData.status === 'error' || competitorData.error) {
          console.error('[Content Gap] SISTRIX error response:', competitorData);
          return new Response(
            JSON.stringify({ 
              error: competitorData.error_message || 'SISTRIX returned an error',
              details: competitorData 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Parse keywords from response - SISTRIX returns flat array of keyword objects
        const rawKeywords = competitorData?.answer || [];
        console.log(`[Content Gap] Processing ${rawKeywords.length} keywords`);
        
        const competitorKeywords = rawKeywords.map((item: any) => ({
          keyword: item.kw || item.keyword || '',
          position: parseInt(item.position) || 0,
          traffic: parseInt(item.traffic) || 0,
          competition: parseFloat(item.competition) || 0,
          competitorUrl: item.url || ''
        })).filter((kw: any) => kw.keyword); // Filter out empty keywords
        
        console.log(`[Content Gap] Processed ${competitorKeywords.length} valid keywords`);
        
        // Return competitor keywords for frontend comparison
        return new Response(
          JSON.stringify({ 
            answer: [{
              competitorDomain: requestBody.competitorDomain,
              keywords: competitorKeywords,
              rawCount: rawKeywords.length,
              analyzedAt: new Date().toISOString()
            }]
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

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

    // Log the raw response structure for debugging
    console.log(`SISTRIX API success: ${action}`);
    console.log(`Raw response keys: ${JSON.stringify(Object.keys(data))}`);
    if (action === 'credits') {
      console.log(`Credits response - data.credits: ${JSON.stringify(data.credits)}`);
      if (data.answer && data.answer[0]) {
        console.log(`Credits response - data.answer[0].credits: ${JSON.stringify(data.answer[0].credits)}`);
      }
    }
    if (data.answer && Array.isArray(data.answer)) {
      console.log(`Answer array length: ${data.answer.length}`);
      if (data.answer[0]) {
        console.log(`First answer keys: ${JSON.stringify(Object.keys(data.answer[0]))}`);
        console.log(`First answer sample: ${JSON.stringify(data.answer[0]).slice(0, 500)}`);
      }
    }
    
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
