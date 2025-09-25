import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, TestTube, Monitor, Play, Car, Lightbulb, Code, Shield, Zap, Eye, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import Footer from "@/components/Footer";
import automotiveLab from "@/assets/automotive-lab.jpg";
import automotiveHero from "@/assets/automotive-hero-clean-new.jpg";
import HotspotImage from "@/components/HotspotImage";
import manufacturersImage from "@/assets/manufacturers-image.png";
import suppliersImage from "@/assets/suppliers-image.png";
import arcturusProduct from "@/assets/arcturus-main-product-new.png";
import arcturusAutomotiveLab from "@/assets/arcturus-automotive-lab-installation.jpg";
import testLabServices from "@/assets/test-lab-services.jpg";
import te42Image from "@/assets/te42-ll.jpg";
import le7Image from "@/assets/le7-product.png";
import te292Image from "@/assets/te292-vis-ir.png";
import camspecsImage from "@/assets/geocal-product.jpg";
import iqAnalyzerImage from "@/assets/iq-analyzer-new.png";
import climateImage from "@/assets/climate-chamber.png";
import emvaLogo from "@/assets/emva-logo.jpg";
import isoStandardsLogo from "@/assets/iso-standards-logo-new.jpg";
import ieeeLogo from "@/assets/ieee-logo.jpg";
import solutionsInCabin from "@/assets/solutions-in-cabin.png";
import solutionsAdas from "@/assets/solutions-adas.png";
import solutionsGeometric from "@/assets/solutions-geometric-calibration.jpg";
import solutionsClimate from "@/assets/solutions-climate-control.png";

// Automotive & ADAS landing page component
const Automotive = () => {
  const [hoveredPoint, setHoveredPoint] = useState<string>("Live Processing");

  const hotspotMarkers = [
    { id: 1, label: "Front camera", top: 37, left: 48 },
    { id: 2, label: "360° environment camera", top: 36, left: 39 },
    { id: 2, label: "360° environment camera", top: 54, left: 53 },
    { id: 2, label: "360° environment camera", top: 57, left: 23 },
    { id: 2, label: "360° environment camera", top: 33, left: 78 },
    { id: 3, label: "Ultra sonic sensors", top: 75, left: 33 },
    { id: 3, label: "Ultra sonic sensors", top: 22, left: 69 },
    { id: 4, label: "Long range radar", top: 63, left: 25 },
    { id: 5, label: "Mid range radar", top: 69, left: 34 },
    { id: 5, label: "Mid range radar", top: 50, left: 80 },
    { id: 6, label: "Side ultra sonic sensor", top: 73, left: 36 },
    { id: 6, label: "Side ultra sonic sensor", top: 45, left: 78 },
  ];
  const sections = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'applications', label: 'ADAS Applications' },
    { id: 'standards', label: 'Standards & Testing' },
    { id: 'products', label: 'Products' },
    { id: 'contact', label: 'Contact' }
  ];

  const applications = [
    {
      title: "In-Cabin Performance Testing",
      description: "Driver and occupant monitoring systems (DMS/OMS) use a variety of near-infrared (NIR) sensors combined with active illumination (e.g., LED) to enhance the safety and comfort of drivers and passengers.",
      icon: Eye,
      iconType: "vision"
    },
    {
      title: "ADAS Performance Testing",
      description: "Advanced Driver Assistance Systems (ADAS) encompass a wide range of camera and sensor systems that support autonomous vehicle movements and provide driver caution notices.",
      icon: Shield,
      iconType: "testing"
    },
    {
      title: "Geometric Camera Calibration",
      description: "An essential measurement for ADAS applications that are required to detect and accurately map 3D objects in a moving scene and make adjustments based on those calculations.",
      icon: Brain,
      iconType: "ai"
    },
    {
      title: "Climate-Controlled Testing",
      description: "Incorporating various weather scenarios into automotive camera testing is crucial to understanding if these systems can still meet their performance thresholds in even the harshest weather conditions.",
      icon: Zap,
      iconType: "illumination"
    }
  ];

  const products = [
    {
      title: "Arcturus",
      description: "A high-intensity light source with unmatched stability and consistency.",
      image: arcturusProduct,
      link: "/product/arcturus"
    },
    {
      title: "LE7 VIS-IR",
      description: "A uniform light source for testing cameras in the near-infrared (NIR) range.",
      image: le7Image,
      link: "/product/le7"
    },
    {
      title: "GEOCAL",
      description: "Geometric calibrations using a compact device that generates a grid of light spots originating from infinity.",
      image: camspecsImage
    },
    {
      title: "iQ-Climate Chamber",
      description: "Temperature-controlled camera testing in the comfort of a camera test lab.",
      image: climateImage
    },
    {
      title: "TE292 VIS-IR",
      description: "A test chart for spectral sensitivity measurements and color calibrations in the VIS-IR range.",
      image: te292Image
    },
    {
      title: "iQ-Analyzer-X",
      description: "Advanced software for evaluating the performance of various image quality factors.",
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
                  <span className="font-medium text-ie-dark-blue">Image Quality</span>
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
              <HotspotImage
                src={automotiveHero}
                alt="Automotive camera testing laboratory"
                markers={hotspotMarkers}
                dotColor="bg-hotspot-primary"
                onHoverChange={(label) => setHoveredPoint(label || "Live Processing")}
              />
              
              {/* Floating stats - now shows hover text */}
              <div className="absolute -bottom-6 -left-6 bg-scandi-white p-6 rounded-lg shadow-soft border border-scandi-light-grey">
                <div className="text-sm text-scandi-grey font-light mb-1">{hoveredPoint === "Live Processing" ? "Live Processing" : "ADAS Component"}</div>
                <div className="text-2xl font-medium text-light-foreground">{hoveredPoint === "Live Processing" ? "Active" : hoveredPoint}</div>
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
            <h2 className="text-3xl md:text-4xl font-bold text-ie-dark-blue mb-4">
              Main Applications
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Automotive camera systems cover a broad spectrum of applications that contribute to vehicle safety, comfort and performance.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {applications.map((app, index) => {
              const IconComponent = app.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-lg p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col items-center text-center min-h-[320px]"
                >
                  {/* Large Icon at top - 70x70px round with IE Blue styling */}
                  <div className="w-[70px] h-[70px] rounded-full bg-[#103e7c]/10 border-2 border-[#103e7c]/20 flex items-center justify-center mb-6 hover:bg-[#103e7c]/20 hover:border-[#103e7c]/40 transition-all duration-300">
                    <IconComponent className="w-8 h-8 text-[#103e7c]/70" />
                  </div>
                  
                   {/* Title */}
                   <h3 className="text-xl font-bold text-ie-dark-blue mb-4 leading-tight h-16 flex items-start">
                     {app.title}
                   </h3>
                   
                   {/* Description */}
                   <p className="text-base text-gray-600 leading-relaxed mb-6 flex-1">
                     {app.description}
                   </p>
                  
                   {/* CTA Button */}
                   <Button 
                     className="w-full text-white hover:opacity-90"
                     style={{ backgroundColor: '#103e7c' }}
                   >
                     Learn More
                   </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* camPAS Testing Workflow Section */}
      <section id="standards" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-ie-dark-blue mb-4">
              Automotive International Standards
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A look at the crucial industry standards for automotive image quality performance testing and evaluation.
            </p>
          </div>

          {/* Standards Tiles */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* IEEE P2020 Standard */}
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 h-full">
              <CardContent className="p-8 text-center h-full flex flex-col">
                <div className="w-30 h-30 bg-white rounded-full flex items-center justify-center mx-auto mb-6 p-2">
                  <img src={ieeeLogo} alt="IEEE Logo" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-xl font-bold text-ie-dark-blue mb-4">IEEE-P2020</h3>
                <p className="text-gray-600 leading-relaxed mb-6 flex-1">
                  The first internationally recognized standard examines the factors contributing to the image quality of Advanced Driver Assistance Systems (ADAS) and outlines various test methods and tools.
                </p>
                <Button variant="outline" className="w-full mt-auto">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            {/* EMVA 1288/ISO 24942 Standard */}
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 h-full">
              <CardContent className="p-8 text-center h-full flex flex-col">
                <div className="w-30 h-30 bg-white rounded-full flex items-center justify-center mx-auto mb-6 p-2">
                  <img src={emvaLogo} alt="EMVA Logo" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-xl font-bold text-ie-dark-blue mb-4">EMVA 1288/ISO 24942</h3>
                <p className="text-gray-600 leading-relaxed mb-6 flex-1">
                  EMVA 1288/ISO 24942 (same standard metrics) outlines threshold specifications and measurement methods for machine vision cameras, many of which are commonly used in automotive vehicles.
                </p>
                <Button variant="outline" className="w-full mt-auto">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            {/* ISO 19093 Standard */}
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 h-full">
              <CardContent className="p-8 text-center h-full flex flex-col">
                <div className="w-30 h-30 bg-white rounded-full flex items-center justify-center mx-auto mb-6 p-2">
                  <img src={isoStandardsLogo} alt="ISO Standards Logo" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-xl font-bold text-ie-dark-blue mb-4">ISO 19093</h3>
                <p className="text-gray-600 leading-relaxed mb-6 flex-1">
                  ISO 19093 outlines measurement methods and metric thresholds for evaluating the performance of a camera system under various low-light conditions.
                </p>
                <Button variant="outline" className="w-full mt-auto">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Automotive Camera Test Solutions - Full Width 2x2 Grid */}
      <section className="py-20 bg-gray-50">
        <div className="w-full px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-ie-dark-blue mb-4">
              Automotive Camera Test Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              We offer a wide range of test solutions for all of the most crucial
              automotive camera applications and performance metrics.
            </p>
          </div>

          {/* 2x2 Grid - Full Viewport Width */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {/* In-Cabin Testing */}
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-[4/3] bg-gray-900 overflow-hidden relative">
                  <img 
                    src={solutionsInCabin}
                    alt="In-Cabin Testing Setup"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-ie-dark-blue mb-4">In-Cabin Testing</h3>
                  <div className="text-gray-600 leading-relaxed space-y-4">
                    <p>
                      In-Cabin systems are primarily tasked with observing the comfort and safety of the driver and passengers. These systems typically work with NIR (near-infrared) sensors combined with active illumination (e.g., LED or VCSEL) to ensure accuracy in very low-light conditions.
                    </p>
                    <p>
                      We offer a wide range of test solutions with IR capabilities, including the LE7 VIS-IR uniform lightbox, which uses iQ-LED technology, allowing you to generate custom spectra between 380 – 1050 nm. The LE7 can be used with transparent test charts such as the camSPECS plate IR, which is optimized for color calibrations and measuring spectral sensitivities in the NIR range.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ADAS Performance Testing */}
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-[4/3] bg-gray-900 overflow-hidden relative">
                  <img 
                    src={solutionsAdas}
                    alt="ADAS Performance Testing Setup"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-ie-dark-blue mb-4">ADAS Performance Testing</h3>
                  <div className="text-gray-600 leading-relaxed space-y-4">
                    <p>
                      Advanced Driver Assistance Systems (ADAS) refer to the camera and sensor systems that assist drivers with various movement adjustments and safety warnings. These systems require a broad range of test methods and metrics to evaluate to ensure high performance and safety. Our test solutions closely follow the test method guidelines established in the IEEE-P2020 standard for ADAS image quality performance.
                    </p>
                    <p>
                      A few of the key performance indicators (KPIs) outlined in the P2020 standard include contrast indicators – contrast transfer accuracy (CTA) and contrast signal-to-noise ratio (CSNR) -, dynamic range, and flicker response. These KPIs require powerful light sources that can simulate the high intensities experienced by ADAS systems. We offer multiple light sources, including Vega and Arcturus, that can generate dynamic test scenes with extremely high stability and consistency.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Geometric Calibration */}
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-[4/3] bg-gray-900 overflow-hidden relative">
                  <img 
                    src={solutionsGeometric}
                    alt="Geometric Calibration Setup"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-ie-dark-blue mb-4">Geometric Calibration</h3>
                  <div className="text-gray-600 leading-relaxed space-y-4">
                    <p>
                      Geometric calibration refers to the ability of a camera to detect and accurately map 3D objects in a moving scene. In automotive applications, distances to objects are calculated based on the measured geometrical characteristics of the camera or a stereo camera pair. Proper geometric calibration of automotive camera systems is essential to ensure high performance and safety.
                    </p>
                    <p>
                      Traditional geometric calibration methods typically require a vast amount of lab space combined with numerous distortion test targets and relay lenses. While these methods are functional, they are not very practical for most test labs that don&apos;t have space. To account for this challenge, we offer the GEOCAL solution. GEOCAL is a compact device that uses a beam expanded laser and diffractive optical element (DOE) to generate a grid of light spots originating from infinity. These features eliminate the need for multiple test targets and relay lenses, making them suitable for use in labs of any size.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Climate-Controlled Testing */}
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-[4/3] bg-gray-900 overflow-hidden relative">
                  <img 
                    src={solutionsClimate}
                    alt="Climate-Controlled Testing Setup"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-ie-dark-blue mb-4">Climate-Controlled Testing</h3>
                  <div className="text-gray-600 leading-relaxed space-y-4">
                    <p>
                      One of the fundamental requirements of ADAS applications is their ability to function properly in any weather scenario. If these systems fail to meet their minimum performance threshold requirements due to conditions like dense fog or pouring rain, safety could be compromised. Therefore, testing ADAS applications in changing weather environments is essential.
                    </p>
                    <p>
                      To perform weather tests, many companies drive test vehicles in various weather conditions and record the camera performance. However, while accurate in a real-world sense, these tests usually lack repeatability and extreme conditions (e.g., extreme cold or heat) due to the unpredictability of the weather and test locations. To combat these challenges, we offer the iQ-Climate Chamber solution, which allows you to test a camera system in extreme weather conditions in the comfort of a test lab.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


      {/* Recommended Products */}
      <section id="products" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-ie-dark-blue mb-4">
              Key Products
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Industry-leading tools for automotive image quality performance testing
            </p>
          </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
             {products.map((product, index) => (
                 <Card 
                   key={index}
                   className={`bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col ${
                     product.title === "Arcturus" 
                       ? "bg-green-100 border-4 border-green-300 shadow-lg ring-4 ring-green-200" 
                       : product.title === "LE7 VIS-IR"
                       ? "bg-blue-100 border-4 border-blue-300 shadow-lg ring-4 ring-blue-200"
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
                      {product.title === "LE7 VIS-IR" && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            ACTIVE
                          </span>
                        </div>
                      )}
                   </div>
                   <div className="p-6 flex flex-col flex-1">
                      <h3 className={`text-xl font-bold mb-3 transition-colors group-hover:text-[#577eb4] ${
                        product.title === "Arcturus" 
                          ? "text-green-700" 
                          : product.title === "LE7 VIS-IR"
                          ? "text-blue-700"
                          : "text-gray-900"
                      }`}>
                        {product.title}
                        {product.title === "Arcturus" && (
                          <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded">
                            CLICKABLE
                          </span>
                        )}
                        {product.title === "LE7 VIS-IR" && (
                          <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">
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
                         </Button>
                       </Link>
                     ) : (
                       <Button 
                         variant="decision"
                         size="lg"
                         className="w-full group"
                       >
                          Learn More
                       </Button>
                     )}
                   </div>
                 </CardContent>
               </Card>
             ))}
          </div>
        </div>
      </section>

      {/* Professional Laboratory Installation */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="aspect-video relative">
              <img 
                src={testLabServices} 
                alt="Automotive Camera Test Services in iQ-Lab"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-ie-dark-blue mb-3">Automotive Camera Test Services</h3>
              <p className="text-gray-600 leading-relaxed">
                Welcome to our iQ-Lab, one of the world's largest independent camera test labs. We offer a wide range of tests for the automotive industry, including the camPAS (Camera Performance for Automotive Systems) test.
              </p>
              <p className="text-gray-600 leading-relaxed mt-4">
                The camPAS test was developed for clients who need independent and objective test results from a neutral third-party to support their development decisions. camPAS, like most of our testing services, can be tailored to meet your specific KPI requirements. Don't hesitate to reach out to our iQ-Lab team to discuss your requirements and all of our test services.
              </p>
            </div>
          </div>
        </div>
      </section>


      <Footer />
    </div>
  );
};

export default Automotive;