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
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('[PDF Parser] Received file:', file.name, 'size:', file.size);
    
    // Read the PDF as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to string to find text content
    // PDFs contain text streams that we can extract with regex patterns
    const decoder = new TextDecoder('latin1');
    const pdfContent = decoder.decode(uint8Array);
    
    console.log('[PDF Parser] PDF content length:', pdfContent.length);
    
    // Extract text streams from PDF
    // PDF text is often in BT...ET blocks or in parentheses after Tj/TJ operators
    const textMatches: string[] = [];
    
    // Method 1: Find text in stream objects (works for many PDFs)
    const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
    let streamMatch;
    while ((streamMatch = streamRegex.exec(pdfContent)) !== null) {
      const streamContent = streamMatch[1];
      // Extract text from Tj operators: (text) Tj
      const tjMatches = streamContent.match(/\(([^)]+)\)\s*Tj/g);
      if (tjMatches) {
        for (const tj of tjMatches) {
          const text = tj.match(/\(([^)]+)\)/)?.[1];
          if (text) textMatches.push(text);
        }
      }
      // Extract text from TJ operators: [(text)] TJ
      const tjArrayMatches = streamContent.match(/\[([^\]]+)\]\s*TJ/g);
      if (tjArrayMatches) {
        for (const tja of tjArrayMatches) {
          const textParts = tja.match(/\(([^)]+)\)/g);
          if (textParts) {
            for (const part of textParts) {
              const text = part.slice(1, -1);
              if (text) textMatches.push(text);
            }
          }
        }
      }
    }
    
    // Method 2: Look for readable text patterns directly
    // SISTRIX PDFs often have text visible in the raw content
    const readableLines: string[] = [];
    const lines = pdfContent.split(/[\r\n]+/);
    
    for (const line of lines) {
      // Look for lines that contain URLs (key identifier for SISTRIX data)
      if (line.includes('https://www.image-engineering.de')) {
        // Try to extract the whole row
        readableLines.push(line);
      }
      // Also look for keyword-like patterns
      if (line.match(/^\s*\w+.*\d+\s+\d+\s+\d+/)) {
        readableLines.push(line);
      }
    }
    
    console.log('[PDF Parser] Found', textMatches.length, 'text matches,', readableLines.length, 'readable lines');
    
    // Parse the extracted data to find keyword entries
    // SISTRIX format: Keyword | Position | Klicks | Suchvolumen | Wettbewerber | Intent | CPC | URL
    const parsedData: Array<{
      keyword: string;
      position: number;
      clicks: number;
      searchVolume: number;
      competition: number;
      intent: string;
      cpc: number;
      url: string;
    }> = [];
    
    // Combine all found text
    const allText = [...textMatches, ...readableLines].join('\n');
    
    // Look for URL patterns and try to extract associated data
    const urlPattern = /https?:\/\/www\.image-engineering\.de[^\s\)]+/g;
    const urls = allText.match(urlPattern) || [];
    
    console.log('[PDF Parser] Found', urls.length, 'URLs');
    
    // For each URL, try to find associated keyword data
    // This is a simplified approach - SISTRIX PDFs have specific formats
    const uniqueUrls = [...new Set(urls)];
    
    // Return what we found for debugging
    return new Response(
      JSON.stringify({
        success: true,
        textMatchCount: textMatches.length,
        readableLineCount: readableLines.length,
        urlCount: uniqueUrls.length,
        sampleText: textMatches.slice(0, 20),
        sampleLines: readableLines.slice(0, 20),
        sampleUrls: uniqueUrls.slice(0, 20),
        parsedData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[PDF Parser] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});