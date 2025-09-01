import { Button } from "@/components/ui/button";
import IntelligentSearchBar from "@/components/IntelligentSearchBar";

const UtilityNavigation = () => {
  return (
    <div className="flex items-center gap-4">
      <IntelligentSearchBar />
      <Button variant="default" className="bg-[#4A90E2] hover:bg-white/20 hover:text-white transition-all duration-300 text-lg text-white">
        Contact
      </Button>
    </div>
  );
};

export default UtilityNavigation;