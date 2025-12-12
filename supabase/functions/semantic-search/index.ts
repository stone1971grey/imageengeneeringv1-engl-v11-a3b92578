import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: 'page' | 'news' | 'event' | 'product' | 'chart';
  url: string;
  relevanceScore: number;
  snippet?: string;
  badges?: string[];
  metadata?: Record<string, any>;
}

interface SearchRequest {
  query: string;
  language?: string;
  categories?: string[];
  limit?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, language = 'en', categories, limit = 10 }: SearchRequest = await req.json();
    
    if (!query || query.trim().length < 2) {
      return new Response(JSON.stringify({ results: [], suggestions: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Semantic search request: "${query}" (lang: ${language})`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parallel fetch from all content sources
    const [pagesResult, newsResult, eventsResult] = await Promise.all([
      // Fetch CMS pages
      supabase
        .from('page_registry')
        .select('page_id, page_slug, page_title, flyout_description, parent_slug')
        .not('page_slug', 'is', null),
      
      // Fetch news articles
      supabase
        .from('news_articles')
        .select('id, slug, title, teaser, category, date, image_url, language')
        .eq('published', true)
        .eq('language', language),
      
      // Fetch events
      supabase
        .from('events')
        .select('id, slug, title, teaser, category, date, location_city, location_country, image_url, language_code')
        .eq('published', true)
        .eq('language_code', language.toUpperCase())
    ]);

    // Collect all content for AI analysis
    const allContent: { type: string; data: any }[] = [];

    if (pagesResult.data) {
      pagesResult.data.forEach(page => {
        allContent.push({
          type: 'page',
          data: {
            id: `page-${page.page_id}`,
            title: page.page_title,
            description: page.flyout_description || '',
            slug: page.page_slug,
            parentSlug: page.parent_slug
          }
        });
      });
    }

    if (newsResult.data) {
      newsResult.data.forEach(news => {
        allContent.push({
          type: 'news',
          data: {
            id: news.id,
            title: news.title,
            description: news.teaser,
            slug: news.slug,
            category: news.category,
            date: news.date
          }
        });
      });
    }

    if (eventsResult.data) {
      eventsResult.data.forEach(event => {
        allContent.push({
          type: 'event',
          data: {
            id: event.id,
            title: event.title,
            description: event.teaser,
            slug: event.slug,
            category: event.category,
            date: event.date,
            location: `${event.location_city}, ${event.location_country}`
          }
        });
      });
    }

    // Use Lovable AI for semantic search
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      // Fallback to basic keyword search
      return new Response(JSON.stringify({ 
        results: performBasicSearch(query, allContent, language),
        suggestions: [],
        aiPowered: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare content summary for AI
    const contentSummary = allContent.map(item => ({
      id: item.data.id,
      type: item.type,
      title: item.data.title,
      description: item.data.description?.substring(0, 200) || '',
      slug: item.data.slug,
      category: item.data.category,
      location: item.data.location,
      date: item.data.date
    }));

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: `You are a semantic search engine for Image Engineering, a company specializing in image quality testing equipment, test charts, and software.

Your task is to analyze the user's search query and find the most relevant content from the provided catalog. Consider:
- Semantic meaning (not just keyword matching)
- Synonyms and related terms
- Industry-specific terminology (image quality, camera testing, ADAS, HDR, color calibration, etc.)
- User intent (are they looking for a product, information, event, or news?)

Return a JSON object with:
1. "results": Array of matched item IDs with relevance scores (0-100) and a brief reason
2. "suggestions": Array of alternative search terms if the query is ambiguous
3. "intent": The detected user intent (product_search, information, event, news, general)

Example response:
{
  "results": [
    {"id": "page-5", "score": 95, "reason": "Direct match for test chart category"},
    {"id": "news-abc123", "score": 75, "reason": "Recent article about HDR testing"}
  ],
  "suggestions": ["HDR test charts", "camera calibration"],
  "intent": "product_search"
}`
          },
          {
            role: 'user',
            content: `Search query: "${query}"
Language: ${language}

Available content:
${JSON.stringify(contentSummary, null, 2)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded, please try again later.',
          results: performBasicSearch(query, allContent, language),
          aiPowered: false 
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ 
        results: performBasicSearch(query, allContent, language),
        suggestions: [],
        aiPowered: false 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '';
    
    console.log('AI response:', aiContent);

    // Parse AI response
    let aiResults: { results: any[]; suggestions: string[]; intent: string } = {
      results: [],
      suggestions: [],
      intent: 'general'
    };

    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = aiContent.match(/```json\n?([\s\S]*?)\n?```/) || 
                       aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        aiResults = JSON.parse(jsonStr);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
    }

    // Build final results with full data
    const searchResults: SearchResult[] = [];
    
    for (const aiResult of aiResults.results.slice(0, limit)) {
      const contentItem = allContent.find(c => c.data.id === aiResult.id);
      if (!contentItem) continue;

      const item = contentItem.data;
      let url = '';
      let category: SearchResult['category'] = 'page';

      switch (contentItem.type) {
        case 'page':
          url = `/${language}/${item.parentSlug ? `${item.parentSlug}/` : ''}${item.slug}`;
          category = 'page';
          break;
        case 'news':
          url = `/${language}/company/news/${item.slug}`;
          category = 'news';
          break;
        case 'event':
          url = `/${language}/training-events/events?event=${item.slug}`;
          category = 'event';
          break;
      }

      searchResults.push({
        id: item.id,
        title: item.title,
        description: item.description || '',
        category,
        url,
        relevanceScore: aiResult.score || 50,
        snippet: aiResult.reason,
        metadata: {
          date: item.date,
          category: item.category,
          location: item.location
        }
      });
    }

    // Sort by relevance score
    searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    console.log(`Found ${searchResults.length} results for "${query}"`);

    return new Response(JSON.stringify({
      results: searchResults,
      suggestions: aiResults.suggestions || [],
      intent: aiResults.intent || 'general',
      aiPowered: true,
      query
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Search error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      results: [],
      suggestions: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Fallback basic search function
function performBasicSearch(query: string, content: { type: string; data: any }[], language: string): SearchResult[] {
  const searchTerms = query.toLowerCase().split(/\s+/);
  const results: SearchResult[] = [];

  for (const item of content) {
    const data = item.data;
    const searchableText = `${data.title} ${data.description || ''} ${data.category || ''}`.toLowerCase();
    
    let score = 0;
    for (const term of searchTerms) {
      if (searchableText.includes(term)) {
        score += 10;
        if (data.title.toLowerCase().includes(term)) score += 20;
      }
    }

    if (score > 0) {
      let url = '';
      let category: SearchResult['category'] = 'page';

      switch (item.type) {
        case 'page':
          url = `/${language}/${data.parentSlug ? `${data.parentSlug}/` : ''}${data.slug}`;
          category = 'page';
          break;
        case 'news':
          url = `/${language}/company/news/${data.slug}`;
          category = 'news';
          break;
        case 'event':
          url = `/${language}/training-events/events?event=${data.slug}`;
          category = 'event';
          break;
      }

      results.push({
        id: data.id,
        title: data.title,
        description: data.description || '',
        category,
        url,
        relevanceScore: Math.min(score, 100),
        metadata: {
          date: data.date,
          category: data.category
        }
      });
    }
  }

  return results.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 10);
}
