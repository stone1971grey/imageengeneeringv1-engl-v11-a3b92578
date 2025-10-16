import { Button } from "@/components/ui/button";
import IntelligentSearchBar from "@/components/IntelligentSearchBar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const UtilityNavigation = () => {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: "en", label: "EN", flag: "🇺🇸" },
    { code: "de", label: "DE", flag: "🇩🇪" },
    { code: "zh", label: "ZH", flag: "🇨🇳" },
    { code: "ja", label: "JA", flag: "🇯🇵" },
    { code: "ko", label: "KO", flag: "🇰🇷" }
  ];

  return (
    <div className="flex items-center gap-4">
      <IntelligentSearchBar />
      
      {/* Language Selector */}
      <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
        <SelectTrigger className="w-[60px] bg-[#103e7c] border-[#103e7c] text-white hover:bg-[#0d3468] transition-all duration-300">
          <SelectValue placeholder="EN" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
          {languages.map((lang) => (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              className="flex items-center gap-2 hover:bg-gray-100 cursor-pointer text-black"
            >
              <span>{lang.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Link to="/contact">
        <Button 
          variant="default" 
          className="w-[60px] h-10 bg-[#f5743a] hover:bg-[#e66428] text-white border border-[#f5743a] hover:border-[#e66428] transition-all duration-300 flex items-center justify-center"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      </Link>
    </div>
  );
};

export default UtilityNavigation;