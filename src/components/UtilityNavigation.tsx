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
        <SelectTrigger className="w-[70px] h-12 bg-white border-black text-black hover:bg-gray-100 transition-all duration-300 [&>svg]:hidden text-3xl">
          <SelectValue>
            {languages.find(lang => lang.code === language)?.flag}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50 min-w-[70px] w-[70px]">
          {languages.map((lang) => (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              className="flex items-center justify-center hover:bg-gray-100 cursor-pointer text-black text-3xl [&_svg]:hidden py-3 [&>span]:w-full [&>span]:text-center [&>span]:flex [&>span]:justify-center"
            >
              {lang.flag}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Link to="/contact">
        <Button 
          variant="default" 
          className="h-10 bg-[#f5743a] hover:bg-[#e66428] text-white border border-[#f5743a] hover:border-[#e66428] transition-all duration-300 flex items-center justify-center px-6"
        >
          Contact
        </Button>
      </Link>
    </div>
  );
};

export default UtilityNavigation;