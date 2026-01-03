import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SISTRIX_BASE_URL = 'https://api.sistrix.com';
const FIXED_DOMAIN = 'image-engineering.de';
const TOP10_LOSS_THRESHOLD = 5; // Alert if URL loses 5+ top10 keywords

interface KeywordData {
  kw: string;
  keyword?: string;
  url: string;
  position: number;
  traffic: number;
  competition: number;
}

interface RankingAlert {
  keyword: string;
  url: string;
  old_position: number;
  new_position: number;
  change: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== SISTRIX CRON SNAPSHOT STARTED ===');
    console.log(`Time: ${new Date().toISOString()}`);
    console.log(`Domain: ${FIXED_DOMAIN}`);

    const SISTRIX_API_KEY = Deno.env.get('SISTRIX_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SISTRIX_API_KEY) {
      console.error('SISTRIX_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'SISTRIX API key not configured' }),
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

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Step 1: Fetch keyword rankings from SISTRIX using keyword.domain.seo
    console.log('Step 1: Fetching keyword rankings from SISTRIX...');
    const params = new URLSearchParams();
    params.append('api_key', SISTRIX_API_KEY);
    params.append('format', 'json');
    params.append('domain', FIXED_DOMAIN);
    params.append('country', 'de');
    params.append('limit', '500'); // Get top 500 keywords

    const sistrixResponse = await fetch(`${SISTRIX_BASE_URL}/keyword.domain.seo?${params.toString()}`);
    const sistrixData = await sistrixResponse.json();

    // Log raw SISTRIX response for debugging
    console.log('SISTRIX raw response status:', sistrixResponse.status);
    console.log('SISTRIX raw response:', JSON.stringify(sistrixData).slice(0, 500));

    if (!sistrixResponse.ok || sistrixData.status === 'error' || sistrixData.status === 'fail') {
      console.error('SISTRIX API error:', sistrixData);
      return new Response(
        JSON.stringify({ error: 'SISTRIX API error', details: sistrixData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // keyword.domain.seo returns array with: kw, position, competition, traffic, url
    const keywordData: KeywordData[] = sistrixData.answer?.[0]?.['keyword.domain.seo'] || sistrixData.answer || [];
    console.log(`Fetched ${keywordData.length} keywords from SISTRIX`);

    // Step 2: Get previous snapshot data to compare
    console.log('Step 2: Fetching previous snapshot for comparison...');
    const { data: previousData, error: prevError } = await supabase
      .from('relaunch_url_mappings')
      .select('*')
      .eq('domain', FIXED_DOMAIN)
      .order('snapshot_date', { ascending: false });

    if (prevError) {
      console.error('Error fetching previous data:', prevError);
    }

    // Create a map of previous positions by keyword
    const previousPositions = new Map<string, { position: number; url: string }>();
    if (previousData) {
      for (const row of previousData) {
        if (row.focus_keyword && !previousPositions.has(row.focus_keyword)) {
          previousPositions.set(row.focus_keyword, {
            position: row.current_position || 100,
            url: row.old_url
          });
        }
      }
    }
    console.log(`Previous snapshot has ${previousPositions.size} keywords`);

    // Step 3: Process keyword data and detect changes
    console.log('Step 3: Processing keyword data and detecting changes...');
    const alerts: RankingAlert[] = [];
    const today = new Date().toISOString().split('T')[0];
    const newMappings: any[] = [];

    for (const item of keywordData) {
      const keyword = item.kw || item.keyword || '';
      const url = item.url || '';
      const newPosition = parseInt(String(item.position)) || 100;
      const traffic = parseInt(String(item.traffic)) || 0;
      const competition = parseFloat(String(item.competition)) || 0;

      // Check if this keyword had previous data
      const previous = previousPositions.get(keyword);
      let trend = 'stable';

      if (previous) {
        const positionChange = newPosition - previous.position; // Positive = dropped in ranking
        if (positionChange > 10) {
          // Dropped more than 10 positions
          trend = 'down';
          alerts.push({
            keyword,
            url,
            old_position: previous.position,
            new_position: newPosition,
            change: positionChange
          });
          console.log(`ALERT: "${keyword}" dropped from ${previous.position} to ${newPosition} (-${positionChange} positions)`);
        } else if (positionChange < -3) {
          trend = 'up';
        }
      } else {
        trend = 'new';
      }

      // Prepare new mapping entry
      newMappings.push({
        domain: FIXED_DOMAIN,
        old_url: url,
        focus_keyword: keyword,
        current_position: newPosition,
        search_volume: null,
        traffic_estimate: traffic,
        cpc: null,
        competition,
        snapshot_date: today,
        trend,
        approval_status: 'pending'
      });
    }

    console.log(`Detected ${alerts.length} ranking drop alerts`);
    console.log(`Prepared ${newMappings.length} new mappings`);

    // Step 4: Upsert new data (update existing or insert new)
    console.log('Step 4: Updating database...');
    
    // For simplicity, we'll update existing entries by old_url+domain, or insert new ones
    let upsertedCount = 0;
    let errorCount = 0;

    for (const mapping of newMappings) {
      const { data, error } = await supabase
        .from('relaunch_url_mappings')
        .upsert(
          {
            ...mapping,
          },
          {
            onConflict: 'domain,old_url',
            ignoreDuplicates: false
          }
        );

      if (error) {
        // If upsert fails (no unique constraint), try insert
        const { error: insertError } = await supabase
          .from('relaunch_url_mappings')
          .insert(mapping);
        
        if (insertError) {
          errorCount++;
          if (errorCount <= 3) {
            console.error('Insert error:', insertError);
          }
        } else {
          upsertedCount++;
        }
      } else {
        upsertedCount++;
      }
    }

    console.log(`Database update: ${upsertedCount} records upserted, ${errorCount} errors`);

    // Step 5: Log alerts for future notification implementation
    if (alerts.length > 0) {
      console.log(`Detected ${alerts.length} keywords with significant ranking drops:`);
      alerts.slice(0, 10).forEach(alert => {
        console.log(`  - "${alert.keyword}": ${alert.old_position} → ${alert.new_position} (dropped ${alert.change} positions)`);
      });
      // TODO: Implement notification system (email, dashboard alerts, etc.) when requirements are defined
    } else {
      console.log('No significant changes detected');
    }

    // Step 6: Summary
    const summary = {
      success: true,
      domain: FIXED_DOMAIN,
      snapshot_date: today,
      keywords_fetched: keywordData.length,
      records_updated: upsertedCount,
      alerts_count: alerts.length,
      alerts: alerts.slice(0, 10) // Include first 10 alerts in response
    };

    console.log('=== SISTRIX CRON SNAPSHOT COMPLETED ===');
    console.log(`Summary: ${JSON.stringify(summary)}`);

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('SISTRIX CRON error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
