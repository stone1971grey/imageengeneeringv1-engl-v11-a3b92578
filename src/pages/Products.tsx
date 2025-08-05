import Navigation from "@/components/Navigation";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { Camera, Monitor, Zap, Cpu, Target, Settings, ArrowRight, Calendar, MapPin, Download, ExternalLink, Package, Lightbulb, Puzzle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
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
      description: "Professional test charts and patterns for image quality testing and calibration",
      image: customChart,
      link: "#charts"
    },
    {
      icon: Zap,
      name: "Equipment",
      description: "High-precision testing equipment for image quality analysis",
      image: arcturusMainProduct,
      link: "#equipment"
    },
    {
      icon: Monitor,
      name: "Software",
      description: "Advanced software solutions for image analysis and quality control",
      image: iqAnalyzerIntro,
      link: "#software"
    },
    {
      icon: Package,
      name: "Product Bundles",
      description: "Complete testing packages combining hardware and software",
      image: productBundleIeee,
      link: "#bundles"
    },
    {
      icon: Lightbulb,
      name: "Solutions",
      description: "Complete lighting and illumination solutions for professional testing environments",
      image: iqLedIllumination,
      link: "#solutions"
    },
    {
      icon: Puzzle,
      name: "Accessories",
      description: "Professional accessories including chart cases, mounts, and calibration tools",
      image: chartCase,
      link: "#accessories"
    },
    {
      icon: Cpu,
      name: "Technology",
      description: "Latest innovations and cutting-edge technology in image quality measurement",
      image: technology2025,
      link: "#technology"
    }
  ];

  const featuredProducts = [
    {
      name: "Arcturus LED System",
      description: "Revolutionary LED lighting system with unmatched uniformity and color accuracy",
      features: ["99.5% Uniformity", "Full Spectrum", "Motorized Control", "HDR Support"],
      image: arcturusHero,
      link: "/product-arcturus"
    },
    {
      name: "iQ-Analyzer Pro",
      description: "Comprehensive image quality analysis software for professional applications",
      features: ["Automated Analysis", "Custom Reports", "Batch Processing", "API Integration"],
      image: arcturusHero,
      link: "#"
    },
    {
      name: "Vega Lightbox",
      description: "Compact yet powerful lighting solution for laboratory environments",
      features: ["Compact Design", "Precise Control", "Multi-Wavelength", "Lab Integration"],
      image: arcturusHero,
      link: "#"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <AnnouncementBanner 
        message="New Product Launch: Arcturus LED System"
        ctaText="Learn more"
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
                Innovation in
                <br />
                <span className="font-medium text-blue-300">Image Technology</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-white/90 font-light leading-relaxed max-w-3xl mx-auto">
                Discover our comprehensive range of cutting-edge products designed 
                to push the boundaries of image quality and precision testing.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
              <Button 
                size="lg" 
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 text-lg"
              >
                Explore Products
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg"
              >
                Download Catalog
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
                Meet us at IBC 2025
              </h2>
              <p className="text-lg text-muted-foreground mb-4 max-w-2xl">
                Book a meeting with us at IBC 2025 to get a tailored walkthrough of how we can help you streamline your media operations and stay ahead of changes.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>12-15 September 2025</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Amsterdam, Netherlands</span>
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
              Book a Meeting
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-primary text-primary hover:bg-primary/5 px-8"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6 tracking-tight">
              Product Categories
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              Comprehensive solutions for every aspect of image quality testing and analysis.
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
                      Learn More
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-32 bg-gradient-to-b from-white to-blue-50/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
              Featured Products
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              Our flagship solutions that are setting new standards in the industry.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {featuredProducts.map((product, index) => (
              <Card 
                key={index}
                className="overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-blue-100"
                style={{ 
                  animationDelay: `${index * 200}ms`,
                  animation: 'fade-in 0.8s ease-out both'
                }}
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent"></div>
                </div>
                
                <div className="p-8">
                  <h3 className="font-bold text-xl text-foreground mb-3">
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {product.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {product.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-muted-foreground">
                        <Settings className="w-3 h-3 mr-2 text-blue-500" />
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    asChild
                  >
                    <Link to={product.link}>
                      Learn More
                      <ExternalLink className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Testing?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Let our experts help you find the perfect solution for your specific requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg"
            >
              Contact Sales
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg"
            >
              Request Demo
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Products;