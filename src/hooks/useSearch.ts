import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

export type SearchResultCategory = 'page' | 'news' | 'event';

export interface SearchResult {
  id: string;
  title: string;
  category: SearchResultCategory;
  url: string;
  meta?: string; // Date, location, or page type
  description?: string; // For search results page
}

interface UseSearchReturn {
  search: (query: string) => Promise<SearchResult[]>;
  isLoading: boolean;
}

export const useSearch = (): UseSearchReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();

  const search = useCallback(async (query: string): Promise<SearchResult[]> => {
    if (!query.trim() || query.length < 2) return [];

    setIsLoading(true);
    const results: SearchResult[] = [];
    const searchTerm = query.toLowerCase().trim();

    try {
      // 1. Search in page_registry (CMS pages)
      // We search by title and join with page_content to check visibility
      const { data: pages, error: pagesError } = await supabase
        .from('page_registry')
        .select('page_slug, page_title, flyout_description, flyout_description_translations')
        .ilike('page_title', `%${searchTerm}%`)
        .limit(10);

      if (!pagesError && pages) {
        // Filter out admin/internal pages and check for public visibility
        for (const page of pages) {
          // Skip internal pages
          if (page.page_slug.startsWith('admin') || 
              page.page_slug.startsWith('styleguide') ||
              page.page_slug.startsWith('backlog') ||
              page.page_slug.includes('confirm') ||
              page.page_slug.includes('registration') ||
              page.page_slug.includes('download-')) {
            continue;
          }

          // Get description for current language
          let description = '';
          if (page.flyout_description_translations && typeof page.flyout_description_translations === 'object') {
            const translations = page.flyout_description_translations as Record<string, string>;
            description = translations[language] || translations['en'] || page.flyout_description || '';
          } else {
            description = page.flyout_description || '';
          }

          // Determine page type for meta
          let pageType = 'Seite';
          if (page.page_slug.includes('products')) pageType = 'Produktseite';
          else if (page.page_slug.includes('your-solution')) pageType = 'Lösungsseite';
          else if (page.page_slug.includes('company')) pageType = 'Unternehmensseite';
          else if (page.page_slug.includes('info-hub')) pageType = 'Info-Hub';
          else if (page.page_slug.includes('training-events')) pageType = 'Training & Events';
          else if (page.page_slug === 'index' || page.page_slug === '') pageType = 'Startseite';

          results.push({
            id: `page-${page.page_slug}`,
            title: page.page_title,
            category: 'page',
            url: `/${language}/${page.page_slug === 'index' ? '' : page.page_slug}`,
            meta: pageType,
            description,
          });
        }
      }

      // 2. Search in news_articles (only published and public visibility)
      const { data: news, error: newsError } = await supabase
        .from('news_articles')
        .select('id, slug, title, teaser, date, visibility')
        .eq('published', true)
        .eq('visibility', 'public')
        .or(`language.eq.${language},language.eq.en`)
        .or(`title.ilike.%${searchTerm}%,teaser.ilike.%${searchTerm}%`)
        .order('date', { ascending: false })
        .limit(10);

      if (!newsError && news) {
        for (const article of news) {
          // Format date for German locale
          const dateFormatted = new Date(article.date).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });

          results.push({
            id: `news-${article.id}`,
            title: article.title,
            category: 'news',
            url: `/${language}/news/${article.slug}`,
            meta: `Artikel · ${dateFormatted}`,
            description: article.teaser,
          });
        }
      }

      // 3. Search in events (only published and public visibility, future events first)
      const today = new Date().toISOString().split('T')[0];
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, slug, title, teaser, date, location_city, location_country, visibility')
        .eq('published', true)
        .eq('visibility', 'public')
        .or(`language_code.eq.${language.toUpperCase()},language_code.eq.EN`)
        .or(`title.ilike.%${searchTerm}%,teaser.ilike.%${searchTerm}%,location_city.ilike.%${searchTerm}%`)
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(10);

      if (!eventsError && events) {
        for (const event of events) {
          const dateFormatted = new Date(event.date).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          const location = [event.location_city, event.location_country].filter(Boolean).join(', ');

          results.push({
            id: `event-${event.id}`,
            title: event.title,
            category: 'event',
            url: `/${language}/training-events/events/${event.slug}`,
            meta: `${dateFormatted} · ${location}`,
            description: event.teaser,
          });
        }
      }

      // Sort results: title matches first, then by category priority (pages, news, events)
      const sortedResults = results.sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        const aStartsWith = aTitle.startsWith(searchTerm);
        const bStartsWith = bTitle.startsWith(searchTerm);
        
        // Title starting with search term comes first
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        // Then by category priority
        const categoryOrder: Record<SearchResultCategory, number> = { page: 1, news: 2, event: 3 };
        return categoryOrder[a.category] - categoryOrder[b.category];
      });

      return sortedResults;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  return { search, isLoading };
};
