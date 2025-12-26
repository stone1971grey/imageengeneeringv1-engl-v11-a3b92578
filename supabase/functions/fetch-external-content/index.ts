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

  // CRITICAL: Remove footer, header, nav, sidebar content BEFORE parsing
  let cleanedHtml = html
    // Remove footer sections completely
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<div[^>]*class="[^"]*footer[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<section[^>]*id="[^"]*footer[^"]*"[^>]*>[\s\S]*?<\/section>/gi, '')
    .replace(/<div[^>]*id="[^"]*footer[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    // Remove navigation
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<div[^>]*class="[^"]*navigation[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*class="[^"]*navbar[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*class="[^"]*nav-[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    // Remove sidebar
    .replace(/<aside[\s\S]*?<\/aside>/gi, '')
    .replace(/<div[^>]*class="[^"]*sidebar[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    // Remove cookie/privacy banners
    .replace(/<div[^>]*class="[^"]*cookie[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*id="[^"]*cookie[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*class="[^"]*privacy[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*class="[^"]*consent[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    // Remove newsletter sections
    .replace(/<div[^>]*class="[^"]*newsletter[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<section[^>]*class="[^"]*newsletter[^"]*"[^>]*>[\s\S]*?<\/section>/gi, '')
    // Remove related products/similar items sections
    .replace(/<div[^>]*class="[^"]*related[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<section[^>]*class="[^"]*related[^"]*"[^>]*>[\s\S]*?<\/section>/gi, '')
    // Remove scripts and styles
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '');

  console.log('HTML cleaned, removed footer/nav/sidebar content');

  // Extract title from h1 or title tag
  const h1Match = cleanedHtml.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) {
    result.title = cleanText(h1Match[1]);
  } else {
    const titleMatch = cleanedHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      result.title = cleanText(titleMatch[1].split('|')[0].split('-')[0]);
    }
  }
  console.log('Extracted title:', result.title);

  // Extract subtitle (often in a specific class or following h1)
  const subtitleMatch = cleanedHtml.match(/class="[^"]*subtitle[^"]*"[^>]*>([^<]+)</i) ||
                        cleanedHtml.match(/<h2[^>]*class="[^"]*product[^"]*"[^>]*>([^<]+)</i) ||
                        cleanedHtml.match(/<span[^>]*class="[^"]*category[^"]*"[^>]*>([^<]+)</i);
  if (subtitleMatch) {
    result.subtitle = cleanText(subtitleMatch[1]);
  }

  // Extract main description - look for multiple paragraphs and merge them
  const descMatches = cleanedHtml.matchAll(/<p[^>]*>([^<]{30,1000})<\/p>/gi);
  const descriptions: string[] = [];
  for (const match of descMatches) {
    const text = cleanText(match[1]);
    // Filter out navigation, cookie, footer content (double-check)
    if (text.length > 40 && !isFooterContent(text)) {
      descriptions.push(text);
      if (descriptions.length >= 5) break;
    }
  }
  result.description = descriptions.join(' ');
  console.log('Extracted description length:', result.description.length);

  // Extract bullet points/benefits from ALL lists, be thorough
  const ulMatches = cleanedHtml.matchAll(/<ul[^>]*>([\s\S]*?)<\/ul>/gi);
  for (const ulMatch of ulMatches) {
    const liMatches = ulMatch[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi);
    for (const liMatch of liMatches) {
      const text = cleanText(liMatch[1].replace(/<[^>]+>/g, ''));
      if (text.length > 10 && text.length < 400 && 
          !text.includes('http') && !isFooterContent(text)) {
        result.benefits.push(text);
      }
    }
  }
  // Also extract from ordered lists
  const olMatches = cleanedHtml.matchAll(/<ol[^>]*>([\s\S]*?)<\/ol>/gi);
  for (const olMatch of olMatches) {
    const liMatches = olMatch[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi);
    for (const liMatch of liMatches) {
      const text = cleanText(liMatch[1].replace(/<[^>]+>/g, ''));
      if (text.length > 10 && text.length < 400 && !text.includes('http') && !isFooterContent(text)) {
        result.benefits.push(text);
      }
    }
  }
  // Deduplicate benefits
  result.benefits = [...new Set(result.benefits)].slice(0, 15);
  console.log('Extracted benefits count:', result.benefits.length);

  // Extract specifications table - more thorough, look for all tables
  const tableMatches = cleanedHtml.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi);
  for (const tableMatch of tableMatches) {
    const trMatches = tableMatch[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
    for (const trMatch of trMatches) {
      const cells = trMatch[1].match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi);
      if (cells && cells.length >= 2) {
        const name = cleanText(cells[0].replace(/<[^>]+>/g, ''));
        const value = cleanText(cells[1].replace(/<[^>]+>/g, ''));
        if (name && value && name.length < 150 && value.length < 300 && 
            !isFooterContent(name) && !isFooterContent(value)) {
          result.specifications.push({ name, value });
        }
      }
    }
  }
  // Also try to extract from definition lists
  const dlMatches = cleanedHtml.matchAll(/<dl[^>]*>([\s\S]*?)<\/dl>/gi);
  for (const dlMatch of dlMatches) {
    const dtMatches = [...dlMatch[1].matchAll(/<dt[^>]*>([\s\S]*?)<\/dt>/gi)];
    const ddMatches = [...dlMatch[1].matchAll(/<dd[^>]*>([\s\S]*?)<\/dd>/gi)];
    for (let i = 0; i < Math.min(dtMatches.length, ddMatches.length); i++) {
      const name = cleanText(dtMatches[i][1].replace(/<[^>]+>/g, ''));
      const value = cleanText(ddMatches[i][1].replace(/<[^>]+>/g, ''));
      if (name && value && !isFooterContent(name)) {
        result.specifications.push({ name, value });
      }
    }
  }
  result.specifications = result.specifications.slice(0, 25);
  console.log('Extracted specifications count:', result.specifications.length);

  // Extract use cases/features from h2/h3/h4 sections
  const sectionMatches = cleanedHtml.matchAll(/<h[234][^>]*>([^<]+)<\/h[234]>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi);
  for (const match of sectionMatches) {
    const title = cleanText(match[1]);
    const desc = cleanText(match[2].replace(/<[^>]+>/g, ''));
    if (title.length > 3 && title.length < 120 && desc.length > 15 && desc.length < 600) {
      // Skip navigation/generic sections
      if (!isFooterContent(title) && !isFooterContent(desc)) {
        result.useCases.push({ title, description: desc });
      }
    }
    if (result.useCases.length >= 8) break;
  }
  console.log('Extracted useCases count:', result.useCases.length);

  // Extract download links (PDF files)
  const pdfMatches = cleanedHtml.matchAll(/<a[^>]*href="([^"]*\.pdf)"[^>]*>([^<]*)</gi);
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
    
    if (title.length > 3 && !isFooterContent(title)) {
      result.downloads.push({
        title,
        description: getDownloadDescription(title),
        url: pdfUrl,
        language: detectedLang,
      });
    }
  }
  console.log('Extracted downloads count:', result.downloads.length);

  // Extract video URL
  const videoMatch = cleanedHtml.match(/href="([^"]*\.mp4)"/i) ||
                     cleanedHtml.match(/src="([^"]*youtube[^"]*embed[^"]*)"/i) ||
                     cleanedHtml.match(/data-video="([^"]*)"/i);
  if (videoMatch) {
    result.videoUrl = videoMatch[1];
  }

  // Extract images (only from main content areas)
  const imgMatches = cleanedHtml.matchAll(/<img[^>]*src="([^"]*)"[^>]*(?:alt="([^"]*)")?/gi);
  for (const match of imgMatches) {
    let imgUrl = match[1];
    const alt = match[2] || '';
    
    // Filter out small icons, tracking pixels, footer images etc.
    if (imgUrl.includes('icon') || 
        imgUrl.includes('logo') ||
        imgUrl.includes('pixel') ||
        imgUrl.includes('tracking') ||
        imgUrl.includes('footer') ||
        imgUrl.includes('social') ||
        imgUrl.includes('badge') ||
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
  console.log('Extracted images count:', result.images.length);

  return result;
}

// Helper function to detect footer/navigation/irrelevant content
function isFooterContent(text: string): boolean {
  const lower = text.toLowerCase();
  const footerPatterns = [
    'cookie', 'privacy', 'newsletter', 'subscribe', 'copyright', 
    'all rights reserved', 'impressum', 'datenschutz', 'agb',
    'terms of service', 'nutzungsbedingungen', 'kontakt', 'contact us',
    'follow us', 'social media', 'facebook', 'twitter', 'linkedin', 'instagram',
    'tel:', 'fax:', 'phone:', 'email:', 'address:', 'adresse:',
    'menu', 'menü', 'navigation', 'sitemap', 'search', 'suche',
    'login', 'register', 'anmelden', 'registrieren',
    'similar products', 'related products', 'ähnliche produkte',
    'you may also like', 'das könnte sie auch interessieren',
    'back to top', 'nach oben', 'scroll to top',
    'all products', 'alle produkte', 'product overview', 'produktübersicht',
    'home', 'startseite', 'about us', 'über uns',
    'careers', 'jobs', 'karriere', 'press', 'presse',
    'legal notice', 'rechtliches', 'disclaimer', 'haftungsausschluss'
  ];
  
  for (const pattern of footerPatterns) {
    if (lower.includes(pattern)) return true;
  }
  return false;
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
