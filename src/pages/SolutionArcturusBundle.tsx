import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowRight, Download, FileText, BarChart3, Zap, Shield, Eye, CheckCircle, Lightbulb, Monitor, Package, Settings, Target, Expand, X } from "lucide-react";
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
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

      {/* Technical Overview */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Technische System-Architektur
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
              Vollständig integrierte Testumgebung mit nahtloser Kommunikation zwischen 
              Hardware, Software und Testmustern für maximale Effizienz und Genauigkeit.
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
                        System-Blockdiagramm
                      </h3>
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Expand className="h-4 w-4" />
                            Vergrößern
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
                            <DialogTitle>System-Blockdiagramm - Detailansicht</DialogTitle>
                            <DialogDescription>
                              Detaillierte Ansicht der technischen System-Architektur des Arcturus HDR Test Bundle
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
                              <text x="400" y="320" textAnchor="middle" fill="#374151" fontSize="16" fontWeight="bold">IEEE P2020 Konforme Testumgebung</text>
                              
                              {/* Connection Types Legend */}
                              <g transform="translate(50, 400)">
                                <text x="0" y="0" fill="#374151" fontSize="14" fontWeight="bold">Verbindungstypen:</text>
                                <line x1="0" y1="20" x2="30" y2="20" stroke="#374151" strokeWidth="2"/>
                                <text x="40" y="25" fill="#374151" fontSize="12">Optischer Pfad</text>
                                <line x1="0" y1="40" x2="30" y2="40" stroke="#EF4444" strokeWidth="2" strokeDasharray="5,5"/>
                                <text x="40" y="45" fill="#374151" fontSize="12">Digitale Steuerung</text>
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
                        <text x="400" y="320" textAnchor="middle" fill="#374151" fontSize="16" fontWeight="bold">IEEE P2020 Konforme Testumgebung</text>
                        
                        {/* Connection Types Legend */}
                        <g transform="translate(50, 400)">
                          <text x="0" y="0" fill="#374151" fontSize="14" fontWeight="bold">Verbindungstypen:</text>
                          <line x1="0" y1="20" x2="30" y2="20" stroke="#374151" strokeWidth="2"/>
                          <text x="40" y="25" fill="#374151" fontSize="12">Optischer Pfad</text>
                          <line x1="0" y1="40" x2="30" y2="40" stroke="#EF4444" strokeWidth="2" strokeDasharray="5,5"/>
                          <text x="40" y="45" fill="#374151" fontSize="12">Digitale Steuerung</text>
                        </g>
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Technical Details */}
                <div className="order-1 lg:order-2 space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      Technische Integration
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">LED-Steuerung</h4>
                          <p className="text-gray-600 text-sm">USB/Ethernet Interface für präzise Helligkeits- und Farbtemperaturkontrolle</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">Chart-Positionierung</h4>
                          <p className="text-gray-600 text-sm">Automatisierte Test-Pattern Auswahl basierend auf Messziel</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">Datenanalyse</h4>
                          <p className="text-gray-600 text-sm">Echtzeit-Bildverarbeitung mit Python API Integration</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="font-medium text-gray-900">Feedback-Loop</h4>
                          <p className="text-gray-600 text-sm">Automatische Anpassung der Testparameter basierend auf Messergebnissen</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Standards-Konformität</h4>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li>• IEEE P2020 für automotive ADAS Testing</li>
                      <li>• VCX für Mobile Device Validation</li>
                      <li>• ISO 12233 für Bildschärfe-Messungen</li>
                      <li>• EMVA 1288 für industrielle Bildverarbeitung</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
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