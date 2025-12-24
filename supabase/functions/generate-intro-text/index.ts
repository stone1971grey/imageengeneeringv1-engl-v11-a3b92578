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
    const { pageData, focusKeyword, language = 'en' } = await req.json();
    
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
      contextParts.push(`H1 Headline: ${pageData.h1}`);
    }
    if (pageData.currentIntro) {
      contextParts.push(`Current Introduction: ${pageData.currentIntro}`);
    }
    if (pageData.slug) {
      contextParts.push(`URL Slug: ${pageData.slug}`);
    }
    if (pageData.pageSlug) {
      contextParts.push(`Full Page Path: ${pageData.pageSlug}`);
    }
    if (focusKeyword) {
      contextParts.push(`Focus Keyword/Keyphrase: ${focusKeyword}`);
    }
    if (pageData.segmentContent) {
      contextParts.push(`Page Content Summary: ${pageData.segmentContent}`);
    }

    const pageContext = contextParts.join('\n\n');

    console.log('[generate-intro-text] Analyzing page content:', {
      hasTitle: !!pageData.title,
      hasMetaDescription: !!pageData.metaDescription,
      hasH1: !!pageData.h1,
      hasCurrentIntro: !!pageData.currentIntro,
      hasFocusKeyword: !!focusKeyword,
      language
    });

    // Language-specific instructions
    const languageInstructions: Record<string, string> = {
      'de': 'Schreibe den Intro-Text auf Deutsch. Verwende eine professionelle aber zugängliche Sprache.',
      'en': 'Write the intro text in English. Use professional but accessible language.',
      'ja': 'イントロテキストを日本語で書いてください。プロフェッショナルでありながらわかりやすい言葉を使用してください。',
      'ko': '소개 텍스트를 한국어로 작성하세요. 전문적이면서도 접근하기 쉬운 언어를 사용하세요.',
      'zh': '请用中文撰写简介文本。使用专业但易于理解的语言。'
    };

    const systemPrompt = `You are an SEO expert specializing in introduction text optimization for web pages.
Your task is to create compelling, SEO-optimized introduction texts that perfectly match the page content.

${languageInstructions[language] || languageInstructions['en']}

CRITICAL INTRO TEXT RULES:
✔ Length: 40-80 words (3-4 sentences) - this is optimal for readability and SEO
✔ Focus Keyphrase MUST appear EXACTLY in the FIRST SENTENCE
✔ Focus Keyphrase should appear in the first 10-15 words
✔ Focus Keyphrase should appear ONLY ONCE in the entire intro
✔ Clear, compelling, actionable language
✔ Match user search intent

RECOMMENDED STRUCTURE (proven effective):

Sentence 1: Focus Keyphrase + clear topic assignment
- The Focus Keyphrase must appear naturally in the first sentence
- Establish what the page is about

Sentence 2: Problem, question, or relevance for the user
- What problem does this solve?
- Why should the user care?

Sentence 3 (optional): What the user learns or gets concretely
- Specific benefits or takeaways
- What will they achieve?

Sentence 4 (optional): Differentiation or additional benefit
- Unique selling points
- Tips, guides, or how to avoid common mistakes

QUALITY CRITERIA (for ranking):
1. Focus Keyphrase Position - Must be in first sentence, ideally first 10-15 words
2. Word Count - 40-80 words is optimal
3. Clarity - Clear what the page offers
4. Value Proposition - User understands the benefit immediately
5. No Keyword Stuffing - Focus Keyphrase appears exactly ONCE

Reply ONLY with a JSON object:
{
  "introText": "The complete introduction text here...",
  "wordCount": 55,
  "keyphrasePosition": "Position of keyphrase (e.g., 'words 3-5')",
  "keyphraseCount": 1,
  "sentenceCount": 3,
  "reason": "Brief explanation of why this intro is effective"
}`;

    const userPrompt = `Create an optimized introduction text for this page.

${focusKeyword ? `CRITICAL: The Focus Keyphrase "${focusKeyword}" MUST appear EXACTLY in the first sentence (ideally in the first 10-15 words) and only ONCE in the entire intro.` : 'No Focus Keyphrase set - create a general introduction.'}

Requirements:
- 40-80 words total (3-4 sentences)
- Focus Keyphrase in first sentence, first 10-15 words if possible
- Only mention Focus Keyphrase ONCE
- Follow the 4-sentence structure if appropriate

PAGE CONTEXT:
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
      console.error('[generate-intro-text] AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response content from AI');
    }

    console.log('[generate-intro-text] Raw AI response:', content);

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
      console.error('[generate-intro-text] Failed to parse AI response:', parseError);
      console.error('[generate-intro-text] Cleaned content:', cleanedContent);
      throw new Error('Failed to parse intro text from AI');
    }

    // Validate structure
    if (!result.introText || typeof result.introText !== 'string') {
      throw new Error('AI response missing introText');
    }

    // Count actual words
    const actualWordCount = result.introText.trim().split(/\s+/).length;

    const validResult = {
      introText: result.introText,
      wordCount: actualWordCount,
      keyphrasePosition: result.keyphrasePosition || 'unknown',
      keyphraseCount: result.keyphraseCount || 1,
      sentenceCount: result.sentenceCount || result.introText.split(/[.!?]+/).filter((s: string) => s.trim()).length,
      reason: result.reason || 'AI-generated introduction'
    };

    console.log('[generate-intro-text] Generated intro:', validResult);

    return new Response(JSON.stringify(validResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[generate-intro-text] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
