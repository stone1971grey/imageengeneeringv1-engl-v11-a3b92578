import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SISTRIX_BASE_URL = 'https://api.sistrix.com';
const FIXED_DOMAIN = 'image-engineering.de';
const RANKING_LOSS_THRESHOLD = 10; // Alert if position drops by more than 10

interface RankingData {
  url: string;
  keyword: string;
  position: number;
  traffic: number;
  cpc: number;
  competition: number;
  searchVolume: number;
}

interface RankingAlert {
  keyword: string;
  old_url: string;
  old_position: number;
  new_position: number;
  position_change: number;
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

    // Step 1: Fetch current rankings from SISTRIX
    console.log('Step 1: Fetching rankings from SISTRIX...');
    const params = new URLSearchParams();
    params.append('api_key', SISTRIX_API_KEY);
    params.append('format', 'json');
    params.append('domain', FIXED_DOMAIN);
    params.append('country', 'de');
    params.append('limit', '1000'); // Get more keywords for comprehensive analysis

    const sistrixResponse = await fetch(`${SISTRIX_BASE_URL}/domain.ranking?${params.toString()}`);
    const sistrixData = await sistrixResponse.json();

    if (!sistrixResponse.ok || sistrixData.status === 'error') {
      console.error('SISTRIX API error:', sistrixData);
      return new Response(
        JSON.stringify({ error: 'SISTRIX API error', details: sistrixData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rankings: RankingData[] = sistrixData.answer?.[0]?.ranking || [];
    console.log(`Fetched ${rankings.length} rankings from SISTRIX`);

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
    const previousPositions = new Map<string, { position: number; old_url: string }>();
    if (previousData) {
      for (const row of previousData) {
        if (row.focus_keyword && !previousPositions.has(row.focus_keyword)) {
          previousPositions.set(row.focus_keyword, {
            position: row.current_position || 100,
            old_url: row.old_url
          });
        }
      }
    }
    console.log(`Previous snapshot has ${previousPositions.size} keywords`);

    // Step 3: Process rankings and detect alerts
    console.log('Step 3: Processing rankings and detecting alerts...');
    const alerts: RankingAlert[] = [];
    const today = new Date().toISOString().split('T')[0];
    const newMappings: any[] = [];

    for (const ranking of rankings) {
      const keyword = ranking.keyword;
      const newPosition = ranking.position;
      const url = ranking.url;

      // Check if this keyword had a previous ranking
      const previous = previousPositions.get(keyword);
      let trend = 'stable';
      let positionChange = 0;

      if (previous) {
        positionChange = newPosition - previous.position;
        if (positionChange > RANKING_LOSS_THRESHOLD) {
          // Position increased = ranking dropped
          trend = 'down';
          alerts.push({
            keyword,
            old_url: previous.old_url,
            old_position: previous.position,
            new_position: newPosition,
            position_change: positionChange
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
        search_volume: ranking.searchVolume || null,
        traffic_estimate: ranking.traffic || null,
        cpc: ranking.cpc || null,
        competition: ranking.competition || null,
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
      console.log(`Detected ${alerts.length} significant ranking changes (> ${RANKING_LOSS_THRESHOLD} positions):`);
      alerts.slice(0, 10).forEach(alert => {
        console.log(`  - "${alert.keyword}": ${alert.old_position} → ${alert.new_position} (${alert.position_change > 0 ? '-' : '+'}${Math.abs(alert.position_change)})`);
      });
      // TODO: Implement notification system (email, dashboard alerts, etc.) when requirements are defined
    } else {
      console.log('No significant ranking changes detected');
    }

    // Step 6: Summary
    const summary = {
      success: true,
      domain: FIXED_DOMAIN,
      snapshot_date: today,
      rankings_fetched: rankings.length,
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
