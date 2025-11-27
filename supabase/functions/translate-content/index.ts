import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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

    // Initialize Supabase client to fetch glossary
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch glossary entries
    const { data: glossaryEntries, error: glossaryError } = await supabase
      .from('glossary')
      .select('*');
    
    if (glossaryError) {
      console.error('Error fetching glossary:', glossaryError);
    }

    console.log('Loaded glossary entries:', glossaryEntries?.length || 0);

    // Map language codes to full language names
    const languageNames: Record<string, string> = {
      'de': 'German',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese'
    };

    const targetLangName = languageNames[targetLanguage] || targetLanguage;

    // Build glossary instructions and collect rules
    let glossaryInstructions = '';
    const nonTranslatable: string[] = [];
    const preferredTranslations: Record<string, string> = {};
    const abbreviations: string[] = [];
    const companySpecific: Record<string, string> = {};

    if (glossaryEntries && glossaryEntries.length > 0) {
      glossaryEntries.forEach((entry: any) => {
        const term = entry.term as string;
        const type = entry.term_type as string;
        const translations = (entry.translations || {}) as Record<string, string>;

        if (!term) return;

        if (type === 'non-translate') {
          nonTranslatable.push(term);
        } else if (type === 'preferred-translation' && translations[targetLanguage]) {
          preferredTranslations[term] = translations[targetLanguage];
        } else if (type === 'abbreviation') {
          abbreviations.push(term);
        } else if (type === 'company-specific' && translations[targetLanguage]) {
          companySpecific[term] = translations[targetLanguage];
        }
      });

      const glossaryParts: string[] = [];
      
      if (nonTranslatable.length > 0) {
        glossaryParts.push(`DO NOT TRANSLATE these terms (keep them EXACTLY as in source, case-sensitive): ${nonTranslatable.join(', ')}`);
      }
      
      if (Object.keys(preferredTranslations).length > 0) {
        const translations = Object.entries(preferredTranslations)
          .map(([en, target]) => `"${en}" → "${target}"`)
          .join(', ');
        glossaryParts.push(`Use these EXACT translations: ${translations}`);
      }
      
      if (abbreviations.length > 0) {
        glossaryParts.push(`Keep these abbreviations/acronyms unchanged: ${abbreviations.join(', ')}`);
      }
      
      if (Object.keys(companySpecific).length > 0) {
        const translations = Object.entries(companySpecific)
          .map(([en, target]) => `"${en}" → "${target}"`)
          .join(', ');
        glossaryParts.push(`Company-specific terminology: ${translations}`);
      }

      if (glossaryParts.length > 0) {
        glossaryInstructions = '\n\nGLOSSARY RULES (MUST FOLLOW STRICTLY):\n' + glossaryParts.join('\n');
      }
    }

    // Helper for escaping regex special chars
    const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Replace non-translatable terms with placeholders before sending to AI
    const placeholderPrefix = '__GLOSSARY_TERM_';
    let placeholderIndex = 0;
    const placeholderMap: Record<string, string> = {};

    const maskText = (text: string): string => {
      if (!text || nonTranslatable.length === 0) return text;

      let result = text;
      for (const term of nonTranslatable) {
        if (!term) continue;
        const placeholder = `${placeholderPrefix}${placeholderIndex++}__`;
        const regex = new RegExp(escapeRegExp(term), 'g');
        if (regex.test(result)) {
          result = result.replace(regex, placeholder);
          placeholderMap[placeholder] = term;
        }
      }
      return result;
    };

    const maskedTexts: Record<string, string> = {};
    for (const key of Object.keys(texts || {})) {
      const value = (texts as any)[key];
      maskedTexts[key] = typeof value === 'string' ? maskText(value) : '';
    }

    // Create translation prompt
    const systemPrompt = `You are a professional translator. Translate the provided English texts to ${targetLangName}.
Maintain the tone, style, and formatting of the original text.
Return ONLY a JSON object with the same keys as the input, containing the translated texts.
Do not add any explanations or additional text.${glossaryInstructions}`;

    const userPrompt = `Translate these texts to ${targetLangName} (placeholders like ${placeholderPrefix}*_ must be kept EXACTLY as they are):\n\n${JSON.stringify(maskedTexts, null, 2)}`;

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

    // Parse the JSON response and restore placeholders
    let translatedTexts: Record<string, string>;
    try {
      const cleanedContent = translatedContent.replace(/```json\n?|\n?```/g, '').trim();
      translatedTexts = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', translatedContent);
      throw new Error('Failed to parse translation response');
    }

    const restoredTexts: Record<string, string> = {};
    for (const key of Object.keys(translatedTexts || {})) {
      let value = translatedTexts[key];
      if (typeof value === 'string') {
        for (const [placeholder, term] of Object.entries(placeholderMap)) {
          if (value.includes(placeholder)) {
            value = value.replace(new RegExp(escapeRegExp(placeholder), 'g'), term);
          }
        }
      }
      restoredTexts[key] = value;
    }

    return new Response(JSON.stringify({ translatedTexts: restoredTexts }), {
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
