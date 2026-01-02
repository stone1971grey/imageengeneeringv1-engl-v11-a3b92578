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
    const { pageData, focusKeyword, existingH3s, segments } = await req.json();
    
    if (!pageData) {
      throw new Error('Page data is required');
    }

    if (!focusKeyword) {
      throw new Error('Focus keyword is required for Smart H3 generation');
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

    // Add existing H3 headings
    if (existingH3s && Array.isArray(existingH3s) && existingH3s.length > 0) {
      contextParts.push(`\nExisting H3 Headings on this page:`);
      existingH3s.forEach((h3: any, index: number) => {
        const hasFkw = h3.text.toLowerCase().includes(focusKeyword.toLowerCase());
        contextParts.push(`${index + 1}. "${h3.text}" (Segment: ${h3.segmentType}, ID: ${h3.segmentId}, Item: ${h3.itemIndex ?? 'N/A'}) ${hasFkw ? '✓ Contains FKW' : '✗ Missing FKW'}`);
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

    console.log('[generate-h3-headlines] Analyzing page content:', {
      hasTitle: !!pageData.title,
      hasH1: !!pageData.h1,
      focusKeyword,
      existingH3Count: existingH3s?.length || 0,
      segmentsCount: segments?.length || 0,
    });

    const systemPrompt = `You are an SEO expert specializing in H3 heading optimization. Your task is to optimize existing H3 headings (item titles within segments) to naturally include the focus keyword while maintaining readability and relevance.

CRITICAL H3 OPTIMIZATION RULES:
✔ Focus keyword must appear EXACTLY in the optimized H3 (not variations)
✔ Keep the original meaning and intent of the heading
✔ H3 length: 20-50 characters is optimal (shorter than H2s)
✔ Natural integration - the keyword should flow naturally
✔ H3s are typically item titles within sections (Features, Benefits, etc.)

IMPORTANT CONSIDERATIONS:
- Not all H3s need the focus keyword - prioritize the most important ones
- Aim for 2-3 H3s with the focus keyword (not all)
- Choose H3s where the keyword fits naturally with the item's content

OPTIMIZATION STRATEGY:
1. Prioritize H3s that are MISSING the focus keyword AND where it makes sense
2. Suggest natural rewording that includes the keyword
3. Keep the heading's purpose and meaning intact
4. Ensure the keyword placement sounds natural, not forced

For each suggestion, provide:
- originalText: The current H3 text
- suggestedText: The optimized H3 with focus keyword
- segmentId: ID of the segment containing this H3
- segmentType: Type of segment (image-text, tiles, feature-overview, etc.)
- segmentKey: Key of the segment
- itemIndex: Index of the item within the segment (0-based)
- reason: Why this optimization makes sense
- priority: 1-5 (1 = highest priority, best fit for keyword)

Reply ONLY with a JSON object:
{
  "suggestions": [
    {
      "originalText": "Current H3 without keyword",
      "suggestedText": "Optimized H3 With Focus Keyword",
      "segmentId": 123,
      "segmentType": "image-text",
      "segmentKey": "segment_key_here",
      "itemIndex": 0,
      "reason": "Adding focus keyword improves SEO while maintaining meaning",
      "characterCount": 35,
      "priority": 1
    }
  ],
  "summary": {
    "totalH3s": 8,
    "h3sWithFkw": 1,
    "h3sOptimized": 2,
    "targetRatio": "2-3 H3s with focus keyword is ideal"
  }
}`;

    const userPrompt = `Optimize the H3 headings on this page to include the focus keyword "${focusKeyword}".

RULES:
1. Focus on H3s that are MISSING the focus keyword
2. The focus keyword "${focusKeyword}" MUST appear EXACTLY in each suggested H3
3. Keep the original meaning and purpose of each heading
4. Make the keyword integration sound natural, not forced
5. Only suggest 2-4 H3 optimizations (not every H3 needs the keyword)
6. Rank suggestions by priority (1 = best fit for keyword)

${pageContext}

Provide 2-4 optimization suggestions for H3 headings where the focus keyword fits most naturally. If H3s already contain the keyword, acknowledge them as optimized.

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
      console.error('[generate-h3-headlines] AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response content from AI');
    }

    console.log('[generate-h3-headlines] Raw AI response:', content);

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
      console.error('[generate-h3-headlines] Failed to parse AI response:', parseError);
      console.error('[generate-h3-headlines] Cleaned content:', cleanedContent);
      throw new Error('Failed to parse H3 suggestions from AI');
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
        itemIndex: s.itemIndex ?? null,
        reason: s.reason || 'AI-generated optimization',
        characterCount: s.characterCount || s.suggestedText.length,
        priority: s.priority || index + 1,
      }))
      .sort((a: any, b: any) => a.priority - b.priority)
      .slice(0, 4);

    console.log('[generate-h3-headlines] Generated suggestions:', validSuggestions);

    return new Response(JSON.stringify({ 
      suggestions: validSuggestions,
      summary: result.summary || null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[generate-h3-headlines] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
