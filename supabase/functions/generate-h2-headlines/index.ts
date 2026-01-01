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
    const { pageData, focusKeyword, existingH2s, segments } = await req.json();
    
    if (!pageData) {
      throw new Error('Page data is required');
    }

    if (!focusKeyword) {
      throw new Error('Focus keyword is required for Smart H2 generation');
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
      contextParts.push(`H1 Headline: ${pageData.h1}`);
    }
    if (pageData.introduction) {
      contextParts.push(`Introduction: ${pageData.introduction}`);
    }
    if (pageData.slug) {
      contextParts.push(`URL Slug: ${pageData.slug}`);
    }
    contextParts.push(`Focus Keyword: ${focusKeyword}`);

    // Add existing H2 headings
    if (existingH2s && Array.isArray(existingH2s) && existingH2s.length > 0) {
      contextParts.push(`\nExisting H2 Headings on this page:`);
      existingH2s.forEach((h2: any, index: number) => {
        const hasFkw = h2.text.toLowerCase().includes(focusKeyword.toLowerCase());
        contextParts.push(`${index + 1}. "${h2.text}" (Segment: ${h2.segmentType}, ID: ${h2.segmentId}) ${hasFkw ? '✓ Contains FKW' : '✗ Missing FKW'}`);
      });
    }

    // Add segments info
    if (segments && Array.isArray(segments) && segments.length > 0) {
      contextParts.push(`\nAvailable Segments for placement:`);
      segments.forEach((seg: any) => {
        contextParts.push(`- ${seg.type} (Key: ${seg.key}, ID: ${seg.id})`);
      });
    }

    const pageContext = contextParts.join('\n');

    console.log('[generate-h2-headlines] Analyzing page content:', {
      hasTitle: !!pageData.title,
      hasH1: !!pageData.h1,
      focusKeyword,
      existingH2Count: existingH2s?.length || 0,
      segmentsCount: segments?.length || 0,
    });

    const systemPrompt = `You are an SEO expert specializing in H2 heading optimization. Your task is to optimize existing H2 headings to naturally include the focus keyword while maintaining readability and relevance.

CRITICAL H2 OPTIMIZATION RULES:
✔ Focus keyword must appear EXACTLY in the optimized H2 (not variations)
✔ Keep the original meaning and intent of the heading
✔ H2 length: 30-70 characters is optimal
✔ Natural integration - the keyword should flow naturally
✔ Maintain content hierarchy and structure

OPTIMIZATION STRATEGY:
1. Prioritize H2s that are MISSING the focus keyword
2. Suggest natural rewording that includes the keyword
3. Keep the heading's purpose and meaning intact
4. Ensure the keyword placement sounds natural, not forced

For each suggestion, provide:
- originalText: The current H2 text
- suggestedText: The optimized H2 with focus keyword
- segmentId: ID of the segment containing this H2
- segmentType: Type of segment (image-text, tiles, accordion, etc.)
- segmentKey: Key of the segment
- reason: Why this optimization makes sense
- priority: 1-5 (1 = highest priority, needs FKW most urgently)

Reply ONLY with a JSON object:
{
  "suggestions": [
    {
      "originalText": "Current H2 without keyword",
      "suggestedText": "Optimized H2 With Focus Keyword",
      "segmentId": 123,
      "segmentType": "image-text",
      "segmentKey": "segment_key_here",
      "reason": "Adding focus keyword improves SEO while maintaining meaning",
      "characterCount": 42,
      "priority": 1
    }
  ],
  "summary": {
    "totalH2s": 5,
    "h2sWithFkw": 2,
    "h2sOptimized": 3,
    "targetRatio": "At least 50% of H2s should contain the focus keyword"
  }
}`;

    const userPrompt = `Optimize the H2 headings on this page to include the focus keyword "${focusKeyword}".

RULES:
1. Focus on H2s that are MISSING the focus keyword
2. The focus keyword "${focusKeyword}" MUST appear EXACTLY in each suggested H2
3. Keep the original meaning and purpose of each heading
4. Make the keyword integration sound natural, not forced
5. Rank suggestions by priority (1 = most important to optimize)

${pageContext}

Provide 3-5 optimization suggestions for H2 headings that need the focus keyword. If all H2s already contain the keyword, suggest improvements to make them more compelling.

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
      console.error('[generate-h2-headlines] AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response content from AI');
    }

    console.log('[generate-h2-headlines] Raw AI response:', content);

    // Parse the JSON response - handle potential markdown code blocks
    let cleanedContent = content.trim();
    
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let result;
    try {
      result = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('[generate-h2-headlines] Failed to parse AI response:', parseError);
      console.error('[generate-h2-headlines] Cleaned content:', cleanedContent);
      throw new Error('Failed to parse H2 suggestions from AI');
    }

    // Validate structure
    if (!result.suggestions || !Array.isArray(result.suggestions)) {
      throw new Error('AI response missing suggestions array');
    }

    const validSuggestions = result.suggestions
      .filter((s: any) => s.originalText && s.suggestedText && typeof s.suggestedText === 'string')
      .map((s: any, index: number) => ({
        originalText: s.originalText,
        suggestedText: s.suggestedText,
        segmentId: s.segmentId || null,
        segmentType: s.segmentType || 'unknown',
        segmentKey: s.segmentKey || null,
        reason: s.reason || 'AI-generated optimization',
        characterCount: s.characterCount || s.suggestedText.length,
        priority: s.priority || index + 1,
      }))
      .sort((a: any, b: any) => a.priority - b.priority)
      .slice(0, 5);

    console.log('[generate-h2-headlines] Generated suggestions:', validSuggestions);

    return new Response(JSON.stringify({ 
      suggestions: validSuggestions,
      summary: result.summary || null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[generate-h2-headlines] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
