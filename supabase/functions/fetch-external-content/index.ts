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

  // STEP 1: Try to find the main article content area first
  let mainContent = html;
  
  // Look for article-content, main-content, or similar containers
  const articleMatch = html.match(/<section[^>]*class="[^"]*article-content[^"]*"[^>]*>([\s\S]*?)<\/section>/i) ||
                       html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                       html.match(/<div[^>]*class="[^"]*main-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                       html.match(/<div[^>]*id="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  
  if (articleMatch) {
    mainContent = articleMatch[1];
    console.log('Found main article content area, length:', mainContent.length);
  }

  // STEP 2: Clean the content from unwanted sections
  let cleanedHtml = mainContent
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<aside[\s\S]*?<\/aside>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    // Remove sidebar divs
    .replace(/<div[^>]*class="[^"]*sidebar[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*class="[^"]*t3-sidebar[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    // Remove gallery/lightbox modal content
    .replace(/<div[^>]*class="[^"]*modal[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<div[^>]*class="[^"]*ba-modal[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
    // Remove social share buttons
    .replace(/<div[^>]*class="[^"]*share[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '');

  console.log('HTML cleaned, main content length:', cleanedHtml.length);

  // STEP 3: Extract title - try multiple approaches
  const h1Match = cleanedHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    result.title = cleanText(h1Match[1].replace(/<[^>]+>/g, ''));
  }
  if (!result.title) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      result.title = cleanText(titleMatch[1].split('|')[0].split('-')[0]);
    }
  }
  // Try modal title as fallback
  if (!result.title) {
    const modalTitleMatch = html.match(/class="modal-title"[^>]*>([^<]+)</i);
    if (modalTitleMatch) {
      result.title = cleanText(modalTitleMatch[1].split('|')[0]);
    }
  }
  console.log('Extracted title:', result.title);

  // STEP 4: Extract subtitle from category or heading
  const subtitleMatch = html.match(/class="[^"]*category-banner__heading[^"]*"[^>]*>([^<]+)</i) ||
                        html.match(/class="[^"]*subtitle[^"]*"[^>]*>([^<]+)</i) ||
                        html.match(/<h2[^>]*>([^<]+)<\/h2>/i);
  if (subtitleMatch) {
    result.subtitle = cleanText(subtitleMatch[1]);
  }

  // STEP 5: Extract ALL paragraphs - be more flexible with inner HTML
  const allParagraphs: string[] = [];
  const pMatches = cleanedHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi);
  for (const match of pMatches) {
    // Strip all inner HTML tags to get pure text
    const rawText = match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const text = cleanText(rawText);
    
    // Only include substantial paragraphs (min 50 chars) that aren't footer content
    if (text.length > 50 && !isFooterContent(text)) {
      allParagraphs.push(text);
    }
  }
  
  // Join all paragraphs as description
  result.description = allParagraphs.join('\n\n');
  console.log('Extracted paragraphs:', allParagraphs.length, 'Total description length:', result.description.length);

  // STEP 6: Extract benefits from the description by splitting into sentences
  if (result.description.length > 100) {
    // Split description into meaningful sentences and use as benefits
    const sentences = result.description
      .split(/[.!?]\s+/)
      .filter(s => s.length > 30 && s.length < 300)
      .map(s => s.trim() + '.');
    
    // Take key sentences as benefits
    result.benefits = sentences.slice(0, 8);
  }

  // Also try to extract from lists
  const ulMatches = cleanedHtml.matchAll(/<ul[^>]*>([\s\S]*?)<\/ul>/gi);
  for (const ulMatch of ulMatches) {
    const liMatches = ulMatch[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi);
    for (const liMatch of liMatches) {
      const text = cleanText(liMatch[1].replace(/<[^>]+>/g, ' '));
      if (text.length > 15 && text.length < 400 && !isFooterContent(text)) {
        result.benefits.push(text);
      }
    }
  }
  result.benefits = [...new Set(result.benefits)].slice(0, 12);
  console.log('Extracted benefits count:', result.benefits.length);

  // STEP 7: Extract specifications from tables
  const tableMatches = cleanedHtml.matchAll(/<table[^>]*>([\s\S]*?)<\/table>/gi);
  for (const tableMatch of tableMatches) {
    const trMatches = tableMatch[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
    for (const trMatch of trMatches) {
      const cells = [...trMatch[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)];
      if (cells.length >= 2) {
        const name = cleanText(cells[0][1].replace(/<[^>]+>/g, ''));
        const value = cleanText(cells[1][1].replace(/<[^>]+>/g, ''));
        if (name && value && name.length < 150 && value.length < 300 && !isFooterContent(name)) {
          result.specifications.push({ name, value });
        }
      }
    }
  }
  
  // Also extract from definition lists
  const dlMatches = cleanedHtml.matchAll(/<dl[^>]*>([\s\S]*?)<\/dl>/gi);
  for (const dlMatch of dlMatches) {
    const dtMatches = [...dlMatch[1].matchAll(/<dt[^>]*>([\s\S]*?)<\/dt>/gi)];
    const ddMatches = [...dlMatch[1].matchAll(/<dd[^>]*>([\s\S]*?)<\/dd>/gi)];
    for (let i = 0; i < Math.min(dtMatches.length, ddMatches.length); i++) {
      const name = cleanText(dtMatches[i][1].replace(/<[^>]+>/g, ''));
      const value = cleanText(ddMatches[i][1].replace(/<[^>]+>/g, ''));
      if (name && value) {
        result.specifications.push({ name, value });
      }
    }
  }
  result.specifications = result.specifications.slice(0, 25);
  console.log('Extracted specifications count:', result.specifications.length);

  // STEP 8: Generate use cases from content sections
  // Look for h3/h4 with following paragraphs
  const sectionMatches = cleanedHtml.matchAll(/<h[34][^>]*>([\s\S]*?)<\/h[34]>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi);
  for (const match of sectionMatches) {
    const title = cleanText(match[1].replace(/<[^>]+>/g, ''));
    const desc = cleanText(match[2].replace(/<[^>]+>/g, ''));
    if (title.length > 3 && title.length < 120 && desc.length > 20 && !isFooterContent(title)) {
      result.useCases.push({ title, description: desc.slice(0, 300) });
    }
    if (result.useCases.length >= 6) break;
  }
  
  // If no use cases found, generate from benefits
  if (result.useCases.length === 0 && result.benefits.length > 0) {
    result.useCases = result.benefits.slice(0, 4).map((benefit, idx) => ({
      title: `Feature ${idx + 1}`,
      description: benefit
    }));
  }
  console.log('Extracted useCases count:', result.useCases.length);

  // STEP 9: Extract download links (PDF files)
  const pdfMatches = html.matchAll(/<a[^>]*href="([^"]*\.pdf)"[^>]*>([\s\S]*?)<\/a>/gi);
  for (const match of pdfMatches) {
    let pdfUrl = match[1];
    // Extract link text, stripping any inner HTML
    const title = cleanText(match[2].replace(/<[^>]+>/g, ' '));
    
    // Make URL absolute
    if (!pdfUrl.startsWith('http')) {
      const urlObj = new URL(baseUrl);
      pdfUrl = pdfUrl.startsWith('/') 
        ? `${urlObj.origin}${pdfUrl}`
        : `${urlObj.origin}/${pdfUrl}`;
    }
    
    // Detect language from filename or title
    const isGerman = pdfUrl.toLowerCase().includes('_de') || 
                     title.toLowerCase().includes('deutsch') ||
                     title.toLowerCase().includes('datenblatt');
    const isEnglish = pdfUrl.toLowerCase().includes('_en') ||
                      title.toLowerCase().includes('english') ||
                      title.toLowerCase().includes('datasheet');
    const detectedLang = isGerman ? 'de' : (isEnglish ? 'en' : language);
    
    if (title.length > 3 && !isFooterContent(title)) {
      result.downloads.push({
        title: title.trim(),
        description: getDownloadDescription(title),
        url: pdfUrl,
        language: detectedLang,
      });
    }
  }
  console.log('Extracted downloads count:', result.downloads.length);

  // STEP 10: Extract video URL
  const videoMatch = html.match(/href="([^"]*\.mp4)"/i) ||
                     html.match(/src="([^"]*youtube[^"]*embed[^"]*)"/i) ||
                     html.match(/data-video="([^"]*)"/i);
  if (videoMatch) {
    result.videoUrl = videoMatch[1];
  }

  // STEP 11: Extract product images
  // First try main product image
  const mainImgMatch = html.match(/<div[^>]*class="[^"]*main-product-img[^"]*"[^>]*>[\s\S]*?<img[^>]*src="([^"]+)"[^>]*>/i);
  if (mainImgMatch) {
    result.images.push({ url: mainImgMatch[1], title: result.title });
  }
  
  // Then get gallery images
  const galleryImgMatches = html.matchAll(/data-original="([^"]+\.(png|jpg|jpeg|webp))"/gi);
  for (const match of galleryImgMatches) {
    const imgUrl = match[1];
    if (imgUrl && !imgUrl.includes('lazy-load') && !imgUrl.includes('default')) {
      result.images.push({ url: imgUrl, title: '' });
    }
    if (result.images.length >= 8) break;
  }
  
  // Fallback: get any relevant images
  if (result.images.length === 0) {
    const imgMatches = html.matchAll(/<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"/gi);
    for (const match of imgMatches) {
      const imgUrl = match[1];
      const alt = match[2] || '';
      if (imgUrl.startsWith('http') && 
          !imgUrl.includes('icon') && 
          !imgUrl.includes('logo') && 
          !imgUrl.includes('pixel') &&
          !imgUrl.includes('lazy-load')) {
        result.images.push({ url: imgUrl, title: alt });
      }
      if (result.images.length >= 8) break;
    }
  }
  console.log('Extracted images count:', result.images.length);

  // STEP 12: Log summary
  console.log('=== EXTRACTION SUMMARY ===');
  console.log('Title:', result.title);
  console.log('Description preview:', result.description.slice(0, 200) + '...');
  console.log('Benefits:', result.benefits.length);
  console.log('Specifications:', result.specifications.length);
  console.log('UseCases:', result.useCases.length);
  console.log('Downloads:', result.downloads.length);
  console.log('Images:', result.images.length);

  return result;
}

// Helper function to detect footer/navigation/irrelevant content
function isFooterContent(text: string): boolean {
  const lower = text.toLowerCase();
  const footerPatterns = [
    'cookie', 'privacy policy', 'newsletter', 'subscribe', 'copyright', 
    'all rights reserved', 'impressum', 'datenschutz',
    'follow us', 'social media',
    'menu', 'navigation', 'sitemap',
    'login', 'register', 'anmelden',
    'related products', 'ähnliche produkte',
    'web shop is currently unavailable'
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
  if (lower.includes('datasheet') || lower.includes('datenblatt') || lower.includes('specification')) {
    return 'Technical specifications and product details';
  }
  if (lower.includes('manual') || lower.includes('anleitung')) {
    return 'Complete operating instructions';
  }
  if (lower.includes('brochure') || lower.includes('broschüre') || lower.includes('flyer')) {
    return 'Product overview and features';
  }
  return 'Product documentation';
}
