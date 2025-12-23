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

    // Add available segments for placement suggestion
    const segmentsList = segments && Array.isArray(segments) && segments.length > 0
      ? `Available Segments (for placement): ${segments.map((s: any) => `${s.type} (${s.key})`).join(', ')}`
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

PLACEMENT SUGGESTIONS:
- Consider which segment type would be best for the H1
- Full Hero segments are ideal for main H1
- Intro segments can also contain H1
- If no suitable segment exists, suggest creating one

Reply ONLY with a JSON object:
{
  "suggestions": [
    {
      "headline": "Optimized H1 Headline Here",
      "reason": "Why this is the #1 choice - keyword position, length, clarity",
      "characterCount": 45,
      "keywordPosition": "start|middle|end",
      "placementSuggestion": {
        "segmentType": "full_hero|intro|action-hero",
        "segmentKey": "existing_segment_key or null",
        "note": "Place in Full Hero for maximum visibility"
      },
      "priority": 1
    }
  ]
}`;

    const userPrompt = `Create 3-5 optimized H1 headline suggestions for this page. 
${focusKeyword ? `The focus keyword "${focusKeyword}" MUST appear EXACTLY in each headline.` : 'No focus keyword set - create general H1 suggestions.'}

RANK BY QUALITY - best headline first!
Consider: keyword position (start is best), character count (40-60 ideal), clarity, and compelling language.

Also suggest the best segment for placing this H1.

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
      .map((s: any, index: number) => ({
        headline: s.headline,
        reason: s.reason || 'AI-generated suggestion',
        characterCount: s.characterCount || s.headline.length,
        keywordPosition: s.keywordPosition || 'unknown',
        placementSuggestion: s.placementSuggestion || null,
        priority: s.priority || index + 1
      }))
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
