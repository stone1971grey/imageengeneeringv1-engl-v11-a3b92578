import { Button } from "@/components/ui/button";
import IntelligentSearchBar from "@/components/IntelligentSearchBar";

const UtilityNavigation = () => {
  return (
    <div className="flex items-center gap-4">
      <IntelligentSearchBar />
      <Button 
        variant="default" 
        className="bg-[#22C3F7] hover:bg-white hover:text-[#22C3F7] text-black border border-[#22C3F7] hover:border-[#22C3F7] transition-all duration-300 text-lg px-6 py-2"
      >
        Contact
      </Button>
    </div>
  );
};

export default UtilityNavigation;