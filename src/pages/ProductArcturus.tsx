import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowLeft, Download, FileText, BarChart3, Zap, Shield, Eye, Car, Smartphone, Heart, CheckCircle, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import Navigation from "@/components/Navigation";

import arcturusMain from "@/assets/arcturus-main-product.png";
import arcturusMainGithub from "@/assets/arcturus-main-github.png";
import arcturusHeroProfessional from "@/assets/arcturus-hero-professional.jpg";
import arcturusRealisticLab from "@/assets/arcturus-realistic-lab.jpg";
import arcturusController from "@/assets/arcturus-controller.jpg";
import arcturusSetup from "@/assets/arcturus-setup-vega.jpg";
import arcturusCharts from "@/assets/arcturus-vega-charts.jpg";
import arcturusAutomotiveLab from "@/assets/arcturus-automotive-lab-installation.jpg";

const ProductArcturus = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const productImages = [
    {
      src: arcturusMain,
      title: "Arcturus LED System",
      description: "Professional high-power LED illumination system"
    },
    {
      src: arcturusController,
      title: "Controller Unit",
      description: "Precision control interface for light output management"
    },
    {
      src: arcturusSetup,
      title: "Laboratory Setup",
      description: "Complete testing environment with Vega software integration"
    },
    {
      src: arcturusCharts,
      title: "Test Charts & Analysis",
      description: "Vega software displaying comprehensive image quality metrics"
    }
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };
  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      <Navigation />
      
      {/* Main content wrapper with top margin to clear fixed navigation */}
      <div className="pt-[140px]">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="sticky top-[140px] z-40 bg-[#F7F9FB] py-6 border-b border-gray-100">
          <div className="container mx-auto px-4 mt-8">
            <ol className="flex gap-2 text-base text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  Products
                </span>
              </li>
              <li>/</li>
              <li>
                <span className="hover:text-foreground transition-colors cursor-pointer">
                  Equipment
                </span>
              </li>
              <li>/</li>
              <li>
                <span className="text-muted-foreground underline">
                  Arcturus LED Product
                </span>
              </li>
            </ol>
          </div>
        </nav>

        {/* Quick Navigation */}
        <nav className="sticky top-[215px] z-30 bg-[#F7F9FB] py-4 border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex flex-wrap gap-6 justify-center text-lg">
                <a href="#overview" className="text-[#3D7BA2] hover:text-[#3D7BA2]/80 font-medium transition-colors scroll-smooth" 
                   onClick={(e) => {
                     e.preventDefault();
                     document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                   }}>Overview</a>
                <a href="#benefits" className="text-[#3D7BA2] hover:text-[#3D7BA2]/80 font-medium transition-colors scroll-smooth"
                   onClick={(e) => {
                     e.preventDefault();
                     document.getElementById('benefits')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                   }}>Benefits</a>
                <a href="#specifications" className="text-[#3D7BA2] hover:text-[#3D7BA2]/80 font-medium transition-colors scroll-smooth"
                   onClick={(e) => {
                     e.preventDefault();
                     document.getElementById('specifications')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                   }}>Specifications</a>
                <a href="#applications" className="text-[#3D7BA2] hover:text-[#3D7BA2]/80 font-medium transition-colors scroll-smooth"
                   onClick={(e) => {
                     e.preventDefault();
                     document.getElementById('applications')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                   }}>Applications</a>
                <a href="#gallery" className="text-[#3D7BA2] hover:text-[#3D7BA2]/80 font-medium transition-colors scroll-smooth"
                   onClick={(e) => {
                     e.preventDefault();
                     document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                   }}>Gallery</a>
                <a href="#downloads" className="text-[#3D7BA2] hover:text-[#3D7BA2]/80 font-medium transition-colors scroll-smooth"
                   onClick={(e) => {
                     e.preventDefault();
                     document.getElementById('downloads')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                   }}>Downloads</a>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section id="overview" className="min-h-[60vh] bg-scandi-white font-inter scroll-mt-[260px] relative overflow-hidden">
          {/* Animated background light effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-soft-blue/20 to-accent-soft-blue/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-l from-soft-blue/15 to-accent-soft-blue/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-gradient-to-r from-accent-soft-blue/10 to-soft-blue/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>
          
          <div className="container mx-auto px-6 py-16 lg:py-24 pt-32 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              
              {/* Left Content */}
              <div className="space-y-8">
                <div>
                  <h1 className="text-6xl lg:text-7xl xl:text-8xl font-light text-light-foreground leading-[0.9] tracking-tight mb-6">
                    ARCTURUS
                    <br />
                    <span className="font-medium text-accent-soft-blue">LED</span>
                  </h1>
                  
                  <p className="text-xl lg:text-2xl text-scandi-grey font-light leading-relaxed max-w-lg">
                    Today's image sensors and high dynamic range configurations make testing at or close to sensor saturation challenging. With Arcturus, we can generate more than enough intensity to challenge these sensors with a much higher sensitivity than currently possible.
                  </p>
                </div>
                
                <div className="pt-4">
                  <Button 
                    size="lg"
                    className="bg-soft-blue hover:bg-soft-blue/90 text-white border-0 px-8 py-4 text-lg font-medium shadow-soft hover:shadow-lg transition-all duration-300 group"
                  >
                    Learn More
                    <ArrowLeft className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>

              {/* Right Product Image */}
              <div className="relative">
                <div className="relative overflow-hidden rounded-lg shadow-soft">
                  {/* Animated glow effect behind image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-soft-blue/20 via-transparent to-accent-soft-blue/20 animate-pulse"></div>
                  
                  <img 
                    src={arcturusMainGithub} 
                    alt="Arcturus LED System"
                    className="w-full h-[500px] lg:h-[600px] object-contain bg-white relative z-10"
                  />
                  
                  {/* Subtle overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent z-20"></div>
                  
                  {/* Moving light beam effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] animate-[slide-in-right_3s_ease-in-out_infinite] z-30"></div>
                </div>
                
                {/* Floating feature highlight */}
                <div className="absolute -bottom-6 -left-6 bg-scandi-white p-6 rounded-lg shadow-soft border border-scandi-light-grey z-40">
                  <div className="text-sm text-scandi-grey font-light mb-1">IEEE P2020</div>
                  <div className="text-2xl font-medium text-light-foreground">Compatible</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Benefits */}
          <div id="benefits" className="bg-gray-100 py-16 scroll-mt-[260px]">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">Main Benefits of Arcturus</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-cyan-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Zap className="text-cyan-500" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Maximum Illuminance</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Up to 1 Mcd/m² - more than enough intensity to challenge even the most sensitive image sensors.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-cyan-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield className="text-cyan-500" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Flicker-Free</h3>
                  <p className="text-gray-600 leading-relaxed">
                    DC-driven LED technology ensures flicker-free operation for consistent, reliable testing results.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-cyan-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Eye className="text-cyan-500" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">High Stability</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Extremely high stability and consistency for reproducible test conditions and accurate measurements.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-cyan-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="text-cyan-500" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Real HDR Scenes</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Create real HDR scenes when combining with other Vega devices for comprehensive testing scenarios.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-cyan-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ArrowLeft className="text-cyan-500" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Vast Dynamic Range</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Change intensity over a vast dynamic range while maintaining constant spectrum characteristics.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-cyan-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Smartphone className="text-cyan-500" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Flexible Control</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Control via UI software, API, and Python scripts for Windows and Linux systems.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Video */}
        <section className="container mx-auto px-4 pb-20">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10">
            <h2 className="text-2xl font-semibold text-[#2D2D2D] mb-6 text-center">Arcturus in Action</h2>
            <div className="flex justify-center">
              <div className="w-full max-w-4xl">
                <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
                  <iframe
                    src="https://www.youtube.com/embed/DIqRMU7gGNw?start=1"
                    title="Arcturus LED System Product Video"
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
                <p className="text-center text-[#555] mt-4 text-sm">
                  Watch how Arcturus delivers maximum illuminance for challenging image sensor testing scenarios
                </p>
              </div>
            </div>
          </div>
        </section>

      {/* Use Case: Simulate Bright Sunlight */}
      <section className="container mx-auto px-4 pb-20">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10">
          <h2 className="text-2xl font-semibold text-[#2D2D2D] mb-6">Simulate Bright Sunlight - Use Case</h2>
          <p className="text-[#555] mb-6 leading-relaxed">
            Automotive-grade camera systems must be tested in numerous light environments, particularly those following the newly established <strong>IEEE-P2020</strong> standard. One of the more challenging scenarios to test for is how the camera system will perform in direct, bright sunlight, as this level of intensity is often difficult to generate in a test lab.
          </p>
          <p className="text-[#555] leading-relaxed">
            Arcturus can simulate the intensity of bright sunlight illumination with very high stability compared to other light sources. This ability allows camera systems to be evaluated in a test lab more efficiently.
          </p>
        </div>
      </section>

      {/* Detailed Specifications */}
      <section id="specifications" className="container mx-auto px-4 pb-20 scroll-mt-[240px]">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10">
          <h2 className="text-2xl font-semibold text-[#2D2D2D] mb-6">Detailed Specifications</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-[#2D2D2D]">Specification</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#2D2D2D]">Arcturus</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-[#555]">Principle</td>
                  <td className="py-3 px-4 text-[#555]">High-stability light source with a large field of view and based on iQ-LED technology</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-[#555]">Light source</td>
                  <td className="py-3 px-4 text-[#555]">36 temperature-controlled LEDs based on DC (direct current) technology</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-[#555]">Correlated color temperature (CCT)</td>
                  <td className="py-3 px-4 text-[#555]">Approx. 4900 K (± 200 K)</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-[#555]">Color rendering index (CRI)</td>
                  <td className="py-3 px-4 text-[#555]">≥ 95</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-[#555]">Maximum luminance</td>
                  <td className="py-3 px-4 text-[#555]">≥ 1Mcd/m²</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-[#555]">Dim function</td>
                  <td className="py-3 px-4 text-[#555]">Software based / 10⁶ - 10 steps</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-[#555]">Flicker frequency range</td>
                  <td className="py-3 px-4 text-[#555]">1 – 1000 Hz (Square), 10 – 1000 Hz (Sine / Triangle)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Software & Control */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-semibold text-[#2D2D2D] mb-4">Arcturus Software</h3>
            <p className="text-[#555] mb-4 leading-relaxed">
              Arcturus uses the same control software as our Vega light source. This software allows you to control up to seven devices (Arcturus + Vega) at one time.
            </p>
            <p className="text-[#555] leading-relaxed">
              APIs are also available (sold separately) for smooth integration into individual designs. We offer a C, C++, and Python API.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-semibold text-[#2D2D2D] mb-4">Evaluation Software</h3>
            <p className="text-[#555] mb-4 leading-relaxed">
              Similar to Vega, Arcturus uses the VLS-Evaluation software to analyze the camera's performance based on standards (IEEE-P2020) and KPIs.
            </p>
            <p className="text-[#555] leading-relaxed">
              Includes analysis for CTA, MMP/Flicker, and CSNR measurements for comprehensive image quality assessment.
            </p>
          </div>
        </div>
      </section>

      {/* Typical Applications */}
      <section id="applications" className="container mx-auto px-4 pb-20 scroll-mt-[320px]">
        <h2 className="text-2xl font-semibold text-[#2D2D2D] mb-8 text-center">Typical Applications</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-white border-gray-100 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-[#3D7BA2]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Car className="text-[#3D7BA2]" size={32} />
              </div>
              <CardTitle className="text-[#2D2D2D]">Automotive Testing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-[#555] text-center">
                IEEE-P2020 compliant testing for automotive camera systems, including bright sunlight simulation scenarios
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-100 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-[#3D7BA2]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="text-[#3D7BA2]" size={32} />
              </div>
              <CardTitle className="text-[#2D2D2D]">High-End Sensors</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-[#555] text-center">
                Testing at or close to sensor saturation with high dynamic range configurations and maximum intensity
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-100 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-[#3D7BA2]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-[#3D7BA2]" size={32} />
              </div>
              <CardTitle className="text-[#2D2D2D]">HDR Scene Creation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-[#555] text-center">
                Create real HDR scenes when combining with other Vega devices for comprehensive testing scenarios
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Product Image Gallery */}
      <section id="gallery" className="container mx-auto px-4 pb-20 scroll-mt-[310px]">
        <h2 className="text-2xl font-semibold text-[#2D2D2D] mb-12 text-center">Product Gallery</h2>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            
            {/* Left Side - Details */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#2D2D2D] mb-4">DETAILS</h3>
                <div className="w-12 h-1 bg-red-600 mb-6"></div>
                
                <div className="space-y-4 text-[#555] leading-relaxed">
                  <p>
                    The core of Arcturus technology is the high-power LED module, which generates 
                    more than enough intensity to challenge today's most sensitive image sensors. 
                    The system is driven by a high-stability, continuous-wave DC power supply 
                    within a temperature-controlled housing.
                  </p>
                  
                  <p>
                    The Arcturus LED System is designed to maximize illumination efficiency 
                    within a large field of view, ensuring the highest possible stability 
                    for automotive camera testing. It operates with flicker-free DC technology, 
                    allowing users to precisely control intensity over a vast dynamic range.
                  </p>
                  
                  <p>
                    Arcturus is best suited for testing high-end sensors that require 
                    maximum illuminance levels. It is particularly effective for measuring 
                    automotive camera systems according to IEEE-P2020 standards, while 
                    rapidly varying signals can be captured with precision timing control.
                  </p>
                  
                  <p className="font-medium text-[#2D2D2D]">
                    The illumination efficiency is typically up to 1 Mcd/m².
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right Side - Product Images */}
            <div className="space-y-6">
              {/* Main Product Image */}
              <div className="relative group cursor-pointer" onClick={() => setIsModalOpen(true)}>
                <div className="aspect-[4/3] bg-gray-50 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <img 
                    src={productImages[currentImageIndex].src} 
                    alt={productImages[currentImageIndex].title}
                    className="w-full h-full object-contain bg-white"
                  />
                  
                  {/* Expand Icon Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3 shadow-lg">
                      <Expand className="w-6 h-6 text-[#2D2D2D]" />
                    </div>
                  </div>
                  
                  {/* Navigation Arrows */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <ChevronLeft className="w-5 h-5 text-[#2D2D2D]" />
                  </button>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    <ChevronRight className="w-5 h-5 text-[#2D2D2D]" />
                  </button>
                </div>
              </div>
              
              {/* Thumbnail Navigation */}
              <div className="flex justify-center gap-3">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-[4/3] w-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      currentImageIndex === index 
                        ? 'border-[#3D7BA2] shadow-md' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={image.src} 
                      alt={image.title}
                      className="w-full h-full object-contain bg-white"
                    />
                    
                    {/* Video Play Button for Demo */}
                    {index === 1 && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="bg-white/90 rounded-full p-1">
                          <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                            <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent ml-0.5"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              {/* Image Description */}
              <div className="text-center">
                <h4 className="font-medium text-[#2D2D2D] mb-1">
                  {productImages[currentImageIndex].title}
                </h4>
                <p className="text-sm text-[#555]">
                  {productImages[currentImageIndex].description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal für Bildvergrößerung */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-7xl w-[95vw] h-[95vh] p-2 bg-black/95 border-none">
            <div className="relative w-full h-full flex items-center justify-center">
              <img 
                src={productImages[currentImageIndex].src} 
                alt={productImages[currentImageIndex].title}
                className="max-w-full max-h-full object-contain"
              />
              
              {/* Navigation in Modal */}
              <button 
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              
              <button 
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
              
              {/* Image Info in Modal */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-white">
                <h3 className="font-medium mb-1">{productImages[currentImageIndex].title}</h3>
                <p className="text-sm text-white/80">{productImages[currentImageIndex].description}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </section>

      {/* Automotive Laboratory Installation */}
      <section className="container mx-auto px-4 pb-20">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="aspect-video relative">
            <img 
              src={arcturusAutomotiveLab} 
              alt="Typical Arcturus installation in automotive camera testing laboratory"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-[#2D2D2D] mb-3">Professional Laboratory Installation</h3>
            <p className="text-[#555] leading-relaxed">
              Typical Arcturus installation in automotive camera testing laboratory, showing uniform illumination pattern across the test chart area with precise color reproduction capabilities. The setup demonstrates how Arcturus integrates seamlessly into existing test environments for IEEE-P2020 compliant automotive camera testing.
            </p>
          </div>
        </div>
      </section>

      {/* Related Downloads */}
      <section id="downloads" className="container mx-auto px-4 pb-20 scroll-mt-[260px]">
        <h2 className="text-2xl font-semibold text-[#2D2D2D] mb-8 text-center">Related Downloads</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="bg-white border-gray-100 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-[#3D7BA2]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-[#3D7BA2]" size={32} />
              </div>
              <CardTitle className="text-[#2D2D2D] text-lg">Arcturus Datenblatt (DE)</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-[#555] mb-4">
                Vollständiges deutsches Datenblatt mit technischen Spezifikationen
              </CardDescription>
              <Button 
                variant="outline" 
                className="border-[#3D7BA2] text-[#3D7BA2] hover:bg-[#3D7BA2] hover:text-white"
                onClick={() => window.open('https://raw.githubusercontent.com/stone1971grey/image-engeering/main/DE_Arcturus_Lightsource-Datenblatt.pdf')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-100 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-[#3D7BA2]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-[#3D7BA2]" size={32} />
              </div>
              <CardTitle className="text-[#2D2D2D] text-lg">Arcturus Datasheet (EN)</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-[#555] mb-4">
                Complete English datasheet with technical specifications
              </CardDescription>
              <Button 
                variant="outline" 
                className="border-[#3D7BA2] text-[#3D7BA2] hover:bg-[#3D7BA2] hover:text-white"
                onClick={() => window.open('https://raw.githubusercontent.com/stone1971grey/image-engeering/main/EN_Arcturus_Lightsource-Datasheet.pdf')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-100 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-[#3D7BA2]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-[#3D7BA2]" size={32} />
              </div>
              <CardTitle className="text-[#2D2D2D] text-lg">Controller Datenblatt (DE)</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-[#555] mb-4">
                Deutsches Datenblatt für Lightcube Controller Spezifikationen
              </CardDescription>
              <Button 
                variant="outline" 
                className="border-[#3D7BA2] text-[#3D7BA2] hover:bg-[#3D7BA2] hover:text-white"
                onClick={() => window.open('https://raw.githubusercontent.com/stone1971grey/image-engeering/main/DE_Lightcube-Controller-Datenblatt.pdf')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-100 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-[#3D7BA2]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="text-[#3D7BA2]" size={32} />
              </div>
              <CardTitle className="text-[#2D2D2D] text-lg">Controller Datasheet (EN)</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-[#555] mb-4">
                English datasheet for Lightcube Controller specifications
              </CardDescription>
              <Button 
                variant="outline" 
                className="border-[#3D7BA2] text-[#3D7BA2] hover:bg-[#3D7BA2] hover:text-white"
                onClick={() => window.open('https://raw.githubusercontent.com/stone1971grey/image-engeering/main/EN_Lightcube-Controller-Datasheet.pdf')}
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="bg-[#3D7BA2] rounded-xl text-white text-center p-12">
          <h2 className="text-3xl font-bold mb-4">Talk to Our Lighting Specialists</h2>
          <p className="text-xl mb-8 opacity-90">
            Get expert advice on configuring the Arcturus for your specific testing requirements.
          </p>
          <Button className="bg-white text-[#3D7BA2] hover:bg-gray-50 px-8 py-3 text-lg font-semibold">
            Schedule Consultation
          </Button>
        </div>
      </section>
      </div>
    </div>
  );
};

export default ProductArcturus;