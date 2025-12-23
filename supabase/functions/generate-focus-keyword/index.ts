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
    const { pageData } = await req.json();
    
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

    const pageContext = contextParts.join('\n\n');

    console.log('[generate-focus-keyword] Analyzing page content:', {
      hasTitle: !!pageData.title,
      hasMetaDescription: !!pageData.metaDescription,
      hasH1: !!pageData.h1,
      hasIntroduction: !!pageData.introduction,
      hasSlug: !!pageData.slug,
    });

    const systemPrompt = `You are an SEO expert specializing in focus keyword selection. Your task is to identify the MAIN QUESTION this page answers.

CRITICAL RULES FOR GOOD FOCUS KEYWORDS:
✔ Realistic search demand - people actually search for this term
✔ Clear search intent - the intent behind the search is obvious  
✔ Not too broad - avoid generic terms like "SEO", "camera", "test"
✔ Not too specific - avoid overly technical terms like "seo-suite-cms-feature-2025"
✔ Exact content match - the keyword must precisely match what the page offers

KEY INSIGHT: A page answers ONE main question → this question IS the focus keyword.

Technical guidelines:
- 1-4 words (ideally 2-3 words)
- Lowercase
- MUST BE IN ENGLISH
- Consider the industry context: Image Quality Testing, Camera Testing, Test Equipment, Automotive Vision Testing

Your ranking criteria (most important first):
1. Search intent match - Does the keyword reflect what the user wants to find?
2. Content relevance - Does the page actually deliver on this keyword?
3. Search volume potential - Would real users search for this?
4. Specificity balance - Not too broad, not too niche

Reply ONLY with a JSON array, RANKED BY QUALITY (best keyword first):
[
  {"keyword": "best keyword", "reason": "Why this is #1 - matches user intent and page content perfectly", "priority": 1},
  {"keyword": "second best", "reason": "Why this ranks #2", "priority": 2}
]`;

    const userPrompt = `Analyze this page and suggest 3-5 focus keywords in English. RANK BY QUALITY - best keyword first!

Ask yourself: "What MAIN QUESTION does this page answer? What would a user type in Google to find exactly THIS page?"

${pageContext}

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
      console.error('[generate-focus-keyword] AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response content from AI');
    }

    console.log('[generate-focus-keyword] Raw AI response:', content);

    // Parse the JSON response - handle potential markdown code blocks
    let cleanedContent = content.trim();
    
    // Remove markdown code blocks if present
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let keywords;
    try {
      keywords = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('[generate-focus-keyword] Failed to parse AI response:', parseError);
      console.error('[generate-focus-keyword] Cleaned content:', cleanedContent);
      throw new Error('Failed to parse keyword suggestions from AI');
    }

    // Validate and sort by priority
    if (!Array.isArray(keywords)) {
      throw new Error('AI response is not an array');
    }

    const validKeywords = keywords
      .filter((k: any) => k.keyword && typeof k.keyword === 'string')
      .sort((a: any, b: any) => (a.priority || 99) - (b.priority || 99))
      .slice(0, 5);

    console.log('[generate-focus-keyword] Generated keywords:', validKeywords);

    return new Response(JSON.stringify({ keywords: validKeywords }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[generate-focus-keyword] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
