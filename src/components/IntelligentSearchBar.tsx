import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, ChevronRight, Sparkles, Loader2, Calendar, Newspaper, FileText, Box } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { charts } from "@/data/charts";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: 'page' | 'news' | 'event' | 'product' | 'chart';
  url: string;
  relevanceScore?: number;
  snippet?: string;
  badges?: string[];
  metadata?: Record<string, any>;
}

interface SearchBarProps {
  variant?: 'desktop' | 'mobile' | 'utility';
}

interface AISearchResponse {
  results: SearchResult[];
  suggestions: string[];
  intent?: string;
  aiPowered?: boolean;
  error?: string;
}

const IntelligentSearchBar = ({ variant = 'desktop' }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAIPowered, setIsAIPowered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { language } = useLanguage();

  // Static search data for quick local results
  const staticSearchData: SearchResult[] = [
    { id: 'home', title: 'Home', description: 'Image Engineering main page', category: 'page', url: `/${language}` },
    { id: 'charts', title: 'Test Charts', description: 'All available test charts and calibration solutions', category: 'page', url: `/${language}/products/test-charts` },
    { id: 'downloads', title: 'Downloads', description: 'Data sheets, software and documentation', category: 'page', url: `/${language}/info-hub/downloads` },
    { id: 'automotive', title: 'Automotive', description: 'ADAS Testing and Automotive Vision solutions', category: 'page', url: `/${language}/your-solution/automotive` },
    { id: 'products', title: 'Products', description: 'Overview of all products and solutions', category: 'page', url: `/${language}/products` },
    { id: 'events', title: 'Events & Training', description: 'Upcoming events and training sessions', category: 'page', url: `/${language}/training-events/events` },
    { id: 'news', title: 'News', description: 'Latest news and announcements', category: 'page', url: `/${language}/company/news` },
    { id: 'contact', title: 'Contact', description: 'Get in touch with us', category: 'page', url: `/${language}/contact` },
  ];

  // Perform AI-powered semantic search
  const performAISearch = useCallback(async (searchQuery: string): Promise<AISearchResponse> => {
    try {
      const { data, error } = await supabase.functions.invoke('semantic-search', {
        body: { 
          query: searchQuery, 
          language,
          limit: 8
        }
      });

      if (error) {
        console.error('AI search error:', error);
        return { results: [], suggestions: [], aiPowered: false };
      }

      return data as AISearchResponse;
    } catch (err) {
      console.error('Search failed:', err);
      return { results: [], suggestions: [], aiPowered: false };
    }
  }, [language]);

  // Local chart search for instant results
  const performLocalSearch = useCallback((searchQuery: string): SearchResult[] => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Search in charts
    charts.forEach(chart => {
      const score = calculateChartMatchScore(chart, q);
      if (score > 0) {
        results.push({
          id: chart.id,
          title: chart.title,
          description: chart.excerpt || chart.description,
          category: 'chart',
          url: `/${language}/products/test-charts/${chart.slug}`,
          badges: chart.badges,
          relevanceScore: score
        });
      }
    });

    // Search in static pages
    staticSearchData.forEach(item => {
      if (item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)) {
        results.push({ ...item, relevanceScore: item.title.toLowerCase().includes(q) ? 80 : 50 });
      }
    });

    return results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0)).slice(0, 5);
  }, [language]);

  const calculateChartMatchScore = (chart: any, query: string): number => {
    let score = 0;
    if (chart.title.toLowerCase().includes(query)) score += 50;
    if (chart.sku?.toLowerCase().includes(query)) score += 40;
    if (chart.excerpt?.toLowerCase().includes(query)) score += 30;
    if (chart.applications?.some((app: string) => app.toLowerCase().includes(query))) score += 25;
    if (chart.categories?.some((cat: string) => cat.toLowerCase().includes(query))) score += 20;
    if (chart.standards?.some((std: string) => std.toLowerCase().includes(query))) score += 15;
    return score;
  };

  // Combined search with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSuggestions([]);
      setIsAIPowered(false);
      return;
    }

    // Immediate local search for responsiveness
    const localResults = performLocalSearch(query);
    setResults(localResults);
    setIsAIPowered(false);

    // Debounced AI search for semantic matching
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsLoading(true);
        const aiResponse = await performAISearch(query);
        
        if (aiResponse.results.length > 0) {
          // Merge AI results with local results, prioritizing AI
          const mergedResults = [...aiResponse.results];
          localResults.forEach(local => {
            if (!mergedResults.some(ai => ai.id === local.id)) {
              mergedResults.push(local);
            }
          });
          setResults(mergedResults.slice(0, 10));
          setIsAIPowered(aiResponse.aiPowered || false);
        }
        
        setSuggestions(aiResponse.suggestions || []);
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, performLocalSearch, performAISearch]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery("");
    navigate(result.url);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'chart': return <Box className="h-4 w-4 text-primary" />;
      case 'news': return <Newspaper className="h-4 w-4 text-blue-500" />;
      case 'event': return <Calendar className="h-4 w-4 text-green-500" />;
      case 'page': return <FileText className="h-4 w-4 text-gray-500" />;
      case 'product': return <Box className="h-4 w-4 text-orange-500" />;
      default: return <Search className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'chart': return 'Test Chart';
      case 'news': return 'News';
      case 'event': return 'Event';
      case 'page': return 'Page';
      case 'product': return 'Product';
      default: return 'Result';
    }
  };

  const highlightMatch = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={i} className="bg-primary/20 text-foreground rounded px-0.5">{part}</mark>
        : part
    );
  };

  const handleSubmit = () => {
    if (results.length > 0 && results[selectedIndex]) {
      handleResultClick(results[selectedIndex]);
    } else if (query.trim()) {
      // Navigate to search results page with query
      navigate(`/${language}/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  return (
    <div ref={searchRef} className={`relative ${variant === 'mobile' ? 'w-full' : variant === 'utility' ? 'w-full' : ''}`}>
      <form onSubmit={handleFormSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          {isLoading ? (
            <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
          ) : isAIPowered ? (
            <Sparkles className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary" />
          ) : (
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
          )}
          <Input
            ref={inputRef}
            type="text"
            placeholder={isAIPowered ? "AI Search..." : "Search..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className={
              variant === 'utility'
                ? "pl-10 pr-10 w-full h-10 bg-transparent border-none text-black placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                : variant === 'mobile' 
                  ? "pl-10 pr-10 w-full bg-white border border-gray-300 text-black placeholder:text-black/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:ring-offset-0"
                  : "pl-10 pr-8 w-44 bg-white border border-gray-300 text-black placeholder:text-black/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:ring-offset-0"
            }
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-white/20"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={!query.trim()}
          className="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Search</span>
        </Button>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-lg shadow-xl z-50 max-h-[28rem] overflow-y-auto min-w-[320px]">
          {/* AI Badge */}
          {isAIPowered && (
            <div className="px-4 py-2 border-b border-border bg-gradient-to-r from-primary/5 to-purple-500/5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary" />
                <span>AI-powered semantic search</span>
              </div>
            </div>
          )}

          {results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    index === selectedIndex ? 'bg-muted' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 mt-1">
                      {getCategoryIcon(result.category)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground truncate">
                          {highlightMatch(result.title, query)}
                        </h4>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          {getCategoryLabel(result.category)}
                        </Badge>
                        {result.relevanceScore && result.relevanceScore > 80 && (
                          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30 shrink-0">
                            Best Match
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {result.snippet || result.description}
                      </p>
                      {result.badges && result.badges.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {result.badges.slice(0, 3).map((badge, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {result.metadata?.date && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(result.metadata.date).toLocaleDateString()}
                          {result.metadata.location && ` • ${result.metadata.location}`}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No results found for "{query}"</p>
              <p className="text-sm mt-1">Try different search terms</p>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="px-4 py-3 border-t border-border bg-muted/30">
              <p className="text-xs text-muted-foreground mb-2">Try searching for:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-2 py-1 text-xs bg-white border border-border rounded-md hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IntelligentSearchBar;