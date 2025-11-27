import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { texts, targetLanguage } = await req.json();
    
    console.log('Translation request:', { texts, targetLanguage });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Map language codes to full language names
    const languageNames: Record<string, string> = {
      'de': 'German',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese'
    };

    const targetLangName = languageNames[targetLanguage] || targetLanguage;

    // Create translation prompt
    const systemPrompt = `You are a professional translator. Translate the provided English texts to ${targetLangName}.
Maintain the tone, style, and formatting of the original text.
Return ONLY a JSON object with the same keys as the input, containing the translated texts.
Do not add any explanations or additional text.`;

    const userPrompt = `Translate these texts to ${targetLangName}:\n\n${JSON.stringify(texts, null, 2)}`;

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
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to your Lovable AI workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const translatedContent = data.choices[0].message.content;
    
    console.log('AI response:', translatedContent);

    // Parse the JSON response
    let translatedTexts;
    try {
      // Remove markdown code blocks if present
      const cleanedContent = translatedContent.replace(/```json\n?|\n?```/g, '').trim();
      translatedTexts = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', translatedContent);
      throw new Error('Failed to parse translation response');
    }

    return new Response(JSON.stringify({ translatedTexts }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Translation failed' 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
