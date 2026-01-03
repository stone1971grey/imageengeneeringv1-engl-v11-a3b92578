import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

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
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
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

    // Step 5: Send email alerts if there are significant ranking drops
    if (alerts.length > 0 && RESEND_API_KEY) {
      console.log('Step 5: Sending email alerts...');
      const resend = new Resend(RESEND_API_KEY);

      const alertHtml = `
        <h1>⚠️ SEO Ranking Alert - ${FIXED_DOMAIN}</h1>
        <p>Die folgenden Keywords haben mehr als ${RANKING_LOSS_THRESHOLD} Positionen verloren:</p>
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
          <tr style="background-color: #f0f0f0;">
            <th>Keyword</th>
            <th>Alte Position</th>
            <th>Neue Position</th>
            <th>Verlust</th>
            <th>URL</th>
          </tr>
          ${alerts.slice(0, 20).map(alert => `
            <tr>
              <td><strong>${alert.keyword}</strong></td>
              <td style="text-align: center;">${alert.old_position}</td>
              <td style="text-align: center; color: red;">${alert.new_position}</td>
              <td style="text-align: center; color: red;">-${alert.position_change}</td>
              <td style="font-size: 12px;">${alert.old_url}</td>
            </tr>
          `).join('')}
        </table>
        ${alerts.length > 20 ? `<p><em>... und ${alerts.length - 20} weitere Alerts</em></p>` : ''}
        <p style="margin-top: 20px;">
          <a href="https://preview--imageengeneeringv1-engl-v11.lovable.app/en/admin-dashboard" style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Zum Relaunch Dashboard
          </a>
        </p>
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          Dieser Report wurde automatisch am ${today} generiert.
        </p>
      `;

      try {
        // Get admin emails from profiles
        const { data: admins } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin');

        const adminEmails: string[] = [];
        if (admins && admins.length > 0) {
          for (const admin of admins) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('email')
              .eq('id', admin.user_id)
              .single();
            if (profile?.email) {
              adminEmails.push(profile.email);
            }
          }
        }

        // Fallback to a default email if no admins found
        const recipients = adminEmails.length > 0 ? adminEmails : ['admin@image-engineering.de'];

        const emailResponse = await resend.emails.send({
          from: 'SEO Alert <onboarding@resend.dev>',
          to: recipients,
          subject: `⚠️ SEO Alert: ${alerts.length} Ranking-Verluste für ${FIXED_DOMAIN}`,
          html: alertHtml,
        });

        console.log('Email sent successfully:', emailResponse);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    } else if (alerts.length > 0 && !RESEND_API_KEY) {
      console.log('Alerts detected but RESEND_API_KEY not configured - skipping email');
    } else {
      console.log('No significant ranking drops detected - no email sent');
    }

    // Step 6: Summary
    const summary = {
      success: true,
      domain: FIXED_DOMAIN,
      snapshot_date: today,
      rankings_fetched: rankings.length,
      records_updated: upsertedCount,
      alerts_count: alerts.length,
      alerts: alerts.slice(0, 10), // Include first 10 alerts in response
      email_sent: alerts.length > 0 && !!RESEND_API_KEY
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
