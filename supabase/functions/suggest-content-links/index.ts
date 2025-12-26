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

    console.log('[Content Links] Analyzing page for potential content:', pageSlug, 'language:', language);

    // Get all available pages from page_registry
    const { data: allPages, error: pagesError } = await supabase
      .from('page_registry')
      .select('page_slug, page_title, flyout_description, parent_slug')
      .neq('page_slug', pageSlug);

    if (pagesError) {
      console.error('[Content Links] Error fetching pages:', pagesError);
      throw new Error('Failed to fetch available pages');
    }

    // Get current page info
    const { data: currentPage, error: currentError } = await supabase
      .from('page_registry')
      .select('page_slug, page_title, parent_slug')
      .eq('page_slug', pageSlug)
      .single();

    if (currentError) {
      console.error('[Content Links] Error fetching current page:', currentError);
    }

    // Get text content from the current page segments
    const { data: contentData, error: contentError } = await supabase
      .from('page_content')
      .select('section_key, content_type, content_value')
      .eq('page_slug', pageSlug)
      .eq('language', language);

    if (contentError) {
      console.error('[Content Links] Error fetching content:', contentError);
    }

    // Extract text content from segments for analysis
    let textContent = '';
    if (contentData) {
      for (const item of contentData) {
        if (item.section_key === 'page_segments' || item.section_key === 'seo') continue;

        try {
          const parsed = JSON.parse(item.content_value);
          
          if (parsed.introText) {
            textContent += parsed.introText.replace(/<[^>]*>/g, '') + '\n';
          }
          if (parsed.description) {
            textContent += parsed.description.replace(/<[^>]*>/g, '') + '\n';
          }
          if (parsed.subtitle) {
            textContent += parsed.subtitle + '\n';
          }
          if (parsed.headline) {
            textContent += parsed.headline + '\n';
          }
        } catch (e) {
          if (typeof item.content_value === 'string' && item.content_value.length > 20) {
            textContent += item.content_value.replace(/<[^>]*>/g, '') + '\n';
          }
        }
      }
    }

    console.log('[Content Links] Text content length:', textContent.length);

    // Build existing pages context
    const existingPagesContext = (allPages || []).map(p => ({
      slug: p.page_slug,
      title: p.page_title,
      description: p.flyout_description || ''
    }));

    // Get all segments on the current pillar page
    const { data: segmentRegistry, error: segmentError } = await supabase
      .from('segment_registry')
      .select('segment_id, segment_key, segment_type, position')
      .eq('page_slug', pageSlug)
      .eq('deleted', false)
      .order('position');

    if (segmentError) {
      console.error('[Content Links] Error fetching segments:', segmentError);
    }

    // Build segment context for AI
    const segmentContext = (segmentRegistry || []).map(s => ({
      id: s.segment_id,
      key: s.segment_key,
      type: s.segment_type,
      position: s.position
    }));

    console.log('[Content Links] Found segments on page:', segmentContext.length);

    const systemPrompt = `You are an SEO and content strategy expert specializing in Topic Cluster / Pillar Page architecture. Your task is to suggest content improvements for this page which serves as a PILLAR PAGE in a topic cluster.

CURRENT PAGE (PILLAR): ${pageSlug}
CURRENT PAGE TITLE: ${currentPage?.page_title || 'Unknown'}
PARENT: ${currentPage?.parent_slug || 'none'}
FOCUS KEYWORD: ${focusKeyword || 'not defined'}

SEGMENTS ON CURRENT PILLAR PAGE:
${JSON.stringify(segmentContext, null, 2)}

EXISTING PAGES (DO NOT suggest these, they already exist):
${JSON.stringify(existingPagesContext.map(p => p.slug), null, 2)}

CURRENT PAGE CONTENT:
${textContent.substring(0, 3000)}

TASK: Analyze the current page and suggest TWO TYPES of content improvements:

TYPE 1 - NEW CLUSTER PAGES (suggestionType: "new_page"):
- Completely NEW pages that should be created as cluster content around this pillar
- These would be child/sibling pages that dive deeper into specific subtopics
- They would link back to this pillar page and vice versa
- CRITICAL: For each new cluster page, you MUST specify WHERE the link to this new page should be placed on the PILLAR page (linkPlacement)

TYPE 2 - SEGMENT ENHANCEMENTS (suggestionType: "existing_segment"):
- Sections/segments within EXISTING pages that should be enhanced or created
- These are content gaps in pages that already exist
- Specify which existing page the segment should be added to

Suggest 3-4 of each type (6-8 total).

RESPONSE FORMAT:
Return ONLY a JSON array:
[
  {
    "suggestedSlug": "new-cluster-page-slug",
    "suggestedTitle": "New Cluster Page Title",
    "suggestionType": "new_page",
    "segmentType": "page",
    "reason": "Why this cluster page supports the pillar and fills a content gap",
    "priority": 1,
    "parentSlug": "${pageSlug}",
    "linkPlacement": {
      "segmentId": 123,
      "segmentKey": "segment_123_intro",
      "segmentType": "intro",
      "placementType": "inline_text|cta_button|navigation_link|feature_card",
      "placementDescription": "Add link in the introText after the sentence about [specific topic]"
    },
    "suggestedSegments": [
      {"type": "action-hero", "content": "Hero section with title and subtitle related to the cluster topic"},
      {"type": "intro", "content": "Introduction text explaining the main concept"},
      {"type": "faq", "content": "3-5 frequently asked questions about this topic"}
    ]
  },
  {
    "suggestedSlug": "existing-page-slug",
    "suggestedTitle": "Suggested Section: [Section Title]",
    "suggestionType": "existing_segment",
    "segmentType": "intro|faq|specification|etc",
    "reason": "Why this segment should be added to the existing page",
    "priority": 2,
    "parentSlug": null,
    "targetPageSlug": "the-existing-page-where-segment-goes"
  }
]

IMPORTANT:
- For new_page: suggestedSlug must be a NEW slug that doesn't exist
- For new_page: linkPlacement MUST reference an existing segment from SEGMENTS ON CURRENT PILLAR PAGE
- For new_page: suggestedSegments should contain 2-4 segment types that make sense for the new cluster page
- For existing_segment: targetPageSlug must be an EXISTING page from the list
- Priority 1 = most valuable
- placementType options: "inline_text" (add link in text), "cta_button" (use existing/new CTA), "navigation_link" (add to navigation), "feature_card" (add as feature item)
- Be specific in placementDescription about exactly where the link should go`;

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
          { role: 'user', content: 'Analyze the page and suggest new content that should be created to enable better internal linking.' }
        ],
        temperature: 0.7,
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
      console.error('[Content Links] AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('[Content Links] Raw AI response:', content);

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
      console.error('[Content Links] Failed to parse AI response:', parseError);
      return new Response(JSON.stringify({ 
        suggestions: [],
        error: 'Failed to parse AI suggestions'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Filter out any suggestions that already exist
    const existingSlugs = new Set((allPages || []).map(p => p.page_slug));
    
    const validSuggestions = suggestions
      .filter((s: any) => {
        if (!s.suggestedSlug || !s.suggestedTitle) return false;
        // For new pages, make sure the suggested page doesn't already exist
        if (s.suggestionType === 'new_page' || !s.suggestionType) {
          if (existingSlugs.has(s.suggestedSlug)) {
            console.log('[Content Links] Rejecting - page already exists:', s.suggestedSlug);
            return false;
          }
        }
        return true;
      })
      .map((s: any, index: number) => ({
        suggestedSlug: s.suggestedSlug,
        suggestedTitle: s.suggestedTitle,
        segmentType: s.segmentType || 'page',
        suggestionType: s.suggestionType || 'new_page',
        reason: s.reason || 'Would improve site coverage',
        priority: s.priority || index + 1,
        parentSlug: s.parentSlug || null,
        targetPageSlug: s.targetPageSlug || null,
        // New fields for placement info
        linkPlacement: s.linkPlacement || null,
        suggestedSegments: s.suggestedSegments || null
      }))
      .sort((a: any, b: any) => a.priority - b.priority)
      .slice(0, 8);

    console.log('[Content Links] Generated content suggestions:', validSuggestions);

    return new Response(JSON.stringify({ 
      suggestions: validSuggestions,
      currentPage: pageSlug,
      existingPagesCount: allPages?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Content Links] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      suggestions: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
