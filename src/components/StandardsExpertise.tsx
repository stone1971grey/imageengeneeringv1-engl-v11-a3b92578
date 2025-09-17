import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Automotive":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Photography":
        return "bg-green-100 text-green-700 border-green-200";
      case "Color Science":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "Machine Vision":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

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
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center max-w-4xl mx-auto">
             {organizations.map((org, index) => (
               <div
                 key={index}
                 className="group cursor-pointer transition-all duration-300 hover:scale-105 text-center"
               >
                 <div className="w-[100px] h-[100px] flex items-center justify-center p-4 bg-card rounded-lg shadow-sm hover:shadow-md transition-all duration-300 mx-auto mb-3">
                   <img
                     src={org.logo}
                     alt={org.name}
                     className="max-w-full max-h-full object-contain"
                   />
                 </div>
                 <div className="space-y-1">
                   <h4 className="font-semibold text-foreground text-lg">{org.name}</h4>
                   <p className="text-lg text-muted-foreground max-w-[140px] leading-tight">{org.fullName}</p>
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
                className="group"
              >
                {isExpanded ? "Hide Standards" : "See all Standards"}
                {isExpanded ? (
                  <ChevronUp className="ml-2 h-4 w-4 transition-transform duration-300" />
                ) : (
                  <ChevronDown className="ml-2 h-4 w-4 transition-transform duration-300" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="overflow-hidden transition-all duration-300 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <div className="pt-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Supported Standards
                </h3>
                <p className="text-muted-foreground">
                  Our testing procedures are based on internationally recognized standards
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {standards.map((standard) => (
                  <Card key={standard.id} className="h-full hover:shadow-md transition-shadow duration-300">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-foreground">
                        {standard.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {standard.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="outline" 
                          className={`text-xs font-medium border ${getCategoryColor(standard.category)}`}
                        >
                          {standard.category}
                        </Badge>
                        
                        <div className="flex items-center text-sm">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            standard.statusType === 'active' ? 'bg-blue-500' : 'bg-green-500'
                          }`} />
                          <span className={`font-medium ${
                            standard.statusType === 'active' ? 'text-blue-700' : 'text-green-700'
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