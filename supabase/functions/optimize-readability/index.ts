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
    const { text, segmentType, optimizationType, language = 'en' } = await req.json();
    
    console.log('[optimize-readability] Request received:', {
      textLength: text?.length,
      segmentType,
      optimizationType,
      language
    });

    if (!text || !optimizationType) {
      return new Response(JSON.stringify({ error: 'Text and optimizationType are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('[optimize-readability] LOVABLE_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build system prompt based on optimization type
    let systemPrompt = '';
    
    if (optimizationType === 'sentence_length') {
      systemPrompt = `You are an expert content editor specializing in readability optimization.

Your task is to improve the readability of the provided text by:
1. Breaking long sentences (>25 words) into shorter, clearer sentences
2. Maintaining the original meaning and all information
3. Keeping the same tone and style
4. Preserving any HTML tags (like <a>, <strong>, <em>) exactly as they are
5. Not adding new content - only restructuring existing content

CRITICAL RULES:
- Every piece of information in the original must remain in the optimized version
- Do not change the overall message or add new ideas
- Keep technical terms and proper nouns unchanged
- Maintain any existing paragraph structure
- Return ONLY the optimized text, no explanations

The ideal sentence length is 15-20 words. Sentences over 25 words should be split.`;
    } else if (optimizationType === 'paragraph_length') {
      systemPrompt = `You are an expert content editor specializing in readability optimization.

Your task is to improve the readability of the provided text by:
1. Breaking long paragraphs (>5 sentences or >150 words) into shorter, more scannable paragraphs
2. Adding paragraph breaks at logical topic transitions
3. Maintaining the original meaning and all information
4. Preserving any HTML tags exactly as they are
5. Using proper HTML paragraph tags (<p>) or double line breaks for separation

CRITICAL RULES:
- Every piece of information in the original must remain in the optimized version
- Do not change the overall message or add new ideas
- Keep technical terms and proper nouns unchanged
- Return ONLY the optimized text with paragraph breaks, no explanations

The ideal paragraph is 2-4 sentences or ~75-100 words for web content.`;
    } else {
      systemPrompt = `You are an expert content editor. Improve the readability of the provided text while maintaining its meaning and preserving all HTML tags. Return only the optimized text.`;
    }

    const userPrompt = `Please optimize the following text from a ${segmentType || 'content'} segment for better readability:

---
${text}
---

Return only the optimized text, preserving all HTML tags and links.`;

    console.log('[optimize-readability] Calling Lovable AI...');

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
      const errorText = await response.text();
      console.error('[optimize-readability] AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: 'AI service unavailable' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const optimizedText = data.choices?.[0]?.message?.content?.trim();

    if (!optimizedText) {
      console.error('[optimize-readability] No content in AI response');
      return new Response(JSON.stringify({ error: 'No optimization generated' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[optimize-readability] Optimization successful, original:', text.length, 'optimized:', optimizedText.length);

    return new Response(JSON.stringify({ 
      optimizedText,
      originalLength: text.length,
      optimizedLength: optimizedText.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[optimize-readability] Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
