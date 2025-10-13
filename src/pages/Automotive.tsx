import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, TestTube, Monitor, Play, Car, Lightbulb, Code, Shield, Zap, Eye, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
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
  const { t } = useLanguage();
  const [hoveredPoint, setHoveredPoint] = useState<string>(t('automotive.hero.liveProcessing'));

  const hotspotMarkers = [
    { id: 1, label: "Front camera", top: 37, left: 48 },
    { id: 2, label: "360° environment camera", top: 32, left: 36 },
    { id: 2, label: "360° environment camera", top: 56, left: 56 },
    { id: 2, label: "360° environment camera", top: 62, left: 18 },
    { id: 2, label: "360° environment camera", top: 28, left: 82 },
    { id: 3, label: "Ultra sonic sensors", top: 78, left: 30 },
    { id: 3, label: "Ultra sonic sensors", top: 18, left: 72 },
    { id: 4, label: "Long range radar", top: 68, left: 20 },
    { id: 5, label: "Mid range radar", top: 74, left: 32 },
    { id: 5, label: "Mid range radar", top: 48, left: 84 },
    { id: 6, label: "Side ultra sonic sensor", top: 80, left: 35 },
    { id: 6, label: "Side ultra sonic sensor", top: 42, left: 80 },
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
      titleKey: "automotive.applications.inCabin.title",
      descriptionKey: "automotive.applications.inCabin.description",
      icon: Eye,
      iconType: "vision"
    },
    {
      titleKey: "automotive.applications.adas.title",
      descriptionKey: "automotive.applications.adas.description",
      icon: Shield,
      iconType: "testing"
    },
    {
      titleKey: "automotive.applications.geometric.title",
      descriptionKey: "automotive.applications.geometric.description",
      icon: Brain,
      iconType: "ai"
    },
    {
      titleKey: "automotive.applications.climate.title",
      descriptionKey: "automotive.applications.climate.description",
      icon: Zap,
      iconType: "illumination"
    }
  ];

  const products = [
    {
      titleKey: "automotive.products.arcturus.title",
      descriptionKey: "automotive.products.arcturus.description",
      image: arcturusProduct,
      link: "/product/arcturus"
    },
    {
      titleKey: "automotive.products.le7.title",
      descriptionKey: "automotive.products.le7.description",
      image: le7Image,
      link: "/product/le7"
    },
    {
      titleKey: "automotive.products.geocal.title",
      descriptionKey: "automotive.products.geocal.description",
      image: camspecsImage
    },
    {
      titleKey: "automotive.products.climate.title",
      descriptionKey: "automotive.products.climate.description",
      image: climateImage
    },
    {
      titleKey: "automotive.products.te292.title",
      descriptionKey: "automotive.products.te292.description",
      image: te292Image
    },
    {
      titleKey: "automotive.products.analyzer.title",
      descriptionKey: "automotive.products.analyzer.description",
      image: iqAnalyzerImage
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />

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
                <h1 id="automotive-hero" className="text-6xl lg:text-7xl xl:text-8xl font-light text-light-foreground leading-[0.9] tracking-tight mb-6 -mt-64 pt-64 md:pt-64 pt-80">
                  {t('automotive.hero.title')}
                  <br />
                  <span className="font-medium text-light-foreground">{t('automotive.hero.subtitle')}</span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-scandi-grey font-light leading-relaxed max-w-lg">
                  {t('automotive.hero.description')}
                </p>
              </div>
              
              <div className="pt-4">
              <Link to="#applications-start">
                  <Button 
                    variant="decision"
                    size="lg"
                    className="px-8 py-4 text-lg font-medium group"
                  >
                    {t('automotive.hero.cta')}
                  </Button>
                </Link>
              </div>

              {/* Minimal stats */}
              <div className="flex items-center space-x-12 pt-8">
                <div>
                  <div className="text-2xl font-medium text-light-foreground">99.9%</div>
                  <div className="text-sm text-scandi-grey font-light">{t('automotive.hero.stat1')}</div>
                </div>
                <div>
                  <div className="text-2xl font-medium text-light-foreground">50ms</div>
                  <div className="text-sm text-scandi-grey font-light">{t('automotive.hero.stat2')}</div>
                </div>
                <div>
                  <div className="text-2xl font-medium text-light-foreground">100+</div>
                  <div className="text-sm text-scandi-grey font-light">{t('automotive.hero.stat3')}</div>
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
                <div className="text-sm text-scandi-grey font-light mb-1">{hoveredPoint === t('automotive.hero.liveProcessing') ? t('automotive.hero.liveProcessing') : t('automotive.hero.adasComponent')}</div>
                <div className="text-2xl font-medium text-light-foreground">{hoveredPoint === t('automotive.hero.liveProcessing') ? "Active" : hoveredPoint}</div>
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
              {t('automotive.applications.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('automotive.applications.description')}
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
                   <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight h-16 flex items-start">
                     {t(app.titleKey)}
                   </h3>
                   
                   {/* Description */}
                   <p className="text-base text-gray-600 leading-relaxed mb-6 flex-1">
                     {t(app.descriptionKey)}
                   </p>
                  
                   {/* CTA Button */}
                   <Button 
                     className="w-full text-white hover:opacity-90"
                     style={{ backgroundColor: '#103e7c' }}
                   >
                     {t('automotive.applications.learnMore')}
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('automotive.standards.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('automotive.standards.description')}
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
                <h3 className="text-xl font-bold text-gray-900 mb-4">{t('automotive.standards.ieee.title')}</h3>
                <p className="text-gray-600 leading-relaxed mb-6 flex-1">
                  {t('automotive.standards.ieee.description')}
                </p>
                <Button variant="outline" className="w-full mt-auto">
                  {t('automotive.standards.learnMore')}
                </Button>
              </CardContent>
            </Card>

            {/* EMVA 1288/ISO 24942 Standard */}
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 h-full">
              <CardContent className="p-8 text-center h-full flex flex-col">
                <div className="w-30 h-30 bg-white rounded-full flex items-center justify-center mx-auto mb-6 p-2">
                  <img src={emvaLogo} alt="EMVA Logo" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{t('automotive.standards.emva.title')}</h3>
                <p className="text-gray-600 leading-relaxed mb-6 flex-1">
                  {t('automotive.standards.emva.description')}
                </p>
                <Button variant="outline" className="w-full mt-auto">
                  {t('automotive.standards.learnMore')}
                </Button>
              </CardContent>
            </Card>

            {/* ISO 19093 Standard */}
            <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 h-full">
              <CardContent className="p-8 text-center h-full flex flex-col">
                <div className="w-30 h-30 bg-white rounded-full flex items-center justify-center mx-auto mb-6 p-2">
                  <img src={isoStandardsLogo} alt="ISO Standards Logo" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{t('automotive.standards.iso.title')}</h3>
                <p className="text-gray-600 leading-relaxed mb-6 flex-1">
                  {t('automotive.standards.iso.description')}
                </p>
                <Button variant="outline" className="w-full mt-auto">
                  {t('automotive.standards.learnMore')}
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('automotive.solutions.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              {t('automotive.solutions.description')}
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('automotive.solutions.inCabin.title')}</h3>
                  <div className="text-gray-600 leading-relaxed space-y-4">
                    <p>
                      {t('automotive.solutions.inCabin.paragraph1')}
                    </p>
                    <p>
                      {t('automotive.solutions.inCabin.paragraph2')}
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('automotive.solutions.adas.title')}</h3>
                  <div className="text-gray-600 leading-relaxed space-y-4">
                    <p>
                      {t('automotive.solutions.adas.paragraph1')}
                    </p>
                    <p>
                      {t('automotive.solutions.adas.paragraph2')}
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('automotive.solutions.geometric.title')}</h3>
                  <div className="text-gray-600 leading-relaxed space-y-4">
                    <p>
                      {t('automotive.solutions.geometric.paragraph1')}
                    </p>
                    <p>
                      {t('automotive.solutions.geometric.paragraph2')}
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('automotive.solutions.climate.title')}</h3>
                  <div className="text-gray-600 leading-relaxed space-y-4">
                    <p>
                      {t('automotive.solutions.climate.paragraph1')}
                    </p>
                    <p>
                      {t('automotive.solutions.climate.paragraph2')}
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('automotive.products.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('automotive.products.description')}
            </p>
          </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
             {products.map((product, index) => (
                 <Card 
                   key={index}
                   className={`bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col ${
                     t(product.titleKey) === t('automotive.products.arcturus.title')
                       ? "bg-green-100 border-4 border-green-300 shadow-lg ring-4 ring-green-200" 
                       : t(product.titleKey) === t('automotive.products.le7.title')
                       ? "bg-blue-100 border-4 border-blue-300 shadow-lg ring-4 ring-blue-200"
                       : ""
                   }`}
                 >
                 <CardContent className="p-0 flex flex-col flex-1">
                   <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                     <img 
                       src={product.image}
                       alt={t(product.titleKey)}
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                     />
                      {t(product.titleKey) === t('automotive.products.arcturus.title') && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            {t('automotive.products.active')}
                          </span>
                        </div>
                      )}
                      {t(product.titleKey) === t('automotive.products.le7.title') && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                            {t('automotive.products.active')}
                          </span>
                        </div>
                      )}
                   </div>
                   <div className="p-6 flex flex-col flex-1">
                      <h3 className={`text-xl font-bold mb-3 transition-colors group-hover:text-[#577eb4] ${
                        t(product.titleKey) === t('automotive.products.arcturus.title')
                          ? "text-green-700" 
                          : t(product.titleKey) === t('automotive.products.le7.title')
                          ? "text-blue-700"
                          : "text-gray-900"
                      }`}>
                        {t(product.titleKey)}
                        {t(product.titleKey) === t('automotive.products.arcturus.title') && (
                          <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded">
                            {t('automotive.products.clickable')}
                          </span>
                        )}
                        {t(product.titleKey) === t('automotive.products.le7.title') && (
                          <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">
                            {t('automotive.products.clickable')}
                          </span>
                        )}
                      </h3>
                     <p className="text-lg text-gray-600 leading-relaxed mb-6 flex-1">
                       {t(product.descriptionKey)}
                     </p>
                     {product.link ? (
                       <Link to={product.link}>
                         <Button 
                           variant="decision"
                           size="lg"
                           className={`w-full group ${
                             t(product.titleKey) === t('automotive.products.arcturus.title')
                               ? "bg-green-600 hover:bg-green-700 text-white border-green-600" 
                               : ""
                           }`}
                         >
                            {t('automotive.products.learnMore')}
                         </Button>
                       </Link>
                     ) : (
                       <Button 
                         variant="decision"
                         size="lg"
                         className="w-full group"
                       >
                          {t('automotive.products.learnMore')}
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
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('automotive.testLab.title')}</h3>
              <p className="text-gray-600 leading-relaxed">
                {t('automotive.testLab.paragraph1')}
              </p>
              <p className="text-gray-600 leading-relaxed mt-4">
                {t('automotive.testLab.paragraph2')}
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