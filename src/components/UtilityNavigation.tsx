import { Button } from "@/components/ui/button";
import IntelligentSearchBar from "@/components/IntelligentSearchBar";

const UtilityNavigation = () => {
  return (
    <div className="flex items-center gap-4">
      <IntelligentSearchBar />
      <Button 
        variant="default" 
        className="bg-[#3D7BA2] hover:bg-white hover:text-[#3D7BA2] text-white border border-[#3D7BA2] hover:border-[#3D7BA2] transition-all duration-300 text-lg px-6 py-2"
      >
        Contact
      </Button>
    </div>
  );
};

export default UtilityNavigation;