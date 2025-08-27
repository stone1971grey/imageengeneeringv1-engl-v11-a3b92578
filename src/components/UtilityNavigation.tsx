import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import IntelligentSearchBar from "@/components/IntelligentSearchBar";

const UtilityNavigation = () => {
  return (
    <div className="flex items-center gap-4">
      <IntelligentSearchBar />
      <Button 
        variant="outline" 
        size="sm" 
        className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-black transition-colors"
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Contact
      </Button>
    </div>
  );
};

export default UtilityNavigation;