import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ActionHero from "@/components/ActionHero";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Camera, Zap, Target, Microscope, Car, Smartphone, Shield, Monitor, Package } from "lucide-react";
import { Link } from "react-router-dom";

// Import lab images
import adasTesting from "@/assets/adas-testing.jpg";
import arcturusLabInstallation from "@/assets/arcturus-automotive-lab-installation.jpg";
import arcturusRealisticLab from "@/assets/arcturus-realistic-lab.jpg";
import arcturusSetupVega from "@/assets/arcturus-setup-vega.jpg";
import automotiveLab from "@/assets/automotive-lab.jpg";
import precisionTestingHero from "@/assets/precision-testing-hero.jpg";
import qualityBenchmarking from "@/assets/quality-benchmarking.jpg";
import arcturusVegaCharts from "@/assets/arcturus-vega-charts.jpg";
import productBundleIeee from "@/assets/product-bundle-ieee.png";

const InsideLab = () => {
  const labSetups = [
    {
      id: 1,
      image: arcturusSetupVega,
      title: "Vega LED Lighting Setup",
      description: "Vega LED + TE294 Test Chart + MMP-Test Configuration",
      industry: "Mobile Testing",
      icon: <Smartphone className="h-5 w-5" />,
      details: [
        "Arcturus Vega LED Light Source",
        "TE294 Multi-Purpose Test Chart", 
        "Precision Camera Mounting System",
        "VCX Standard Compliance"
      ]
    },
    {
      id: 2,
      image: arcturusLabInstallation,
      title: "Automotive Vision Laboratory",
      description: "ADAS Camera Test Environment",
      industry: "Automotive",
      icon: <Car className="h-5 w-5" />,
      details: [
        "IEEE P2020 Compliant Setup",
        "High-Precision Test Chart Positioning",
        "Automotive-Grade Illumination",
        "Environmental Control Systems"
      ]
    },
    {
      id: 3,
      image: precisionTestingHero,
      title: "Precision Measurement Station",
      description: "High-Resolution Camera Analysis Setup",
      industry: "Professional Photography",
      icon: <Camera className="h-5 w-5" />,
      details: [
        "Ultra-High Resolution Test Charts",
        "Color Temperature Control",
        "Vibration-Free Mounting",
        "Spectral Analysis Capability"
      ]
    },
    {
      id: 4,
      image: adasTesting,
      title: "ADAS Test Laboratory",
      description: "Complete Automotive Vision Testing Suite",
      industry: "Automotive ADAS",
      icon: <Shield className="h-5 w-5" />,
      details: [
        "Multi-Test Chart Scenarios",
        "Dynamic Range Testing",
        "Low-Light Performance Analysis",
        "Safety Standard Conformance"
      ]
    },
    {
      id: 5,
      image: qualityBenchmarking,
      title: "Quality Benchmarking Setup",
      description: "Comparative Analysis Laboratory",
      industry: "Quality Control",
      icon: <Target className="h-5 w-5" />,
      details: [
        "Multi-Device Testing",
        "Standardized Conditions",
        "Statistical Analysis Tools",
        "ISO Compliance Framework"
      ]
    },
    {
      id: 6,
      image: arcturusRealisticLab,
      title: "Production-Ready Test Environment",
      description: "Industrial-Grade Laboratory Installation",
      industry: "Industrial Testing",
      icon: <Microscope className="h-5 w-5" />,
      details: [
        "Industrial-Grade Equipment",
        "24/7 Operation Capability",
        "Remote Monitoring Systems",
        "Scalable Test Configurations"
      ]
    },
    {
      id: 7,
      image: automotiveLab,
      title: "Automotive Electronics Laboratory",
      description: "Vehicle Camera System Testing",
      industry: "Automotive Electronics",
      icon: <Monitor className="h-5 w-5" />,
      details: [
        "ECU Integration Testing",
        "Real-Time Image Processing",
        "Thermal Analysis Capability",
        "EMC Test Environment"
      ]
    },
    {
      id: 8,
      image: productBundleIeee,
      title: "Arcturus HDR Test Package",
      description: "High-Precision Complete Solution for Image Quality Testing",
      industry: "Complete Solution",
      icon: <Package className="h-5 w-5" />,
      details: [
        "Arcturus LED System with DC Technology",
        "Vega Software Suite with Reporting & API",
        "High-Precision Test Charts (e.g., TE294)",
        "Ideal for ADAS, Mobile Device, and HDR Camera Testing",
        "IEEE P2020 & VCX Compliant"
      ],
      link: "/solution/arcturus-bundle"
    }
  ];

  return (
    <div className="min-h-screen bg-white font-roboto">
      <Navigation />
      
      <ActionHero
        title="Inside the Lab"
        subtitle="Explore real test setups in professional environments – from automotive ADAS testing to quality control for mobile devices."
        backgroundImage={automotiveLab}
      />

      {/* Lab Gallery Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Real Test Setups
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Industry-leading laboratory installations for professional image quality testing
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {labSetups.map((setup) => (
              <Card 
                key={setup.id} 
                className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col"
              >
                <CardContent className="p-0 flex flex-col flex-1">
                  <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                    <img
                      src={setup.image}
                      alt={setup.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="text-gray-900">{setup.icon}</div>
                          <span className="text-sm font-semibold text-gray-900">{setup.industry}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 transition-colors group-hover:text-[#f5743a]">
                      {setup.title}
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed mb-4">
                      {setup.description}
                    </p>
                    
                    <div className="space-y-3 flex-1">
                      <h4 className="text-base font-semibold text-gray-900">Setup Details:</h4>
                      <ul className="space-y-2">
                        {setup.details.map((detail, index) => (
                          <li key={index} className="text-base text-gray-600 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-[#f5743a] rounded-full mt-2 flex-shrink-0"></div>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-4 pt-4">
                      {setup.link ? (
                        <Link to={setup.link}>
                          <Button 
                            size="lg"
                            className="w-full text-white hover:opacity-90"
                            style={{ backgroundColor: '#f5743a' }}
                          >
                            Learn more
                          </Button>
                        </Link>
                      ) : (
                        <Button 
                          size="lg"
                          className="w-full text-white hover:opacity-90"
                          style={{ backgroundColor: '#f5743a' }}
                        >
                          Learn more
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <div className="bg-scandi-light-grey py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Bereit, Ihr eigenes Labor einzurichten?
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-8 max-w-2xl mx-auto">
            Unsere Experten können Ihnen dabei helfen, die perfekte Testumgebung 
            für Ihre spezifischen Anforderungen zu entwerfen und zu implementieren.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium">
              Kontaktieren Sie unsere Laborexperten
            </Button>
            <Button variant="outline" className="border-scandi-grey text-scandi-grey px-8 py-3 text-lg font-medium hover:bg-scandi-light-grey">
              Labor-Setup-Leitfaden herunterladen
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default InsideLab;