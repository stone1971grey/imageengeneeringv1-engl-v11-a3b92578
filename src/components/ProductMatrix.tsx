import { useState } from "react";
import { ChevronDown, Zap, Camera, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const industries = [
  {
    id: "automotive",
    title: "Automotive",
    icon: Camera,
    testCharts: ["TE42-LL", "TE252", "TE269"],
    lighting: ["Arcturus", "iQ-Chart Box", "lightSTUDIO"],
    measurement: ["camSPECS", "LED-Panel", "iQ-Analyzer-X"]
  },
  {
    id: "medical",
    title: "Medical",
    icon: Camera,
    testCharts: ["TE42-MED", "TE258", "TE271"],
    lighting: ["Arcturus Pro", "iQ-Chart Box", "lightSTUDIO Pro"],
    measurement: ["camSPECS Pro", "LED-Panel", "iQ-Analyzer-X"]
  },
  {
    id: "consumer",
    title: "Consumer Electronics",
    icon: Camera,
    testCharts: ["TE42-CE", "TE255", "TE268"],
    lighting: ["Arcturus Lite", "iQ-Chart Box", "lightSTUDIO"],
    measurement: ["camSPECS Lite", "LED-Panel", "iQ-Analyzer"]
  },
  {
    id: "security",
    title: "Security",
    icon: Camera,
    testCharts: ["TE42-SEC", "TE259", "TE272"],
    lighting: ["Arcturus Security", "iQ-Chart Box Pro", "lightSTUDIO Security"],
    measurement: ["camSPECS Security", "LED-Panel Pro", "iQ-Analyzer-X Pro"]
  },
  {
    id: "broadcast",
    title: "Broadcast",
    icon: Camera,
    testCharts: ["TE42-BC", "TE260", "TE275"],
    lighting: ["Arcturus Broadcast", "iQ-Chart Box Broadcast", "lightSTUDIO Broadcast"],
    measurement: ["camSPECS Broadcast", "LED-Panel Broadcast", "iQ-Analyzer-X Broadcast"]
  }
];

const ProductCategory = ({ 
  title, 
  products, 
  icon: Icon 
}: { 
  title: string; 
  products: string[]; 
  icon: React.ComponentType<any>;
}) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <h4 className="font-semibold text-sm text-foreground">{title}</h4>
    </div>
    <div className="grid gap-2">
      {products.map((product, index) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 bg-background/50 rounded-lg border hover:shadow-sm transition-shadow"
        >
          <span className="text-sm text-muted-foreground">{product}</span>
          <button className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors">
            View
          </button>
        </div>
      ))}
    </div>
  </div>
);

const ProductMatrix = () => {
  return (
    <section className="py-16 bg-[#F7F9FB]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Product-to-Industry Matrix
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the perfect testing solutions tailored for your industry. 
            Explore our comprehensive product mapping across key sectors.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {industries.map((industry) => (
              <AccordionItem 
                key={industry.id} 
                value={industry.id}
                className="border-none"
              >
                <Card className="bg-background shadow-sm">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <industry.icon className="h-5 w-5 text-primary" />
                      <span className="text-lg font-semibold text-foreground">
                        {industry.title}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="px-6 pb-6">
                      <div className="grid md:grid-cols-3 gap-8">
                        <ProductCategory
                          title="Test Charts"
                          products={industry.testCharts}
                          icon={Camera}
                        />
                        <ProductCategory
                          title="Illumination Devices"
                          products={industry.lighting}
                          icon={Zap}
                        />
                        <ProductCategory
                          title="Measurement Equipment"
                          products={industry.measurement}
                          icon={Wrench}
                        />
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground mb-4">
            Need a custom solution for your specific requirements?
          </p>
          <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
            Contact Our Experts
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductMatrix;