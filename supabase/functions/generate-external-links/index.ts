import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { pageSlug, focusKeyword, language = 'en' } = await req.json();

    if (!pageSlug) {
      throw new Error('Page slug is required');
    }

    console.log('[External Links] Analyzing page:', pageSlug, 'language:', language, 'focusKeyword:', focusKeyword);

    // Get text content from the current page segments
    const { data: contentData, error: contentError } = await supabase
      .from('page_content')
      .select('section_key, content_type, content_value')
      .eq('page_slug', pageSlug)
      .eq('language', language);

    if (contentError) {
      console.error('[External Links] Error fetching content:', contentError);
    }

    // Get segment registry to map segment keys to IDs
    const { data: segmentRegistryData, error: segRegError } = await supabase
      .from('segment_registry')
      .select('segment_key, segment_id, segment_type')
      .eq('page_slug', pageSlug)
      .eq('deleted', false);

    if (segRegError) {
      console.error('[External Links] Error fetching segment registry:', segRegError);
    }

    // Create a map of segment_key to segment_id
    const segmentKeyToIdMap: Record<string, number> = {};
    const segmentKeyToTypeMap: Record<string, string> = {};
    if (segmentRegistryData) {
      for (const seg of segmentRegistryData) {
        segmentKeyToIdMap[seg.segment_key] = seg.segment_id;
        segmentKeyToTypeMap[seg.segment_key] = seg.segment_type;
      }
    }

    // Create a map from internal segment id (from page_segments array) to real segment_id from registry
    // The page_segments array uses internal IDs, but we need the real segment_id from segment_registry
    const internalIdToRealIdMap: Record<string, number> = {};
    if (segmentRegistryData) {
      for (const seg of segmentRegistryData) {
        // segment_key format is "segment-{internal_id}" - extract internal_id
        const match = seg.segment_key.match(/^segment-(\d+)$/);
        if (match) {
          internalIdToRealIdMap[match[1]] = seg.segment_id;
        }
      }
    }

    // Extract text content from segments for analysis
    const textSegments: Array<{ key: string; text: string; type: string; field: string; segmentId?: number }> = [];

    if (contentData) {
      for (const item of contentData) {
        // Parse page_segments JSON array to extract text from all segments
        if (item.section_key === 'page_segments') {
          try {
            const pageSegments = JSON.parse(item.content_value);
            if (Array.isArray(pageSegments)) {
              for (const seg of pageSegments) {
                const internalId = String(seg.id);
                const segType = seg.type;
                const segData = seg.data || {};
                
                // Get the REAL segment_id from registry, not the internal page_segments id
                const realSegmentId = internalIdToRealIdMap[internalId] || segmentKeyToIdMap[`segment-${internalId}`];
                
                // Extract text from common text fields
                const textFields = ['description', 'text', 'content', 'subtitle', 'introText'];
                for (const field of textFields) {
                  if (segData[field] && typeof segData[field] === 'string') {
                    const plainText = segData[field].replace(/<[^>]*>/g, '');
                    if (plainText.length > 20) {
                      textSegments.push({
                        key: `segment-${internalId}`,
                        text: plainText,
                        type: segType,
                        field: field,
                        segmentId: realSegmentId
                      });
                    }
                  }
                }
              }
            }
          } catch (e) {
            console.error('[External Links] Error parsing page_segments:', e);
          }
        }
        // Handle individual segment entries
        else if (item.section_key.startsWith('segment-')) {
          try {
            const segData = JSON.parse(item.content_value);
            const textFields = ['description', 'text', 'content', 'subtitle', 'introText'];
            for (const field of textFields) {
              if (segData[field] && typeof segData[field] === 'string') {
                const plainText = segData[field].replace(/<[^>]*>/g, '');
                if (plainText.length > 20) {
                  textSegments.push({
                    key: item.section_key,
                    text: plainText,
                    type: segmentKeyToTypeMap[item.section_key] || 'unknown',
                    field: field,
                    segmentId: segmentKeyToIdMap[item.section_key]
                  });
                }
              }
            }
          } catch (e) {
            // Non-JSON content
          }
        }
      }
    }

    console.log('[External Links] Found', textSegments.length, 'text segments to analyze');

    if (textSegments.length === 0) {
      return new Response(JSON.stringify({ 
        suggestions: [],
        analyzedSegments: 0,
        message: 'No text content found on this page.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validSegmentKeys = textSegments.map(s => s.key);

    // CRITICAL: System prompt with strict competitor exclusion rules
    const systemPrompt = `You are an SEO expert analyzing content to suggest EXTERNAL links to authoritative, neutral sources.

TASK: Analyze the page content and suggest external links to high-quality, neutral external resources.

=== CRITICAL EXCLUSION RULES - NEVER VIOLATE ===
You must NEVER suggest links to:
1. COMPETITORS/MARKET RIVALS - Any company that sells similar products or services
   - Camera testing equipment manufacturers
   - Image quality testing companies
   - Optical measurement device providers
   - Test chart manufacturers
   - Any commercial testing solution providers
   
2. COMMERCIAL SITES selling products in the same market
3. VENDOR/SUPPLIER SITES that could appear as alternatives
4. COMPANY BLOGS from competitors
5. PRODUCT PAGES from any commercial entity in the industry

=== ALLOWED SOURCES (WHITELIST) ===
ONLY suggest links to these types of sources:
1. ACADEMIC/RESEARCH: University websites, research papers, academic journals
   - Examples: ieee.org, acm.org, university.edu domains
   
2. STANDARDS ORGANIZATIONS: Official standards bodies
   - Examples: iso.org, iec.ch, din.de, nist.gov
   
3. KNOWLEDGE BASES: Neutral educational resources
   - Examples: Wikipedia, Scholarpedia, educational .edu sites
   
4. GOVERNMENT/INSTITUTIONAL: Official government or institutional resources
   - Examples: .gov domains, national institutes
   
5. TECHNICAL DOCUMENTATION: Open-source or non-commercial technical docs
   - Examples: W3C specs, IETF RFCs, open standards documentation

=== SEGMENTS AVAILABLE ===
${textSegments.map(s => `- Key: "${s.key}" | Type: ${s.type} | Field: ${s.field} | Content: "${s.text.substring(0, 300)}..."`).join('\n')}

=== RESPONSE FORMAT ===
Return ONLY a JSON array with suggestions:
[
  {
    "anchorText": "exact text phrase from segment content",
    "targetUrl": "https://neutral-authoritative-source.org/page",
    "targetTitle": "Descriptive title of the external resource",
    "segmentKey": "exact_segment_key_from_list",
    "segmentType": "segment type",
    "reason": "Why this neutral source adds value (mention it's NOT a competitor)",
    "sourceType": "academic|standards|knowledge|government|technical",
    "priority": 1
  }
]

=== VALIDATION RULES ===
- anchorText MUST be EXACT text found in the segment
- segmentKey MUST be from: ${JSON.stringify(validSegmentKeys)}
- targetUrl MUST be a real, authoritative URL
- Maximum 3 suggestions
- Priority 1 = most important
- If no safe, neutral sources exist, return empty array []
- WHEN IN DOUBT, DO NOT SUGGEST - safety first!`;

    const userPrompt = `Analyze this page and suggest external links to NEUTRAL, AUTHORITATIVE sources only.

PAGE: ${pageSlug}
FOCUS KEYWORD: ${focusKeyword || 'not defined'}
INDUSTRY: Camera and image testing equipment, optical measurement devices

Find exact text phrases that could benefit from external links to:
- Academic papers or research
- Industry standards (ISO, IEEE, etc.)
- Wikipedia or educational resources
- Government/institutional sources

REMEMBER: NEVER link to any commercial competitor or market rival. Only neutral, educational sources.`;

    console.log('[External Links] Calling AI for suggestions...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3, // Lower temperature for more conservative suggestions
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again in a moment.',
          suggestions: []
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI credits exhausted. Please add credits to continue.',
          suggestions: []
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('[External Links] AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('[External Links] Raw AI response:', content);

    // Parse JSON from response
    let suggestions = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found in response');
      }
    } catch (parseError) {
      console.error('[External Links] Failed to parse AI response:', parseError);
      return new Response(JSON.stringify({ 
        suggestions: [],
        error: 'Failed to parse AI suggestions'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate suggestions - ensure they meet safety criteria
    const validatedSuggestions = suggestions
      .filter((s: any) => {
        // Must have required fields
        if (!s.anchorText || !s.targetUrl || !s.segmentKey) return false;
        
        // segmentKey must be valid
        if (!validSegmentKeys.includes(s.segmentKey)) {
          console.log('[External Links] Invalid segment key:', s.segmentKey);
          return false;
        }
        
        // URL safety checks - block common commercial domains
        const blockedDomains = [
          'amazon', 'ebay', 'alibaba', 'aliexpress',
          'imatest', 'dxomark', 'dxo',
          'basler', 'flir', 'teledyne', 'ximea',
          'stemmer', 'edmund', 'thorlabs',
          'radiant', 'konica', 'minolta',
          '.shop', '.store', '.buy'
        ];
        
        const urlLower = s.targetUrl.toLowerCase();
        for (const blocked of blockedDomains) {
          if (urlLower.includes(blocked)) {
            console.log('[External Links] Blocked commercial domain:', s.targetUrl);
            return false;
          }
        }
        
        return true;
      })
      .map((s: any) => ({
        anchorText: s.anchorText,
        targetUrl: s.targetUrl,
        targetTitle: s.targetTitle || s.targetUrl,
        segmentKey: s.segmentKey,
        segmentId: segmentKeyToIdMap[s.segmentKey] || null,
        segmentType: s.segmentType || segmentKeyToTypeMap[s.segmentKey] || 'unknown',
        reason: s.reason || '',
        sourceType: s.sourceType || 'knowledge',
        priority: s.priority || 1
      }))
      .sort((a: any, b: any) => a.priority - b.priority)
      .slice(0, 3); // Maximum 3 suggestions

    console.log('[External Links] Validated suggestions:', validatedSuggestions.length);

    return new Response(JSON.stringify({ 
      suggestions: validatedSuggestions,
      analyzedSegments: textSegments.length,
      message: validatedSuggestions.length === 0 
        ? 'No suitable external link opportunities found. External links must be to neutral, authoritative sources only.'
        : `Found ${validatedSuggestions.length} external link suggestion(s) to authoritative sources.`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[External Links] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      suggestions: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
