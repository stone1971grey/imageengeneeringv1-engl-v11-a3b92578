import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, FileText, Newspaper, Calendar, ChevronRight, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSearch, SearchResult, SearchResultCategory } from "@/hooks/useSearch";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchBarProps {
  variant?: 'desktop' | 'mobile' | 'utility';
  onClose?: () => void;
}

const IntelligentSearchBar = ({ variant = 'desktop', onClose }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { search, isLoading } = useSearch();

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }
    
    const searchResults = await search(searchQuery);
    // Limit to 7 results for autocomplete (per spec: 5-7 max)
    setResults(searchResults.slice(0, 7));
  }, [search]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 200);
    
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Handle keyboard navigation
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
          if (results.length > 0 && results[selectedIndex]) {
            // Click on suggestion -> go directly to content
            handleResultClick(results[selectedIndex]);
          } else if (query.trim().length >= 2) {
            // Enter with no selection -> go to full search results
            handleGoToSearchResults();
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
  }, [isOpen, results, selectedIndex, query]);

  // Handle clicking outside to close
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
    onClose?.();
    navigate(result.url);
  };

  const handleGoToSearchResults = () => {
    setIsOpen(false);
    onClose?.();
    navigate(`/${language}/search?q=${encodeURIComponent(query)}`);
    setQuery("");
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  };

  const getCategoryIcon = (category: SearchResultCategory) => {
    switch (category) {
      case 'page': return <FileText className="h-4 w-4" />;
      case 'news': return <Newspaper className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'download': return <Download className="h-4 w-4" />;
    }
  };

  const getCategoryLabel = (category: SearchResultCategory) => {
    const labels: Record<string, Record<SearchResultCategory, string>> = {
      de: { page: 'Seite', news: 'News', event: 'Event', download: 'Download' },
      en: { page: 'Page', news: 'News', event: 'Event', download: 'Download' },
      zh: { page: '页面', news: '新闻', event: '活动', download: '下载' },
      ja: { page: 'ページ', news: 'ニュース', event: 'イベント', download: 'ダウンロード' },
      ko: { page: '페이지', news: '뉴스', event: '이벤트', download: '다운로드' },
    };
    return labels[language]?.[category] || labels['en'][category];
  };

  const getCategoryColor = (category: SearchResultCategory) => {
    switch (category) {
      case 'page': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'news': return 'bg-green-50 text-green-700 border-green-200';
      case 'event': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'download': return 'bg-orange-50 text-orange-700 border-orange-200';
    }
  };

  return (
    <div ref={searchRef} className={`relative ${variant === 'mobile' ? 'w-full' : variant === 'utility' ? 'w-full' : ''}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={language === 'de' ? 'Suchen...' : language === 'zh' ? '搜索...' : language === 'ja' ? '検索...' : language === 'ko' ? '검색...' : 'Search...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className={
            variant === 'utility'
              ? "pl-10 pr-10 w-full h-10 bg-transparent border-none text-black placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              : variant === 'mobile' 
                ? "pl-10 pr-10 w-full bg-white border border-gray-300 text-black placeholder:text-black/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:ring-offset-0"
                : "pl-10 pr-10 w-36 bg-white border border-gray-300 text-black placeholder:text-black/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:ring-offset-0"
          }
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-white/20"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Autocomplete Dropdown - styled based on variant */}
      {isOpen && query.length >= 2 && (
        <div 
          className={`absolute top-full left-0 right-0 mt-2 rounded-xl shadow-xl z-[100] max-h-80 overflow-y-auto ${
            variant === 'mobile' 
              ? 'bg-[#f5f5f5] border-2 border-white' 
              : 'bg-white border border-border min-w-[320px]'
          }`}
        >
          {isLoading ? (
            <div className="px-4 py-6 text-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mx-auto" />
            </div>
          ) : results.length > 0 ? (
            <div className={variant === 'mobile' ? 'p-2' : 'py-1'}>
              {results.map((result, index) => (
                <div
                  key={result.id}
                  className={`px-3 py-2.5 cursor-pointer transition-colors rounded-lg ${
                    variant === 'mobile'
                      ? (index === selectedIndex ? 'bg-white shadow-sm' : 'hover:bg-white/60')
                      : (index === selectedIndex ? 'bg-muted' : 'hover:bg-muted/50')
                  }`}
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-center gap-2">
                    {/* Category Badge */}
                    <Badge 
                      variant="outline" 
                      className={`text-xs font-medium px-1.5 py-0.5 flex-shrink-0 ${getCategoryColor(result.category)}`}
                    >
                      {getCategoryLabel(result.category)}
                    </Badge>
                    
                    {/* Title */}
                    <span className="font-medium text-gray-900 flex-1 truncate text-sm">
                      {result.title}
                    </span>
                    
                    <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </div>
                  
                  {/* Meta line (date, location, page type) - hidden on mobile for compactness */}
                  {result.meta && variant !== 'mobile' && (
                    <p className="text-xs text-muted-foreground mt-1 ml-[72px] truncate">
                      {result.meta}
                    </p>
                  )}
                </div>
              ))}
              
              {/* "Show all results" link */}
              <div 
                className={`px-3 py-2.5 cursor-pointer transition-colors rounded-lg ${
                  variant === 'mobile' 
                    ? 'mt-1 border-t border-gray-200 hover:bg-white/60' 
                    : 'border-t border-border hover:bg-muted/50'
                }`}
                onClick={handleGoToSearchResults}
              >
                <div className="flex items-center justify-center gap-2 text-sm text-gray-700 font-medium">
                  <Search className="h-4 w-4" />
                  {language === 'de' ? 'Alle Ergebnisse anzeigen' : language === 'zh' ? '显示所有结果' : language === 'ja' ? 'すべての結果を表示' : language === 'ko' ? '모든 결과 보기' : 'Show all results'}
                </div>
              </div>
            </div>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-gray-500 mb-2">
                {language === 'de' ? 'Keine direkten Treffer' : language === 'zh' ? '没有直接匹配' : language === 'ja' ? '直接一致なし' : language === 'ko' ? '직접 일치 없음' : 'No direct matches'}
              </p>
              <button 
                type="button"
                onClick={handleGoToSearchResults}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {language === 'de' ? 'Alle Ergebnisse anzeigen →' : language === 'zh' ? '显示所有结果 →' : language === 'ja' ? 'すべての結果を表示 →' : language === 'ko' ? '모든 결과 보기 →' : 'Show all results →'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IntelligentSearchBar;