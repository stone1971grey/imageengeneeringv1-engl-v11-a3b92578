import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SISTRIX_API_KEY = Deno.env.get('SISTRIX_API_KEY');
    if (!SISTRIX_API_KEY) {
      console.error('[SISTRIX Visibility] Missing API key');
      return new Response(
        JSON.stringify({ error: 'SISTRIX API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, domain, country = 'de', days = 30 } = await req.json();
    console.log('[SISTRIX Visibility] Request:', { action, domain, country, days });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'fetch') {
      // Fetch current visibility index from SISTRIX API
      const apiUrl = `https://api.sistrix.com/domain.sichtbarkeitsindex?api_key=${SISTRIX_API_KEY}&domain=${encodeURIComponent(domain)}&country=${country}&format=json`;
      
      console.log('[SISTRIX Visibility] Fetching from API for domain:', domain);
      
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`SISTRIX API error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[SISTRIX Visibility] API response:', JSON.stringify(data).substring(0, 500));
      
      // Parse visibility index from response
      // SISTRIX returns: { answer: [{ sichtbarkeitsindex: [{ value: 0.1234, date: "2024-01-01" }] }] }
      let visibilityIndex = 0;
      let date = new Date().toISOString().split('T')[0];
      
      if (data.answer && data.answer[0]) {
        const siData = data.answer[0].sichtbarkeitsindex || data.answer[0]['domain.sichtbarkeitsindex'];
        if (siData && siData[0]) {
          visibilityIndex = parseFloat(siData[0].value) || 0;
          date = siData[0].date || date;
        }
      }
      
      console.log('[SISTRIX Visibility] Parsed SI:', { visibilityIndex, date });
      
      // Store in database
      const { error: insertError } = await supabase
        .from('sistrix_visibility_history')
        .upsert({
          domain,
          country,
          visibility_index: visibilityIndex,
          recorded_at: date
        }, {
          onConflict: 'domain,country,recorded_at'
        });
      
      if (insertError) {
        console.error('[SISTRIX Visibility] Insert error:', insertError);
      } else {
        console.log('[SISTRIX Visibility] Stored successfully');
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          visibilityIndex,
          date,
          domain,
          country
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (action === 'history') {
      // Get historical data from database
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data: history, error } = await supabase
        .from('sistrix_visibility_history')
        .select('visibility_index, recorded_at')
        .eq('domain', domain)
        .eq('country', country)
        .gte('recorded_at', startDate.toISOString().split('T')[0])
        .order('recorded_at', { ascending: true });
      
      if (error) {
        console.error('[SISTRIX Visibility] History query error:', error);
        throw error;
      }
      
      console.log('[SISTRIX Visibility] Found', history?.length || 0, 'history entries');
      
      // Calculate trend
      let trend = 0;
      let trendPercent = 0;
      if (history && history.length >= 2) {
        const first = parseFloat(history[0].visibility_index);
        const last = parseFloat(history[history.length - 1].visibility_index);
        trend = last - first;
        trendPercent = first > 0 ? ((last - first) / first) * 100 : 0;
      }
      
      return new Response(
        JSON.stringify({ 
          success: true,
          history: history || [],
          trend,
          trendPercent,
          domain,
          country
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Invalid action. Use "fetch" or "history"' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[SISTRIX Visibility] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});