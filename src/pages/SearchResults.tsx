import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, FileText, Newspaper, Calendar, ChevronRight, Filter, Download, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useSearch, SearchResult, SearchResultCategory } from '@/hooks/useSearch';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

type FilterType = 'all' | 'page' | 'news' | 'event' | 'download';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { search, isLoading } = useSearch();
  
  const initialQuery = searchParams.get('q') || '';
  const initialFilter = (searchParams.get('filter') as FilterType) || 'all';
  
  const [query, setQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>(initialFilter);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Autocomplete state
  const [autocompleteResults, setAutocompleteResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isAutocompleteLoading, setIsAutocompleteLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Perform main search when query changes
  useEffect(() => {
    const performSearch = async () => {
      if (query.trim().length >= 2) {
        const searchResults = await search(query);
        setResults(searchResults);
        setHasSearched(true);
      } else {
        setResults([]);
        setHasSearched(false);
      }
    };

    performSearch();
  }, [query, search]);

  // Update URL when search params change
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (activeFilter !== 'all') params.set('filter', activeFilter);
    setSearchParams(params, { replace: true });
  }, [query, activeFilter, setSearchParams]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced autocomplete search
  const performAutocomplete = useCallback(async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setAutocompleteResults([]);
      setShowDropdown(false);
      return;
    }
    
    setIsAutocompleteLoading(true);
    try {
      const searchResults = await search(searchTerm);
      setAutocompleteResults(searchResults.slice(0, 6));
      setShowDropdown(true);
    } catch (error) {
      console.error('Autocomplete error:', error);
    } finally {
      setIsAutocompleteLoading(false);
    }
  }, [search]);

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSelectedIndex(-1);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      performAutocomplete(value);
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(inputValue);
    setShowDropdown(false);
  };

  const handleResultClick = (result: SearchResult) => {
    setShowDropdown(false);
    navigate(result.url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || autocompleteResults.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < autocompleteResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleResultClick(autocompleteResults[selectedIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const clearInput = () => {
    setInputValue('');
    setAutocompleteResults([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const getCategoryIcon = (category: SearchResultCategory) => {
    switch (category) {
      case 'page': return <FileText className="h-5 w-5" />;
      case 'news': return <Newspaper className="h-5 w-5" />;
      case 'event': return <Calendar className="h-5 w-5" />;
      case 'download': return <Download className="h-5 w-5" />;
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
      case 'page': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'news': return 'bg-green-100 text-green-800 border-green-200';
      case 'event': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'download': return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  // Filter results based on active filter
  const filteredResults = activeFilter === 'all' 
    ? results 
    : results.filter(r => r.category === activeFilter);

  // Count results per category
  const counts = {
    all: results.length,
    page: results.filter(r => r.category === 'page').length,
    news: results.filter(r => r.category === 'news').length,
    event: results.filter(r => r.category === 'event').length,
    download: results.filter(r => r.category === 'download').length,
  };

  // Translated UI texts
  const t = {
    de: {
      title: 'Suchergebnisse',
      placeholder: 'Suchen...',
      searchButton: 'Suchen',
      searching: 'Suche läuft...',
      noResults: 'Keine Ergebnisse für',
      tryOther: 'Versuchen Sie einen anderen Suchbegriff.',
      minChars: 'Geben Sie mindestens 2 Zeichen ein, um zu suchen.',
      all: 'Alle',
      pages: 'Seiten',
      news: 'News',
      events: 'Events',
      downloads: 'Downloads',
      registration: '✓ Gratis nach Registrierung',
    },
    en: {
      title: 'Search Results',
      placeholder: 'Search...',
      searchButton: 'Search',
      searching: 'Searching...',
      noResults: 'No results for',
      tryOther: 'Try a different search term.',
      minChars: 'Enter at least 2 characters to search.',
      all: 'All',
      pages: 'Pages',
      news: 'News',
      events: 'Events',
      downloads: 'Downloads',
      registration: '✓ Free after registration',
    },
    zh: {
      title: '搜索结果',
      placeholder: '搜索...',
      searchButton: '搜索',
      searching: '搜索中...',
      noResults: '没有找到结果',
      tryOther: '请尝试其他搜索词。',
      minChars: '请输入至少2个字符进行搜索。',
      all: '全部',
      pages: '页面',
      news: '新闻',
      events: '活动',
      downloads: '下载',
      registration: '✓ 注册后免费',
    },
    ja: {
      title: '検索結果',
      placeholder: '検索...',
      searchButton: '検索',
      searching: '検索中...',
      noResults: '結果が見つかりません',
      tryOther: '別の検索語をお試しください。',
      minChars: '検索するには2文字以上入力してください。',
      all: 'すべて',
      pages: 'ページ',
      news: 'ニュース',
      events: 'イベント',
      downloads: 'ダウンロード',
      registration: '✓ 登録後無料',
    },
    ko: {
      title: '검색 결과',
      placeholder: '검색...',
      searchButton: '검색',
      searching: '검색 중...',
      noResults: '결과 없음',
      tryOther: '다른 검색어를 시도해 보세요.',
      minChars: '검색하려면 2자 이상 입력하세요.',
      all: '전체',
      pages: '페이지',
      news: '뉴스',
      events: '이벤트',
      downloads: '다운로드',
      registration: '✓ 등록 후 무료',
    },
  };

  const texts = t[language as keyof typeof t] || t.en;

  const filterButtons: { key: FilterType; label: string }[] = [
    { key: 'all', label: texts.all },
    { key: 'page', label: texts.pages },
    { key: 'news', label: texts.news },
    { key: 'event', label: texts.events },
    { key: 'download', label: texts.downloads },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Search Header with Autocomplete */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">{texts.title}</h1>
            
            {/* Search Input with Autocomplete */}
            <div ref={containerRef} className="relative">
              <form onSubmit={handleSubmit} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                <Input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => inputValue.length >= 2 && setShowDropdown(true)}
                  placeholder={texts.placeholder}
                  className="pl-12 pr-24 h-14 text-lg border-2 border-border focus-visible:ring-2 focus-visible:ring-primary"
                />
                {inputValue && (
                  <button
                    type="button"
                    onClick={clearInput}
                    className="absolute right-24 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                <Button 
                  type="submit" 
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  disabled={isLoading}
                >
                  {texts.searchButton}
                </Button>
              </form>

              {/* Autocomplete Dropdown */}
              {showDropdown && inputValue.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#f5f5f5] border-2 border-white rounded-xl shadow-2xl z-50 max-h-[400px] overflow-y-auto">
                  {isAutocompleteLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : autocompleteResults.length > 0 ? (
                    <div className="py-2">
                      {autocompleteResults.map((result, index) => (
                        <button
                          key={`${result.category}-${result.id}`}
                          onClick={() => handleResultClick(result)}
                          className={`w-full px-4 py-3 text-left flex items-start gap-3 hover:bg-white/60 transition-colors ${
                            index === selectedIndex ? 'bg-white/60' : ''
                          }`}
                        >
                          <span className={`flex-shrink-0 p-2 rounded-lg ${getCategoryColor(result.category)}`}>
                            {getCategoryIcon(result.category)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{result.title}</p>
                            {result.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">{result.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {getCategoryLabel(result.category)}
                              </span>
                              {result.requiresRegistration && (
                                <span className="text-xs text-emerald-700">
                                  {texts.registration}
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-2" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      {texts.noResults} „{inputValue}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          {hasSearched && results.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {filterButtons.map(({ key, label }) => (
                <Button
                  key={key}
                  variant={activeFilter === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveFilter(key)}
                  className="gap-1.5"
                >
                  {label}
                  <Badge 
                    variant="secondary" 
                    className={`ml-1 ${activeFilter === key ? 'bg-primary-foreground text-primary' : ''}`}
                  >
                    {counts[key]}
                  </Badge>
                </Button>
              ))}
            </div>
          )}

          {/* Results */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">{texts.searching}</p>
            </div>
          ) : hasSearched ? (
            filteredResults.length > 0 ? (
              <div className="space-y-4">
                {filteredResults.map((result) => (
                  <Card 
                    key={result.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer group"
                    onClick={() => navigate(result.url)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Category Icon */}
                        <div className={`p-2 rounded-lg ${getCategoryColor(result.category)}`}>
                          {getCategoryIcon(result.category)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge 
                              variant="outline" 
                              className={`text-xs font-medium ${getCategoryColor(result.category)}`}
                            >
                              {getCategoryLabel(result.category)}
                            </Badge>
                            {result.requiresRegistration && (
                              <span className="text-xs text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                                {texts.registration}
                              </span>
                            )}
                          </div>
                          
                          <h2 className="text-lg font-semibold text-foreground group-hover:text-[#f9dc24] transition-colors line-clamp-1">
                            {result.title}
                          </h2>
                          
                          {result.meta && (
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {result.meta}
                            </p>
                          )}
                          
                          {result.description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {result.description}
                            </p>
                          )}
                        </div>
                        
                        {/* Arrow */}
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {texts.noResults} „{query}"
                </h2>
                <p className="text-muted-foreground">
                  {texts.tryOther}
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto opacity-50 mb-4" />
              <p>{texts.minChars}</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SearchResults;
