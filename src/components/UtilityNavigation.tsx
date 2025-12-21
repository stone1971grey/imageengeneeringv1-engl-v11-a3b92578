import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { Search, X, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import { useState, useRef, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { useSearch, SearchResult, SearchResultCategory } from "@/hooks/useSearch";
import { FileText, Newspaper, Calendar, ChevronRight } from "lucide-react";

const UtilityNavigation = () => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { search, isLoading } = useSearch();

  // Debounced search
  const performSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const searchResults = await search(query);
    setResults(searchResults.slice(0, 7));
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, performSearch]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showDropdown) return;
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
            handleResultClick(results[selectedIndex]);
          } else if (searchQuery.trim().length >= 2) {
            handleGoToSearchResults();
          }
          break;
        case 'Escape':
          setShowDropdown(false);
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDropdown, results, selectedIndex, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      handleGoToSearchResults();
    }
  };

  const handleGoToSearchResults = () => {
    setShowDropdown(false);
    setIsSearchOpen(false);
    navigate(`/${language}/search?q=${encodeURIComponent(searchQuery)}`);
    setSearchQuery("");
  };

  const handleResultClick = (result: SearchResult) => {
    setShowDropdown(false);
    setIsSearchOpen(false);
    setSearchQuery("");
    navigate(result.url);
  };

  const handleSearchToggle = () => {
    if (!isSearchOpen) {
      setIsSearchOpen(true);
      setTimeout(() => inputRef.current?.focus(), 150);
    } else if (!searchQuery) {
      setIsSearchOpen(false);
      setShowDropdown(false);
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
      case 'page': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'news': return 'bg-green-50 text-green-700 border-green-200';
      case 'event': return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  const languages = [
    { code: "en", label: "EN", flag: "🇺🇸" },
    { code: "de", label: "DE", flag: "🇩🇪" },
    { code: "zh", label: "ZH", flag: "🇨🇳" },
    { code: "ja", label: "JA", flag: "🇯🇵" },
    { code: "ko", label: "KO", flag: "🇰🇷" }
  ];

  return (
    <div className="flex items-center gap-4 relative">
      {/* Expandable Search with Autocomplete */}
      <div ref={containerRef} className="relative">
        <form 
          onSubmit={handleSearchSubmit} 
          className="relative flex items-center bg-white rounded-md shadow-sm overflow-visible h-10 transition-all duration-500 ease-in-out"
          style={{
            width: isSearchOpen ? '280px' : '40px',
          }}
        >
          <div className="flex items-center w-full h-full">
            {/* Search Icon Button - only visible when closed */}
            {!isSearchOpen && (
              <button
                type="button"
                onClick={handleSearchToggle}
                className="w-10 h-10 flex items-center justify-center flex-shrink-0 hover:bg-gray-100 transition-colors z-10"
                aria-label="Search"
              >
                <Search className="h-5 w-5 text-gray-700" />
              </button>
            )}
            
            {/* Expandable Input Field */}
            <div 
              className="relative flex-1 h-full flex items-center overflow-hidden transition-all duration-500 ease-in-out"
              style={{
                width: isSearchOpen ? '100%' : '0px',
                opacity: isSearchOpen ? 1 : 0,
              }}
            >
              <Search className="absolute left-3 h-4 w-4 text-gray-500 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                className="w-full h-full pl-10 pr-20 bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-500"
              />
            </div>
            
            {/* Submit Button - compact yellow */}
            {isSearchOpen && searchQuery.trim().length >= 2 && (
              <button
                type="submit"
                className="absolute right-10 h-7 px-2 bg-[#f9dc24] hover:bg-[#e8cc1f] text-black rounded flex items-center justify-center transition-colors z-10"
                aria-label="Suchen"
                title="Suchen"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
            
            {/* Close Button - only visible when open */}
            {isSearchOpen && (
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  setShowDropdown(false);
                  setSearchQuery("");
                }}
                className="w-10 h-10 flex items-center justify-center flex-shrink-0 hover:bg-gray-100 transition-colors z-10"
                aria-label="Close search"
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
            )}
          </div>
        </form>

        {/* Autocomplete Dropdown */}
        {isSearchOpen && showDropdown && searchQuery.length >= 2 && (
          <div className="absolute top-full right-0 mt-2 w-[360px] bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-6 text-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mx-auto" />
              </div>
            ) : results.length > 0 ? (
              <div className="py-1">
                {results.map((result, index) => (
                  <div
                    key={result.id}
                    className={`px-3 py-2.5 cursor-pointer transition-colors ${
                      index === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-medium px-2 py-0.5 ${getCategoryColor(result.category)}`}
                      >
                        {getCategoryLabel(result.category)}
                      </Badge>
                      <span className="font-medium text-gray-900 flex-1 truncate">
                        {result.title}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </div>
                    {result.meta && (
                      <p className="text-xs text-gray-500 mt-1 ml-[72px] truncate">
                        {result.meta}
                      </p>
                    )}
                  </div>
                ))}
                
                <div 
                  className="px-3 py-2.5 border-t border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={handleGoToSearchResults}
                >
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-700 font-medium">
                    <Search className="h-4 w-4" />
                    Alle Ergebnisse anzeigen
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-gray-500 mb-2">Keine direkten Treffer</p>
                <button 
                  type="button"
                  onClick={handleGoToSearchResults}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Alle Ergebnisse anzeigen →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Language Selector */}
      <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
        <SelectTrigger className="w-[70px] h-10 bg-white border-none text-black hover:bg-gray-100 transition-all duration-300 [&>svg]:hidden text-3xl justify-center px-0 focus:ring-0 focus:ring-offset-0 rounded-md">
          <SelectValue className="text-center w-full flex justify-center">
            {languages.find(lang => lang.code === language)?.flag}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-lg min-w-[70px] w-[70px]">
          {languages.map((lang) => (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              className="justify-center hover:bg-gray-100 cursor-pointer text-black text-3xl py-3 pl-0 pr-0 [&_svg]:hidden [&>span:first-child]:hidden"
            >
              {lang.flag}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Link to={`/${language}/contact`}>
        <Button 
          variant="default" 
          className="h-10 bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black border border-[#f9dc24] hover:border-[#f9dc24]/90 transition-all duration-300 flex items-center justify-center px-6 rounded-md font-medium"
        >
          {t.nav.contact}
        </Button>
      </Link>
    </div>
  );
};

export default UtilityNavigation;