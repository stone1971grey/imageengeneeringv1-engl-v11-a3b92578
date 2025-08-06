import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Camera, Zap, Target, Microscope, Car, Smartphone, Shield, Monitor } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";

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
      title: "Vega LED Beleuchtungsaufbau",
      description: "Vega LED + TE294 Testtafel + MMP-Test Konfiguration",
      industry: "Mobile Testing",
      icon: <Smartphone className="h-5 w-5" />,
      details: [
        "Arcturus Vega LED Lichtquelle",
        "TE294 Mehrzweck-Testtafel", 
        "Präzisions-Kamera-Montagesystem",
        "VCX Standard Compliance"
      ]
    },
    {
      id: 2,
      image: arcturusLabInstallation,
      title: "Automotive Vision Labor",
      description: "ADAS Kamera-Testumgebung",
      industry: "Automotive",
      icon: <Car className="h-5 w-5" />,
      details: [
        "IEEE P2020 Konformer Aufbau",
        "Hochpräzise Testtafel-Positionierung",
        "Automotive-Grade Beleuchtung",
        "Umgebungskontrollsysteme"
      ]
    },
    {
      id: 3,
      image: precisionTestingHero,
      title: "Präzisions-Messstation",
      description: "Hochauflösende Kamera-Analyse-Aufbau",
      industry: "Professionelle Fotografie",
      icon: <Camera className="h-5 w-5" />,
      details: [
        "Ultra-hochauflösende Testtafeln",
        "Farbtemperatur-Kontrolle",
        "Vibrationsfreie Montage",
        "Spektralanalyse-Fähigkeit"
      ]
    },
    {
      id: 4,
      image: adasTesting,
      title: "ADAS Testlabor",
      description: "Komplette Automotive Vision Testing Suite",
      industry: "Automotive ADAS",
      icon: <Shield className="h-5 w-5" />,
      details: [
        "Multi-Testtafel-Szenarien",
        "Dynamikbereich-Tests",
        "Schwachlicht-Leistungsanalyse",
        "Sicherheitsstandard-Konformität"
      ]
    },
    {
      id: 5,
      image: qualityBenchmarking,
      title: "Qualitäts-Benchmarking Aufbau",
      description: "Vergleichsanalyse-Labor",
      industry: "Qualitätskontrolle",
      icon: <Target className="h-5 w-5" />,
      details: [
        "Multi-Geräte-Tests",
        "Standardisierte Bedingungen",
        "Statistische Analyse-Tools",
        "ISO Compliance Framework"
      ]
    },
    {
      id: 6,
      image: arcturusRealisticLab,
      title: "Realitätsnahe Testumgebung",
      description: "Produktionsreife Labor-Installation",
      industry: "Industrielle Tests",
      icon: <Microscope className="h-5 w-5" />,
      details: [
        "Industrietaugliche Ausrüstung",
        "24/7 Betriebsfähigkeit",
        "Remote-Überwachungssysteme",
        "Skalierbare Testkonfigurationen"
      ]
    },
    {
      id: 7,
      image: automotiveLab,
      title: "Automotive Elektronik Labor",
      description: "Fahrzeug-Kamerasystem-Tests",
      industry: "Automotive Elektronik",
      icon: <Monitor className="h-5 w-5" />,
      details: [
        "ECU Integrationstests",
        "Echtzeit-Bildverarbeitung",
        "Thermische Analysefähigkeit",
        "EMV-Testumgebung"
      ]
    },
    {
      id: 8,
      image: arcturusVegaCharts,
      title: "Testtafel-Analyse-Workstation",
      description: "Umfassender Testtafel-Testaufbau",
      industry: "Testtafel-Entwicklung",
      icon: <Zap className="h-5 w-5" />,
      details: [
        "Multi-Testtafel-Konfigurationen",
        "Präzisions-Messwerkzeuge",
        "Datenanalyse-Software",
        "Individuelle Testtafel-Entwicklung"
      ]
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
                <Link to="/products">Produkte</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Blick ins Testlabor</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Hero Section */}
      <div className="bg-scandi-white py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl lg:text-7xl xl:text-8xl font-light text-light-foreground leading-[0.9] tracking-tight mb-6">
              Inside the Lab
              <br />
              <span className="text-soft-blue">Real Test Setups in </span>
              <span className="text-soft-blue font-medium">Professional Environments</span>
            </h1>
            <p className="text-xl lg:text-2xl text-scandi-grey font-light leading-relaxed max-w-3xl mx-auto">
              Erkunden Sie, wie Image Engineerings Testlösungen in realen Laborumgebungen eingesetzt werden. 
              Von automotive ADAS-Tests bis hin zur Qualitätskontrolle mobiler Geräte - erleben Sie die Präzision und 
              Professionalität, die zu genauen Ergebnissen führt.
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
                  <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-2">
                    <div className="flex items-center gap-2">
                      {setup.icon}
                      <h3 className="text-sm font-semibold text-gray-900">{setup.industry}</h3>
                    </div>
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {setup.title}
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  {setup.description}
                </p>
                
                <div className="space-y-3">
                  <h4 className="text-base font-semibold text-gray-900 mb-3">Setup Details:</h4>
                  <ul className="space-y-2">
                    {setup.details.map((detail, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
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
            <Button className="bg-soft-blue hover:bg-soft-blue/90 text-white px-8 py-3 text-lg font-medium">
              Kontaktieren Sie unsere Laborexperten
            </Button>
            <Button variant="outline" className="border-scandi-grey text-scandi-grey px-8 py-3 text-lg font-medium hover:bg-scandi-light-grey">
              Labor-Setup-Leitfaden herunterladen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsideLab;