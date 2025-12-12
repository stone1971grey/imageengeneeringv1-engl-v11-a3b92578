import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, ArrowRight, Sparkles, Loader2, Calendar, Newspaper, FileText, Box } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
    const localResults: SearchResult[] = [];

    // Search in charts
    charts.forEach(chart => {
      const score = calculateChartMatchScore(chart, q);
      if (score > 0) {
        localResults.push({
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
        localResults.push({ ...item, relevanceScore: item.title.toLowerCase().includes(q) ? 80 : 50 });
      }
    });

    return localResults.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0)).slice(0, 6);
  }, [language]);

  const calculateChartMatchScore = (chart: any, searchQuery: string): number => {
    let score = 0;
    if (chart.title.toLowerCase().includes(searchQuery)) score += 50;
    if (chart.sku?.toLowerCase().includes(searchQuery)) score += 40;
    if (chart.excerpt?.toLowerCase().includes(searchQuery)) score += 30;
    if (chart.applications?.some((app: string) => app.toLowerCase().includes(searchQuery))) score += 25;
    if (chart.categories?.some((cat: string) => cat.toLowerCase().includes(searchQuery))) score += 20;
    if (chart.standards?.some((std: string) => std.toLowerCase().includes(searchQuery))) score += 15;
    return score;
  };

  // Combined search with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSuggestions([]);
      setIsAIPowered(false);
      setIsOpen(false);
      return;
    }

    // Ensure dropdown is open when there is a query
    setIsOpen(true);

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
          setResults(mergedResults.slice(0, 8));
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
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'chart': return <Box className="h-4 w-4 text-amber-600" />;
      case 'news': return <Newspaper className="h-4 w-4 text-blue-600" />;
      case 'event': return <Calendar className="h-4 w-4 text-emerald-600" />;
      case 'page': return <FileText className="h-4 w-4 text-slate-500" />;
      case 'product': return <Box className="h-4 w-4 text-orange-600" />;
      default: return <Search className="h-4 w-4 text-slate-400" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'chart': return 'Chart';
      case 'news': return 'News';
      case 'event': return 'Event';
      case 'page': return 'Page';
      case 'product': return 'Product';
      default: return '';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'chart': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'news': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'event': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'page': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'product': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const highlightMatch = (text: string, searchQuery: string): React.ReactNode => {
    if (!searchQuery.trim()) return text;
    try {
      const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
      return parts.map((part, i) => 
        part.toLowerCase() === searchQuery.toLowerCase() 
          ? <span key={i} className="bg-yellow-200 text-yellow-900 font-semibold px-0.5 rounded">{part}</span>
          : part
      );
    } catch {
      return text;
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0 && results[selectedIndex]) {
      handleResultClick(results[selectedIndex]);
    }
  };

  // Determine container width based on variant
  const getContainerClass = () => {
    if (variant === 'mobile') return 'w-full';
    if (variant === 'utility') return 'w-full max-w-md';
    return 'w-64';
  };

  return (
    <div ref={searchRef} className={`relative ${getContainerClass()}`}>
      <form onSubmit={handleFormSubmit} className="relative">
        <div className="relative flex items-center">
          {/* Search Icon or Loading Spinner */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            {isLoading ? (
              <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
            ) : isAIPowered ? (
              <Sparkles className="h-4 w-4 text-amber-500" />
            ) : (
              <Search className="h-4 w-4 text-slate-400" />
            )}
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            placeholder="Search products, news, events..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query && setIsOpen(true)}
            className="w-full h-10 pl-10 pr-20 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all duration-200 shadow-sm"
          />

          {/* Right side buttons */}
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <button
              type="submit"
              disabled={!query.trim()}
              className="p-1.5 bg-amber-400 hover:bg-amber-500 disabled:bg-slate-200 disabled:cursor-not-allowed text-white disabled:text-slate-400 rounded transition-all duration-200"
              aria-label="Search"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-[100] max-h-[480px] overflow-hidden">
          {/* AI Status Bar */}
          {(isLoading || isAIPowered) && (
            <div className="px-4 py-2.5 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 text-amber-500 animate-spin" />
                    <span className="text-xs font-medium text-amber-700">Searching with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs font-medium text-amber-700">AI-powered results</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Results List */}
          <div className="overflow-y-auto max-h-[380px]">
            {results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <div
                    key={`${result.id}-${index}`}
                    className={`mx-2 px-3 py-3 cursor-pointer rounded-lg transition-all duration-150 ${
                      index === selectedIndex 
                        ? 'bg-amber-50 border border-amber-200' 
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                    onClick={() => handleResultClick(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Category Icon */}
                      <div className="flex-shrink-0 mt-0.5 p-1.5 bg-slate-100 rounded-lg">
                        {getCategoryIcon(result.category)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900 text-sm truncate">
                            {highlightMatch(result.title, query)}
                          </h4>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${getCategoryColor(result.category)}`}>
                            {getCategoryLabel(result.category)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {result.snippet || result.description}
                        </p>
                      </div>

                      {/* Arrow */}
                      <ArrowRight className={`h-4 w-4 flex-shrink-0 mt-1 transition-colors ${
                        index === selectedIndex ? 'text-amber-500' : 'text-slate-300'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-10 text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-full flex items-center justify-center">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-700">No results found</p>
                <p className="text-xs text-slate-400 mt-1">Try different keywords</p>
              </div>
            )}
          </div>

          {/* Suggestions Footer */}
          {suggestions.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-2">Suggestions</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.slice(0, 4).map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 transition-all duration-150"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Keyboard Hint */}
          {results.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3 text-[10px] text-slate-400">
                <span><kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-500 font-mono">↑↓</kbd> Navigate</span>
                <span><kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-500 font-mono">Enter</kbd> Select</span>
                <span><kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-500 font-mono">Esc</kbd> Close</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IntelligentSearchBar;
