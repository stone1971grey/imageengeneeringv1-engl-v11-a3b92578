import Navigation from "@/components/Navigation";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { Camera, Monitor, Zap, Cpu, Target, Settings, ArrowRight, Calendar, MapPin, Download, Package, Lightbulb, Puzzle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import arcturusHero from "@/assets/arcturus-hero-professional.jpg";
import ibcBanner from "@/assets/ibc.png";
import customChart from "@/assets/custom-chart.png";
import arcturusMainProduct from "@/assets/arcturus-main-product.png";
import iqAnalyzerIntro from "@/assets/iq-analyzer-intro.png";
import productBundleIeee from "@/assets/product-bundle-ieee.png";
import iqLedIllumination from "@/assets/iq-led-illumination.png";
import chartCase from "@/assets/chart-case.png";
import technology2025 from "@/assets/technology-2025.png";

const Products = () => {
  const productCategories = [
    {
      icon: Camera,
      name: "Charts",
      description: "Professionelle Testcharts und Muster für Bildqualitätstests und Kalibrierung",
      image: customChart,
      link: "#charts"
    },
    {
      icon: Zap,
      name: "Geräte",
      description: "Hochpräzise Testausrüstung für Bildqualitätsanalyse",
      image: arcturusMainProduct,
      link: "#equipment"
    },
    {
      icon: Monitor,
      name: "Software",
      description: "Fortschrittliche Softwarelösungen für Bildanalyse und Qualitätskontrolle",
      image: iqAnalyzerIntro,
      link: "#software"
    },
    {
      icon: Package,
      name: "Produktbündel",
      description: "Komplette Testpakete mit Hardware und Software",
      image: productBundleIeee,
      link: "#bundles"
    },
    {
      icon: Lightbulb,
      name: "Lösungen",
      description: "Komplette Beleuchtungs- und Illuminationslösungen für professionelle Testumgebungen",
      image: iqLedIllumination,
      link: "#solutions"
    },
    {
      icon: Puzzle,
      name: "Zubehör",
      description: "Professionelles Zubehör einschließlich Chart-Koffer, Halterungen und Kalibrierungstools",
      image: chartCase,
      link: "#accessories"
    },
    {
      icon: Cpu,
      name: "Technologie",
      description: "Neueste Innovationen und modernste Technologie in der Bildqualitätsmessung",
      image: technology2025,
      link: "#technology"
    }
  ];


  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <AnnouncementBanner 
        message="Neuer Produktlaunch: Arcturus LED System"
        ctaText="Mehr erfahren"
        ctaLink="/product-arcturus"
        icon="calendar"
      />

      {/* Hero Section - Full Width */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Hero Background Image with Ken Burns */}
        <div className="absolute inset-0 animate-fade-in">
          <img 
            src={arcturusHero} 
            alt="Products Hero" 
            className="w-full h-full object-cover animate-ken-burns"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-600/60"></div>
        </div>

        {/* Navigation Spacer */}
        <div className="h-16"></div>
        
        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-6 py-24 lg:py-32">
          <div className="text-center max-w-5xl mx-auto">
            
            {/* Main Headline */}
            <div className="mb-8">
              <h1 id="products-hero" className="text-6xl lg:text-7xl xl:text-8xl font-light text-white leading-[0.9] tracking-tight mb-6 -mt-64 pt-64">
                Innovation in der
                <br />
                <span className="font-medium text-blue-300">Bildtechnologie</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-white/90 font-light leading-relaxed max-w-3xl mx-auto">
                Entdecken Sie unser umfassendes Sortiment modernster Produkte, die darauf ausgelegt sind, 
                die Grenzen von Bildqualität und Präzisionstests zu verschieben.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
              <Button 
                size="lg" 
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 text-lg"
              >
                Produkte erkunden
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg"
              >
                Katalog herunterladen
                <Download className="ml-2 w-5 h-5" />
              </Button>
            </div>
            
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-blue-300/40 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-blue-300/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* IBC 2025 Teaser Banner */}
      <section className="w-full bg-gradient-to-r from-primary/5 to-accent-soft-blue/5 border-b border-muted-foreground/10">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center lg:text-left">
              <h2 className="text-2xl lg:text-3xl font-semibold text-foreground mb-3">
                Treffen Sie uns auf der IBC 2025
              </h2>
              <p className="text-lg text-muted-foreground mb-4 max-w-2xl">
                Vereinbaren Sie ein Treffen mit uns auf der IBC 2025, um eine maßgeschneiderte Einführung darüber zu erhalten, wie wir Ihnen helfen können, Ihre Medienoperationen zu optimieren und Veränderungen voraus zu sein.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>12-15 September 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Amsterdam, Niederlande</span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <img 
                src={ibcBanner} 
                alt="IBC 2025 Banner" 
                className="w-auto h-24 lg:h-32 object-contain"
              />
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white px-8"
            >
              Termin vereinbaren
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-primary text-primary hover:bg-primary/5 px-8"
            >
              Mehr erfahren
            </Button>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6 tracking-tight">
              Produktkategorien
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              Umfassende Lösungen für jeden Aspekt von Bildqualitätstests und -analyse.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {productCategories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Card 
                  key={index}
                  className="group overflow-hidden bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 flex flex-col h-full"
                  style={{ 
                    animationDelay: `${index * 150}ms`,
                    animation: 'fade-in 0.6s ease-out both'
                  }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent"></div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                        <IconComponent size={24} className="text-white" strokeWidth={1.5} />
                      </div>
                      <h3 className="font-bold text-blue-900 text-xl">
                        {category.name}
                      </h3>
                    </div>
                    
                    <p className="text-blue-700 text-base leading-relaxed mb-4 flex-grow">
                      {category.description}
                    </p>
                    
                    <Button 
                      size="sm"
                      className="w-full bg-blue-200 text-black border border-blue-300 hover:bg-blue-300 hover:text-black transition-colors mt-auto"
                    >
                      Mehr erfahren
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Bereit, Ihre Tests zu transformieren?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Lassen Sie unsere Experten Ihnen helfen, die perfekte Lösung für Ihre spezifischen Anforderungen zu finden.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg"
            >
              Vertrieb kontaktieren
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg"
            >
              Demo anfordern
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Products;