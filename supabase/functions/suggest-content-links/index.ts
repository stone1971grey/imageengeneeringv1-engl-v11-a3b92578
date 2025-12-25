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

    const systemPrompt = `You are an SEO and content strategy expert. Your task is to suggest NEW PAGES or SEGMENTS that should be CREATED to improve the website's internal linking structure.

CURRENT PAGE: ${pageSlug}
CURRENT PAGE TITLE: ${currentPage?.page_title || 'Unknown'}
PARENT: ${currentPage?.parent_slug || 'none'}
FOCUS KEYWORD: ${focusKeyword || 'not defined'}

EXISTING PAGES (DO NOT suggest these, they already exist):
${JSON.stringify(existingPagesContext.map(p => p.slug), null, 2)}

CURRENT PAGE CONTENT:
${textContent.substring(0, 3000)}

TASK: Analyze the current page content and suggest 4-6 NEW pages or segments that:
1. Would make sense to link FROM this page
2. Do NOT already exist in the existing pages list
3. Would improve the site's topic coverage and SEO
4. Are topically related to the current page content

RESPONSE FORMAT:
Return ONLY a JSON array with content suggestions:
[
  {
    "suggestedSlug": "suggested-page-slug",
    "suggestedTitle": "Suggested Page Title",
    "segmentType": "page or segment",
    "reason": "Why this content would be valuable and how it relates to the current page",
    "priority": 1,
    "parentSlug": "optional-parent-slug if it should be a child page"
  }
]

IMPORTANT:
- Only suggest content that does NOT exist yet
- Be specific and practical with suggestions
- Priority 1 = most valuable/important
- Maximum 6 suggestions`;

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
        // Make sure the suggested page doesn't already exist
        if (existingSlugs.has(s.suggestedSlug)) {
          console.log('[Content Links] Rejecting - page already exists:', s.suggestedSlug);
          return false;
        }
        return true;
      })
      .map((s: any, index: number) => ({
        suggestedSlug: s.suggestedSlug,
        suggestedTitle: s.suggestedTitle,
        segmentType: s.segmentType || 'page',
        reason: s.reason || 'Would improve site coverage',
        priority: s.priority || index + 1,
        parentSlug: s.parentSlug || null
      }))
      .sort((a: any, b: any) => a.priority - b.priority)
      .slice(0, 6);

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
