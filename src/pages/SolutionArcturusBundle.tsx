import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowRight, Download, FileText, BarChart3, Zap, Shield, Eye, CheckCircle, Lightbulb, Monitor, Package, Settings, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import Navigation from "@/components/Navigation";

// Import solution images
import arcturusMain from "@/assets/arcturus-main-product.png";
import arcturusSetup from "@/assets/arcturus-setup-vega.jpg";
import arcturusCharts from "@/assets/arcturus-vega-charts.jpg";
import arcturusRealisticLab from "@/assets/arcturus-realistic-lab.jpg";
import customChart from "@/assets/custom-chart.png";
import iqAnalyzerIntro from "@/assets/iq-analyzer-intro.png";

const SolutionArcturusBundle = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const solutionImages = [
    {
      src: arcturusMain,
      title: "Arcturus LED System",
      description: "Hochleistungs-LED-Beleuchtungssystem für maximale Intensität"
    },
    {
      src: iqAnalyzerIntro,
      title: "Vega Software Suite",
      description: "Umfassende Bildanalyse und Qualitätskontrollsoftware"
    },
    {
      src: customChart,
      title: "Test Charts Collection",
      description: "Präzisions-Testcharts für verschiedene Anwendungsbereiche"
    },
    {
      src: arcturusSetup,
      title: "Kompletter Laboraufbau",
      description: "Integrierte Lösung mit allen Komponenten"
    }
  ];

  const bundleComponents = [
    {
      title: "Arcturus LED System",
      description: "Hochstabile Lichtquelle bis zu 1 Mcd/m²",
      features: [
        "DC-betriebene LED-Technologie",
        "Flimmerfrei für konsistente Tests",
        "Weiter Dynamikbereich",
        "IEEE P2020 kompatibel"
      ],
      icon: <Zap className="h-8 w-8 text-black" />
    },
    {
      title: "Vega Software Suite",
      description: "Professionelle Bildanalyse und Kalibrierung",
      features: [
        "Automatisierte Bildqualitätsanalyse",
        "Multi-Format Exportfunktionen",
        "Python API Integration",
        "Umfassende Reportgenerierung"
      ],
      icon: <Monitor className="h-8 w-8 text-black" />
    },
    {
      title: "Premium Test Charts",
      description: "Hochpräzise Testmuster für verschiedene Anwendungen",
      features: [
        "Automotive spezifische Charts",
        "Mobile Device Testing Charts",
        "Farbkalibrierungs-Charts",
        "Individuelle Chart-Konfigurationen"
      ],
      icon: <Target className="h-8 w-8 text-black" />
    }
  ];

  const applicationAreas = [
    {
      title: "Automotive ADAS Testing",
      description: "Komplette Testlösung für Fahrerassistenzsysteme nach IEEE P2020 Standard",
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      benefits: ["HDR Szenarien-Tests", "Sonnenlicht-Simulation", "Nachtsicht-Validierung"]
    },
    {
      title: "Mobile Device Validation",
      description: "Umfassende Bildqualitätstests für Smartphone-Kameras nach VCX Standards",
      icon: <Eye className="h-8 w-8 text-blue-600" />,
      benefits: ["Farbgenauigkeits-Tests", "Schärfe-Analyse", "Low-Light Performance"]
    },
    {
      title: "Professional Photography",
      description: "Präzisions-Kalibrierung für professionelle Kamerasysteme",
      icon: <Lightbulb className="h-8 w-8 text-blue-600" />,
      benefits: ["Farbwiedergabe-Tests", "Dynamikbereich-Analyse", "Objektivschärfe-Messung"]
    }
  ];

  return (
    <div className="min-h-screen bg-white font-inter">
      <Navigation />
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-6 pt-20 pb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Startseite</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <span className="cursor-pointer">Lösungen</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Arcturus LED + Vega Software + Test Charts</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Hero Section */}
      <div className="bg-scandi-white py-16 lg:py-24">
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
                  Die ultimative Kombination aus Arcturus LED-Beleuchtungssystem, Vega Software Suite und 
                  präzisions-entwickelten Test Charts für professionelle Bildqualitätsanalyse.
                </p>
              </div>
              
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white border-0 px-8 py-4 text-lg font-medium shadow-soft hover:shadow-lg transition-all duration-300 group"
                >
                  Komplettlösung anfragen
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-scandi-grey text-scandi-grey px-8 py-4 text-lg font-medium hover:bg-scandi-light-grey"
                >
                  Technische Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bundle Components */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Was ist in der Komplettlösung enthalten?
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
            Drei perfekt aufeinander abgestimmte Komponenten für maximale Effizienz und Genauigkeit 
            in Ihren Bildqualitätstests.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {bundleComponents.map((component, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-300 border-0 bg-red-100">
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
      </div>

      {/* Key Benefits */}
      <div className="bg-scandi-light-grey py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Warum das Arcturus HDR Test Bundle?
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
              Durch die perfekte Integration aller Komponenten erhalten Sie eine nahtlose 
              Testumgebung mit maximaler Effizienz.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Settings className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Plug & Play Setup</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                Alle Komponenten sind bereits aufeinander abgestimmt und sofort einsatzbereit.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Maximale Genauigkeit</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                Kalibrierte Komponenten garantieren höchste Messgenauigkeit und Reproduzierbarkeit.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Standards-Konformität</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                Vollständige Konformität mit IEEE P2020, VCX und anderen relevanten Standards.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Application Areas */}
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Anwendungsbereiche
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
            Das Arcturus HDR Test Bundle eignet sich für verschiedenste Testszenarien 
            in professionellen Umgebungen.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {applicationAreas.map((area, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300 bg-white border border-gray-200">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center">
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
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      {benefit}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-scandi-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Bereit für professionelle Bildqualitätstests?
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-8 max-w-2xl mx-auto">
            Kontaktieren Sie unsere Experten für eine individuelle Beratung oder fordern Sie 
            ein maßgeschneidertes Angebot für Ihre Anforderungen an.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-medium">
              Beratungstermin vereinbaren
            </Button>
            <Button variant="outline" className="border-scandi-grey text-scandi-grey px-8 py-3 text-lg font-medium hover:bg-scandi-light-grey">
              <Download className="mr-2 h-5 w-5" />
              Produktdatenblatt herunterladen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionArcturusBundle;