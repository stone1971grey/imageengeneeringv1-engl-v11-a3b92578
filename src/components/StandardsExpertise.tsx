import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Camera, Car, Monitor, Cog } from "lucide-react";
import { useState } from "react";
import ieeeLogo from "@/assets/logo-ieee-new.jpg";
import iecLogo from "@/assets/logo-iec-new.jpg";
import isoLogo from "@/assets/logo-iso-new.jpg";
import emvaLogo from "@/assets/logo-emva-new.jpg";

const StandardsExpertise = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const organizations = [
    {
      name: "IEEE",
      fullName: "Institute of Electrical and Electronics Engineers",
      logo: ieeeLogo
    },
    {
      name: "ISO",
      fullName: "International Organization for Standardization",
      logo: isoLogo
    },
    {
      name: "IEC",
      fullName: "International Electrotechnical Commission",
      logo: iecLogo
    },
    {
      name: "EMVA",
      fullName: "European Machine Vision Association",
      logo: emvaLogo
    }
  ];

  const standards = [
    {
      id: "IEEE-P2020",
      title: "IEEE P2020",
      description: "Automotive Image Quality Standard",
      category: "Automotive",
      status: "Active Member",
      statusType: "active" as const
    },
    {
      id: "ISO-12233",
      title: "ISO 12233",
      description: "Resolution and Spatial Frequency Responses",
      category: "Photography",
      status: "Compliant",
      statusType: "compliant" as const
    },
    {
      id: "ISO-14524",
      title: "ISO 14524",
      description: "Electronic Still Picture Cameras - Methods for measuring opto-electronic conversion functions",
      category: "Photography",
      status: "Compliant",
      statusType: "compliant" as const
    },
    {
      id: "ISO-15739",
      title: "ISO 15739",
      description: "Noise measurements",
      category: "Photography",
      status: "Compliant",
      statusType: "compliant" as const
    },
    {
      id: "IEC-61966-2-1",
      title: "IEC 61966-2-1",
      description: "Colour measurement and management - sRGB colour space",
      category: "Color Science",
      status: "Compliant",
      statusType: "compliant" as const
    },
    {
      id: "EMVA-1288",
      title: "EMVA 1288",
      description: "Standard for Characterization of Image Sensors and Cameras",
      category: "Machine Vision",
      status: "Compliant",
      statusType: "compliant" as const
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Automotive":
        return <Car className="h-5 w-5 text-gray-600" />;
      case "Photography":
        return <Camera className="h-5 w-5 text-gray-600" />;
      case "Color Science":
        return <Monitor className="h-5 w-5 text-gray-600" />;
      case "Machine Vision":
        return <Cog className="h-5 w-5 text-gray-600" />;
      default:
        return <Monitor className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Shaping Global Standards
          </h2>
          <p className="text-lg text-black max-w-3xl mx-auto leading-relaxed">
            We actively shape and comply with the world's leading image quality standards.
          </p>
        </div>

        {/* Logo Row */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center max-w-4xl mx-auto">
             {organizations.map((org, index) => (
               <div
                 key={index}
                 className="group cursor-pointer transition-all duration-300 hover:scale-105 text-center"
               >
                 <div className="w-[100px] h-[100px] flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 mx-auto mb-3">
                   <img
                     src={org.logo}
                     alt={org.name}
                     className="max-w-full max-h-full object-contain"
                   />
                 </div>
                 <div className="space-y-1">
                    <h4 className="font-semibold text-black text-lg">{org.name}</h4>
                    <p className="text-lg text-gray-700 max-w-[140px] leading-tight">{org.fullName}</p>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Expandable CTA */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <div className="text-center mb-8">
            <CollapsibleTrigger asChild>
              <Button 
                variant="decision"
                size="lg"
                className="group w-[300px]"
              >
                {isExpanded ? "Hide Standards" : "See all Standards"}
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  isExpanded ? 'rotate-180' : 'rotate-0'
                }`} />
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="overflow-hidden transition-all duration-[550ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-1 data-[state=closed]:duration-500 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-1 data-[state=open]:duration-550">
            <div className="pt-8 transition-opacity duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
              <div className={`text-center mb-8 transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] ${
                isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}>
                <h3 className="text-lg font-bold text-black mb-2">
                  Supported Standards
                </h3>
                <p className="text-lg text-gray-700">
                  Our testing procedures are based on internationally recognized standards
                </p>
              </div>

              <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] delay-75 ${
                isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                {standards.map((standard) => (
                <Card key={standard.id} className="h-[220px] hover:shadow-md transition-shadow duration-300 bg-gray-100 border-0 flex flex-col">
                    <CardHeader className="pb-4 flex-shrink-0">
                      <CardTitle className="text-lg font-semibold text-black">
                        {standard.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                      <p className="text-lg text-gray-700 leading-relaxed">
                        {standard.description}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(standard.category)}
                          <span className="text-lg font-medium text-black">{standard.category}</span>
                        </div>
                        
                        <div className="flex items-center text-lg">
                          <div className={`w-2 h-2 rounded-full mr-2 bg-black`} />
                          <span className={`font-medium text-black ${
                            standard.statusType === 'active' ? '' : ''
                          }`}>
                            {standard.status}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  );
};

export default StandardsExpertise;