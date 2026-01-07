import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SISTRIX_BASE_URL = 'https://api.sistrix.com';
const DOMAINS_TO_TRACK = [
  { domain: 'image-engineering.de', country: 'de' },
  { domain: 'image-engineering.de', country: 'us' },
];

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SISTRIX_API_KEY = Deno.env.get('SISTRIX_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SISTRIX_API_KEY) {
      console.error('SISTRIX_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'SISTRIX_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Supabase credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const results: { domain: string; country: string; visibilityIndex: number; success: boolean; error?: string }[] = [];

    for (const config of DOMAINS_TO_TRACK) {
      try {
        console.log(`[Visibility Update] Fetching SI for ${config.domain} (${config.country})`);
        
        // Fetch visibility index from SISTRIX
        const params = new URLSearchParams();
        params.append('api_key', SISTRIX_API_KEY);
        params.append('format', 'json');
        params.append('domain', config.domain);
        params.append('country', config.country);
        
        const response = await fetch(`${SISTRIX_BASE_URL}/domain.visibilityindex?${params.toString()}`);
        const data = await response.json();
        
        if (!response.ok || data.status === 'error') {
          console.error(`[Visibility Update] SISTRIX error for ${config.domain}:`, data);
          results.push({ 
            ...config, 
            visibilityIndex: 0, 
            success: false, 
            error: data.error_message || 'API error' 
          });
          continue;
        }
        
        // Extract visibility index value
        const answer = data?.answer || [];
        let visibilityIndex = 0;
        
        if (answer.length > 0 && answer[0].value !== undefined) {
          visibilityIndex = parseFloat(answer[0].value) || 0;
        }
        
        console.log(`[Visibility Update] ${config.domain} (${config.country}): SI = ${visibilityIndex}`);
        
        // Insert into database
        const { error: insertError } = await supabase
          .from('sistrix_visibility_history')
          .insert({
            domain: config.domain,
            country: config.country,
            visibility_index: visibilityIndex,
            recorded_at: new Date().toISOString()
          });
        
        if (insertError) {
          console.error(`[Visibility Update] DB insert error for ${config.domain}:`, insertError);
          results.push({ ...config, visibilityIndex, success: false, error: insertError.message });
        } else {
          results.push({ ...config, visibilityIndex, success: true });
        }
        
      } catch (e) {
        console.error(`[Visibility Update] Error for ${config.domain}:`, e);
        results.push({ 
          ...config, 
          visibilityIndex: 0, 
          success: false, 
          error: e instanceof Error ? e.message : 'Unknown error' 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`[Visibility Update] Completed: ${successCount}/${results.length} successful`);

    return new Response(
      JSON.stringify({ 
        success: successCount === results.length,
        updated: successCount,
        total: results.length,
        results,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Visibility Update] Fatal error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
