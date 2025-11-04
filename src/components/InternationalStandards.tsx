import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ieeeLogo from "@/assets/ieee-logo.jpg";
import isoStandardsLogo from "@/assets/iso-standards-logo-new.jpg";
import emvaLogo from "@/assets/emva-logo.jpg";

const InternationalStandards = () => {
  return (
    <section id="standards" className="py-16" style={{ backgroundColor: '#f3f3f5' }}>
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
          Automotive International Standards
        </h2>
        
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mb-12">
          <div className="h-24 w-40 flex items-center justify-center">
            <img 
              src={ieeeLogo}
              alt="IEEE P2020 Standard"
              className="h-full w-full object-contain grayscale hover:grayscale-0 transition-all duration-300"
            />
          </div>
          <div className="h-24 w-40 flex items-center justify-center">
            <img 
              src={isoStandardsLogo}
              alt="ISO Standards"
              className="h-full w-full object-contain grayscale hover:grayscale-0 transition-all duration-300"
            />
          </div>
          <div className="h-24 w-40 flex items-center justify-center">
            <img 
              src={emvaLogo}
              alt="EMVA 1288 Standard"
              className="h-full w-full object-contain grayscale hover:grayscale-0 transition-all duration-300"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <Link to="/automotive#standards">
            <Button 
              size="lg"
              className="bg-[#f9dc24] text-black px-8 py-4 text-lg font-medium shadow-soft hover:shadow-lg transition-all duration-300"
            >
              View Standards
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default InternationalStandards;
