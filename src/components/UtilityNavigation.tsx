import { Button } from "@/components/ui/button";
import IntelligentSearchBar from "@/components/IntelligentSearchBar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { useState } from "react";
import { MessageCircle } from "lucide-react";

const UtilityNavigation = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const languages = [
    { code: "en", label: "English", flag: "🇺🇸", short: "EN" },
    { code: "de", label: "Deutsch", flag: "🇩🇪", short: "D" },
    { code: "zh", label: "中文", flag: "🇨🇳", short: "CN" },
    { code: "ja", label: "日本語", flag: "🇯🇵", short: "JP" },
    { code: "ko", label: "한국어", flag: "🇰🇷", short: "KR" }
  ];

  return (
    <div className="flex items-center gap-4">
      <IntelligentSearchBar />
      
      {/* Language Selector */}
      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
        <SelectTrigger className="w-[60px] bg-[#103e7c] border-[#103e7c] text-white hover:bg-[#0d3468] transition-all duration-300">
          <SelectValue>
            {languages.find(lang => lang.code === selectedLanguage)?.short || "EN"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
          {languages.map((lang) => (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              className="flex items-center gap-2 hover:bg-gray-100 cursor-pointer text-black"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Link to="/contact">
        <Button 
          variant="default" 
          className="w-[50px] bg-[#d9c409] hover:bg-[#c4b108] text-black border border-[#d9c409] hover:border-[#c4b108] transition-all duration-300 flex items-center justify-center p-2"
        >
          <MessageCircle className="h-5 w-5" />
        </Button>
      </Link>
    </div>
  );
};

export default UtilityNavigation;