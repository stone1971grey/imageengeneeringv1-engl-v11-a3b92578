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
    const { pageData, focusKeyword } = await req.json();
    
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
      contextParts.push(`Current Title: ${pageData.title}`);
    }
    if (pageData.metaDescription) {
      contextParts.push(`Meta Description: ${pageData.metaDescription}`);
    }
    if (pageData.h1) {
      contextParts.push(`H1 Heading: ${pageData.h1}`);
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

    const pageContext = contextParts.join('\n\n');

    console.log('[generate-seo-title] Generating SEO title with context:', {
      hasTitle: !!pageData.title,
      hasMetaDescription: !!pageData.metaDescription,
      hasH1: !!pageData.h1,
      hasFocusKeyword: !!focusKeyword,
      focusKeyword,
    });

    const systemPrompt = `You are an SEO expert specializing in writing compelling SEO titles (meta titles).

CRITICAL RULES FOR OPTIMAL SEO TITLES:
✔ LENGTH: 50-60 characters (STRICTLY enforce this - Google truncates at ~60)
✔ FOCUS KEYWORD: Must include the focus keyword, preferably at the beginning
✔ BRAND: Include brand name at end if space allows (use " | " separator)
✔ COMPELLING: Must be click-worthy and accurately describe the page
✔ UNIQUE: Each title should be unique and specific to the page content

STRUCTURE GUIDELINES:
- Primary keyword first when possible
- Use power words (Professional, Complete, Best, Guide, etc.)
- Consider search intent - what does the user want?
- Avoid keyword stuffing
- Use numbers when appropriate (e.g., "5 Best...", "2025 Guide")

INDUSTRY CONTEXT: Image Quality Testing, Camera Testing, Test Equipment, Automotive Vision Testing, Image Engineering

Reply ONLY with a JSON array, RANKED BY QUALITY (best title first):
[
  {"title": "best optimized title here", "characterCount": 55, "reason": "Why this is #1 - explains optimization choices", "keywordPosition": "front/middle/end", "priority": 1},
  {"title": "second best title", "characterCount": 58, "reason": "Why this ranks #2", "keywordPosition": "front/middle/end", "priority": 2}
]`;

    const userPrompt = `Generate 3-5 optimized SEO titles for this page. RANK BY QUALITY - best title first!

${focusKeyword ? `IMPORTANT: The title MUST include the focus keyword: "${focusKeyword}"` : 'No focus keyword set - generate based on page content.'}

${pageContext}

Requirements:
1. Each title must be 50-60 characters (CRITICAL - no exceptions!)
2. Focus keyword should appear early in the title (if provided)
3. Make titles compelling and click-worthy
4. Consider adding brand suffix "| Image Engineering" if space allows

Reply ONLY with the JSON array, without markdown formatting or additional text.`;

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
      console.error('[generate-seo-title] AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response content from AI');
    }

    console.log('[generate-seo-title] Raw AI response:', content);

    // Parse the JSON response - handle potential markdown code blocks
    let cleanedContent = content.trim();
    
    // Remove markdown code blocks if present
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let titles;
    try {
      titles = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('[generate-seo-title] Failed to parse AI response:', parseError);
      console.error('[generate-seo-title] Cleaned content:', cleanedContent);
      throw new Error('Failed to parse title suggestions from AI');
    }

    // Validate and sort by priority
    if (!Array.isArray(titles)) {
      throw new Error('AI response is not an array');
    }

    const validTitles = titles
      .filter((t: any) => t.title && typeof t.title === 'string')
      .map((t: any) => ({
        ...t,
        characterCount: t.title.length, // Recalculate to ensure accuracy
      }))
      .sort((a: any, b: any) => (a.priority || 99) - (b.priority || 99))
      .slice(0, 5);

    console.log('[generate-seo-title] Generated titles:', validTitles);

    return new Response(JSON.stringify({ titles: validTitles }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[generate-seo-title] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
