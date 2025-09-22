import { Button } from "@/components/ui/button";
import IntelligentSearchBar from "@/components/IntelligentSearchBar";

const UtilityNavigation = () => {
  return (
    <div className="flex items-center gap-4">
      <IntelligentSearchBar />
      <Button 
        variant="default" 
        className="bg-[#d9c409] hover:bg-[#c4b108] text-black border border-[#d9c409] hover:border-[#c4b108] transition-all duration-300 text-lg px-6 py-2"
      >
        Contact
      </Button>
    </div>
  );
};

export default UtilityNavigation;