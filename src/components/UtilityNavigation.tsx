import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useRef, useEffect } from "react";

const UtilityNavigation = () => {
  const { language, setLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results or handle search
      console.log("Search query:", searchQuery);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: "en", label: "EN", flag: "🇺🇸" },
    { code: "de", label: "DE", flag: "🇩🇪" },
    { code: "zh", label: "ZH", flag: "🇨🇳" },
    { code: "ja", label: "JA", flag: "🇯🇵" },
    { code: "ko", label: "KO", flag: "🇰🇷" }
  ];

  return (
    <div className="flex items-center gap-4 relative">
      {/* Search with toggle animation */}
      <div ref={searchContainerRef} className="relative">
        {/* Search Button (Magnifying Glass) */}
        <button
          type="button"
          onClick={toggleSearch}
          className="w-10 h-10 flex items-center justify-center bg-white rounded-md hover:bg-gray-100 transition-colors shadow-sm"
          aria-label="Toggle Search"
        >
          <Search className="h-5 w-5 text-gray-700" />
        </button>

        {/* Expandable Search Input */}
        {isSearchOpen && (
          <form 
            onSubmit={handleSearchSubmit} 
            className="absolute right-0 top-0 flex items-center bg-white rounded-md shadow-lg overflow-hidden h-10 animate-scale-in"
          >
            <div className="flex items-center w-[240px]">
              <div className="relative flex-1 h-full flex items-center">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-full pl-10 pr-8 bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                  >
                    <X className="h-3 w-3 text-gray-500" />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={toggleSearch}
                className="w-10 h-10 flex items-center justify-center flex-shrink-0 hover:bg-gray-100 transition-colors"
                aria-label="Close Search"
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </form>
        )}
      </div>
      
      {/* Language Selector */}
      <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
        <SelectTrigger className="w-[70px] h-10 bg-white border-none text-black hover:bg-gray-100 transition-all duration-300 [&>svg]:hidden text-3xl justify-center px-0 focus:ring-0 focus:ring-offset-0 rounded-md">
          <SelectValue className="text-center w-full flex justify-center">
            {languages.find(lang => lang.code === language)?.flag}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50 min-w-[70px] w-[70px]">
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
      
      <Link to="/contact">
        <Button 
          variant="default" 
          className="h-10 bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black border border-[#f9dc24] hover:border-[#f9dc24]/90 transition-all duration-300 flex items-center justify-center px-6 rounded-md font-medium"
        >
          Contact
        </Button>
      </Link>
    </div>
  );
};

export default UtilityNavigation;