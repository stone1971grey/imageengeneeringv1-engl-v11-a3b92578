import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowRight, Download, FileText, BarChart3, Zap, Shield, Eye, CheckCircle, Lightbulb, Monitor, Package, Settings, Target, Expand, X, Check, Quote, Camera } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductFAQ from "@/components/ProductFAQ";

// Import solution images
import arcturusMain from "@/assets/arcturus-main-product.png";
import arcturusSetup from "@/assets/arcturus-setup-vega.jpg";
import arcturusCharts from "@/assets/arcturus-vega-charts.jpg";
import arcturusRealisticLab from "@/assets/arcturus-realistic-lab.jpg";

import iqAnalyzerIntro from "@/assets/iq-analyzer-intro.png";
import testimonialDrBecker from "@/assets/testimonial-dr-becker.jpg";
import te294Grayscale from "@/assets/te294-grayscale.png";
import arcturusAccessories from "@/assets/arcturus-accessories.png";
import vegaAddon from "@/assets/vega-addon.png";
import professionalTraining from "@/assets/professional-training.jpg";

const SolutionArcturusBundle = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const solutionImages = [
    {
      src: arcturusMain,
      title: "Arcturus LED System",
      description: "High-performance LED lighting system for maximum intensity"
    },
    {
      src: iqAnalyzerIntro,
      title: "Vega Software Suite",
      description: "Comprehensive image analysis and quality control software"
    },
    {
      src: "/images/custom-chart.png",
      title: "Test Charts Collection",
      description: "Precision test charts for various application areas"
    },
    {
      src: arcturusSetup,
      title: "Complete Laboratory Setup",
      description: "Integrated solution with all components"
    }
  ];

  const bundleComponents = [
    {
      title: "Arcturus LED System",
      description: "Highly stable light source up to 1 Mcd/m²",
      features: [
        "DC-powered LED technology",
        "Flicker-free for consistent testing",
        "Wide dynamic range",
        "IEEE P2020 compatible"
      ],
      icon: <Zap className="h-8 w-8 text-black" />
    },
    {
      title: "Vega Software Suite",
      description: "Professional image analysis and calibration",
      features: [
        "Automated image quality analysis",
        "Multi-format export functions",
        "Python API integration",
        "Comprehensive report generation"
      ],
      icon: <Monitor className="h-8 w-8 text-black" />
    },
    {
      title: "Premium Test Charts",
      description: "High-precision test patterns for various applications",
      features: [
        "Automotive specific charts",
        "Mobile device testing charts",
        "Color calibration charts",
        "Individual chart configurations"
      ],
      icon: <Target className="h-8 w-8 text-black" />
    }
  ];

  const applicationAreas = [
    {
      title: "Automotive ADAS Testing",
      description: "Complete testing solution for driver assistance systems according to IEEE P2020 standard",
      icon: <Shield className="h-8 w-8 text-[#577eb4]" />,
      benefits: ["HDR scenario testing", "Sunlight simulation", "Night vision validation"]
    },
    {
      title: "Mobile Device Validation",
      description: "Comprehensive image quality testing for smartphone cameras according to VCX standards",
      icon: <Eye className="h-8 w-8 text-[#577eb4]" />,
      benefits: ["Color accuracy testing", "Sharpness analysis", "Low-light performance"]
    },
    {
      title: "Professional Photography",
      description: "Precision calibration for professional camera systems",
      icon: <Lightbulb className="h-8 w-8 text-[#577eb4]" />,
      benefits: ["Color reproduction testing", "Dynamic range analysis", "Lens sharpness measurement"]
    }
  ];

  const faqData = [
    {
      question: "Is the bundle VCX compatible?",
      answer: "Yes, the Arcturus HDR Test Bundle is fully VCX compatible. The Vega Software Suite supports all relevant VCX standards for mobile device testing and enables standardized image quality measurements according to VCX guidelines."
    },
    {
      question: "What API interfaces are included?",
      answer: "The Vega Software Suite offers a comprehensive Python API for complete automation. It enables control of the Arcturus LED system, automated image capture, data analysis and report generation. Additionally, REST APIs are available for web integration."
    },
    {
      question: "How does calibration work?",
      answer: "The system is delivered factory-calibrated and supports automatic recalibration. The Vega software performs regular consistency checks and warns of deviations. Manual calibration is possible via the software interface."
    },
    {
      question: "Can Vega & Arcturus be used simultaneously?",
      answer: "Yes, that's the main advantage of the bundle. Vega and Arcturus are seamlessly integrated and can be operated synchronously. The software automatically controls the LED system based on selected test protocols and optimizes lighting in real-time."
    },
    {
      question: "What camera types can be tested with this?",
      answer: "The bundle supports all common camera types: automotive cameras (ADAS), smartphone cameras, industrial machine vision systems, broadcast cameras and professional photography equipment. The software automatically recognizes camera parameters and adapts test procedures accordingly."
    },
    {
      question: "What is included in the delivery?",
      answer: "The bundle includes: Arcturus LED system with control unit, complete Vega Software Suite with license, Premium Test Charts Collection (TE294 and others), USB/Ethernet cables, installation manual and 12 months support."
    },
    {
      question: "Is the system expandable?",
      answer: "Absolutely. The modular design enables simple extensions: additional LED modules, more test charts, software upgrades and integration into existing test systems. The API supports custom scripts and third-party integration."
    }
  ];

  // Comparison data for Arcturus vs. older solutions
  const comparisonData = [
    {
      criterion: "Light Stability",
      arcturus: "±0.5 °C precise, actively controlled",
      older: "Imprecise, passive",
      arcturusIcon: <Check className="h-5 w-5 text-green-600" />,
      olderIcon: <X className="h-5 w-5 text-red-500" />
    },
    {
      criterion: "Flicker Frequency Control",
      arcturus: "Sine / Triangle / Square",
      older: "Limited",
      arcturusIcon: <Check className="h-5 w-5 text-green-600" />,
      olderIcon: <X className="h-5 w-5 text-red-500" />
    },
    {
      criterion: "API Access",
      arcturus: "C, C++, Python",
      older: "Manual Operation",
      arcturusIcon: <Check className="h-5 w-5 text-green-600" />,
      olderIcon: <X className="h-5 w-5 text-red-500" />
    },
    {
      criterion: "Space Requirement",
      arcturus: "Compact, modular",
      older: "Large, rigid setup",
      arcturusIcon: <Check className="h-5 w-5 text-green-600" />,
      olderIcon: <X className="h-5 w-5 text-red-500" />
    },
    {
      criterion: "Expandability",
      arcturus: "Up to 7 light sources",
      older: "Not expandable",
      arcturusIcon: <Check className="h-5 w-5 text-green-600" />,
      olderIcon: <X className="h-5 w-5 text-red-500" />
    },
    {
      criterion: "Test Chart Compatibility",
      arcturus: "TE294 (modular)",
      older: "Proprietary",
      arcturusIcon: <Check className="h-5 w-5 text-green-600" />,
      olderIcon: <X className="h-5 w-5 text-red-500" />
    },
    {
      criterion: "HDR Test Precision",
      arcturus: "Full CTA / MMP / CSNR",
      older: "Limited",
      arcturusIcon: <Check className="h-5 w-5 text-green-600" />,
      olderIcon: <X className="h-5 w-5 text-red-500" />
    }
  ];

  // Schema.org markup for comparison
  const comparisonSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Arcturus HDR Test Package",
    "description": "Comparison of modern HDR testing solutions with traditional systems like DTS.",
    "brand": {
      "@type": "Brand",
      "name": "Image Engineering"
    },
    "isSimilarTo": {
      "@type": "Product",
      "name": "DTS Testsystem"
    },
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Light Stability",
        "value": "±0.5 °C controlled stability"
      },
      {
        "@type": "PropertyValue",
        "name": "API Access",
        "value": "C, C++, Python"
      },
      {
        "@type": "PropertyValue",
        "name": "Flicker Control",
        "value": "Sine / Triangle / Square"
      }
    ]
  };

  // Add schema to head
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(comparisonSchema);
    script.id = 'comparison-schema';
    
    const existingSchema = document.getElementById('comparison-schema');
    if (existingSchema) {
      existingSchema.remove();
    }
    
    document.head.appendChild(script);
    
    return () => {
      const schemaToRemove = document.getElementById('comparison-schema');
      if (schemaToRemove) {
        schemaToRemove.remove();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      <Navigation />
      
      {/* Main content wrapper with top margin to clear fixed navigation */}
      <div className="pt-[140px]">
        {/* Quick Navigation */}
        <nav className="sticky top-[195px] z-30 bg-[#F7F9FB] py-4 border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex flex-wrap gap-6 justify-center text-lg">
                 <a href="#overview" className="text-[#3D7BA2] hover:text-[#3D7BA2]/80 font-medium transition-colors scroll-smooth" 
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}>Complete Solution</a>
                  <a href="#architecture" className="text-[#3D7BA2] hover:text-[#3D7BA2]/80 font-medium transition-colors scroll-smooth"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}>System Architecture</a>
                  <a href="#benefits" className="text-[#3D7BA2] hover:text-[#3D7BA2]/80 font-medium transition-colors scroll-smooth"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}>Why Test Bundle</a>
                  <a href="#applications" className="text-[#3D7BA2] hover:text-[#3D7BA2]/80 font-medium transition-colors scroll-smooth"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('applications')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}>Application Areas</a>
                  <a href="#comparison" className="text-[#3D7BA2] hover:text-[#3D7BA2]/80 font-medium transition-colors scroll-smooth"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('comparison')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}>Comparison</a>
                 <a href="#faq" className="text-[#3D7BA2] hover:text-[#3D7BA2]/80 font-medium transition-colors scroll-smooth"
                   onClick={(e) => {
                     e.preventDefault();
                     document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                   }}>FAQ</a>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section id="overview" className="bg-scandi-white py-16 lg:py-24 scroll-mt-[265px]">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Product Image */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-lg shadow-soft">
                <img 
                  src={arcturusSetup} 
                  alt="Arcturus Komplettlösung"
                  className="w-full h-[500px] lg:h-[600px] object-cover"
                />
                
                {/* Floating bundle highlight - positioned within image bounds */}
                <div className="absolute bottom-6 left-6 bg-scandi-white p-6 rounded-lg shadow-soft border border-scandi-light-grey z-10">
                  <div className="text-sm text-scandi-grey font-light mb-1">
                    Komplettpaket
                  </div>
                  <div className="text-2xl font-medium text-light-foreground">3-in-1 Lösung</div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="space-y-8">
              <div>
            <h1 className="text-6xl lg:text-7xl xl:text-8xl font-light text-light-foreground leading-[0.9] tracking-tight mb-6">
              Arcturus
              <br />
              <span className="text-soft-blue font-light">HDR</span>
              <br />
              <span className="text-soft-blue font-medium">Test Bundle</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-scandi-grey font-light leading-relaxed max-w-lg">
              The ultimate combination of Arcturus LED lighting system, Vega software suite and 
              precision-engineered test charts for professional image quality analysis.
            </p>
              </div>
              
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  className="bg-[#577eb4] hover:bg-[#4a6b9a] text-white border-0 px-8 py-4 text-lg font-medium shadow-soft hover:shadow-lg transition-all duration-300 group"
                  onClick={() => {
                    const footer = document.querySelector('footer');
                    if (footer) {
                      footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                >
                  Request Complete Solution
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white text-white px-8 py-4 text-lg font-medium hover:bg-[#626262] hover:text-white hover:border-[#626262]"
                  onClick={() => {
                    document.getElementById('downloads')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  Technical Details
                  <Download className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        </section>

        {/* Bundle Components */}
        <section id="architecture" className="container mx-auto px-6 py-16 scroll-mt-[265px]">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            System Architecture
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
            Three perfectly coordinated components for maximum efficiency and accuracy 
            in your image quality testing.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {bundleComponents.map((component, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-0 bg-[#e8d3dd]">
              <CardHeader className="text-center pb-1 pt-4">
                <div className="flex justify-center mb-4">
                  <div className="w-14 h-14 bg-soft-blue/10 rounded-full flex items-center justify-center">
                    {component.icon}
                  </div>
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900 mb-4">
                  {component.title}
                </CardTitle>
                <CardDescription className="text-base text-gray-700">
                  {component.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-8 pb-4">
                <ul className="space-y-2">
                  {component.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
        </section>

        {/* Technical Overview */}
        <section id="benefits" className="bg-white py-16 scroll-mt-[265px]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Why Test Bundle?
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
              Fully integrated test environment with seamless communication between 
              hardware, software and test patterns for maximum efficiency and accuracy.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="bg-gray-50 rounded-xl p-8 shadow-soft">
              <div className="grid lg:grid-cols-3 gap-12 items-start">
                
                {/* Enlarged Mermaid Diagram */}
                <div className="lg:col-span-2 order-2 lg:order-1">
                  <div className="bg-white rounded-lg p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">
                        System Block Diagram
                      </h3>
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Expand className="h-4 w-4" />
                            Enlarge
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl w-full h-[90vh] bg-white">
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="absolute top-4 right-4 z-50 bg-white hover:bg-gray-100 shadow-lg"
                            onClick={() => setIsDialogOpen(false)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <DialogHeader>
                            <DialogTitle>System Block Diagram - Detail View</DialogTitle>
                            <DialogDescription>
                              Detailed view of the technical system architecture of the Arcturus HDR Test Bundle
                            </DialogDescription>
                          </DialogHeader>
                          <div className="w-full h-full overflow-auto bg-white p-4">
                            <svg viewBox="0 0 800 500" className="w-full h-auto min-h-[500px] bg-white">
                              {/* Arcturus LED System */}
                              <rect x="50" y="50" width="150" height="80" rx="8" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2"/>
                              <text x="125" y="85" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">Arcturus LED</text>
                              <text x="125" y="105" textAnchor="middle" fill="white" fontSize="14">System</text>
                              
                              {/* Test Charts */}
                              <rect x="50" y="200" width="150" height="80" rx="8" fill="#10B981" stroke="#047857" strokeWidth="2"/>
                              <text x="125" y="235" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">Test Charts</text>
                              <text x="125" y="255" textAnchor="middle" fill="white" fontSize="14">Collection</text>
                              
                              {/* Camera Under Test */}
                              <rect x="350" y="125" width="150" height="80" rx="8" fill="#6B7280" stroke="#374151" strokeWidth="2"/>
                              <text x="425" y="160" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">Camera</text>
                              <text x="425" y="180" textAnchor="middle" fill="white" fontSize="14">Under Test</text>
                              
                              {/* Vega Software */}
                              <rect x="600" y="50" width="150" height="180" rx="8" fill="#8B5CF6" stroke="#7C3AED" strokeWidth="2"/>
                              <text x="675" y="85" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">Vega Software</text>
                              <text x="675" y="105" textAnchor="middle" fill="white" fontSize="14">Suite</text>
                              
                              {/* Vega Components */}
                              <rect x="620" y="125" width="110" height="25" rx="4" fill="#A855F7" stroke="#9333EA" strokeWidth="1"/>
                              <text x="675" y="142" textAnchor="middle" fill="white" fontSize="12">Image Analysis</text>
                              
                              <rect x="620" y="155" width="110" height="25" rx="4" fill="#A855F7" stroke="#9333EA" strokeWidth="1"/>
                              <text x="675" y="172" textAnchor="middle" fill="white" fontSize="12">API Control</text>
                              
                              <rect x="620" y="185" width="110" height="25" rx="4" fill="#A855F7" stroke="#9333EA" strokeWidth="1"/>
                              <text x="675" y="202" textAnchor="middle" fill="white" fontSize="12">Report Generation</text>
                              
                              {/* Connections */}
                              {/* LED to Test Chart */}
                              <line x1="125" y1="130" x2="125" y2="200" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                              <text x="135" y="170" fill="#374151" fontSize="12">Illumination</text>
                              
                              {/* Test Chart to Camera */}
                              <line x1="200" y1="240" x2="350" y2="165" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                              <text x="250" y="190" fill="#374151" fontSize="12">Optical Signal</text>
                              
                              {/* Camera to Vega */}
                              <line x1="500" y1="165" x2="600" y2="140" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)"/>
                              <text x="520" y="145" fill="#374151" fontSize="12">Image Data</text>
                              
                              {/* Vega to LED (Control) */}
                              <path d="M 600 90 Q 400 20 200 90" stroke="#EF4444" strokeWidth="2" fill="none" strokeDasharray="5,5" markerEnd="url(#arrowhead-red)"/>
                              <text x="400" y="35" textAnchor="middle" fill="#EF4444" fontSize="12">LED Control (USB/Ethernet)</text>
                              
                              {/* Arrow markers */}
                              <defs>
                                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                  <polygon points="0 0, 10 3.5, 0 7" fill="#374151"/>
                                </marker>
                                <marker id="arrowhead-red" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                  <polygon points="0 0, 10 3.5, 0 7" fill="#EF4444"/>
                                </marker>
                              </defs>
                              
                              {/* Labels */}
                              <text x="400" y="320" textAnchor="middle" fill="#374151" fontSize="16" fontWeight="bold">IEEE P2020 Compliant Test Environment</text>
                              
                              {/* Connection Types Legend */}
                              <g transform="translate(50, 400)">
                                <text x="0" y="0" fill="#374151" fontSize="14" fontWeight="bold">Connection Types:</text>
                                <line x1="0" y1="20" x2="30" y2="20" stroke="#374151" strokeWidth="2"/>
                                <text x="40" y="25" fill="#374151" fontSize="12">Optical Path</text>
                                <line x1="0" y1="40" x2="30" y2="40" stroke="#EF4444" strokeWidth="2" strokeDasharray="5,5"/>
                                <text x="40" y="45" fill="#374151" fontSize="12">Digital Control</text>
                              </g>
                            </svg>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <div className="cursor-pointer rounded-lg overflow-hidden">
                      <svg viewBox="0 0 800 500" className="w-full h-auto">
                        {/* Arcturus LED System */}
                        <rect x="50" y="50" width="150" height="80" rx="8" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2"/>
                        <text x="125" y="85" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">Arcturus LED</text>
                        <text x="125" y="105" textAnchor="middle" fill="white" fontSize="14">System</text>
                        
                        {/* Test Charts */}
                        <rect x="50" y="200" width="150" height="80" rx="8" fill="#10B981" stroke="#047857" strokeWidth="2"/>
                        <text x="125" y="235" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">Test Charts</text>
                        <text x="125" y="255" textAnchor="middle" fill="white" fontSize="14">Collection</text>
                        
                        {/* Camera Under Test */}
                        <rect x="350" y="125" width="150" height="80" rx="8" fill="#6B7280" stroke="#374151" strokeWidth="2"/>
                        <text x="425" y="160" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">Camera</text>
                        <text x="425" y="180" textAnchor="middle" fill="white" fontSize="14">Under Test</text>
                        
                        {/* Vega Software */}
                        <rect x="600" y="50" width="150" height="180" rx="8" fill="#8B5CF6" stroke="#7C3AED" strokeWidth="2"/>
                        <text x="675" y="85" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">Vega Software</text>
                        <text x="675" y="105" textAnchor="middle" fill="white" fontSize="14">Suite</text>
                        
                        {/* Vega Components */}
                        <rect x="620" y="125" width="110" height="25" rx="4" fill="#A855F7" stroke="#9333EA" strokeWidth="1"/>
                        <text x="675" y="142" textAnchor="middle" fill="white" fontSize="12">Image Analysis</text>
                        
                        <rect x="620" y="155" width="110" height="25" rx="4" fill="#A855F7" stroke="#9333EA" strokeWidth="1"/>
                        <text x="675" y="172" textAnchor="middle" fill="white" fontSize="12">API Control</text>
                        
                        <rect x="620" y="185" width="110" height="25" rx="4" fill="#A855F7" stroke="#9333EA" strokeWidth="1"/>
                        <text x="675" y="202" textAnchor="middle" fill="white" fontSize="12">Report Generation</text>
                        
                        {/* Connections */}
                        {/* LED to Test Chart */}
                        <line x1="125" y1="130" x2="125" y2="200" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead2)"/>
                        <text x="135" y="170" fill="#374151" fontSize="12">Illumination</text>
                        
                        {/* Test Chart to Camera */}
                        <line x1="200" y1="240" x2="350" y2="165" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead2)"/>
                        <text x="250" y="190" fill="#374151" fontSize="12">Optical Signal</text>
                        
                        {/* Camera to Vega */}
                        <line x1="500" y1="165" x2="600" y2="140" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead2)"/>
                        <text x="520" y="145" fill="#374151" fontSize="12">Image Data</text>
                        
                        {/* Vega to LED (Control) */}
                        <path d="M 600 90 Q 400 20 200 90" stroke="#EF4444" strokeWidth="2" fill="none" strokeDasharray="5,5" markerEnd="url(#arrowhead-red2)"/>
                        <text x="400" y="35" textAnchor="middle" fill="#EF4444" fontSize="12">LED Control (USB/Ethernet)</text>
                        
                        {/* Arrow markers */}
                        <defs>
                          <marker id="arrowhead2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#374151"/>
                          </marker>
                          <marker id="arrowhead-red2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#EF4444"/>
                          </marker>
                        </defs>
                        
                        {/* Labels */}
                        <text x="400" y="320" textAnchor="middle" fill="#374151" fontSize="16" fontWeight="bold">IEEE P2020 Compliant Test Environment</text>
                        
                        {/* Connection Types Legend */}
                        <g transform="translate(50, 400)">
                          <text x="0" y="0" fill="#374151" fontSize="14" fontWeight="bold">Connection Types:</text>
                          <line x1="0" y1="20" x2="30" y2="20" stroke="#374151" strokeWidth="2"/>
                          <text x="40" y="25" fill="#374151" fontSize="12">Optical Path</text>
                          <line x1="0" y1="40" x2="30" y2="40" stroke="#EF4444" strokeWidth="2" strokeDasharray="5,5"/>
                          <text x="40" y="45" fill="#374151" fontSize="12">Digital Control</text>
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Technical Details */}
                <div className="order-1 lg:order-2 space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Technical Integration
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">LED Control</h4>
                          <p className="text-gray-600 text-sm">USB/Ethernet interface for precise brightness and color temperature control</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">Chart Positioning</h4>
                          <p className="text-gray-600 text-sm">Automated test pattern selection based on measurement target</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">Data Analysis</h4>
                          <p className="text-gray-600 text-sm">Real-time image processing with Python API integration</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">Feedback Loop</h4>
                          <p className="text-gray-600 text-sm">Automatic adjustment of test parameters based on measurement results</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Standards Compliance</h4>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li>• IEEE P2020 for automotive ADAS testing</li>
                      <li>• VCX for mobile device validation</li>
                      <li>• ISO 12233 for image sharpness measurements</li>
                      <li>• EMVA 1288 for industrial image processing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </section>

        {/* Key Benefits */}
        <section id="applications" className="bg-scandi-light-grey py-16 scroll-mt-[265px]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Application Areas
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
              Through the perfect integration of all components, you get a seamless 
              test environment with maximum efficiency.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#577eb4]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Settings className="text-[#577eb4]" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Plug & Play Setup</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                All components are already coordinated and ready to use immediately.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#577eb4]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="text-[#577eb4]" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Maximum Accuracy</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                Calibrated components guarantee highest measurement accuracy and reproducibility.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#577eb4]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="text-[#577eb4]" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Standards Compliance</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                Full compliance with IEEE P2020, VCX and other relevant standards.
              </p>
            </div>
          </div>
        </div>
        </section>

        {/* Application Areas */}
        <section id="comparison" className="container mx-auto px-6 py-16 scroll-mt-[265px]">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Comparison
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
            The Arcturus HDR Test Bundle is suitable for various test scenarios 
            in professional environments.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {applicationAreas.map((area, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300 bg-white border border-gray-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-[#577eb4]/10 rounded-xl flex items-center justify-center">
                    {area.icon}
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {area.title}
                  </CardTitle>
                </div>
                <CardDescription className="text-lg text-gray-700 leading-relaxed">
                  {area.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-2">
                <div className="space-y-3">
                  {area.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center gap-3 text-base text-gray-600">
                      <div className="w-2 h-2 bg-[#577eb4] rounded-full flex-shrink-0"></div>
                      {benefit}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        </section>

        {/* Customer Testimonial */}
        <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                
                 {/* Portrait Image */}
                <div className="flex-shrink-0">
                  <div className="w-[150px] h-[150px] rounded-full overflow-hidden shadow-lg">
                    <img 
                      src={testimonialDrBecker} 
                      alt="Dr. Thomas Becker, Head of Image Quality Lab bei VisionDrive Automotive GmbH"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Testimonial Content */}
                <div className="flex-1 text-center md:text-left">
                  <div className="mb-6">
                    <Quote className="h-8 w-8 text-[#577eb4] mx-auto md:mx-0 mb-4" />
                    <blockquote className="text-xl md:text-2xl text-gray-800 leading-relaxed font-medium italic">
                      "With Arcturus, we were able to measure stable HDR results at 0.3 ms exposure time for the first time – 
                      a decisive breakthrough for our ADAS calibration."
                    </blockquote>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <div className="font-semibold text-gray-900 text-lg">
                      Dr. Thomas Becker
                    </div>
                    <div className="text-[#577eb4] font-medium">
                      Head of Image Quality Lab
                    </div>
                    <div className="text-gray-600">
                      VisionDrive Automotive GmbH
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </section>

        {/* Comparison Section */}
        <section className="bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Why not DTS? – The Comparison at a Glance
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
              See for yourself how the modern Arcturus HDR Test Bundle 
              outperforms traditional test solutions and offers you decisive advantages.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <div className="bg-gray-50 rounded-xl overflow-hidden shadow-soft">
              {/* Header */}
              <div className="grid md:grid-cols-3 bg-gradient-to-r from-[#577eb4] to-[#4a6b9a] text-white">
                <div className="p-4 text-center font-semibold text-lg">
                  Criterion
                </div>
                <div className="p-4 text-center font-semibold text-lg border-l border-[#4a6b9a]">
                  Arcturus HDR Test Package
                </div>
                <div className="p-4 text-center font-semibold text-lg border-l border-[#4a6b9a]">
                  Previous Solution (e.g. DTS)
                </div>
              </div>
              
              {/* Comparison Rows */}
              <div className="divide-y divide-gray-200">
                {comparisonData.map((row, index) => (
                  <div key={index} className={`grid md:grid-cols-3 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <div className="p-6 font-medium text-gray-900 border-r border-gray-200">
                      {row.criterion}
                    </div>
                    <div className="p-6 border-r border-gray-200">
                      <div className="flex items-center gap-3">
                        {row.arcturusIcon}
                        <span className="text-gray-800 font-medium">{row.arcturus}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3">
                        {row.olderIcon}
                        <span className="text-gray-600">{row.older}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Footnote */}
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500">
                * DTS is a registered trademark and is mentioned here for comparison purposes only.
              </p>
            </div>
          </div>
        </div>
        </section>


        {/* Related Products */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Related Products
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Complementary tools and extensions for your test environment
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              
              {/* TE294 Chart Set */}
              <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col h-full">
                <CardContent className="p-0 flex-grow flex flex-col">
                  <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                    <img 
                      src={te294Grayscale}
                      alt="TE294 Chart Set for CTA, CSNR and MMP measurements"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      TE294 Chart Set
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4 flex-grow">
                      Optimized test chart for CTA, CSNR and MMP measurements
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full border-gray-200 hover:border-[#626262] hover:text-white hover:bg-[#626262] mt-auto"
                    >
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Arcturus Accessories */}
              <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col h-full">
                <CardContent className="p-0 flex-grow flex flex-col">
                  <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                    <img 
                      src={arcturusAccessories}
                      alt="Arcturus LED System and accessories"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      Arcturus Accessories
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4 flex-grow">
                      Precision mounts, extensions and calibration aids
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full border-gray-200 hover:border-[#626262] hover:text-white hover:bg-[#626262] mt-auto"
                    >
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Vega Add-on Kit */}
              <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col h-full">
                <CardContent className="p-0 flex-grow flex flex-col">
                  <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                    <img 
                      src={vegaAddon}
                      alt="Vega LED system and add-on components"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      Vega Add-on Kit
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4 flex-grow">
                      Extension for existing installations with Vega LED
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full border-gray-200 hover:border-[#626262] hover:text-white hover:bg-[#626262] mt-auto"
                    >
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Professional Training Program */}
              <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col h-full">
                <CardContent className="p-0 flex-grow flex flex-col">
                  <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                    <img 
                      src={professionalTraining}
                      alt="Professional training for technical equipment and camera testing systems"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      Professional Training Program
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4 flex-grow">
                      Comprehensive training courses and certification for optimal system usage
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full border-gray-200 hover:border-[#626262] hover:text-white hover:bg-[#626262] mt-auto"
                    >
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="scroll-mt-[265px]">
        <ProductFAQ 
          faqs={faqData}
          productName="Arcturus HDR Test Bundle"
        />
        </section>

        {/* Related Downloads */}
        <section id="downloads" className="container mx-auto px-4 pb-20 scroll-mt-[280px]">
          <h2 className="text-2xl font-semibold text-[#2D2D2D] mb-8 text-center">Related Downloads</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="bg-white border-gray-100 hover:shadow-lg transition-shadow flex flex-col h-full">
              <CardHeader className="text-center flex-grow-0">
                <div className="w-16 h-16 bg-[#3D7BA2]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-[#3D7BA2]" size={32} />
                </div>
                <CardTitle className="text-[#2D2D2D] text-lg">Arcturus Datasheet (DE)</CardTitle>
              </CardHeader>
              <CardContent className="text-center flex flex-col justify-between flex-grow">
                <CardDescription className="text-[#555] mb-4">
                  Complete German datasheet with technical specifications
                </CardDescription>
                <Button 
                  variant="technical"
                  onClick={() => window.open('https://raw.githubusercontent.com/stone1971grey/image-engeering/main/DE_Arcturus_Lightsource-Datenblatt.pdf')}
                  className="mt-auto"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF Download
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-100 hover:shadow-lg transition-shadow flex flex-col h-full">
              <CardHeader className="text-center flex-grow-0">
                <div className="w-16 h-16 bg-[#3D7BA2]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="text-[#3D7BA2]" size={32} />
                </div>
                <CardTitle className="text-[#2D2D2D] text-lg">Arcturus Datasheet (EN)</CardTitle>
              </CardHeader>
              <CardContent className="text-center flex flex-col justify-between flex-grow">
                <CardDescription className="text-[#555] mb-4">
                  Complete English datasheet with technical specifications
                </CardDescription>
                <Button 
                  variant="technical"
                  onClick={() => window.open('https://raw.githubusercontent.com/stone1971grey/image-engeering/main/EN_Arcturus_Lightsource-Datasheet.pdf')}
                  className="mt-auto"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF Download
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-100 hover:shadow-lg transition-shadow flex flex-col h-full">
              <CardHeader className="text-center flex-grow-0">
                <div className="w-16 h-16 bg-[#3D7BA2]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Monitor className="text-[#3D7BA2]" size={32} />
                </div>
                <CardTitle className="text-[#2D2D2D] text-lg">Vega Software Manual</CardTitle>
              </CardHeader>
              <CardContent className="text-center flex flex-col justify-between flex-grow">
                <CardDescription className="text-[#555] mb-4">
                  Software documentation and user guide
                </CardDescription>
                <Button 
                  variant="technical"
                  className="mt-auto"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF Download
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-100 hover:shadow-lg transition-shadow flex flex-col h-full">
              <CardHeader className="text-center flex-grow-0">
                <div className="w-16 h-16 bg-[#3D7BA2]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="text-[#3D7BA2]" size={32} />
                </div>
                <CardTitle className="text-[#2D2D2D] text-lg">Test Charts Guide</CardTitle>
              </CardHeader>
              <CardContent className="text-center flex flex-col justify-between flex-grow">
                <CardDescription className="text-[#555] mb-4">
                  Test chart specifications and application guide
                </CardDescription>
                <Button 
                  variant="technical"
                  className="mt-auto"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF Download
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default SolutionArcturusBundle;