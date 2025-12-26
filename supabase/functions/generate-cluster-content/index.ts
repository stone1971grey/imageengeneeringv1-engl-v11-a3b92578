import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pageSlug, pageTitle, parentPageSlug, segments, pillarPageContent } = await req.json();
    
    console.log('[generate-cluster-content] Generating content for:', pageSlug);
    console.log('[generate-cluster-content] Page title:', pageTitle);
    console.log('[generate-cluster-content] Segments to generate:', segments?.length);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build context from parent page
    let parentContext = '';
    if (pillarPageContent) {
      parentContext = `
PARENT PILLAR PAGE CONTEXT:
Title: ${pillarPageContent.title || 'Unknown'}
Description: ${pillarPageContent.description || 'No description'}
Key Topics: ${pillarPageContent.topics?.join(', ') || 'Not specified'}
`;
    }

    // Generate content for each segment
    const generatedSegments: Record<string, any> = {};

    for (const segment of segments || []) {
      const segmentType = segment.type;
      const segmentId = segment.id;
      
      console.log(`[generate-cluster-content] Generating content for segment: ${segmentType} (ID: ${segmentId})`);

      const prompt = buildPromptForSegment(segmentType, pageTitle, parentContext, segment.currentData);

      try {
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { 
                role: 'system', 
                content: `Du bist ein technischer Content-Writer für Image Engineering, ein führendes Unternehmen im Bereich Bildqualitätstests und Kamerakalibrierung. 
                
Schreibe professionelle, technisch fundierte Inhalte auf Deutsch. 
- Verwende einen sachlichen, informativen Ton
- Fokussiere auf technische Details und praktische Anwendungen
- Halte dich an SEO-Best-Practices
- Antworte NUR mit validem JSON ohne Markdown-Formatierung`
              },
              { role: 'user', content: prompt }
            ],
          }),
        });

        if (!response.ok) {
          console.error(`[generate-cluster-content] AI API error for ${segmentType}:`, response.status);
          continue;
        }

        const data = await response.json();
        let content = data.choices?.[0]?.message?.content || '';
        
        // Clean up JSON response
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        try {
          const parsedContent = JSON.parse(content);
          generatedSegments[segmentId] = {
            type: segmentType,
            data: parsedContent
          };
          console.log(`[generate-cluster-content] Successfully generated content for ${segmentType}`);
        } catch (parseError) {
          console.error(`[generate-cluster-content] Failed to parse JSON for ${segmentType}:`, parseError);
          // Use fallback content
          generatedSegments[segmentId] = {
            type: segmentType,
            data: getFallbackContent(segmentType, pageTitle)
          };
        }
      } catch (segmentError) {
        console.error(`[generate-cluster-content] Error generating ${segmentType}:`, segmentError);
      }
    }

    // Update page_segments in database with generated content
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current page_segments
    const { data: existingContent, error: fetchError } = await supabase
      .from('page_content')
      .select('*')
      .eq('page_slug', pageSlug)
      .eq('section_key', 'page_segments')
      .eq('language', 'en')
      .single();

    if (fetchError) {
      console.error('[generate-cluster-content] Error fetching page_segments:', fetchError);
      throw fetchError;
    }

    // Parse and update segments
    let pageSegments = JSON.parse(existingContent.content_value || '[]');
    
    for (const seg of pageSegments) {
      const generatedData = generatedSegments[seg.id];
      if (generatedData) {
        seg.data = { ...seg.data, ...generatedData.data };
      }
    }

    // Save updated page_segments
    const { error: updateError } = await supabase
      .from('page_content')
      .update({
        content_value: JSON.stringify(pageSegments),
        updated_at: new Date().toISOString()
      })
      .eq('id', existingContent.id);

    if (updateError) {
      console.error('[generate-cluster-content] Error updating page_segments:', updateError);
      throw updateError;
    }

    console.log('[generate-cluster-content] Successfully updated page with generated content');

    return new Response(JSON.stringify({ 
      success: true, 
      generatedSegments: Object.keys(generatedSegments).length,
      segments: generatedSegments
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[generate-cluster-content] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function buildPromptForSegment(segmentType: string, pageTitle: string, parentContext: string, currentData: any): string {
  const baseContext = `
Thema der Cluster-Seite: "${pageTitle}"
${parentContext}

Generiere professionellen, technisch fundierten Content für dieses Segment.
`;

  switch (segmentType) {
    case 'action-hero':
      return `${baseContext}
Generiere ein Action-Hero Segment mit:
- headline: Eine kraftvolle, prägnante Überschrift (max 60 Zeichen)
- subline: Ein erklärender Untertitel (max 150 Zeichen)
- ctaText: Call-to-Action Button-Text (z.B. "Mehr erfahren", "Jetzt entdecken")
- ctaLink: "#intro"
- backgroundStyle: "gradient"
- alignment: "center"

Antworte mit validem JSON:
{
  "headline": "...",
  "subline": "...",
  "ctaText": "...",
  "ctaLink": "#intro",
  "backgroundStyle": "gradient",
  "alignment": "center"
}`;

    case 'intro':
      return `${baseContext}
Generiere ein Intro-Segment mit:
- headline: Die H1-Überschrift für SEO (inkludiere das Hauptkeyword)
- headingLevel: "h1"
- introText: Ein informativer Einführungstext (HTML-formatiert, 150-250 Wörter) mit:
  - Überblick über das Thema
  - Wichtigste Vorteile/Features als <ul><li> Liste
  - Relevanz für die Zielgruppe (Ingenieure, Qualitätsmanager)
- alignment: "left"
- showDivider: true

Antworte mit validem JSON:
{
  "headline": "...",
  "headingLevel": "h1",
  "introText": "<p>...</p><ul><li>...</li></ul>",
  "alignment": "left",
  "showDivider": true
}`;

    case 'faq':
      return `${baseContext}
Generiere ein FAQ-Segment mit 4-5 relevanten Fragen und detaillierten Antworten.
- headline: "Häufige Fragen zu [Thema]"
- items: Array mit question/answer Paaren

Die Fragen sollten typische Kundenfragen abdecken:
- Was ist/sind...?
- Wie funktioniert...?
- Welche Vorteile bietet...?
- Für wen eignet sich...?
- Wie unterscheidet sich...?

Antworte mit validem JSON:
{
  "headline": "Häufige Fragen zu ...",
  "items": [
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."}
  ]
}`;

    case 'specification':
      return `${baseContext}
Generiere ein Specification-Segment mit technischen Daten:
- title: "Technische Spezifikationen"
- rows: Array mit specification/value Paaren (mind. 5 Einträge)
- description: Kurzer erklärender Text unter der Tabelle

Typische Spezifikationen könnten sein:
- Messprinzip, Genauigkeit, Auflösung
- Unterstützte Standards (ISO, IEEE, EMVA)
- Softwarekompatibilität
- Anwendungsbereiche

Antworte mit validem JSON:
{
  "title": "Technische Spezifikationen",
  "rows": [
    {"specification": "...", "value": "..."}
  ],
  "description": "..."
}`;

    case 'feature-overview':
      return `${baseContext}
Generiere ein Feature-Overview-Segment mit 4 Features:
- title: "Features & Vorteile"
- subtext: Kurzer einleitender Text
- layout: "2"
- rows: "2"
- items: Array mit 4 Features (title + description)

Jedes Feature sollte einen konkreten Nutzen beschreiben.

Antworte mit validem JSON:
{
  "title": "Features & Vorteile",
  "subtext": "...",
  "layout": "2",
  "rows": "2",
  "items": [
    {"title": "...", "description": "..."},
    {"title": "...", "description": "..."},
    {"title": "...", "description": "..."},
    {"title": "...", "description": "..."}
  ]
}`;

    default:
      return `${baseContext}
Generiere passenden Content für ein "${segmentType}"-Segment.
- headline: Passende Überschrift
- description: Beschreibender Text

Antworte mit validem JSON:
{
  "headline": "...",
  "description": "..."
}`;
  }
}

function getFallbackContent(segmentType: string, pageTitle: string): Record<string, any> {
  switch (segmentType) {
    case 'action-hero':
      return {
        headline: pageTitle,
        subline: `Entdecken Sie alle Details zu ${pageTitle}`,
        ctaText: 'Mehr erfahren',
        ctaLink: '#intro',
        backgroundStyle: 'gradient',
        alignment: 'center'
      };
    case 'intro':
      return {
        headline: pageTitle,
        headingLevel: 'h1',
        introText: `<p>Willkommen auf der Detailseite zu ${pageTitle}. Hier finden Sie umfassende Informationen zu diesem Thema.</p>`,
        alignment: 'left',
        showDivider: true
      };
    case 'faq':
      return {
        headline: `Häufige Fragen zu ${pageTitle}`,
        items: [
          { question: `Was ist ${pageTitle}?`, answer: 'Inhalt wird in Kürze ergänzt.' },
          { question: `Welche Vorteile bietet ${pageTitle}?`, answer: 'Inhalt wird in Kürze ergänzt.' }
        ]
      };
    default:
      return {
        headline: pageTitle,
        description: `Informationen zu ${pageTitle}`
      };
  }
}
