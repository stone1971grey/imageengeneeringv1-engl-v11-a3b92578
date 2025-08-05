import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Building, Cog, ArrowRight, CheckCircle } from "lucide-react";
import manufacturersImage from "@/assets/manufacturers-image.png";
import suppliersImage from "@/assets/suppliers-image.png";

interface Solution {
  id: string;
  title: string;
  image: string;
  icon: any;
  description: string;
  benefits: string[];
  processes: string[];
  badge: string;
}

const solutions: Solution[] = [
  {
    id: "manufacturers",
    title: "Hersteller",
    image: manufacturersImage,
    icon: Building,
    description: "OEMs profitieren von objektiven Tests durch neutrale Drittpartei für fundierte Sensorauswahl.",
    benefits: [
      "Objektive Sensorauswahl aus breiter Palette",
      "Maßgeschneiderte camPAS-Tests",
      "Fundierte Entscheidungsgrundlagen"
    ],
    processes: [
      "Spezifikationsanalyse",
      "Test-Design",
      "Objektive Bewertung",
      "Entscheidungsunterstützung"
    ],
    badge: "OEM"
  },
  {
    id: "suppliers",
    title: "Zulieferer", 
    image: suppliersImage,
    icon: Cog,
    description: "Tier-1/2 Zulieferer validieren Komponenten vor Lieferung und optimieren Bildqualität proaktiv.",
    benefits: [
      "Validierung vor Lieferung",
      "Frühe Fehlererkennung", 
      "Bildqualitätsverbesserungen"
    ],
    processes: [
      "Pre-Delivery Validation",
      "Bug-Detection",
      "Quality Enhancement",
      "Supplier Confidence"
    ],
    badge: "Tier 1/2"
  }
];

const ManufacturerSupplierShowcase = () => {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-16">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Lösungen für Hersteller & Zulieferer
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Spezialisierte camPAS-Testlösungen für verschiedene Rollen in der automotive Supply Chain
          </p>
        </div>

        {/* Horizontal Scrollable Cards */}
        <ScrollArea className="w-full whitespace-nowrap rounded-xl">
          <div className="flex w-max space-x-6 p-1">
            {solutions.map((solution) => {
              const IconComponent = solution.icon;
              return (
                <Card key={solution.id} className="w-[500px] bg-white shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="p-0">
                    {/* Image Section */}
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img 
                        src={solution.image}
                        alt={`${solution.title} workflow diagram`}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary" className="bg-white/90 text-gray-900">
                          {solution.badge}
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{solution.title}</h3>
                      </div>

                      <p className="text-gray-700 leading-relaxed mb-6">
                        {solution.description}
                      </p>

                      {/* Benefits */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                          Vorteile
                        </h4>
                        <div className="space-y-2">
                          {solution.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Process Steps */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                          Prozess
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {solution.processes.map((process, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {process}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* CTA */}
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 group">
                        Mehr über {solution.title}-Lösungen
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Legend */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Horizontaler Scroll für weitere Details verfügbar
          </p>
          <div className="flex justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              <span>OEM Hersteller</span>
            </div>
            <div className="flex items-center gap-2">
              <Cog className="w-4 h-4 text-blue-600" />
              <span>Tier-1/2 Zulieferer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManufacturerSupplierShowcase;