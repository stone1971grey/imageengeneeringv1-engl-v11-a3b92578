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

    console.log(`[Firecrawl] Fetching content from: ${url}`);

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Firecrawl to scrape the page - get markdown, html, and links
    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown', 'html', 'links'],
        onlyMainContent: true,
        waitFor: 2000, // Wait for dynamic content
      }),
    });

    if (!firecrawlResponse.ok) {
      const errorText = await firecrawlResponse.text();
      console.error('[Firecrawl] API error:', firecrawlResponse.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: `Firecrawl API error: ${firecrawlResponse.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const firecrawlData = await firecrawlResponse.json();
    console.log('[Firecrawl] Response success:', firecrawlData.success);

    if (!firecrawlData.success) {
      console.error('[Firecrawl] Scrape failed:', firecrawlData.error);
      return new Response(
        JSON.stringify({ success: false, error: firecrawlData.error || 'Firecrawl scrape failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = firecrawlData.data || firecrawlData;
    const markdown = data.markdown || '';
    const html = data.html || '';
    const links = data.links || [];
    const metadata = data.metadata || {};

    console.log('[Firecrawl] Markdown length:', markdown.length);
    console.log('[Firecrawl] HTML length:', html.length);
    console.log('[Firecrawl] Links count:', links.length);
    console.log('[Firecrawl] Metadata:', JSON.stringify(metadata).slice(0, 300));

    // Parse the Firecrawl data into our structured format
    const parsed = parseFirecrawlContent(markdown, html, links, metadata, url, language);

    console.log('[Firecrawl] === EXTRACTION SUMMARY ===');
    console.log('[Firecrawl] Title:', parsed.title);
    console.log('[Firecrawl] Description length:', parsed.description.length);
    console.log('[Firecrawl] Description preview:', parsed.description.slice(0, 300));
    console.log('[Firecrawl] Benefits:', parsed.benefits.length);
    console.log('[Firecrawl] Specifications:', parsed.specifications.length);
    console.log('[Firecrawl] UseCases:', parsed.useCases.length);
    console.log('[Firecrawl] Downloads:', parsed.downloads.length);
    console.log('[Firecrawl] Images:', parsed.images.length);

    return new Response(
      JSON.stringify({ success: true, data: parsed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('[Firecrawl] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function parseFirecrawlContent(
  markdown: string, 
  html: string, 
  links: string[], 
  metadata: Record<string, string>,
  baseUrl: string,
  language: string
): ParsedContent {
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

  // === TITLE ===
  // First try metadata, then extract from markdown H1
  result.title = metadata.title || '';
  if (!result.title) {
    const h1Match = markdown.match(/^#\s+(.+)$/m);
    if (h1Match) {
      result.title = h1Match[1].trim();
    }
  }
  // Clean up title (remove site name suffixes)
  result.title = result.title.split('|')[0].split(' - ')[0].trim();
  console.log('[Firecrawl] Extracted title:', result.title);

  // === SUBTITLE ===
  // Look for H2 or use meta description as subtitle
  const h2Match = markdown.match(/^##\s+(.+)$/m);
  if (h2Match) {
    result.subtitle = h2Match[1].trim();
  }

  // === DESCRIPTION ===
  // Extract clean paragraphs from the markdown content
  // The IE pages have navigation at start and JSON/gallery blocks later
  
  // Get meta description as fallback
  const metaDescription = (metadata.description || '').trim();
  console.log('[Firecrawl] Meta description:', metaDescription.slice(0, 200));
  
  // Find where JSON/gallery content starts (these pages have embedded JSON for galleries)
  const jsonPatterns = [
    /\{[^{}]*"form_id":/,
    /\{[^{}]*"id":\d+,/,
    /\{[^{}]*"category":/,
    /gallery images/i,
    /\[\s*\{/,  // Array of objects start
  ];
  
  let jsonStartIndex = markdown.length;
  for (const pattern of jsonPatterns) {
    const match = markdown.search(pattern);
    if (match > 0 && match < jsonStartIndex) {
      jsonStartIndex = match;
    }
  }
  
  // Find where navigation/header content ends
  // The shop notice is followed by the actual product content
  // We need to find the end of the shop notice line and start from there
  
  let mainContentStart = 0;
  
  // Strategy 1: Find shop notice and skip to next paragraph
  const shopNoticeIdx = markdown.indexOf('Our web shop is currently unavailable');
  if (shopNoticeIdx > 0) {
    // Find the end of this line/paragraph (next double newline)
    const nextParaIdx = markdown.indexOf('\n\n', shopNoticeIdx);
    if (nextParaIdx > 0) {
      mainContentStart = nextParaIdx + 2; // Skip past the double newline
      console.log('[Firecrawl] Found shop notice, skipping to:', mainContentStart);
    }
  }
  
  // Strategy 2: If no shop notice, look for first H2 or content paragraph
  if (mainContentStart === 0) {
    // Try to find first substantial paragraph after navigation
    const h2Idx = markdown.indexOf('## ');
    if (h2Idx > 0) {
      mainContentStart = h2Idx;
    }
  }
  
  console.log('[Firecrawl] Main content starts at index:', mainContentStart);
  
  // Extract the portion between navigation and JSON
  const contentPortion = markdown.substring(mainContentStart, jsonStartIndex);
  console.log('[Firecrawl] Content portion start:', mainContentStart);
  console.log('[Firecrawl] Content portion length:', contentPortion.length);
  console.log('[Firecrawl] Content portion preview:', contentPortion.slice(0, 600));
  
  // Process the content portion - split by double newlines
  const paragraphs: string[] = [];
  const listBlocks: string[] = []; // Separate list content
  const blocks = contentPortion.split(/\n\n+/);
  
  for (const block of blocks) {
    let trimmed = block.trim();
    
    // Skip headers (will use for title)
    if (trimmed.startsWith('#')) continue;
    // Skip navigation items
    if (trimmed === '×' || trimmed === 'Test Equipment' || trimmed === 'Main Menu') continue;
    // Skip the shop notice
    if (trimmed.includes('web shop is currently unavailable')) continue;
    // Skip footnotes (escaped asterisks at start like \*This is a footnote)
    if (trimmed.match(/^\\\*/)) continue;
    // Skip very short content
    if (trimmed.length < 30) continue;
    // Skip footer content
    if (isFooterContent(trimmed)) continue;
    // Skip navigation-like content
    if (trimmed.match(/^(Home|Products|Equipment|Software|Services|Company|Contact)\s*$/i)) continue;
    
    // Check if this is a list block (multiple list items)
    const isListBlock = trimmed.split('\n').filter(line => line.match(/^[\-\*•]\s/)).length > 0;
    
    // Clean markdown formatting
    let cleaned = trimmed
      .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // Remove images
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1') // Remove italic
      .replace(/`([^`]+)`/g, '$1') // Remove code
      .replace(/\\\*/g, '*') // Unescape asterisks (\* -> *)
      .replace(/\\\\/g, '') // Remove escaped backslashes
      .replace(/\s{2,}/g, ' ') // Normalize spaces
      .trim();
    
    // Skip if too short after cleaning
    if (cleaned.length < 30) continue;
    
    // Skip if contains JSON artifacts
    if (cleaned.includes('{"') || cleaned.includes('":"') || cleaned.includes('form_id')) continue;
    
    // Skip if looks like a navigation path
    if (cleaned.match(/^[A-Za-z\s]+>\s/)) continue;
    
    // Handle list blocks differently - preserve them with newlines
    if (isListBlock) {
      // Clean each line individually for lists
      const cleanedLines = trimmed.split('\n').map(line => {
        return line
          .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          .replace(/\*\*([^*]+)\*\*/g, '$1')
          .replace(/\*([^*]+)\*/g, '$1')
          .replace(/\\\*/g, '*')
          .replace(/\\\\/g, '')
          .trim();
      }).filter(line => line.length > 5);
      
      if (cleanedLines.length > 0) {
        listBlocks.push(cleanedLines.join('\n'));
        console.log(`[Firecrawl] Extracted list block with ${cleanedLines.length} items`);
      }
    } else {
      paragraphs.push(cleaned);
      console.log(`[Firecrawl] Extracted paragraph: ${cleaned.slice(0, 150)}...`);
    }
  }
  
  console.log('[Firecrawl] Total extracted paragraphs:', paragraphs.length);
  console.log('[Firecrawl] Total extracted list blocks:', listBlocks.length);
  
  // Build description from ALL paragraphs AND list blocks (no limit)
  const allContent = [...paragraphs];
  // Include list blocks in description as well (they contain important content!)
  for (const listBlock of listBlocks) {
    allContent.push(listBlock);
  }
  
  if (allContent.length > 0) {
    result.description = allContent.join('\n\n');  // ALL content, no limit
  } else if (metaDescription.length > 30) {
    result.description = metaDescription;
  }
  
  console.log('[Firecrawl] Final description length:', result.description.length);
  console.log('[Firecrawl] Description preview:', result.description.slice(0, 600));
  
  // Use contentPortion for further extraction
  const cleanedMarkdown = contentPortion;

  // === BENEFITS ===
  // Extract from markdown lists (lines starting with -, *, •)
  // Use cleanedMarkdown which has JSON artifacts removed
  const listItems: string[] = [];
  const listMatches = cleanedMarkdown.matchAll(/^[\-\*•]\s+(.+)$/gm);
  for (const match of listMatches) {
    let text = match[1]
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .trim();
    
    // Skip if contains ANY JSON indicators or special chars
    if (text.includes('":') || text.includes('{"') || text.includes('\\')) continue;
    if (text.includes('form_id') || text.includes('thumbnail')) continue;
    
    // Must have good letter ratio
    const letterRatio = (text.match(/[a-zA-ZäöüÄÖÜß\s]/g) || []).length / text.length;
    if (letterRatio < 0.8) continue;
    
    if (text.length > 15 && text.length < 400 && !isFooterContent(text)) {
      listItems.push(text);
    }
  }
  
  // Also generate benefits from description sentences if list items are sparse
  if (listItems.length < 3 && result.description.length > 100) {
    const sentences = result.description
      .split(/[.!?]\s+/)
      .filter(s => s.length > 30 && s.length < 300)
      .map(s => s.trim() + (s.endsWith('.') ? '' : '.'));
    
    listItems.push(...sentences.slice(0, 8 - listItems.length));
  }
  
  result.benefits = [...new Set(listItems)];  // ALL benefits, no limit
  console.log('[Firecrawl] Extracted benefits:', result.benefits.length);

  // === SPECIFICATIONS ===
  // Look for table-like content in cleaned markdown (| col | col |)
  const tableLines = cleanedMarkdown.split('\n').filter(line => line.includes('|') && line.trim().startsWith('|'));
  let isHeaderRow = true;
  
  for (const line of tableLines) {
    // Skip separator lines (|---|---|)
    if (line.match(/^\|[\s\-:|]+\|$/)) {
      isHeaderRow = false;
      continue;
    }
    
    const cells = line.split('|').map(c => c.trim()).filter(c => c.length > 0);
    if (cells.length >= 2 && !isHeaderRow) {
      const name = cells[0].replace(/\*\*/g, '').replace(/\\\\/g, '').trim();
      const value = cells[1].replace(/\*\*/g, '').replace(/\\\\/g, '').trim();
      
      // Skip JSON artifacts
      if (name.includes('":') || value.includes('":')) continue;
      
      if (name && value && name.length < 150 && value.length < 300 && !isFooterContent(name)) {
        result.specifications.push({ name, value });
      }
    }
  }
  
  // Also look for "key: value" or "key – value" patterns
  const kvMatches = cleanedMarkdown.matchAll(/^[\*\-•]?\s*\*?\*?([^:\n\|]+?)\*?\*?\s*[:\-–]\s*(.+)$/gm);
  for (const match of kvMatches) {
    let name = match[1].trim().replace(/\*\*/g, '').replace(/\\\\/g, '');
    let value = match[2].trim().replace(/\*\*/g, '').replace(/\\\\/g, '');
    
    // Skip JSON artifacts
    if (name.includes('"') || value.includes('{') || value.includes('}')) continue;
    
    // Skip if it looks like a sentence
    if (name.split(' ').length > 5) continue;
    if (value.length > 300) continue;
    
    if (name.length > 2 && name.length < 100 && value && !isFooterContent(name)) {
      // Avoid duplicates
      if (!result.specifications.some(s => s.name === name)) {
        result.specifications.push({ name, value });
      }
    }
  }
  
  // NO LIMIT on specifications - take all extracted specs
  console.log('[Firecrawl] Extracted specifications:', result.specifications.length);

  // === USE CASES ===
  // Look for H3/H4 sections with descriptions in cleaned markdown
  const sectionMatches = cleanedMarkdown.matchAll(/^###?\s+(.+)\n+([^#]+)/gm);
  for (const match of sectionMatches) {
    let title = match[1].trim().replace(/\*\*/g, '').replace(/\\\\/g, '');
    const content = match[2].trim();
    
    // Skip JSON artifacts
    if (title.includes('"') || title.includes('{')) continue;
    
    // Get first paragraph as description
    let firstPara = content.split('\n\n')[0]
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\\\\/g, '')
      .replace(/\\"/g, '"')
      .trim();
    
    // Skip if contains JSON artifacts
    if (firstPara.includes('":') || firstPara.includes('{"')) continue;
    
    if (title.length > 3 && title.length < 120 && firstPara.length > 20 && !isFooterContent(title)) {
      result.useCases.push({ 
        title, 
        description: firstPara.slice(0, 400) 
      });
    }
    
    if (result.useCases.length >= 6) break;
  }
  
  // Generate use cases from benefits if none found
  if (result.useCases.length === 0 && result.benefits.length > 0) {
    result.useCases = result.benefits.slice(0, 4).map((benefit, idx) => ({
      title: `Feature ${idx + 1}`,
      description: benefit
    }));
  }
  console.log('[Firecrawl] Extracted useCases:', result.useCases.length);

  // === DOWNLOADS ===
  // Extract PDF links from the links array
  for (const link of links) {
    if (link.toLowerCase().includes('.pdf')) {
      let pdfUrl = link;
      
      // Make URL absolute if needed
      if (!pdfUrl.startsWith('http')) {
        const urlObj = new URL(baseUrl);
        pdfUrl = pdfUrl.startsWith('/') 
          ? `${urlObj.origin}${pdfUrl}`
          : `${urlObj.origin}/${pdfUrl}`;
      }
      
      // Extract filename for title
      const filename = pdfUrl.split('/').pop()?.split('?')[0] || 'Document';
      const title = filename
        .replace('.pdf', '')
        .replace(/[-_]/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2');
      
      // Detect language
      const isGerman = pdfUrl.toLowerCase().includes('_de') || filename.toLowerCase().includes('_de');
      const isEnglish = pdfUrl.toLowerCase().includes('_en') || filename.toLowerCase().includes('_en');
      const detectedLang = isGerman ? 'de' : (isEnglish ? 'en' : language);
      
      result.downloads.push({
        title: title.trim(),
        description: getDownloadDescription(title),
        url: pdfUrl,
        language: detectedLang,
      });
    }
  }
  console.log('[Firecrawl] Extracted downloads:', result.downloads.length);

  // === VIDEO ===
  // Check for video links
  for (const link of links) {
    if (link.includes('youtube.com') || link.includes('vimeo.com') || link.endsWith('.mp4')) {
      result.videoUrl = link;
      break;
    }
  }

  // === IMAGES ===
  // Extract image URLs from HTML
  const imgMatches = html.matchAll(/<img[^>]*src="([^"]+)"[^>]*(?:alt="([^"]*)")?[^>]*>/gi);
  for (const match of imgMatches) {
    let imgUrl = match[1];
    const alt = match[2] || '';
    
    // Make URL absolute
    if (!imgUrl.startsWith('http')) {
      const urlObj = new URL(baseUrl);
      imgUrl = imgUrl.startsWith('/') 
        ? `${urlObj.origin}${imgUrl}`
        : `${urlObj.origin}/${imgUrl}`;
    }
    
    // Filter out icons, logos, pixels, lazy-load placeholders
    if (imgUrl.includes('icon') || 
        imgUrl.includes('logo') || 
        imgUrl.includes('pixel') ||
        imgUrl.includes('lazy-load') ||
        imgUrl.includes('placeholder') ||
        imgUrl.includes('1x1') ||
        imgUrl.includes('spinner')) {
      continue;
    }
    
    result.images.push({ url: imgUrl, title: alt });
    if (result.images.length >= 10) break;
  }
  
  // Also check for data-original (lazy-loaded images)
  const lazyImgMatches = html.matchAll(/data-original="([^"]+\.(png|jpg|jpeg|webp))"/gi);
  for (const match of lazyImgMatches) {
    let imgUrl = match[1];
    
    if (!imgUrl.startsWith('http')) {
      const urlObj = new URL(baseUrl);
      imgUrl = imgUrl.startsWith('/') 
        ? `${urlObj.origin}${imgUrl}`
        : `${urlObj.origin}/${imgUrl}`;
    }
    
    // Avoid duplicates
    if (!result.images.some(img => img.url === imgUrl)) {
      result.images.push({ url: imgUrl, title: '' });
    }
    if (result.images.length >= 10) break;
  }
  console.log('[Firecrawl] Extracted images:', result.images.length);

  return result;
}

// Helper function to detect footer/navigation/irrelevant content
function isFooterContent(text: string): boolean {
  const lower = text.toLowerCase();
  const footerPatterns = [
    'cookie', 'privacy policy', 'newsletter', 'subscribe', 'copyright', 
    'all rights reserved', 'impressum', 'datenschutz',
    'follow us', 'social media', 'facebook', 'twitter', 'linkedin', 'instagram',
    'menu', 'navigation', 'sitemap', 'breadcrumb',
    'login', 'register', 'anmelden', 'sign up', 'sign in',
    'related products', 'ähnliche produkte', 'you might also like',
    'web shop is currently unavailable', 'shop unavailable',
    'contact us', 'kontakt', 'get in touch',
    'back to top', 'nach oben', 'scroll to top',
    'page load', 'loading', 'please wait',
    'skip to content', 'skip to main',
  ];
  
  for (const pattern of footerPatterns) {
    if (lower.includes(pattern)) return true;
  }
  return false;
}

function getDownloadDescription(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('datasheet') || lower.includes('datenblatt') || lower.includes('specification')) {
    return 'Technical specifications and product details';
  }
  if (lower.includes('manual') || lower.includes('anleitung') || lower.includes('guide')) {
    return 'Complete operating instructions';
  }
  if (lower.includes('brochure') || lower.includes('broschüre') || lower.includes('flyer')) {
    return 'Product overview and features';
  }
  if (lower.includes('whitepaper') || lower.includes('white paper')) {
    return 'Technical whitepaper with in-depth analysis';
  }
  if (lower.includes('certificate') || lower.includes('zertifikat')) {
    return 'Product certification documentation';
  }
  return 'Product documentation';
}
