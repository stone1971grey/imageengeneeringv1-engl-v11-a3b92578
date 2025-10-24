import React from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import chartsHero from "@/assets/charts-hero.jpg";

// Sample chart data (simplified)
const chartItems = [
  {
    id: "te42",
    title: "TE42 Low Light Chart",
    category: "Low Light Testing",
    sku: "TE42-V2",
    description: "Professional test chart for low-light camera performance evaluation. Includes gray scales, color patches, and resolution targets optimized for challenging lighting conditions.",
    features: ["OECF Analysis", "Color Accuracy", "Noise Performance"],
    downloadUrl: "#te42-datasheet"
  },
  {
    id: "te292",
    title: "TE292 Dead Leaves Chart",
    category: "Resolution Testing",
    sku: "TE292",
    description: "Industry-standard resolution testing chart with dead leaves pattern for MTF and texture analysis. Essential for evaluating camera sharpness and detail reproduction.",
    features: ["MTF Testing", "Texture Analysis", "ISO 12233 Compliant"],
    downloadUrl: "#te292-datasheet"
  },
  {
    id: "te294",
    title: "TE294 Grayscale Chart",
    category: "Color & Tone",
    sku: "TE294",
    description: "Precision grayscale chart for accurate tone reproduction testing. Features calibrated neutral patches from black to white for gamma and OECF analysis.",
    features: ["20 Gray Steps", "Neutral Patches", "OECF Calibration"],
    downloadUrl: "#te294-datasheet"
  },
  {
    id: "te300",
    title: "TE300 Universal Test Chart",
    category: "Multi-Purpose",
    sku: "TE300",
    description: "Comprehensive all-in-one test chart combining resolution, color, and distortion testing capabilities. Perfect for complete camera system evaluation.",
    features: ["Resolution Targets", "Color Patches", "Distortion Grid"],
    downloadUrl: "#te300-datasheet"
  },
  {
    id: "geocal",
    title: "GeoCal Calibration Target",
    category: "Geometric Calibration",
    sku: "GEOCAL-01",
    description: "Advanced geometric calibration target for camera calibration and distortion correction. Precision-manufactured for accurate intrinsic parameter estimation.",
    features: ["High Precision", "Multiple Patterns", "Calibration Software"],
    downloadUrl: "#geocal-datasheet"
  },
  {
    id: "hdr-chart",
    title: "HDR Extended Range Chart",
    category: "HDR Testing",
    sku: "HDR-EXT",
    description: "Specialized chart for High Dynamic Range camera testing with extended luminance range. Enables comprehensive HDR performance evaluation.",
    features: ["20 Stop Range", "LED Backlight", "Dynamic Testing"],
    downloadUrl: "#hdr-datasheet"
  }
];

const Charts = () => {
  const ChartCard = ({ chart }: { chart: typeof chartItems[0] }) => (
    <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge className="bg-[#f5743a] text-black hover:bg-[#f5743a]/90 text-base px-3 py-1.5 font-normal">
            {chart.category}
          </Badge>
        </div>
        <CardTitle className="text-xl leading-relaxed flex items-start gap-3">
          <FileText className="h-6 w-6 text-[#f5743a] flex-shrink-0 mt-1" />
          <span>{chart.title}</span>
        </CardTitle>
        <div className="flex gap-4 text-sm text-white">
          <span>SKU: {chart.sku}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <CardDescription className="text-base leading-relaxed flex-1 text-white">
          {chart.description}
        </CardDescription>
        
        <div className="space-y-2">
          <p className="text-sm font-semibold text-white">Key Features:</p>
          <ul className="text-sm text-white space-y-1">
            {chart.features.map((feature, idx) => (
              <li key={idx}>• {feature}</li>
            ))}
          </ul>
        </div>
        
        <Button 
          className="w-full bg-[#f5743a] hover:bg-[#f5743a]/90 text-white"
          asChild
        >
          <a href={chart.downloadUrl} target="_blank" rel="noopener noreferrer">
            <FileText className="h-4 w-4 mr-2" />
            Download Datasheet
          </a>
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-56 pb-16 lg:pt-64 lg:pb-20">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${chartsHero})`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent"></div>
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Test Charts
            </h1>
            <p className="text-xl lg:text-2xl text-white mb-8 max-w-2xl">
              Professional test charts for comprehensive camera and image quality testing – from low-light to ultra-HD.
            </p>
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Our Test Charts</h2>
            <p className="text-white max-w-2xl">
              Industry-leading test charts for precise image quality measurement and camera calibration across all applications.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chartItems.map(chart => (
              <ChartCard key={chart.id} chart={chart} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Need Custom Test Charts?</h2>
          <p className="text-white mb-8 max-w-2xl mx-auto">
            We offer custom test chart design and manufacturing services tailored to your specific testing requirements.
          </p>
          <Button 
            size="lg"
            className="bg-[#f5743a] hover:bg-[#f5743a]/90 text-white"
            asChild
          >
            <a href="#contact">Contact Our Experts</a>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Charts;
