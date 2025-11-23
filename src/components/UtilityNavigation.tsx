import { Button } from "@/components/ui/button";
import IntelligentSearchBar from "@/components/IntelligentSearchBar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

const UtilityNavigation = () => {
  const { language, setLanguage } = useLanguage();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const languages = [
    { code: "en", label: "EN", flag: "🇺🇸" },
    { code: "de", label: "DE", flag: "🇩🇪" },
    { code: "zh", label: "ZH", flag: "🇨🇳" },
    { code: "ja", label: "JA", flag: "🇯🇵" },
    { code: "ko", label: "KO", flag: "🇰🇷" }
  ];

  return (
    <div className="flex items-center gap-4 relative">
      {/* Search - Modern Expandable */}
      <div className="relative overflow-hidden">
        <div className="flex items-center">
          {/* Search Input - slides in smoothly */}
          <div 
            className={`transition-all duration-500 ease-in-out ${
              isSearchOpen ? 'w-[220px] opacity-100' : 'w-0 opacity-0'
            } overflow-hidden`}
          >
            <IntelligentSearchBar />
          </div>
          
          {/* Search Icon Button - morphs smoothly */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`w-10 h-10 rounded-md flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
              isSearchOpen 
                ? 'bg-gray-100 hover:bg-gray-200 rotate-90' 
                : 'bg-white hover:bg-gray-100 rotate-0'
            }`}
            aria-label={isSearchOpen ? "Close search" : "Open search"}
          >
            {isSearchOpen ? (
              <X className="h-5 w-5 text-gray-700 transition-transform duration-300" />
            ) : (
              <Search className="h-5 w-5 text-gray-700 transition-transform duration-300" />
            )}
          </button>
        </div>
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