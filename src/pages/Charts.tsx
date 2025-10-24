import React from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import chartsHero from "@/assets/charts-hero.jpg";
import te42llt from "@/assets/te42-ll-t.png";

// Sample chart data (simplified)
const chartItems = [
  {
    id: "te42-ll-t",
    title: "TE42-LL-T",
    category: "Low Light Testing",
    sku: "TE42-LL-T",
    description: "Multipurpose low-light test chart with integrated LED-Panels for timing measurements. Perfect for evaluating camera performance with precise timing control.",
    features: ["Integrated LED-Panels", "Timing Measurements", "Low Light Testing"],
    downloadUrl: "#te42-ll-t-datasheet",
    image: te42llt
  },
  {
    id: "te42-ll-uw",
    title: "TE42-LL UW",
    category: "Ultra-Wide Testing",
    sku: "TE42-LL-UW",
    description: "Multipurpose test chart for ultra-wide camera systems. Specially designed for testing wide-angle and fisheye camera performance.",
    features: ["Ultra-Wide Camera Systems", "Wide-Angle Testing", "Multi-Purpose"],
    downloadUrl: "#te42-ll-uw-datasheet"
  },
  {
    id: "te42-ll-2ar",
    title: "TE42-LL 2AR",
    category: "Multi-Aspect Testing",
    sku: "TE42-LL-2AR",
    description: "Multipurpose test chart with two aspect ratios on the same chart. Efficiently test different aspect ratios in one setup.",
    features: ["Two Aspect Ratios", "Multi-Purpose", "Efficient Testing"],
    downloadUrl: "#te42-ll-2ar-datasheet"
  },
  {
    id: "te42",
    title: "TE42",
    category: "High-Speed Testing",
    sku: "TE42",
    description: "Multipurpose test chart for high-speed camera testing. Designed for comprehensive evaluation of fast-moving capture systems.",
    features: ["High-Speed Testing", "Multi-Purpose", "Professional Grade"],
    downloadUrl: "#te42-datasheet"
  },
  {
    id: "te300",
    title: "TE300",
    category: "Skin Tone Testing",
    sku: "TE300",
    description: "An advanced and modern skin tone test chart. Perfect for accurate color reproduction in portrait and video applications.",
    features: ["Skin Tone Analysis", "Color Accuracy", "Modern Design"],
    downloadUrl: "#te300-datasheet"
  },
  {
    id: "te297",
    title: "TE297",
    category: "Dynamic Range",
    sku: "TE297",
    description: "A grayscale test chart for wide dynamic range camera testing. Enables comprehensive HDR performance evaluation.",
    features: ["Wide Dynamic Range", "Grayscale Steps", "HDR Testing"],
    downloadUrl: "#te297-datasheet"
  },
  {
    id: "te296",
    title: "TE296",
    category: "Resolution Testing",
    sku: "TE296",
    description: "A slanted edge chart for the updated ISO 12233 (2023) standard. Industry-leading resolution measurement tool.",
    features: ["ISO 12233:2023", "Slanted Edge", "MTF Analysis"],
    downloadUrl: "#te296-datasheet"
  },
  {
    id: "te292",
    title: "TE292",
    category: "Spectral Testing",
    sku: "TE292",
    description: "Spectral sensitivity measurements with iQ-LED. Advanced tool for analyzing camera spectral response characteristics.",
    features: ["Spectral Sensitivity", "iQ-LED Compatible", "Precision Measurement"],
    downloadUrl: "#te292-datasheet"
  },
  {
    id: "te285",
    title: "TE285",
    category: "IR Testing",
    sku: "TE285",
    description: "IEC 62676-5 based test chart for the evaluation of Infra-Red performance. Essential for security and surveillance camera testing.",
    features: ["IEC 62676-5", "IR Evaluation", "Security Applications"],
    downloadUrl: "#te285-datasheet"
  },
  {
    id: "te281",
    title: "TE281",
    category: "Flare Testing",
    sku: "TE281",
    description: "Flare target according to ISO 18844. Precise evaluation of lens flare and veiling glare characteristics.",
    features: ["ISO 18844", "Flare Analysis", "Veiling Glare"],
    downloadUrl: "#te281-datasheet"
  },
  {
    id: "te280",
    title: "TE280",
    category: "Texture Analysis",
    sku: "TE280",
    description: "Texture loss test chart ISO 19567. Evaluates camera texture preservation and detail rendering capabilities.",
    features: ["ISO 19567", "Texture Loss", "Detail Analysis"],
    downloadUrl: "#te280-datasheet"
  },
  {
    id: "te279",
    title: "TE279",
    category: "4K/UHD Testing",
    sku: "TE279",
    description: "4K (UHD TV) Universal test chart. Comprehensive testing solution for 4K camera systems and displays.",
    features: ["4K Resolution", "UHD TV", "Universal Testing"],
    downloadUrl: "#te279-datasheet"
  },
  {
    id: "te278",
    title: "TE278",
    category: "8K Testing",
    sku: "TE278",
    description: "8K (UHD TV2) Resolution test chart 200-4000 CPH. Next-generation testing for ultra-high resolution systems.",
    features: ["8K Resolution", "200-4000 CPH", "UHD TV2"],
    downloadUrl: "#te278-datasheet"
  },
  {
    id: "te275",
    title: "TE275",
    category: "Resolution Testing",
    sku: "TE275",
    description: "Slanted Edge ISO 12233:2017. Standard-compliant resolution testing for professional camera evaluation.",
    features: ["ISO 12233:2017", "Slanted Edge", "Resolution Analysis"],
    downloadUrl: "#te275-datasheet"
  }
];

const Charts = () => {
  const ChartCard = ({ chart }: { chart: typeof chartItems[0] }) => (
    <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
      {chart.image && (
        <div className="w-full h-48 overflow-hidden">
          <img 
            src={chart.image} 
            alt={chart.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
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
