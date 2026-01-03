import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SISTRIX_BASE_URL = 'https://api.sistrix.com';
const FIXED_DOMAIN = 'image-engineering.de';
const TOP10_LOSS_THRESHOLD = 5; // Alert if URL loses 5+ top10 keywords

interface UrlData {
  url: string;
  top10: number;
  top100: number;
  visibilityShare: number;
}

interface RankingAlert {
  url: string;
  old_top10: number;
  new_top10: number;
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

    // Step 1: Fetch current URL data from SISTRIX using domain.urls
    console.log('Step 1: Fetching URLs from SISTRIX...');
    const params = new URLSearchParams();
    params.append('api_key', SISTRIX_API_KEY);
    params.append('format', 'json');
    params.append('domain', FIXED_DOMAIN);
    params.append('country', 'de');
    params.append('limit', '500'); // Get top 500 URLs

    const sistrixResponse = await fetch(`${SISTRIX_BASE_URL}/domain.urls?${params.toString()}`);
    const sistrixData = await sistrixResponse.json();

    if (!sistrixResponse.ok || sistrixData.status === 'error') {
      console.error('SISTRIX API error:', sistrixData);
      return new Response(
        JSON.stringify({ error: 'SISTRIX API error', details: sistrixData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const urlData: UrlData[] = sistrixData.answer?.[0]?.url || [];
    console.log(`Fetched ${urlData.length} URLs from SISTRIX`);

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

    // Create a map of previous top10 counts by URL
    const previousTop10 = new Map<string, number>();
    if (previousData) {
      for (const row of previousData) {
        if (row.old_url && !previousTop10.has(row.old_url)) {
          previousTop10.set(row.old_url, row.traffic_estimate || 0);
        }
      }
    }
    console.log(`Previous snapshot has ${previousTop10.size} URLs`);

    // Step 3: Process URL data and detect changes
    console.log('Step 3: Processing URL data and detecting changes...');
    const alerts: RankingAlert[] = [];
    const today = new Date().toISOString().split('T')[0];
    const newMappings: any[] = [];

    for (const item of urlData) {
      const url = item.url;
      const newTop10 = parseInt(String(item.top10)) || 0;
      const top100 = parseInt(String(item.top100)) || 0;
      const visibilityShare = parseFloat(String(item.visibilityShare)) || 0;

      // Check if this URL had previous data
      const previousCount = previousTop10.get(url);
      let trend = 'stable';

      if (previousCount !== undefined) {
        const change = previousCount - newTop10; // Positive = lost keywords
        if (change >= 5) {
          // Lost 5+ top10 keywords
          trend = 'down';
          alerts.push({
            url,
            old_top10: previousCount,
            new_top10: newTop10,
            change
          });
          console.log(`ALERT: "${url}" lost ${change} top10 keywords (${previousCount} → ${newTop10})`);
        } else if (change <= -3) {
          trend = 'up';
        }
      } else {
        trend = 'new';
      }

      // Prepare new mapping entry
      newMappings.push({
        domain: FIXED_DOMAIN,
        old_url: url,
        focus_keyword: null, // domain.urls doesn't provide keywords
        current_position: null,
        search_volume: null,
        traffic_estimate: newTop10, // Use top10 count as indicator
        cpc: null,
        competition: null,
        snapshot_date: today,
        trend,
        approval_status: 'pending',
        notes: `Top10: ${newTop10}, Top100: ${top100}, Visibility: ${visibilityShare}%`
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
      console.log(`Detected ${alerts.length} URLs with significant top10 keyword losses:`);
      alerts.slice(0, 10).forEach(alert => {
        console.log(`  - "${alert.url}": ${alert.old_top10} → ${alert.new_top10} top10 keywords (lost ${alert.change})`);
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
      urls_fetched: urlData.length,
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
