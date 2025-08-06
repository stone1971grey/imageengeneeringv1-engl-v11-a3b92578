import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Zap, Target, Microscope, Car, Smartphone, Shield, Monitor } from "lucide-react";

// Import lab images
import adasTesting from "@/assets/adas-testing.jpg";
import arcturusLabInstallation from "@/assets/arcturus-automotive-lab-installation.jpg";
import arcturusRealisticLab from "@/assets/arcturus-realistic-lab.jpg";
import arcturusSetupVega from "@/assets/arcturus-setup-vega.jpg";
import automotiveLab from "@/assets/automotive-lab.jpg";
import precisionTestingHero from "@/assets/precision-testing-hero.jpg";
import qualityBenchmarking from "@/assets/quality-benchmarking.jpg";
import arcturusVegaCharts from "@/assets/arcturus-vega-charts.jpg";

const InsideLab = () => {
  const labSetups = [
    {
      id: 1,
      image: arcturusSetupVega,
      title: "Vega LED Illumination Setup",
      description: "Vega LED + TE294 Chart + MMP-Test Configuration",
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
      title: "Automotive Vision Lab",
      description: "ADAS Camera Testing Environment",
      industry: "Automotive",
      icon: <Car className="h-5 w-5" />,
      details: [
        "IEEE P2020 Compliant Setup",
        "High-Precision Chart Positioning",
        "Automotive Grade Lighting",
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
        "Ultra-High Resolution Charts",
        "Color Temperature Control",
        "Vibration-Free Mounting",
        "Spectral Analysis Capability"
      ]
    },
    {
      id: 4,
      image: adasTesting,
      title: "ADAS Testing Laboratory",
      description: "Complete Automotive Vision Testing Suite",
      industry: "Automotive ADAS",
      icon: <Shield className="h-5 w-5" />,
      details: [
        "Multi-Chart Test Scenarios",
        "Dynamic Range Testing",
        "Low-Light Performance Analysis",
        "Safety Standard Compliance"
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
        "Multiple Device Testing",
        "Standardized Conditions",
        "Statistical Analysis Tools",
        "ISO Compliance Framework"
      ]
    },
    {
      id: 6,
      image: arcturusRealisticLab,
      title: "Real-World Testing Environment",
      description: "Production-Grade Lab Installation",
      industry: "Industrial Testing",
      icon: <Microscope className="h-5 w-5" />,
      details: [
        "Industrial Grade Equipment",
        "24/7 Operation Capability",
        "Remote Monitoring Systems",
        "Scalable Test Configurations"
      ]
    },
    {
      id: 7,
      image: automotiveLab,
      title: "Automotive Electronics Lab",
      description: "Vehicle Camera System Testing",
      industry: "Automotive Electronics",
      icon: <Monitor className="h-5 w-5" />,
      details: [
        "ECU Integration Testing",
        "Real-Time Image Processing",
        "Thermal Analysis Capability",
        "EMC Testing Environment"
      ]
    },
    {
      id: 8,
      image: arcturusVegaCharts,
      title: "Chart Analysis Workstation",
      description: "Comprehensive Chart Testing Setup",
      industry: "Chart Development",
      icon: <Zap className="h-5 w-5" />,
      details: [
        "Multi-Chart Configurations",
        "Precision Measurement Tools",
        "Data Analysis Software",
        "Custom Chart Development"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Inside the Lab
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Real Test Setups in Professional Environments
            </p>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto">
              Explore how Image Engineering's testing solutions are deployed in real-world laboratories. 
              From automotive ADAS testing to mobile device quality control, see the precision and 
              professionalism that drives accurate results.
            </p>
          </div>
        </div>
      </div>

      {/* Lab Gallery Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {labSetups.map((setup) => (
            <Card 
              key={setup.id} 
              className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white hover:-translate-y-2"
            >
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={setup.image}
                  alt={setup.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                    <div className="flex items-center gap-1">
                      {setup.icon}
                      <span className="text-xs font-medium">{setup.industry}</span>
                    </div>
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {setup.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {setup.description}
                </p>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Setup Details:</h4>
                  <ul className="space-y-1">
                    {setup.details.map((detail, index) => (
                      <li key={index} className="text-xs text-gray-500 flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Set Up Your Own Lab?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Our experts can help you design and implement the perfect testing environment 
            for your specific requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Contact Our Lab Experts
            </button>
            <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium">
              Download Lab Setup Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsideLab;