import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { pageData, focusKeyword } = await req.json();

    if (!pageData) {
      throw new Error('Page data is required');
    }

    // Build context from page data
    const pageContext = `
Page Information:
- Current Title: ${pageData.title || 'Not set'}
- Current H1: ${pageData.h1 || 'Not set'}
- Focus Keyword: ${focusKeyword || 'Not defined'}
- Current Description: ${pageData.description || 'Not set'}
- Page Slug: ${pageData.slug || 'Unknown'}
- Introduction Text: ${pageData.introText || 'Not available'}
`.trim();

    const systemPrompt = `You are an SEO expert who creates optimized meta descriptions for websites.

IMPORTANT RULES:
1. The description MUST be between 120-160 characters (optimal: 140-155)
2. The focus keyword "${focusKeyword || ''}" MUST be included (if provided)
3. The description must encourage clicks (Call-to-Action)
4. Use active language and verbs
5. Mention the main benefit/USP of the page
6. No keyword stuffing

RESPONSE FORMAT:
Reply ONLY with a JSON array with exactly 3 suggestions:
[
  {
    "description": "The optimized meta description here",
    "characterCount": 145,
    "reason": "Brief explanation why this description is good",
    "priority": 1
  }
]

Sort by quality (priority 1 = best option).`;

    const userPrompt = `Create 3 optimized meta descriptions for this page:

${pageContext}

REQUIREMENTS:
- Length: 120-160 characters (optimal: 140-155)
- Focus keyword "${focusKeyword || ''}" must be included
- Click-encouraging with call-to-action
- Professional and informative

Reply ONLY with the JSON array, no other text.`;

    console.log('Generating SEO descriptions with Lovable AI...');

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
        temperature: 0.7,
        max_tokens: 1500,
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
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('Raw AI response:', content);

    // Parse JSON from response
    let suggestions = [];
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return empty suggestions on parse error
      return new Response(JSON.stringify({ 
        suggestions: [],
        error: 'Failed to parse AI suggestions'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate and clean suggestions
    const validSuggestions = suggestions
      .filter((s: any) => s.description && typeof s.description === 'string')
      .map((s: any, index: number) => ({
        description: s.description.trim(),
        characterCount: s.description.trim().length,
        reason: s.reason || 'SEO-optimierte Description',
        priority: s.priority || index + 1
      }))
      .sort((a: any, b: any) => a.priority - b.priority)
      .slice(0, 3);

    console.log('Generated description suggestions:', validSuggestions);

    return new Response(JSON.stringify({ suggestions: validSuggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-seo-description function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      suggestions: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
