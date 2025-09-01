import { Button } from "@/components/ui/button";
import IntelligentSearchBar from "@/components/IntelligentSearchBar";

const UtilityNavigation = () => {
  return (
    <div className="flex items-center gap-4">
      <IntelligentSearchBar />
      <Button variant="default" className="bg-gradient-primary hover:bg-white hover:text-black transition-all duration-300 text-lg">
        Contact
      </Button>
    </div>
  );
};

export default UtilityNavigation;