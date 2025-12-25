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

    const { pageSlug, pageContent, focusKeyword, language = 'en' } = await req.json();

    if (!pageSlug) {
      throw new Error('Page slug is required');
    }

    console.log('[Internal Links] Analyzing page:', pageSlug, 'language:', language);

    // Get all available pages from page_registry
    const { data: allPages, error: pagesError } = await supabase
      .from('page_registry')
      .select('page_slug, page_title, flyout_description, parent_slug')
      .neq('page_slug', pageSlug);

    if (pagesError) {
      console.error('[Internal Links] Error fetching pages:', pagesError);
      throw new Error('Failed to fetch available pages');
    }

    console.log('[Internal Links] Found', allPages?.length || 0, 'potential link targets');

    // Get text content from the current page segments
    const { data: contentData, error: contentError } = await supabase
      .from('page_content')
      .select('section_key, content_type, content_value')
      .eq('page_slug', pageSlug)
      .eq('language', language);

    if (contentError) {
      console.error('[Internal Links] Error fetching content:', contentError);
    }

    // Extract text content from segments for analysis
    let textContent = '';
    const textSegments: Array<{ key: string; text: string; type: string }> = [];

    if (contentData) {
      for (const item of contentData) {
        // Skip non-text content
        if (item.section_key === 'page_segments' || item.section_key === 'seo') continue;

        try {
          const parsed = JSON.parse(item.content_value);
          
          // Extract text from different segment types
          if (parsed.introText) {
            textSegments.push({ 
              key: item.section_key, 
              text: parsed.introText.replace(/<[^>]*>/g, ''), 
              type: 'intro' 
            });
            textContent += parsed.introText.replace(/<[^>]*>/g, '') + '\n';
          }
          if (parsed.description) {
            textSegments.push({ 
              key: item.section_key, 
              text: parsed.description.replace(/<[^>]*>/g, ''), 
              type: 'description' 
            });
            textContent += parsed.description.replace(/<[^>]*>/g, '') + '\n';
          }
          if (parsed.subtitle) {
            textSegments.push({ 
              key: item.section_key, 
              text: parsed.subtitle, 
              type: 'subtitle' 
            });
            textContent += parsed.subtitle + '\n';
          }
        } catch (e) {
          // Not JSON, might be plain text
          if (typeof item.content_value === 'string' && item.content_value.length > 20) {
            textSegments.push({ 
              key: item.section_key, 
              text: item.content_value.replace(/<[^>]*>/g, ''), 
              type: 'text' 
            });
            textContent += item.content_value.replace(/<[^>]*>/g, '') + '\n';
          }
        }
      }
    }

    console.log('[Internal Links] Found', textSegments.length, 'text segments to analyze');

    // Build available pages context for AI
    const pagesContext = (allPages || []).map(p => ({
      slug: p.page_slug,
      title: p.page_title,
      description: p.flyout_description || '',
      parent: p.parent_slug || ''
    }));

    const systemPrompt = `You are an SEO expert analyzing content to suggest internal links.

TASK: Analyze the page content and suggest 3-5 internal links that would:
1. Improve user navigation and experience
2. Distribute link equity to important pages
3. Connect topically related content
4. Use natural anchor text (not "click here" or "read more")

AVAILABLE PAGES TO LINK TO:
${JSON.stringify(pagesContext, null, 2)}

RESPONSE FORMAT:
Return ONLY a JSON array with link suggestions:
[
  {
    "anchorText": "exact text from content to turn into a link",
    "targetSlug": "target-page-slug",
    "targetTitle": "Target Page Title",
    "segmentKey": "segment_key_where_text_appears",
    "reason": "Brief explanation why this link makes sense",
    "priority": 1
  }
]

RULES:
- anchorText must be EXACT text that exists in the content
- Only suggest links where there's topical relevance
- Prefer linking to pages with related topics
- Don't suggest links if no good matches exist
- Maximum 5 suggestions, minimum 0 if no good matches
- Priority 1 = most important link`;

    const userPrompt = `Analyze this page content and suggest internal links:

PAGE: ${pageSlug}
FOCUS KEYWORD: ${focusKeyword || 'not defined'}

TEXT SEGMENTS:
${textSegments.map(s => `[${s.key}] (${s.type}): ${s.text.substring(0, 500)}`).join('\n\n')}

Suggest internal links to relevant pages from the available pages list. Return only the JSON array.`;

    console.log('[Internal Links] Calling AI for link suggestions...');

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
        temperature: 0.5,
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
      console.error('[Internal Links] AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('[Internal Links] Raw AI response:', content);

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
      console.error('[Internal Links] Failed to parse AI response:', parseError);
      return new Response(JSON.stringify({ 
        suggestions: [],
        error: 'Failed to parse AI suggestions'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate and enrich suggestions with existence check
    const existingSlugs = new Set((allPages || []).map(p => p.page_slug));
    
    const validSuggestions = suggestions
      .filter((s: any) => s.anchorText && s.targetSlug && s.segmentKey)
      .map((s: any, index: number) => {
        const exists = existingSlugs.has(s.targetSlug);
        return {
          anchorText: s.anchorText.trim(),
          targetSlug: s.targetSlug,
          targetTitle: s.targetTitle || s.targetSlug,
          segmentKey: s.segmentKey,
          reason: s.reason || 'Topically related content',
          priority: s.priority || index + 1,
          targetExists: exists
        };
      })
      .sort((a: any, b: any) => a.priority - b.priority)
      .slice(0, 5);

    console.log('[Internal Links] Generated suggestions:', validSuggestions);

    return new Response(JSON.stringify({ 
      suggestions: validSuggestions,
      analyzedSegments: textSegments.length,
      availablePages: allPages?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Internal Links] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      suggestions: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
