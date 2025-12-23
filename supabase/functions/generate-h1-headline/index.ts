import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { pageData, focusKeyword, segments } = await req.json();
    
    if (!pageData) {
      throw new Error('Page data is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build context from page data
    const contextParts: string[] = [];
    
    if (pageData.title) {
      contextParts.push(`Page Title: ${pageData.title}`);
    }
    if (pageData.metaDescription) {
      contextParts.push(`Meta Description: ${pageData.metaDescription}`);
    }
    if (pageData.currentH1) {
      contextParts.push(`Current H1: ${pageData.currentH1}`);
    }
    if (pageData.introduction) {
      contextParts.push(`Introduction: ${pageData.introduction}`);
    }
    if (pageData.slug) {
      contextParts.push(`URL Slug: ${pageData.slug}`);
    }
    if (pageData.pageSlug) {
      contextParts.push(`Full Page Path: ${pageData.pageSlug}`);
    }
    if (focusKeyword) {
      contextParts.push(`Focus Keyword: ${focusKeyword}`);
    }

    // Normalize segment types - IMPORTANT: There is NO "hero" type!
    // Valid segment types are: full-hero, product-hero, product-hero-gallery, action-hero, intro, etc.
    const normalizeSegmentType = (type: string): string => {
      const typeMap: Record<string, string> = {
        'hero': 'product-hero', // Legacy "hero" is now product-hero
        'full_hero': 'full-hero',
        'product_hero': 'product-hero',
        'action_hero': 'action-hero',
        'product_hero_gallery': 'product-hero-gallery',
      };
      return typeMap[type] || type;
    };
    
    const normalizedSegments = segments && Array.isArray(segments) 
      ? segments.map((s: any) => ({
          ...s,
          type: normalizeSegmentType(s.type),
          originalType: s.type
        }))
      : [];
    
    const segmentsList = normalizedSegments.length > 0
      ? `Available Segments (for placement): ${normalizedSegments.map((s: any) => `${s.type} (Key: ${s.key}, ID: ${s.id})`).join(', ')}`
      : 'No segments available';
    contextParts.push(segmentsList);

    const pageContext = contextParts.join('\n\n');

    console.log('[generate-h1-headline] Analyzing page content:', {
      hasTitle: !!pageData.title,
      hasMetaDescription: !!pageData.metaDescription,
      hasCurrentH1: !!pageData.currentH1,
      hasIntroduction: !!pageData.introduction,
      hasFocusKeyword: !!focusKeyword,
      segmentsCount: segments?.length || 0,
    });

    const systemPrompt = `You are an SEO expert specializing in H1 headline optimization. Your task is to create compelling H1 headlines that perfectly match the page content and include the focus keyword.

CRITICAL H1 HEADLINE RULES:
✔ Exact focus keyword match - The focus keyword MUST appear EXACTLY in the H1 (not variations)
✔ Length: 20-70 characters (ideal: 40-60 characters)
✔ One H1 per page - This is THE main headline
✔ Clear, compelling, actionable language
✔ Match user search intent
✔ Describe what the page delivers

H1 QUALITY CRITERIA (for ranking):
1. Focus Keyword Position - Keyword at the START ranks higher
2. Clarity - Clear what the page is about
3. Compelling - Makes users want to read more
4. Length - 40-60 characters is optimal
5. Unique - Not generic, specific to this page

VALID SEGMENT TYPES (use ONLY these):
- product-hero: Product detail pages with hero section (PREFERRED for existing pages)
- product-hero-gallery: Product pages with image gallery
- full-hero: Full-width hero for landing pages (only use if ALREADY exists, NEVER suggest creating new)
- action-hero: Call-to-action focused hero
- intro: Introduction section - great for SEO, does NOT change page character significantly

IMPORTANT PLACEMENT RULES:
1. NEVER suggest creating a new "full-hero" - it dramatically changes page character
2. If a product-hero, product-hero-gallery, or action-hero already exists, USE IT (don't create new)
3. If NO suitable hero segment exists, suggest creating an "intro" segment as the BEST alternative
4. Always prefer EXISTING segments over creating new ones
5. There is NO segment type called just "hero" - use "product-hero" instead

PLACEMENT OPTIONS (provide 2-3 ranked options):
For each H1 suggestion, provide placement options ranked from best to acceptable:

1. BEST OPTION - Use EXISTING hero segment (product-hero, product-hero-gallery, full-hero, action-hero)
   - Reference by segmentKey and segmentId
   - createNew: false
   
2. ALTERNATIVE - Create Intro segment (intro)
   - Does not change page character
   - Great for SEO (contains description too)
   - createNew: true
   - suggestedTabPosition: 2 (usually after hero)

Reply ONLY with a JSON object:
{
  "suggestions": [
    {
      "headline": "Optimized H1 Headline Here",
      "reason": "Why this is the best choice",
      "characterCount": 45,
      "keywordPosition": "start|middle|end",
      "placementOptions": [
        {
          "rank": 1,
          "segmentType": "product-hero",
          "segmentKey": "297",
          "segmentId": 297,
          "createNew": false,
          "suggestedTabPosition": 1,
          "note": "Best option: Place in existing Product Hero for immediate visibility"
        },
        {
          "rank": 2,
          "segmentType": "intro",
          "segmentKey": null,
          "segmentId": null,
          "createNew": true,
          "suggestedTabPosition": 2,
          "note": "Alternative: Create new Intro segment after hero - minimal impact on page design"
        }
      ],
      "priority": 1
    }
  ]
}`;

    const userPrompt = `Create 3-5 optimized H1 headline suggestions for this page. 
${focusKeyword ? `The focus keyword "${focusKeyword}" MUST appear EXACTLY in each headline.` : 'No focus keyword set - create general H1 suggestions.'}

RANK BY QUALITY - best headline first!
Consider: keyword position (start is best), character count (40-60 ideal), clarity, and compelling language.

CRITICAL PLACEMENT RULES:
1. NEVER suggest creating a new full-hero segment - it changes the page character too much
2. ALWAYS prefer EXISTING hero segments (product-hero, product-hero-gallery, full-hero, action-hero)
3. If you need to suggest creating a new segment, ONLY suggest "intro" - it has minimal design impact
4. There is NO segment type called just "hero" - use "product-hero" for product pages

FOR EACH HEADLINE, provide 2-3 placement options:
- FIRST: Use an EXISTING hero segment if available (reference by key and id, createNew: false)
- SECOND: Create an "intro" segment if no suitable hero exists (createNew: true)

Available segments on this page:
${normalizedSegments.length > 0
  ? normalizedSegments.map((s: any) => `- Type: ${s.type}, Key: ${s.key}, ID: ${s.id}`).join('\n')
  : 'No segments exist yet - suggest creating an intro segment!'}

${pageContext}

Reply ONLY with the JSON object, without markdown formatting or additional text.`;

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
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add funds to your Lovable AI workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('[generate-h1-headline] AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response content from AI');
    }

    console.log('[generate-h1-headline] Raw AI response:', content);

    // Parse the JSON response - handle potential markdown code blocks
    let cleanedContent = content.trim();
    
    // Remove markdown code blocks if present
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let result;
    try {
      result = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('[generate-h1-headline] Failed to parse AI response:', parseError);
      console.error('[generate-h1-headline] Cleaned content:', cleanedContent);
      throw new Error('Failed to parse H1 suggestions from AI');
    }

    // Validate structure
    if (!result.suggestions || !Array.isArray(result.suggestions)) {
      throw new Error('AI response missing suggestions array');
    }

    const validSuggestions = result.suggestions
      .filter((s: any) => s.headline && typeof s.headline === 'string')
      .map((s: any, index: number) => {
        // Handle both old single placementSuggestion and new placementOptions array
        let placementOptions = s.placementOptions || [];
        
        // Fallback: convert old format to new format
        if (placementOptions.length === 0 && s.placementSuggestion) {
          placementOptions = [{
            rank: 1,
            segmentType: s.placementSuggestion.segmentType,
            segmentKey: s.placementSuggestion.segmentKey,
            segmentId: s.placementSuggestion.segmentId || null,
            createNew: !s.placementSuggestion.segmentKey,
            suggestedTabPosition: 1,
            note: s.placementSuggestion.note
          }];
        }
        
        // Ensure all placement options have required fields
        placementOptions = placementOptions.map((opt: any, optIndex: number) => ({
          rank: opt.rank || optIndex + 1,
          segmentType: opt.segmentType || 'intro',
          segmentKey: opt.segmentKey || null,
          segmentId: opt.segmentId || null,
          createNew: opt.createNew ?? !opt.segmentKey,
          suggestedTabPosition: opt.suggestedTabPosition || 1,
          note: opt.note || `Option ${optIndex + 1}`
        }));
        
        return {
          headline: s.headline,
          reason: s.reason || 'AI-generated suggestion',
          characterCount: s.characterCount || s.headline.length,
          keywordPosition: s.keywordPosition || 'unknown',
          placementOptions: placementOptions.sort((a: any, b: any) => a.rank - b.rank).slice(0, 3),
          // Keep backward compatibility
          placementSuggestion: placementOptions[0] ? {
            segmentType: placementOptions[0].segmentType,
            segmentKey: placementOptions[0].segmentKey,
            segmentId: placementOptions[0].segmentId,
            note: placementOptions[0].note
          } : null,
          priority: s.priority || index + 1
        };
      })
      .sort((a: any, b: any) => a.priority - b.priority)
      .slice(0, 5);

    console.log('[generate-h1-headline] Generated suggestions:', validSuggestions);

    return new Response(JSON.stringify({ suggestions: validSuggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[generate-h1-headline] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
