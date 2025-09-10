import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Camera, TestTube, Monitor, Play, Car, Lightbulb, Code, Shield, Zap, Eye, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import ManufacturerSupplierShowcase from "@/components/ManufacturerSupplierShowcase";
import Footer from "@/components/Footer";
import automotiveLab from "@/assets/automotive-lab.jpg";
import automotiveHero from "@/assets/automotive-hero-new.jpg";
import manufacturersImage from "@/assets/manufacturers-image.png";
import suppliersImage from "@/assets/suppliers-image.png";
import arcturusProduct from "@/assets/arcturus-main-product-new.png";
import te42Image from "@/assets/te42-ll.jpg";
import camspecsImage from "@/assets/camspecs-xl.png";
import iqAnalyzerImage from "@/assets/iq-analyzer-x.png";

// Automotive & ADAS landing page component
const Automotive = () => {
  const sections = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'applications', label: 'ADAS Applications' },
    { id: 'standards', label: 'Standards & Testing' },
    { id: 'products', label: 'Products' },
    { id: 'contact', label: 'Contact' }
  ];

  const applications = [
    {
      title: "[PLATZHALTER] Kamerasystem Validierung",
      description: "[PLATZHALTER] Umfassende Validierung von Fahrerassistenzkameras für Sicherheitsstandards und ADAS-Funktionen",
      icon: Eye,
      iconType: "vision"
    },
    {
      title: "[PLATZHALTER] Sensor Performance Tests",
      description: "[PLATZHALTER] Hochpräzise LED-Beleuchtung für anspruchsvolle Sensorsystem- und Komponententests",
      icon: Shield,
      iconType: "testing"
    },
    {
      title: "[PLATZHALTER] KI-basierte Bildanalyse",
      description: "[PLATZHALTER] Erweiterte KI-Software für Bildanalyse, Kalibrierung und automatisierte Qualitätskontrolle",
      icon: Brain,
      iconType: "ai"
    },
    {
      title: "[PLATZHALTER] ADAS Beleuchtungssysteme",
      description: "[PLATZHALTER] Professionelle LED-Beleuchtungssysteme für stabile Testumgebungen bei schwachem Licht",
      icon: Zap,
      iconType: "illumination"
    }
  ];

  const products = [
    {
      title: "[PLATZHALTER] Arcturus ADAS",
      description: "[PLATZHALTER] Hochleistungs-LED-Beleuchtung für ADAS-Tests, HDR-Szenen & High-End Sensoren",
      image: arcturusProduct,
      link: "/product/arcturus"
    },
    {
      title: "[PLATZHALTER] TE42-ADAS",
      description: "[PLATZHALTER] Schwachlicht-Testtabelle für ADAS Kamera-Validierung",
      image: te42Image
    },
    {
      title: "[PLATZHALTER] camSPECS ADAS",
      description: "[PLATZHALTER] Spektrale Empfindlichkeitsmessung für ADAS-Systeme",
      image: camspecsImage
    },
    {
      title: "[PLATZHALTER] iQ-Analyzer ADAS",
      description: "[PLATZHALTER] Bildqualitätsbewertungs-Software-Suite für autonome Fahrsysteme",
      image: iqAnalyzerImage
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />
        <AnnouncementBanner 
        message="[PLATZHALTER] Automotive & ADAS Vision Excellence"
        ctaText="Learn More"
        ctaLink="#"
        icon="calendar"
      />

      {/* Hero Section - starts immediately after navigation */}
      <section id="introduction" className="min-h-screen bg-scandi-white font-roboto">
        {/* Navigation Spacer */}
        <div className="h-16"></div>
        
        {/* Hero Content */}
        <div id="hero-start" className="container mx-auto px-6 py-16 lg:py-20 pb-8 lg:pb-12">
          <div className="grid lg:grid-cols-5 gap-16 items-center min-h-[80vh]">
            
            {/* Left Content - 2/5 */}
            <div className="lg:col-span-2 space-y-8 lg:pr-8">
              <div>
                <h1 id="automotive-hero" className="text-6xl lg:text-7xl xl:text-8xl font-light text-light-foreground leading-[0.9] tracking-tight mb-6 -mt-64 pt-64">
                  Automotive
                  <br />
                  <span className="font-medium text-soft-blue">Image Quality</span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-scandi-grey font-light leading-relaxed max-w-lg">
                  Precision-engineered camera system test solutions for robust vehicle safety, performance and autonomy.
                </p>
              </div>
              
              <div className="pt-4">
              <Link to="#applications-start">
                  <Button 
                    variant="decision"
                    size="lg"
                    className="px-8 py-4 text-lg font-medium group"
                  >
                    Discover Automotive Solutions
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              {/* Minimal stats */}
              <div className="flex items-center space-x-12 pt-8">
                <div>
                  <div className="text-2xl font-medium text-light-foreground">99.9%</div>
                  <div className="text-sm text-scandi-grey font-light">[PLATZHALTER] Genauigkeit</div>
                </div>
                <div>
                  <div className="text-2xl font-medium text-light-foreground">50ms</div>
                  <div className="text-sm text-scandi-grey font-light">[PLATZHALTER] Reaktion</div>
                </div>
                <div>
                  <div className="text-2xl font-medium text-light-foreground">100+</div>
                  <div className="text-sm text-scandi-grey font-light">[PLATZHALTER] ADAS Projekte</div>
                </div>
              </div>
            </div>

            {/* Right Content - Interactive Image Map - 3/5 */}
            <div className="lg:col-span-3 relative">
              <div className="relative overflow-hidden rounded-lg shadow-soft">
                <img 
                  src={automotiveHero}
                  alt="Automotive camera testing laboratory"
                  className="w-full h-[500px] lg:h-[600px] object-cover"
                />
                
                {/* Interactive Hotspots */}
                <div className="absolute inset-0">
                  {/* Hotspot 1 - Camera System */}
                  <div className="absolute top-[25%] left-[20%] group cursor-pointer">
                    <div className="w-4 h-4 bg-soft-blue rounded-full border-2 border-white shadow-lg animate-pulse hover:animate-none hover:scale-125 transition-all duration-300"></div>
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg min-w-[200px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <h4 className="font-semibold text-gray-900 mb-1">ADAS Camera System</h4>
                      <p className="text-sm text-gray-600">High-precision testing setup for automotive camera validation</p>
                    </div>
                  </div>

                  {/* Hotspot 2 - LED Lighting */}
                  <div className="absolute top-[40%] right-[25%] group cursor-pointer">
                    <div className="w-4 h-4 bg-soft-blue rounded-full border-2 border-white shadow-lg animate-pulse hover:animate-none hover:scale-125 transition-all duration-300"></div>
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg min-w-[200px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <h4 className="font-semibold text-gray-900 mb-1">Arcturus LED System</h4>
                      <p className="text-sm text-gray-600">Professional LED lighting for consistent test conditions</p>
                    </div>
                  </div>

                  {/* Hotspot 3 - Test Chart */}
                  <div className="absolute bottom-[35%] left-[35%] group cursor-pointer">
                    <div className="w-4 h-4 bg-soft-blue rounded-full border-2 border-white shadow-lg animate-pulse hover:animate-none hover:scale-125 transition-all duration-300"></div>
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg min-w-[200px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <h4 className="font-semibold text-gray-900 mb-1">Test Chart System</h4>
                      <p className="text-sm text-gray-600">Precision test patterns for image quality assessment</p>
                    </div>
                  </div>

                  {/* Hotspot 4 - Control Station */}
                  <div className="absolute top-[60%] right-[15%] group cursor-pointer">
                    <div className="w-4 h-4 bg-soft-blue rounded-full border-2 border-white shadow-lg animate-pulse hover:animate-none hover:scale-125 transition-all duration-300"></div>
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg min-w-[200px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <h4 className="font-semibold text-gray-900 mb-1">Control Station</h4>
                      <p className="text-sm text-gray-600">Advanced software control and real-time analysis</p>
                    </div>
                  </div>
                </div>
                
                {/* Original video overlay simulation */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
              </div>
              
              {/* Floating stats */}
              <div className="absolute -bottom-6 -left-6 bg-scandi-white p-6 rounded-lg shadow-soft border border-scandi-light-grey">
                <div className="text-sm text-scandi-grey font-light mb-1">Live Processing</div>
                <div className="text-2xl font-medium text-light-foreground">Active</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Better anchor point for smooth scrolling */}
      <div id="applications-start" className="h-12 -mb-12"></div>

      {/* Applications Overview */}
      <section id="applications" className="py-8 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              [PLATZHALTER] ADAS Hauptanwendungen
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              [PLATZHALTER] Essenzielle Testlösungen für autonome Fahrerassistenzsysteme
            </p>
          </div>
        </div>

        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {applications.map((app, index) => {
              const IconComponent = app.icon;
              const getIconColors = (iconType: string) => {
                return { bg: 'bg-automotive-icon-bg', fg: 'text-automotive-icon-bg' };
              };
              const colors = getIconColors(app.iconType);
              
              return (
                <div 
                  key={index}
                  className="bg-white rounded-lg p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col items-center text-center min-h-[320px]"
                >
                  {/* Large Icon at top - 70x70px round */}
                  <div className={`w-[70px] h-[70px] rounded-full ${colors.bg} flex items-center justify-center mb-6`}>
                    <IconComponent className="w-8 h-8 text-black" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-4 leading-tight flex-1">
                    {app.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed mb-6 flex-1">
                    {app.description}
                  </p>
                  
                  {/* CTA Button */}
                  <Button 
                    className="w-full text-white hover:opacity-90"
                    style={{ backgroundColor: 'hsl(77, 56%, 37%)' }}
                  >
                    Learn More
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* camADAS Testing Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                [PLATZHALTER] camADAS - Kameraperformance für Autonome Fahrerassistenzsysteme
              </h3>
              <p className="text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
                [PLATZHALTER] Der camADAS (Camera Performance for Autonomous Driver Assistance Systems) Test ist ein einzigartig entwickelter Bildqualitäts-Performance-Test für Kamerasysteme in der ADAS-Industrie. Wir bieten camADAS für Kunden, die unabhängige und objektive Testergebnisse von einer neutralen dritten Partei benötigen.
              </p>
            </div>

            <div className="mb-12">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Current working groups, e.g. <a href="https://sagroups.ieee.org/2020/" className="hover:underline" style={{ color: '#577eb4' }}>IEEE-P2020</a>, are working on an internationally recognized image quality testing standard for automotive camera systems. The publication of IEEE-P2020 is expected by the end of 2024. Currently, there are no industry-wide testing standards. The development of the camPAS test arose from supporting our customers in finding and creating test methods that deliver unbiased results. As an active member of IEEE-P2020, we can directly implement the latest automotive camera testing methods and procedures from the standard to keep camPAS relevant and current.
              </p>
            </div>

            {/* What tests are included */}
            <div className="bg-automotive-tests-bg rounded-2xl p-8 mb-12">
              <h4 className="text-2xl font-bold text-gray-900 mb-6">What tests are included in camPAS?</h4>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                The difference between a camPAS test and a standard test method is the ability to fully customize the camPAS test to customer specifications. We evaluate camera systems based on various image quality KPIs or use tests to analyze sensor smoothness or error susceptibility.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Some of the most common image quality KPIs we test include Contrast Transfer Accuracy (CTA), Modulated Light Reduction Probability (Flicker), High Dynamic Range (HDR), visual assessment of low-light performance, etc. These tests are performed using the latest techniques (as described in IEEE-P2020) and equipment to ensure the highest results.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                It is important to note that these KPIs are just examples and we test an extensive range of KPIs for camera and sensor systems. camPAS tests are not pre-made tests and instead require consultation with our test lab to ensure we design a test that meets customer requirements.
              </p>
              
              <div className="text-center">
                <Button 
                  variant="technical"
                  size="lg"
                  className="group"
                >
                  Contact iQ-Lab for camPAS Consultation
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>

            {/* IEEE-P2020 Product Bundle Section */}
            <h4 className="text-2xl font-bold text-gray-900 mb-6">IEEE-P2020 Product Package</h4>
            
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              <a href="https://sagroups.ieee.org/2020/" className="hover:underline" style={{ color: '#577eb4' }}>IEEE-P2020</a> establishes an internationally recognized standard for automotive and ADAS applications. This standard addresses the fundamental KPIs that contribute to the image quality of automotive camera systems. Unlike most camera industries, automotive and ADAS applications are unique because they directly affect consumer safety.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              During the development of the standard, it became clear that new metrics must be established to account for the unique environments in which autonomous driving systems must operate. Direct sunlight, dense fog, low light, flickering lights and heavy pedestrian traffic are just some of the environments in which ADAS systems operate. The new KPIs to address these testing challenges include Contrast Transfer Accuracy (CTA), Modulated Light Reduction Probability (MMP - Flicker), Contrast Signal-to-Noise Ratio (CSNR) and High Dynamic Range (HDR), among others.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              These KPIs require new testing methods and equipment. We have developed many of our newer camera testing devices based on the testing procedures described in the standard and offer a product package for those who want to start with IEEE-P2020 measurements today.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Vega Light Source */}
              <div className="bg-automotive-tests-bg rounded-xl p-6">
                <h5 className="text-lg font-bold text-gray-900 mb-3">Vega High-Intensity Light Source</h5>
                 <p className="text-lg text-gray-600 leading-relaxed">
                   A high-intensity light source based on DC technology with extremely high stability for measuring cameras with very short exposure times.
                 </p>
              </div>

              {/* TE294 Test Chart */}
              <div className="bg-automotive-tests-bg rounded-xl p-6">
                <h5 className="text-lg font-bold text-gray-900 mb-3">Vega Test Chart (TE294)</h5>
                 <p className="text-lg text-gray-600 leading-relaxed">
                   A unique grayscale test chart with 36 fields and 10:1 contrast for high-precision measurements of automotive camera systems.
                 </p>
              </div>

              {/* VLS Software */}
              <div className="bg-automotive-tests-bg rounded-xl p-6">
                <h5 className="text-lg font-bold text-gray-900 mb-3">VLS Software</h5>
                 <p className="text-lg text-gray-600 leading-relaxed">
                   Evaluation software that supports CTA, MMP and CSNR measurements and evaluations for versatile lighting system testing.
                 </p>
              </div>

              {/* Vega API */}
              <div className="bg-automotive-tests-bg rounded-xl p-6">
                <h5 className="text-lg font-bold text-gray-900 mb-3">Vega API</h5>
                 <p className="text-lg text-gray-600 leading-relaxed">
                   Flexible workflows with C++-based API that provides C interfaces and Python example scripts for complete integration flexibility.
                 </p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 mb-12">
               <p className="text-lg text-gray-700 mb-4">
                 <strong>Important Note:</strong> This package includes one Vega device, one controller and one test chart. Additional Vega devices and charts can be purchased separately (one controller can control up to seven Vega devices).
               </p>
              <div className="text-center">
                <Link to="#footer">
                  <Button 
                    variant="contact"
                    size="lg"
                    className="px-8 py-3 text-lg"
                  >
                    Contact Sales for IEEE-P2020 Package
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Manufacturer/Supplier Showcase - separate section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <ManufacturerSupplierShowcase />
          </div>
        </div>
      </section>

      {/* Recommended Products */}
      <section id="products" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              [PLATZHALTER] Empfohlene ADAS Produkte
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              [PLATZHALTER] Branchenführende Tools für ADAS-Kameratests
            </p>
          </div>

           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
             {products.map((product, index) => (
               <Card 
                 key={index}
                 className={`bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col ${
                   product.title === "Arcturus" 
                     ? "bg-green-100 border-4 border-green-300 shadow-lg ring-4 ring-green-200" 
                     : ""
                 }`}
               >
                 <CardContent className="p-0 flex flex-col flex-1">
                   <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                     <img 
                       src={product.image}
                       alt={product.title}
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                     />
                     {product.title === "Arcturus" && (
                       <div className="absolute top-2 right-2">
                         <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                           ACTIVE
                         </span>
                       </div>
                     )}
                   </div>
                   <div className="p-6 flex flex-col flex-1">
                     <h3 className={`text-xl font-bold mb-3 transition-colors group-hover:text-[#577eb4] ${
                       product.title === "Arcturus" 
                         ? "text-green-700" 
                         : "text-gray-900"
                     }`}>
                       {product.title}
                       {product.title === "Arcturus" && (
                         <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded">
                           CLICKABLE
                         </span>
                       )}
                     </h3>
                     <p className="text-lg text-gray-600 leading-relaxed mb-6 flex-1">
                       {product.description}
                     </p>
                     {product.link ? (
                       <Link to={product.link}>
                         <Button 
                           variant="decision"
                           size="lg"
                           className={`w-full group ${
                             product.title === "Arcturus" 
                               ? "bg-green-600 hover:bg-green-700 text-white border-green-600" 
                               : ""
                           }`}
                         >
                           Learn More
                           <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                         </Button>
                       </Link>
                     ) : (
                       <Button 
                         variant="decision"
                         size="lg"
                         className="w-full group"
                       >
                         Learn More
                         <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                       </Button>
                     )}
                   </div>
                 </CardContent>
               </Card>
             ))}
          </div>
        </div>
      </section>


      <Footer />
    </div>
  );
};

export default Automotive;