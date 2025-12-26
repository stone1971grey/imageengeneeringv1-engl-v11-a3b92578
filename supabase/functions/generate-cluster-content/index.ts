import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SourceContent {
  title: string;
  subtitle?: string;
  description: string;
  benefits: string[];
  specifications: { name: string; value: string }[];
  useCases: { title: string; description: string }[];
  downloads: { title: string; description: string; url: string; language: string }[];
  videoUrl: string | null;
  images: { url: string; title: string }[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pageSlug, pageTitle, parentPageSlug, segments, pillarPageContent, sourceUrl, language = 'en' } = await req.json();
    
    console.log('[generate-cluster-content] Generating content for:', pageSlug);
    console.log('[generate-cluster-content] Page title:', pageTitle);
    console.log('[generate-cluster-content] Source URL:', sourceUrl);
    console.log('[generate-cluster-content] Language:', language);
    console.log('[generate-cluster-content] Segments to generate:', segments?.length);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Step 1: Fetch actual content from source URL if provided
    let sourceContent: SourceContent | null = null;
    if (sourceUrl) {
      console.log('[generate-cluster-content] Fetching source content from:', sourceUrl);
      try {
        const fetchResponse = await fetch(sourceUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; ContentAutomation/1.0)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
        });
        
        if (fetchResponse.ok) {
          const html = await fetchResponse.text();
          sourceContent = parseHtmlContent(html, sourceUrl, language);
          console.log('[generate-cluster-content] Parsed source content:', {
            title: sourceContent.title,
            benefitsCount: sourceContent.benefits.length,
            specsCount: sourceContent.specifications.length,
            downloadsCount: sourceContent.downloads.length,
            useCasesCount: sourceContent.useCases.length,
          });
        }
      } catch (fetchError) {
        console.error('[generate-cluster-content] Error fetching source:', fetchError);
      }
    }

    // Build context from parent page and source content
    let contextInfo = `
CLUSTER PAGE: "${pageTitle}"
PARENT PAGE: ${parentPageSlug || 'None'}
`;

    if (sourceContent) {
      contextInfo += `
ORIGINAL SOURCE CONTENT:
Title: ${sourceContent.title}
Subtitle: ${sourceContent.subtitle || 'Not available'}
Description: ${sourceContent.description}

BENEFITS FROM SOURCE (${sourceContent.benefits.length} items):
${sourceContent.benefits.map((b, i) => `${i + 1}. ${b}`).join('\n')}

SPECIFICATIONS FROM SOURCE (${sourceContent.specifications.length} items):
${sourceContent.specifications.map(s => `- ${s.name}: ${s.value}`).join('\n')}

USE CASES / FEATURES FROM SOURCE (${sourceContent.useCases.length} items):
${sourceContent.useCases.map(uc => `- ${uc.title}: ${uc.description}`).join('\n')}

DOWNLOADS FROM SOURCE (${sourceContent.downloads.length} items):
${sourceContent.downloads.map(d => `- ${d.title} (${d.language}): ${d.url}`).join('\n')}

VIDEO: ${sourceContent.videoUrl || 'None'}
`;
    }

    if (pillarPageContent) {
      contextInfo += `
PILLAR PAGE CONTEXT:
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

      // Check if we can use source content directly for certain segments
      let generatedData = null;
      
      if (sourceContent) {
        generatedData = generateFromSourceContent(segmentType, sourceContent, pageTitle, language);
      }

      // If no direct content, use AI to enhance/generate
      if (!generatedData) {
        const prompt = buildEnhancedPrompt(segmentType, pageTitle, contextInfo, sourceContent, language);

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
                  content: getSystemPrompt(language)
                },
                { role: 'user', content: prompt }
              ],
            }),
          });

          if (!response.ok) {
            console.error(`[generate-cluster-content] AI API error for ${segmentType}:`, response.status);
            generatedData = getFallbackContent(segmentType, pageTitle, sourceContent, language);
          } else {
            const data = await response.json();
            let content = data.choices?.[0]?.message?.content || '';
            
            // Clean up JSON response
            content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            
            try {
              generatedData = JSON.parse(content);
              console.log(`[generate-cluster-content] Successfully generated AI content for ${segmentType}`);
            } catch (parseError) {
              console.error(`[generate-cluster-content] Failed to parse JSON for ${segmentType}:`, parseError);
              generatedData = getFallbackContent(segmentType, pageTitle, sourceContent, language);
            }
          }
        } catch (segmentError) {
          console.error(`[generate-cluster-content] Error generating ${segmentType}:`, segmentError);
          generatedData = getFallbackContent(segmentType, pageTitle, sourceContent, language);
        }
      }

      if (generatedData) {
        generatedSegments[segmentId] = {
          type: segmentType,
          data: generatedData
        };
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
      .eq('language', language)
      .single();

    if (fetchError) {
      console.error('[generate-cluster-content] Error fetching page_segments:', fetchError);
      throw fetchError;
    }

    // Parse and update segments - match by segmentId field
    let pageSegments = JSON.parse(existingContent.content_value || '[]');
    
    for (const seg of pageSegments) {
      const segId = seg.segmentId || seg.id;
      const generatedData = generatedSegments[segId];
      if (generatedData) {
        // Merge data, preserving segment structure
        seg.data = { ...seg.data, ...generatedData.data };
        console.log(`[generate-cluster-content] Updated segment ${segId} with ${generatedData.type} data`);
      }
    }

    // Also add downloads segment if we have downloads from source and no tiles segment exists
    if (sourceContent && sourceContent.downloads.length > 0) {
      const hasTiles = pageSegments.some((s: any) => s.type === 'tiles' || s.type === 'downloads');
      if (!hasTiles) {
        const filteredDownloads = sourceContent.downloads.filter(d => d.language === language || d.language === 'en');
        if (filteredDownloads.length > 0) {
          const tilesSegment = {
            id: `auto-tiles-${Date.now()}`,
            segmentId: `auto-tiles-${Date.now()}`,
            type: 'tiles',
            position: pageSegments.length,
            data: {
              title: language === 'de' ? 'Downloads' : 'Downloads',
              columns: String(Math.min(filteredDownloads.length, 3)),
              items: filteredDownloads.map(d => ({
                title: d.title,
                description: d.description,
                icon: 'FileText',
                ctaText: language === 'de' ? 'PDF herunterladen' : 'Download PDF',
                ctaLink: d.url,
                showButton: true,
              })),
            },
          };
          pageSegments.push(tilesSegment);
          console.log('[generate-cluster-content] Added tiles segment for downloads');
        }
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
      segments: generatedSegments,
      sourceContentUsed: !!sourceContent,
      downloadsAdded: sourceContent?.downloads.length || 0,
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

// Generate content directly from source when possible
function generateFromSourceContent(segmentType: string, source: SourceContent, pageTitle: string, language: string): Record<string, any> | null {
  switch (segmentType) {
    case 'specification':
      if (source.specifications.length >= 3) {
        return {
          title: language === 'de' ? 'Technische Spezifikationen' : 'Technical Specifications',
          rows: source.specifications.map(s => ({
            specification: s.name,
            value: s.value,
          })),
          description: language === 'de' 
            ? `Detaillierte technische Daten für ${source.title || pageTitle}.`
            : `Detailed technical specifications for ${source.title || pageTitle}.`,
        };
      }
      return null;

    case 'tiles':
      const filteredDownloads = source.downloads.filter(d => d.language === language || d.language === 'en');
      if (filteredDownloads.length > 0) {
        return {
          title: 'Downloads',
          columns: String(Math.min(filteredDownloads.length, 3)),
          items: filteredDownloads.map(d => ({
            title: d.title,
            description: d.description,
            icon: 'FileText',
            ctaText: language === 'de' ? 'PDF herunterladen' : 'Download PDF',
            ctaLink: d.url,
            showButton: true,
          })),
        };
      }
      return null;

    case 'video':
      if (source.videoUrl) {
        return {
          title: language === 'de' ? 'Produktvideo' : 'Product Video',
          videoUrl: source.videoUrl,
          aspectRatio: '16:9',
          autoplay: false,
          muted: true,
          loop: false,
        };
      }
      return null;

    default:
      return null;
  }
}

function getSystemPrompt(language: string): string {
  if (language === 'de') {
    return `Du bist ein erfahrener technischer Content-Writer für Image Engineering, ein führendes Unternehmen im Bereich Bildqualitätstests und Kamerakalibrierung.

WICHTIGE REGELN:
- Schreibe professionelle, technisch fundierte Inhalte auf Deutsch
- Verwende einen sachlichen, informativen Ton
- Fokussiere auf technische Details und praktische Anwendungen
- Nutze die bereitgestellten Quellinhalte als Basis
- Halte dich an SEO-Best-Practices
- Antworte NUR mit validem JSON ohne Markdown-Formatierung

UNTERNEHMENSKONTEXT:
Image Engineering ist spezialisiert auf:
- Test Charts und Targets für Kamerakalibrierung
- Beleuchtungssysteme (Arcturus, Vega, LE7)
- Analysesoftware (iQ-Analyzer-X)
- Internationale Standards (ISO, IEEE, EMVA 1288)`;
  }

  return `You are an experienced technical content writer for Image Engineering, a leading company in image quality testing and camera calibration.

IMPORTANT RULES:
- Write professional, technically accurate content in English
- Use a factual, informative tone
- Focus on technical details and practical applications
- Use the provided source content as your foundation
- Follow SEO best practices
- Respond ONLY with valid JSON without Markdown formatting

COMPANY CONTEXT:
Image Engineering specializes in:
- Test Charts and Targets for camera calibration
- Illumination systems (Arcturus, Vega, LE7)
- Analysis software (iQ-Analyzer-X)
- International standards (ISO, IEEE, EMVA 1288)`;
}

function buildEnhancedPrompt(segmentType: string, pageTitle: string, contextInfo: string, source: SourceContent | null, language: string): string {
  const baseContext = `
${contextInfo}

Generate professional, technically accurate content for this segment.
IMPORTANT: Use the source content provided above as your primary reference. Expand and enhance it, don't just summarize.
`;

  const langLabel = language === 'de' ? 'German' : 'English';

  switch (segmentType) {
    case 'action-hero':
      return `${baseContext}

Generate an Action-Hero segment in ${langLabel} with:
- headline: A powerful, concise headline (max 60 chars) based on the source title
- subline: An explanatory subtitle (max 150 chars) that highlights the key value proposition
- ctaText: Call-to-action button text (e.g., "Learn More", "Get Started")
- ctaLink: "#intro"
- backgroundStyle: "gradient"
- alignment: "center"

IMPORTANT: The headline should capture the essence of ${pageTitle}. Use the source description for the subline.

Respond with valid JSON:
{
  "headline": "...",
  "subline": "...",
  "ctaText": "...",
  "ctaLink": "#intro",
  "backgroundStyle": "gradient",
  "alignment": "center"
}`;

    case 'intro':
      const benefitsList = source?.benefits?.slice(0, 6).map(b => `<li>${b}</li>`).join('\n') || '';
      return `${baseContext}

Generate an Intro segment in ${langLabel} with:
- headline: The H1 heading for SEO (include main keyword "${pageTitle}")
- headingLevel: "h1"
- introText: An informative introduction (HTML-formatted, 200-300 words) that includes:
  ${source?.description ? `\n  USE THIS AS BASE: "${source.description}"` : ''}
  - Comprehensive overview of the topic
  - Key benefits as <ul><li> list (use these from source: ${source?.benefits?.slice(0, 5).join('; ') || 'generate relevant ones'})
  - Target audience relevance (engineers, quality managers, OEMs)
  - Mention related standards if applicable (ISO, IEEE, EMVA)
- alignment: "left"
- showDivider: true

Respond with valid JSON:
{
  "headline": "...",
  "headingLevel": "h1",
  "introText": "<p>...</p><ul><li>...</li></ul><p>...</p>",
  "alignment": "left",
  "showDivider": true
}`;

    case 'faq':
      return `${baseContext}

Generate a FAQ segment in ${langLabel} with 5-6 relevant questions and detailed answers.
- headline: "Frequently Asked Questions about ${pageTitle}"
- items: Array with question/answer pairs

Base the FAQs on the source content. Include questions like:
1. What is ${pageTitle} and what are its main applications?
2. What technical specifications are important?
3. What are the key benefits compared to alternatives?
4. Which industry standards does it support?
5. How does it integrate with existing workflows?
6. What documentation/support is available?

Each answer should be 2-4 sentences with specific technical details.

Respond with valid JSON:
{
  "headline": "${language === 'de' ? 'Häufige Fragen zu' : 'Frequently Asked Questions about'} ${pageTitle}",
  "items": [
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."}
  ]
}`;

    case 'specification':
      const specs = source?.specifications?.slice(0, 10) || [];
      return `${baseContext}

Generate a Specification segment in ${langLabel} with technical data:
- title: "${language === 'de' ? 'Technische Spezifikationen' : 'Technical Specifications'}"
- rows: Array with specification/value pairs (minimum 8 entries)
${specs.length > 0 ? `\nUSE THESE SPECIFICATIONS FROM SOURCE:\n${specs.map(s => `- ${s.name}: ${s.value}`).join('\n')}` : ''}
- description: Brief explanatory text under the table

If source specs are incomplete, add typical specifications for this type of product:
- Measurement accuracy, resolution, range
- Supported standards (ISO, IEEE, EMVA)
- Software compatibility
- Operating conditions
- Dimensions and weight
- Connectivity options

Respond with valid JSON:
{
  "title": "${language === 'de' ? 'Technische Spezifikationen' : 'Technical Specifications'}",
  "rows": [
    {"specification": "...", "value": "..."}
  ],
  "description": "..."
}`;

    case 'feature-overview':
      const useCases = source?.useCases?.slice(0, 6) || [];
      return `${baseContext}

Generate a Feature-Overview segment in ${langLabel} with 4-6 features:
- title: "${language === 'de' ? 'Features & Vorteile' : 'Features & Benefits'}"
- subtext: Brief introductory text
- layout: "2" or "3"
- rows: "2"
- items: Array with features (title + description)

${useCases.length > 0 ? `USE THESE FEATURES FROM SOURCE:\n${useCases.map(uc => `- ${uc.title}: ${uc.description}`).join('\n')}` : ''}

Each feature should describe a concrete benefit with technical detail.

Respond with valid JSON:
{
  "title": "${language === 'de' ? 'Features & Vorteile' : 'Features & Benefits'}",
  "subtext": "...",
  "layout": "2",
  "rows": "2",
  "items": [
    {"title": "...", "description": "..."},
    {"title": "...", "description": "..."}
  ]
}`;

    case 'tiles':
      return `${baseContext}

Generate a Tiles segment in ${langLabel} for downloads/resources:
- title: "Downloads" or "${language === 'de' ? 'Dokumentation' : 'Documentation'}"
- columns: "3"
- items: Array with tiles (title, description, icon, ctaText, ctaLink, showButton)

Typical tiles for this product type:
- Datasheet (PDF with specifications)
- User Manual (operating instructions)
- Application Notes (use case examples)
- Software Downloads (if applicable)
- Brochure (product overview)

Respond with valid JSON:
{
  "title": "Downloads",
  "columns": "3",
  "items": [
    {"title": "...", "description": "...", "icon": "FileText", "ctaText": "Download PDF", "ctaLink": "#", "showButton": true}
  ]
}`;

    case 'banner-p':
      return `${baseContext}

Generate a Banner-P segment (call-to-action banner) in ${langLabel}:
- headline: Compelling headline that drives action
- description: Supporting text (1-2 sentences)
- ctaText: Button text
- ctaLink: "/contact"
- variant: "dark" or "gradient"

Respond with valid JSON:
{
  "headline": "...",
  "description": "...",
  "ctaText": "${language === 'de' ? 'Kontakt aufnehmen' : 'Get in Touch'}",
  "ctaLink": "/contact",
  "variant": "gradient"
}`;

    default:
      return `${baseContext}

Generate appropriate content in ${langLabel} for a "${segmentType}" segment.
- headline: Suitable heading
- description: Descriptive text based on the source content

Respond with valid JSON:
{
  "headline": "...",
  "description": "..."
}`;
  }
}

function getFallbackContent(segmentType: string, pageTitle: string, source: SourceContent | null, language: string): Record<string, any> {
  const isDE = language === 'de';
  
  switch (segmentType) {
    case 'action-hero':
      return {
        headline: source?.title || pageTitle,
        subline: source?.description?.slice(0, 150) || (isDE ? `Entdecken Sie alle Details zu ${pageTitle}` : `Discover all details about ${pageTitle}`),
        ctaText: isDE ? 'Mehr erfahren' : 'Learn More',
        ctaLink: '#intro',
        backgroundStyle: 'gradient',
        alignment: 'center'
      };
      
    case 'intro':
      const benefitsHtml = source?.benefits?.length 
        ? '<ul>' + source.benefits.slice(0, 5).map(b => `<li>${b}</li>`).join('') + '</ul>'
        : '';
      return {
        headline: source?.title || pageTitle,
        headingLevel: 'h1',
        introText: `<p>${source?.description || (isDE ? `Willkommen auf der Detailseite zu ${pageTitle}.` : `Welcome to the detail page for ${pageTitle}.`)}</p>${benefitsHtml}`,
        alignment: 'left',
        showDivider: true
      };
      
    case 'faq':
      return {
        headline: isDE ? `Häufige Fragen zu ${pageTitle}` : `Frequently Asked Questions about ${pageTitle}`,
        items: [
          { 
            question: isDE ? `Was ist ${pageTitle}?` : `What is ${pageTitle}?`, 
            answer: source?.description || (isDE ? 'Inhalt wird in Kürze ergänzt.' : 'Content will be added shortly.')
          },
          { 
            question: isDE ? `Welche Vorteile bietet ${pageTitle}?` : `What are the benefits of ${pageTitle}?`,
            answer: source?.benefits?.[0] || (isDE ? 'Inhalt wird in Kürze ergänzt.' : 'Content will be added shortly.')
          },
          {
            question: isDE ? 'Welche Standards werden unterstützt?' : 'What standards are supported?',
            answer: isDE ? 'Unterstützt ISO, IEEE und EMVA 1288 Standards.' : 'Supports ISO, IEEE, and EMVA 1288 standards.'
          }
        ]
      };
      
    case 'specification':
      return {
        title: isDE ? 'Technische Spezifikationen' : 'Technical Specifications',
        rows: source?.specifications?.slice(0, 8) || [
          { specification: isDE ? 'Typ' : 'Type', value: pageTitle }
        ],
        description: isDE ? `Technische Daten für ${pageTitle}.` : `Technical data for ${pageTitle}.`
      };
      
    case 'feature-overview':
      return {
        title: isDE ? 'Features & Vorteile' : 'Features & Benefits',
        subtext: '',
        layout: '2',
        rows: '2',
        items: source?.useCases?.slice(0, 4) || [
          { title: isDE ? 'Professionelle Qualität' : 'Professional Quality', description: isDE ? 'Höchste Präzision für professionelle Anwendungen.' : 'Highest precision for professional applications.' }
        ]
      };
      
    case 'tiles':
      const downloads = source?.downloads?.filter(d => d.language === language || d.language === 'en')?.slice(0, 4) || [];
      return {
        title: 'Downloads',
        columns: String(Math.min(downloads.length || 2, 3)),
        items: downloads.length > 0 
          ? downloads.map(d => ({
              title: d.title,
              description: d.description,
              icon: 'FileText',
              ctaText: isDE ? 'PDF herunterladen' : 'Download PDF',
              ctaLink: d.url,
              showButton: true
            }))
          : [{
              title: 'Datasheet',
              description: isDE ? 'Technische Spezifikationen' : 'Technical specifications',
              icon: 'FileText',
              ctaText: 'Download',
              ctaLink: '#',
              showButton: true
            }]
      };
      
    default:
      return {
        headline: pageTitle,
        description: source?.description || (isDE ? `Informationen zu ${pageTitle}` : `Information about ${pageTitle}`)
      };
  }
}

// HTML parsing functions
function parseHtmlContent(html: string, baseUrl: string, language: string): SourceContent {
  const result: SourceContent = {
    title: '',
    subtitle: '',
    description: '',
    benefits: [],
    specifications: [],
    useCases: [],
    downloads: [],
    videoUrl: null,
    images: [],
  };

  // Extract title from h1 or title tag
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) {
    result.title = cleanText(h1Match[1]);
  } else {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      result.title = cleanText(titleMatch[1].split('|')[0]);
    }
  }

  // Extract subtitle
  const subtitleMatch = html.match(/class="[^"]*subtitle[^"]*"[^>]*>([^<]+)</i) ||
                        html.match(/<h2[^>]*class="[^"]*product[^"]*"[^>]*>([^<]+)</i);
  if (subtitleMatch) {
    result.subtitle = cleanText(subtitleMatch[1]);
  }

  // Extract main description - look for multiple paragraphs
  const descMatches = html.matchAll(/<p[^>]*>([^<]{30,800})<\/p>/gi);
  const descriptions: string[] = [];
  for (const match of descMatches) {
    const text = cleanText(match[1]);
    if (text.length > 50 && !text.toLowerCase().includes('cookie') && !text.toLowerCase().includes('privacy')) {
      descriptions.push(text);
      if (descriptions.length >= 3) break;
    }
  }
  result.description = descriptions.join(' ');

  // Extract bullet points/benefits - be more thorough
  const ulMatches = html.matchAll(/<ul[^>]*>([\s\S]*?)<\/ul>/gi);
  for (const ulMatch of ulMatches) {
    const liMatches = ulMatch[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi);
    for (const liMatch of liMatches) {
      const text = cleanText(liMatch[1].replace(/<[^>]+>/g, ''));
      if (text.length > 10 && text.length < 300 && !text.includes('http')) {
        result.benefits.push(text);
      }
    }
  }
  // Deduplicate and limit
  result.benefits = [...new Set(result.benefits)].slice(0, 12);

  // Extract specifications table - more thorough
  const tableMatches = html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
  for (const trMatch of tableMatches) {
    const cells = trMatch[1].match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi);
    if (cells && cells.length >= 2) {
      const name = cleanText(cells[0].replace(/<[^>]+>/g, ''));
      const value = cleanText(cells[1].replace(/<[^>]+>/g, ''));
      if (name && value && name.length < 100 && value.length < 300) {
        result.specifications.push({ name, value });
      }
    }
  }
  result.specifications = result.specifications.slice(0, 20);

  // Extract use cases/features from h2/h3 sections
  const sectionMatches = html.matchAll(/<h[23][^>]*>([^<]+)<\/h[23]>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi);
  for (const match of sectionMatches) {
    const title = cleanText(match[1]);
    const desc = cleanText(match[2].replace(/<[^>]+>/g, ''));
    if (title.length > 5 && title.length < 100 && desc.length > 20 && desc.length < 600) {
      if (!title.toLowerCase().includes('menu') && 
          !title.toLowerCase().includes('footer') &&
          !title.toLowerCase().includes('contact') &&
          !title.toLowerCase().includes('cookie')) {
        result.useCases.push({ title, description: desc });
      }
    }
    if (result.useCases.length >= 8) break;
  }

  // Extract download links (PDF files)
  const pdfMatches = html.matchAll(/<a[^>]*href="([^"]*\.pdf)"[^>]*>([^<]*)</gi);
  for (const match of pdfMatches) {
    let pdfUrl = match[1];
    const title = cleanText(match[2]);
    
    if (!pdfUrl.startsWith('http')) {
      const urlObj = new URL(baseUrl);
      pdfUrl = pdfUrl.startsWith('/') 
        ? `${urlObj.origin}${pdfUrl}`
        : `${urlObj.origin}/${pdfUrl}`;
    }
    
    const isGerman = pdfUrl.toLowerCase().includes('_de') || 
                     pdfUrl.toLowerCase().includes('/de_') ||
                     title.toLowerCase().includes('deutsch') ||
                     title.toLowerCase().includes('datenblatt');
    
    const isEnglish = pdfUrl.toLowerCase().includes('_en') ||
                      pdfUrl.toLowerCase().includes('/en_') ||
                      title.toLowerCase().includes('english') ||
                      title.toLowerCase().includes('datasheet');
    
    const detectedLang = isGerman ? 'de' : (isEnglish ? 'en' : language);
    
    if (title.length > 3) {
      result.downloads.push({
        title,
        description: getDownloadDescription(title),
        url: pdfUrl,
        language: detectedLang,
      });
    }
  }

  // Extract video URL
  const videoMatch = html.match(/href="([^"]*\.mp4)"/i) ||
                     html.match(/src="([^"]*youtube[^"]*embed[^"]*)"/i) ||
                     html.match(/data-video="([^"]*)"/i);
  if (videoMatch) {
    result.videoUrl = videoMatch[1];
  }

  // Extract images
  const imgMatches = html.matchAll(/<img[^>]*src="([^"]*)"[^>]*(?:alt="([^"]*)")?/gi);
  for (const match of imgMatches) {
    let imgUrl = match[1];
    const alt = match[2] || '';
    
    if (imgUrl.includes('icon') || 
        imgUrl.includes('logo') ||
        imgUrl.includes('pixel') ||
        imgUrl.includes('tracking') ||
        imgUrl.length < 10) continue;
    
    if (!imgUrl.startsWith('http') && !imgUrl.startsWith('data:')) {
      const urlObj = new URL(baseUrl);
      imgUrl = imgUrl.startsWith('/') 
        ? `${urlObj.origin}${imgUrl}`
        : `${urlObj.origin}/${imgUrl}`;
    }
    
    if (imgUrl.startsWith('http')) {
      result.images.push({ url: imgUrl, title: alt });
    }
    
    if (result.images.length >= 10) break;
  }

  return result;
}

function cleanText(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function getDownloadDescription(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('datasheet') || lower.includes('datenblatt')) {
    return 'Technical specifications and product details';
  }
  if (lower.includes('manual') || lower.includes('anleitung')) {
    return 'Complete operating instructions';
  }
  if (lower.includes('brochure') || lower.includes('broschüre')) {
    return 'Product overview and features';
  }
  if (lower.includes('application') || lower.includes('anwendung')) {
    return 'Application notes and use cases';
  }
  if (lower.includes('quick') || lower.includes('schnell')) {
    return 'Quick start guide';
  }
  return 'Product documentation';
}
