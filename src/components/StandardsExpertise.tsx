import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ieeeLogo from "@/assets/logo-ieee.png";
import iecLogo from "@/assets/logo-iec.png";
import isoLogo from "@/assets/logo-iso.jpg";
import emvaLogo from "@/assets/logo-emva.jpg";

const StandardsExpertise = () => {
  const organizations = [
    {
      name: "IEEE",
      logo: ieeeLogo
    },
    {
      name: "ISO",
      logo: isoLogo
    },
    {
      name: "IEC",
      logo: iecLogo
    },
    {
      name: "EMVA",
      logo: emvaLogo
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Shaping Global Standards
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We actively shape and comply with the world's leading image quality standards.
          </p>
        </div>

        {/* Logo Row */}
        <div className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center max-w-4xl mx-auto">
            {organizations.map((org, index) => (
              <div
                key={index}
                className="group cursor-pointer transition-all duration-300 hover:scale-105"
              >
                <div className="w-[120px] h-[80px] flex items-center justify-center p-4 bg-card rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                  <img
                    src={org.logo}
                    alt={org.name}
                    className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button 
            variant="outline" 
            className="group"
            onClick={() => {
              // You can add navigation logic here or link to a standards page
              console.log("Navigate to standards page");
            }}
          >
            See all Standards
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default StandardsExpertise;