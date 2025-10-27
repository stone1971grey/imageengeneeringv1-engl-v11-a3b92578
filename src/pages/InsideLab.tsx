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
      image: productBundleIeee,
      title: "Arcturus HDR Testpaket",
      description: "Hochpräzise Komplettlösung für Bildqualitätstests",
      industry: "Komplettlösung",
      icon: <Package className="h-5 w-5" />,
      details: [
        "Arcturus LED-System mit DC-Technologie",
        "Vega Software Suite mit Reporting & API",
        "Hochpräzise Testcharts (z. B. TE294)",
        "Ideal für ADAS-, Mobilgeräte- und HDR-Kamera-Tests",
        "IEEE P2020 & VCX konform"
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
                    
                    {setup.link && (
                      <div className="mt-4 pt-4">
                        <Link to={setup.link}>
                          <Button 
                            size="lg"
                            className="w-full text-white hover:opacity-90"
                            style={{ backgroundColor: '#f5743a' }}
                          >
                            Mehr erfahren
                          </Button>
                        </Link>
                      </div>
                    )}
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