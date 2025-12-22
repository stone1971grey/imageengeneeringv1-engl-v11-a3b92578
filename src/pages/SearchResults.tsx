import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, FileText, Newspaper, Calendar, ChevronRight, Filter, Download, Lock } from 'lucide-react';
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

  // Perform search when query changes
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(inputValue);
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
      registration: 'Registrierung erforderlich',
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
      registration: 'Registration required',
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
      registration: '需要注册',
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
      registration: '登録が必要',
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
      registration: '등록 필요',
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
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">{texts.title}</h1>
            
            {/* Search Input */}
            <form onSubmit={handleSubmit} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={texts.placeholder}
                className="pl-12 pr-4 h-14 text-lg border-2 border-border focus-visible:ring-2 focus-visible:ring-primary"
              />
              <Button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2"
                disabled={isLoading}
              >
                {texts.searchButton}
              </Button>
            </form>
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
                              <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                <Lock className="h-3 w-3" />
                                {texts.registration}
                              </span>
                            )}
                          </div>
                          
                          <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
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
