import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParsedContent {
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  specifications: { name: string; value: string }[];
  useCases: { title: string; description: string }[];
  downloads: { title: string; description: string; url: string; language: string }[];
  videoUrl: string | null;
  images: { url: string; title: string }[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, language = 'en' } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching content from: ${url}`);

    // Fetch the page content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ContentAutomation/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    console.log(`Fetched ${html.length} bytes of HTML`);

    // Parse the content
    const parsed = parseHtmlContent(html, url, language);

    return new Response(
      JSON.stringify({ success: true, data: parsed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error fetching content:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function parseHtmlContent(html: string, baseUrl: string, language: string): ParsedContent {
  const result: ParsedContent = {
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

  // Extract subtitle (often in a specific class or following h1)
  const subtitleMatch = html.match(/class="[^"]*subtitle[^"]*"[^>]*>([^<]+)</i) ||
                        html.match(/<h2[^>]*class="[^"]*product[^"]*"[^>]*>([^<]+)</i);
  if (subtitleMatch) {
    result.subtitle = cleanText(subtitleMatch[1]);
  }

  // Extract main description - look for first paragraph after intro
  const descMatch = html.match(/<p[^>]*>([^<]{50,500})<\/p>/i);
  if (descMatch) {
    result.description = cleanText(descMatch[1]);
  }

  // Extract bullet points/benefits
  const ulMatches = html.matchAll(/<ul[^>]*>([\s\S]*?)<\/ul>/gi);
  for (const ulMatch of ulMatches) {
    const liMatches = ulMatch[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi);
    for (const liMatch of liMatches) {
      const text = cleanText(liMatch[1].replace(/<[^>]+>/g, ''));
      if (text.length > 10 && text.length < 200 && !text.includes('http')) {
        result.benefits.push(text);
      }
    }
    // Only take first meaningful list
    if (result.benefits.length >= 3) break;
  }

  // Extract specifications table
  const tableMatches = html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
  for (const trMatch of tableMatches) {
    const cells = trMatch[1].match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi);
    if (cells && cells.length >= 2) {
      const name = cleanText(cells[0].replace(/<[^>]+>/g, ''));
      const value = cleanText(cells[1].replace(/<[^>]+>/g, ''));
      if (name && value && name.length < 100 && value.length < 200) {
        result.specifications.push({ name, value });
      }
    }
  }

  // Extract use cases/features from h2/h3 sections
  const sectionMatches = html.matchAll(/<h[23][^>]*>([^<]+)<\/h[23]>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi);
  for (const match of sectionMatches) {
    const title = cleanText(match[1]);
    const desc = cleanText(match[2].replace(/<[^>]+>/g, ''));
    if (title.length > 5 && title.length < 100 && desc.length > 20 && desc.length < 500) {
      // Skip navigation/generic sections
      if (!title.toLowerCase().includes('menu') && 
          !title.toLowerCase().includes('footer') &&
          !title.toLowerCase().includes('contact')) {
        result.useCases.push({ title, description: desc });
      }
    }
    if (result.useCases.length >= 4) break;
  }

  // Extract download links (PDF files)
  const pdfMatches = html.matchAll(/<a[^>]*href="([^"]*\.pdf)"[^>]*>([^<]*)</gi);
  for (const match of pdfMatches) {
    let pdfUrl = match[1];
    const title = cleanText(match[2]);
    
    // Make URL absolute
    if (!pdfUrl.startsWith('http')) {
      const urlObj = new URL(baseUrl);
      pdfUrl = pdfUrl.startsWith('/') 
        ? `${urlObj.origin}${pdfUrl}`
        : `${urlObj.origin}/${pdfUrl}`;
    }
    
    // Detect language from filename or title
    const isGerman = pdfUrl.toLowerCase().includes('_de') || 
                     pdfUrl.toLowerCase().includes('/de_') ||
                     title.toLowerCase().includes('deutsch') ||
                     title.toLowerCase().includes('datenblatt') ||
                     title.toLowerCase().includes('betriebsanleitung');
    
    const isEnglish = pdfUrl.toLowerCase().includes('_en') ||
                      pdfUrl.toLowerCase().includes('/en_') ||
                      title.toLowerCase().includes('english') ||
                      title.toLowerCase().includes('datasheet') ||
                      title.toLowerCase().includes('manual');
    
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
    
    // Filter out small icons, tracking pixels etc.
    if (imgUrl.includes('icon') || 
        imgUrl.includes('logo') ||
        imgUrl.includes('pixel') ||
        imgUrl.includes('tracking') ||
        imgUrl.length < 10) continue;
    
    // Make URL absolute
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
  return 'Product documentation';
}
