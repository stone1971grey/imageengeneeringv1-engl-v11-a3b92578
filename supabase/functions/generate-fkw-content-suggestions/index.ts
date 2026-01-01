import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContentSuggestion {
  suggestionType: 'heading' | 'body';
  headingLevel?: 'h2' | 'h3';
  currentText: string;
  suggestedText: string;
  segmentKey: string;
  segmentId: number;
  segmentType: string;
  fieldPath: string;
  reason: string;
  priority: number;
}

interface AnalysisResult {
  suggestions: ContentSuggestion[];
  analysis: {
    totalWords: number;
    fkwOccurrences: number;
    fkwDensity: number;
    densityStatus: 'too_low' | 'optimal' | 'too_high';
    h1HasFkw: boolean;
    h2Count: number;
    h2WithFkw: number;
    h3Count: number;
    h3WithFkw: number;
    introHasFkw: boolean;
  };
  score: number;
  recommendations: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { pageSlug, focusKeyword, language = 'en', pageSegments = [] } = await req.json();

    if (!pageSlug || !focusKeyword) {
      throw new Error('Page slug and focus keyword are required');
    }

    console.log('[FKW Content] Analyzing page:', pageSlug, 'FKW:', focusKeyword, 'language:', language);

    // Get segment registry for this page
    const { data: segmentRegistryData } = await supabase
      .from('segment_registry')
      .select('segment_key, segment_id, segment_type')
      .eq('page_slug', pageSlug)
      .eq('deleted', false);

    const segmentKeyToIdMap: Record<string, number> = {};
    const segmentKeyToTypeMap: Record<string, string> = {};
    if (segmentRegistryData) {
      for (const seg of segmentRegistryData) {
        segmentKeyToIdMap[seg.segment_key] = seg.segment_id;
        segmentKeyToTypeMap[seg.segment_key] = seg.segment_type;
      }
    }

    // Extract all headings and body text from segments
    const headings: Array<{
      level: 'h1' | 'h2' | 'h3';
      text: string;
      segmentKey: string;
      segmentId: number;
      segmentType: string;
      fieldPath: string;
    }> = [];

    const bodyTexts: Array<{
      text: string;
      segmentKey: string;
      segmentId: number;
      segmentType: string;
      fieldPath: string;
      isIntro: boolean;
    }> = [];

    let totalWords = 0;
    const fkwLower = focusKeyword.toLowerCase();

    // Process page segments from the passed array
    for (const seg of pageSegments) {
      const segId = seg.id;
      const segType = seg.type;
      const segData = seg.data || {};
      const segKey = `segment-${segId}`;

      // Extract H1 from product-hero, product-hero-gallery, full-hero
      if (['product-hero', 'product-hero-gallery', 'full-hero'].includes(segType)) {
        const title = segData.title || segData.hero_title || '';
        const subtitle = segData.subtitle || segData.hero_subtitle || '';
        
        if (title) {
          headings.push({
            level: 'h1',
            text: title,
            segmentKey: segKey,
            segmentId: parseInt(segId),
            segmentType: segType,
            fieldPath: 'title'
          });
        }
        
        // Subtitle could be part of H1 or body - treat as body for suggestions
        if (subtitle) {
          bodyTexts.push({
            text: subtitle,
            segmentKey: segKey,
            segmentId: parseInt(segId),
            segmentType: segType,
            fieldPath: 'subtitle',
            isIntro: false
          });
          const words = subtitle.split(/\s+/).filter((w: string) => w.length > 0);
          totalWords += words.length;
        }
      }

      // Extract H2 from intro, image-text
      if (segType === 'intro') {
        const headline = segData.headline || segData.title || '';
        const introText = segData.introText || segData.description || '';
        
        if (headline) {
          headings.push({
            level: 'h2',
            text: headline,
            segmentKey: segKey,
            segmentId: parseInt(segId),
            segmentType: segType,
            fieldPath: 'headline'
          });
        }
        
        if (introText) {
          const cleanText = introText.replace(/<[^>]*>/g, '');
          bodyTexts.push({
            text: cleanText,
            segmentKey: segKey,
            segmentId: parseInt(segId),
            segmentType: segType,
            fieldPath: 'introText',
            isIntro: true
          });
          const words = cleanText.split(/\s+/).filter((w: string) => w.length > 0);
          totalWords += words.length;
        }
      }

      // Extract from image-text segments
      if (segType === 'image-text') {
        const items = segData.items || [];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.title) {
            headings.push({
              level: 'h2',
              text: item.title,
              segmentKey: segKey,
              segmentId: parseInt(segId),
              segmentType: segType,
              fieldPath: `items[${i}].title`
            });
          }
          if (item.description) {
            const cleanText = item.description.replace(/<[^>]*>/g, '');
            bodyTexts.push({
              text: cleanText,
              segmentKey: segKey,
              segmentId: parseInt(segId),
              segmentType: segType,
              fieldPath: `items[${i}].description`,
              isIntro: false
            });
            const words = cleanText.split(/\s+/).filter((w: string) => w.length > 0);
            totalWords += words.length;
          }
        }
      }

      // Extract from feature-overview segments
      if (segType === 'feature-overview') {
        const sectionTitle = segData.sectionTitle || '';
        if (sectionTitle) {
          headings.push({
            level: 'h2',
            text: sectionTitle,
            segmentKey: segKey,
            segmentId: parseInt(segId),
            segmentType: segType,
            fieldPath: 'sectionTitle'
          });
        }
        
        const features = segData.features || [];
        for (let i = 0; i < features.length; i++) {
          const feature = features[i];
          if (feature.title) {
            headings.push({
              level: 'h3',
              text: feature.title,
              segmentKey: segKey,
              segmentId: parseInt(segId),
              segmentType: segType,
              fieldPath: `features[${i}].title`
            });
          }
          if (feature.description) {
            const cleanText = feature.description.replace(/<[^>]*>/g, '');
            bodyTexts.push({
              text: cleanText,
              segmentKey: segKey,
              segmentId: parseInt(segId),
              segmentType: segType,
              fieldPath: `features[${i}].description`,
              isIntro: false
            });
            const words = cleanText.split(/\s+/).filter((w: string) => w.length > 0);
            totalWords += words.length;
          }
        }
      }

      // Extract from tiles segments
      if (segType === 'tiles') {
        const tiles = segData.tiles || [];
        for (let i = 0; i < tiles.length; i++) {
          const tile = tiles[i];
          if (tile.title) {
            headings.push({
              level: 'h3',
              text: tile.title,
              segmentKey: segKey,
              segmentId: parseInt(segId),
              segmentType: segType,
              fieldPath: `tiles[${i}].title`
            });
          }
          if (tile.description) {
            const cleanText = tile.description.replace(/<[^>]*>/g, '');
            bodyTexts.push({
              text: cleanText,
              segmentKey: segKey,
              segmentId: parseInt(segId),
              segmentType: segType,
              fieldPath: `tiles[${i}].description`,
              isIntro: false
            });
            const words = cleanText.split(/\s+/).filter((w: string) => w.length > 0);
            totalWords += words.length;
          }
        }
      }
    }

    // Count FKW occurrences
    let fkwOccurrences = 0;
    const allText = [...headings.map(h => h.text), ...bodyTexts.map(b => b.text)].join(' ').toLowerCase();
    const fkwRegex = new RegExp(fkwLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = allText.match(fkwRegex);
    fkwOccurrences = matches ? matches.length : 0;

    // Calculate density
    const fkwDensity = totalWords > 0 ? (fkwOccurrences / totalWords) * 100 : 0;
    let densityStatus: 'too_low' | 'optimal' | 'too_high' = 'optimal';
    if (fkwDensity < 0.5) densityStatus = 'too_low';
    else if (fkwDensity > 2.0) densityStatus = 'too_high';

    // Analyze headings
    const h1Headings = headings.filter(h => h.level === 'h1');
    const h2Headings = headings.filter(h => h.level === 'h2');
    const h3Headings = headings.filter(h => h.level === 'h3');
    
    const h1HasFkw = h1Headings.some(h => h.text.toLowerCase().includes(fkwLower));
    const h2WithFkw = h2Headings.filter(h => h.text.toLowerCase().includes(fkwLower)).length;
    const h3WithFkw = h3Headings.filter(h => h.text.toLowerCase().includes(fkwLower)).length;
    
    // Check intro
    const introTexts = bodyTexts.filter(b => b.isIntro);
    const introHasFkw = introTexts.some(i => i.text.toLowerCase().includes(fkwLower));

    console.log('[FKW Content] Analysis:', {
      totalWords,
      fkwOccurrences,
      fkwDensity: fkwDensity.toFixed(2),
      headingsCount: headings.length,
      h2Count: h2Headings.length,
      h2WithFkw,
      h3Count: h3Headings.length,
      h3WithFkw
    });

    // Find candidates for optimization (headings/body without FKW)
    const headingCandidates = [...h2Headings, ...h3Headings]
      .filter(h => !h.text.toLowerCase().includes(fkwLower))
      .slice(0, 4); // Max 4 heading candidates

    const bodyCandidates = bodyTexts
      .filter(b => !b.text.toLowerCase().includes(fkwLower) && b.text.length > 50)
      .slice(0, 3); // Max 3 body candidates

    // Generate AI suggestions
    const systemPrompt = `You are an SEO expert optimizing content for the focus keyword: "${focusKeyword}"

TASK: Generate optimized versions of headings and body text that naturally incorporate the focus keyword.

RULES:
1. Focus keyword must appear NATURALLY - no keyword stuffing
2. Keep the original meaning and context
3. H2/H3 headlines should be 40-70 characters when possible
4. For body text, suggest a complete rewritten first paragraph (40-80 words)
5. Focus keyword should appear once in each suggestion
6. Maintain professional, engaging tone

RESPONSE FORMAT (JSON array):
[
  {
    "originalText": "exact original text",
    "suggestedText": "optimized version with focus keyword",
    "suggestionType": "heading" or "body",
    "headingLevel": "h2" or "h3" (only for headings),
    "reason": "brief explanation why this optimization works",
    "priority": 1-5 (1 = highest priority)
  }
]

Return max 5 suggestions total, prioritizing:
1. H2 headings without keyword (highest priority)
2. H3 headings without keyword
3. First body paragraph (intro text) if keyword missing
4. Other body paragraphs`;

    const candidatesContext = [
      ...headingCandidates.map(h => ({
        type: 'heading',
        level: h.level,
        text: h.text,
        segmentType: h.segmentType
      })),
      ...bodyCandidates.map(b => ({
        type: 'body',
        text: b.text.substring(0, 300),
        segmentType: b.segmentType,
        isIntro: b.isIntro
      }))
    ];

    const userPrompt = `Focus Keyword: "${focusKeyword}"
Page: ${pageSlug}

CONTENT TO OPTIMIZE:
${JSON.stringify(candidatesContext, null, 2)}

Generate optimized versions that naturally include the focus keyword. Return only suggestions where including the keyword makes semantic sense.`;

    console.log('[FKW Content] Calling AI for suggestions...');

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
        temperature: 0.6,
        max_tokens: 3000,
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
      console.error('[FKW Content] AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('[FKW Content] Raw AI response:', content);

    // Parse AI suggestions
    let aiSuggestions = [];
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        aiSuggestions = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('[FKW Content] Failed to parse AI response:', e);
    }

    // Map AI suggestions back to segment info
    const finalSuggestions: ContentSuggestion[] = [];

    for (const aiSug of aiSuggestions) {
      // Find matching candidate
      let matchedCandidate = null;
      let fieldPath = '';
      let segmentId = 0;
      let segmentKey = '';
      let segmentType = '';

      if (aiSug.suggestionType === 'heading') {
        matchedCandidate = headingCandidates.find(h => 
          h.text === aiSug.originalText || h.text.includes(aiSug.originalText) || aiSug.originalText.includes(h.text)
        );
        if (matchedCandidate) {
          fieldPath = matchedCandidate.fieldPath;
          segmentId = matchedCandidate.segmentId;
          segmentKey = matchedCandidate.segmentKey;
          segmentType = matchedCandidate.segmentType;
        }
      } else {
        matchedCandidate = bodyCandidates.find(b => 
          b.text.includes(aiSug.originalText.substring(0, 50)) || aiSug.originalText.includes(b.text.substring(0, 50))
        );
        if (matchedCandidate) {
          fieldPath = matchedCandidate.fieldPath;
          segmentId = matchedCandidate.segmentId;
          segmentKey = matchedCandidate.segmentKey;
          segmentType = matchedCandidate.segmentType;
        }
      }

      if (matchedCandidate && segmentId) {
        finalSuggestions.push({
          suggestionType: aiSug.suggestionType,
          headingLevel: aiSug.headingLevel,
          currentText: aiSug.originalText,
          suggestedText: aiSug.suggestedText,
          segmentKey,
          segmentId,
          segmentType,
          fieldPath,
          reason: aiSug.reason,
          priority: aiSug.priority || finalSuggestions.length + 1
        });
      }
    }

    // Sort by priority and limit to 5
    finalSuggestions.sort((a, b) => a.priority - b.priority);
    const limitedSuggestions = finalSuggestions.slice(0, 5);

    // Calculate score
    let score = 0;
    if (h1HasFkw) score += 25;
    if (introHasFkw) score += 20;
    if (h2WithFkw > 0) score += 15;
    if (h2WithFkw >= 2) score += 10;
    if (h3WithFkw > 0) score += 10;
    if (densityStatus === 'optimal') score += 20;
    else if (densityStatus === 'too_low') score += 5;

    // Generate recommendations
    const recommendations: string[] = [];
    if (!h1HasFkw) recommendations.push('Focus Keyword fehlt in der H1-Überschrift');
    if (!introHasFkw) recommendations.push('Focus Keyword fehlt im Intro-Text');
    if (h2Headings.length > 0 && h2WithFkw === 0) recommendations.push('Mindestens eine H2-Überschrift sollte das Focus Keyword enthalten');
    if (densityStatus === 'too_low') recommendations.push('Keyword-Dichte ist zu niedrig (unter 0.5%)');
    if (densityStatus === 'too_high') recommendations.push('Achtung: Keyword-Dichte könnte zu hoch sein (über 2%)');
    if (score >= 80) recommendations.push('✓ Sehr gute FKW-Optimierung!');

    const result: AnalysisResult = {
      suggestions: limitedSuggestions,
      analysis: {
        totalWords,
        fkwOccurrences,
        fkwDensity: Math.round(fkwDensity * 100) / 100,
        densityStatus,
        h1HasFkw,
        h2Count: h2Headings.length,
        h2WithFkw,
        h3Count: h3Headings.length,
        h3WithFkw,
        introHasFkw
      },
      score,
      recommendations
    };

    console.log('[FKW Content] Final result:', {
      suggestionsCount: limitedSuggestions.length,
      score,
      analysis: result.analysis
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[FKW Content] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      suggestions: [],
      analysis: null,
      score: 0,
      recommendations: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
