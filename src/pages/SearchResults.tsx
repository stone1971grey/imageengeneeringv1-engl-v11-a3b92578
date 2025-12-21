import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Search, FileText, Newspaper, Calendar, ChevronRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useSearch, SearchResult, SearchResultCategory } from '@/hooks/useSearch';
import { useLanguage } from '@/contexts/LanguageContext';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

type FilterType = 'all' | 'page' | 'news' | 'event';

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
    }
  };

  const getCategoryLabel = (category: SearchResultCategory) => {
    switch (category) {
      case 'page': return 'Seite';
      case 'news': return 'News';
      case 'event': return 'Event';
    }
  };

  const getCategoryColor = (category: SearchResultCategory) => {
    switch (category) {
      case 'page': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'news': return 'bg-green-100 text-green-800 border-green-200';
      case 'event': return 'bg-purple-100 text-purple-800 border-purple-200';
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
  };

  const filterButtons: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Alle' },
    { key: 'page', label: 'Seiten' },
    { key: 'news', label: 'News' },
    { key: 'event', label: 'Events' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">Suchergebnisse</h1>
            
            {/* Search Input */}
            <form onSubmit={handleSubmit} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Suchen..."
                className="pl-12 pr-4 h-14 text-lg border-2 border-border focus-visible:ring-2 focus-visible:ring-primary"
              />
              <Button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2"
                disabled={isLoading}
              >
                Suchen
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
              <p className="text-muted-foreground">Suche läuft...</p>
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
                          <div className="flex items-center gap-2 mb-1">
                            <Badge 
                              variant="outline" 
                              className={`text-xs font-medium ${getCategoryColor(result.category)}`}
                            >
                              {getCategoryLabel(result.category)}
                            </Badge>
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
                  Keine Ergebnisse für „{query}"
                </h2>
                <p className="text-muted-foreground">
                  Versuchen Sie einen anderen Suchbegriff.
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto opacity-50 mb-4" />
              <p>Geben Sie mindestens 2 Zeichen ein, um zu suchen.</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SearchResults;
