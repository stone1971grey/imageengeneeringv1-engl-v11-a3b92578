import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, Download, FileText, BarChart3, Zap, Shield, Eye, Lightbulb, Monitor, ChevronLeft, ChevronRight, Expand, X, Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import ProductFAQ from "@/components/ProductFAQ";
import AnnouncementBanner from "@/components/AnnouncementBanner";

import le7Product from "@/assets/le7-product.png";
import arcturusRealisticLab from "@/assets/arcturus-realistic-lab.jpg";
import vcxLogo from "@/assets/vcx-logo.png";
import ieeeLogo from "@/assets/ieee-logo-standards.jpg";
import isoLogo from "@/assets/iso-standards-logo-banner.jpg";

const ProductLE7 = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const productImages = [
    {
      src: le7Product,
      title: "LE7 VIS-IR LED System",
      description: "Uniform lightbox using iQ-LED technology for transparent test chart illumination"
    },
    {
      src: arcturusRealisticLab,
      title: "Laboratory Setup",
      description: "Complete testing environment with LE7 integration"
    }
  ];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const faqData = [
    {
      question: "What spectral range does the LE7 cover?",
      answer: "The LE7 VIS-IR covers the visible and near-infrared spectrum from 380nm to 1050nm, making it ideal for automotive camera testing including NIR sensors used in in-cabin monitoring systems."
    },
    {
      question: "How uniform is the light distribution?",
      answer: "The LE7 provides exceptional uniformity across the entire illumination area, ensuring consistent test conditions for accurate spectral sensitivity measurements and color calibrations."
    },
    {
      question: "Is the LE7 compatible with existing test charts?",
      answer: "Yes, the LE7 is designed to work with transparent test charts including camSPECS plates optimized for NIR range measurements and various ISO and IEEE standard test charts."
    },
    {
      question: "What makes iQ-LED technology special?",
      answer: "iQ-LED technology allows you to generate custom spectra with precise control over wavelength and intensity, enabling comprehensive testing across the entire VIS-IR range."
    }
  ];

  // Schema markup for SEO
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": "LE7 VIS-IR LED System",
    "description": "A uniform lightbox using iQ-LED technology for transparent test chart illumination in the visible and near-infrared range (380-1050nm).",
    "brand": {
      "@type": "Brand",
      "name": "Image Engineering"
    },
    "category": "LED Lighting Systems",
    "offers": {
      "@type": "Offer",
      "availability": "https://schema.org/InStock",
      "priceCurrency": "EUR"
    }
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(productSchema);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      <Navigation />
      
      {/* Main content wrapper with top margin to clear fixed navigation */}
      <div className="pt-[140px]">
        {/* Quick Navigation */}
        <nav className="sticky top-[195px] z-30 bg-[#F7F9FB] py-4 border-b border-gray-100">
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
                    }}>Key Benefits</a>
                  <a href="#use-cases" className="text-[#3D7BA2] hover:text-[#3D7BA2]/80 font-medium transition-colors scroll-smooth"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('use-cases')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}>Use Cases</a>
                  <a href="#specifications" className="text-[#3D7BA2] hover:text-[#3D7BA2]/80 font-medium transition-colors scroll-smooth"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('specifications')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}>Specifications</a>
                  <a href="#faq" className="text-[#3D7BA2] hover:text-[#3D7BA2]/80 font-medium transition-colors scroll-smooth"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}>FAQ</a>
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
        <section id="overview" className="min-h-[60vh] bg-scandi-white font-roboto scroll-mt-[280px] relative overflow-hidden">
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
                          LE7
                        </h1>
                        
                        <h2 className="text-2xl lg:text-3xl font-light text-accent-soft-blue mb-6">
                          LE7-2x / LE7-4x / LE7-6x / LE7 VIS-IR / LE7-E
                        </h2>
                        
                        <p className="text-xl lg:text-2xl text-scandi-grey font-light leading-relaxed max-w-lg">
                          A uniform lightbox using iQ-LED technology for transparent test chart illumination.
                        </p>
                </div>
                
                <div className="pt-4">
                  <Button 
                    size="lg"
                    className="bg-[#74952a] hover:bg-[#5f7a22] text-white border-0 px-8 py-4 text-lg font-medium shadow-soft hover:shadow-lg transition-all duration-300 group"
                    onClick={() => {
                      const footer = document.querySelector('footer');
                      if (footer) {
                        footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                  >
                    Contact Sales
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>

              {/* Right Product Image */}
              <div className="relative">
                <div className="relative overflow-hidden rounded-lg shadow-soft">
                  {/* Animated glow effect behind image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-soft-blue/20 via-transparent to-accent-soft-blue/20 animate-pulse"></div>
                  
                  <img 
                    src={le7Product} 
                    alt="LE7 VIS-IR LED System"
                    className="w-full h-[500px] lg:h-[600px] object-contain bg-white relative z-10"
                  />
                  
                  {/* Subtle overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent z-20"></div>
                  
                  {/* Moving light beam effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] animate-[slide-in-right_3s_ease-in-out_infinite] z-30"></div>
                </div>
                
                {/* Floating feature highlight */}
                <div className="absolute -bottom-6 -left-6 bg-scandi-white p-6 rounded-lg shadow-soft border border-scandi-light-grey z-40">
                  <div className="text-sm text-scandi-grey font-light mb-1">Spectral Range</div>
                  <div className="text-2xl font-medium text-light-foreground">380-1050nm</div>
                </div>
              </div>
            </div>
          </div>
          
        </section>

        {/* Product Overview - Full Width Container */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Product Overview
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Advanced iQ-LED technology for precise camera testing
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                The LE7 is a uniform lightbox that uses iQ-LED technology to increase the effectiveness of image quality camera testing when using transparent test targets, including OECF and color targets.
              </p>
              <p>
                Light sources equipped with iQ-LED light modules can generate a custom spectrum to replicate various light sources in a camera test lab environment. As with our other iQ-LED products, the LE7 uses 20 LED channels to emulate almost any light spectrum from bright sunlight to darker lowlight.
              </p>
              <p>
                The LE7 contains two, four, or six iQ-LED modules* and is based on the principle of an integrating sphere to provide &gt; 97% uniformity of the active chart area.
              </p>
              <p>
                This product uses a mini-spectrometer with a spectral range of 350 – 860 to ensure better spectral resolution and higher sensitivity.
              </p>
              <p>
                iQ-LED control software is provided with the LE7. Version 3.2.0 and above gives you the capability to control individual modules. Controlling modules individually provides the opportunity for a more extensive intensity range.
              </p>
              <p>
                An iQ-LED API is also available as a separate option for integration into your design.
              </p>
              <p className="text-sm text-gray-500 italic">
                *Please note, we may be able to upgrade your existing LE7 V2 without having to order a whole new device (not guaranteed). Please contact our sales team for details.
              </p>
            </div>
          </div>
          
          {/* International Standards & Certifications Banner Section */}
          <section className="bg-gradient-to-r from-slate-800 to-slate-900 py-16">
            <div className="container mx-auto px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                    International Standards & Certifications
                  </h2>
                  <p className="text-xl text-slate-300 mb-8 max-w-3xl">
                    Our solutions are tested and validated according to globally recognized standards, including ISO (image quality, noise, low-light), IEEE-P2020, and VCX benchmarks for phone and webcam performance.
                  </p>
                  <div className="flex gap-4">
                    <Button 
                      size="lg"
                      className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 text-lg font-medium"
                    >
                      View Standards
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline"
                      className="border-slate-400 text-slate-300 hover:bg-slate-700 hover:text-white px-8 py-3 text-lg font-medium"
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="w-28 h-28 bg-white rounded-lg flex items-center justify-center p-3">
                      <img 
                        src={vcxLogo} 
                        alt="VCX Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="w-28 h-28 bg-white rounded-lg flex items-center justify-center p-3">
                      <img 
                        src={ieeeLogo} 
                        alt="IEEE Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="w-28 h-28 bg-white rounded-lg flex items-center justify-center p-3">
                      <img 
                        src={isoLogo} 
                        alt="ISO Standards Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Key Benefits */}
          <div id="benefits" className="bg-gradient-to-br from-gray-50 to-blue-50 py-16 scroll-mt-[280px]">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-gray-800 mb-12 text-center">Key Benefits of LE7</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-cyan-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Zap className="text-cyan-500" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Maximum Uniformity</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Exceptional light uniformity across the entire illumination area for consistent and reliable test results.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-cyan-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield className="text-cyan-500" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Flicker-Free</h3>
                  <p className="text-gray-600 leading-relaxed">
                    DC-powered LED technology ensures flicker-free operation for accurate spectral sensitivity measurements.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-cyan-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Eye className="text-cyan-500" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Wide Spectrum Range</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Covers both visible (380-700nm) and near-infrared (700-1050nm) ranges for comprehensive camera testing.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-cyan-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lightbulb className="text-cyan-500" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">True HDR Gammas</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Supports various HDR configurations and gamma settings for modern automotive camera systems.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-cyan-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Monitor className="text-cyan-500" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Flexible Control</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Precise software control for custom spectral compositions and intensity levels.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-cyan-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="text-cyan-500" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">High Stability</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Long-term stability and repeatability for consistent measurement conditions over time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section id="use-cases" className="py-20 bg-white scroll-mt-[280px]">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Use Cases with LE7
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Versatile applications for automotive and beyond
              </p>
            </div>

            <div className="space-y-16">
              {/* In-Cabin Monitoring */}
              <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">In-Cabin Monitoring - NIR Testing</h3>
                  <div className="text-gray-600 leading-relaxed space-y-4">
                    <p>
                      In-cabin monitoring systems rely heavily on near-infrared sensors combined with active NIR illumination to ensure accurate detection in low-light conditions. The LE7 VIS-IR provides the perfect testing environment for these systems.
                    </p>
                    <p>
                      With its ability to generate custom spectra in the NIR range (700-1050nm), the LE7 enables comprehensive testing of driver monitoring systems, passenger safety features, and gesture recognition cameras used in modern vehicles.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Spectral Sensitivity Measurements */}
              <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Spectral Sensitivity Measurements</h3>
                  <div className="text-gray-600 leading-relaxed space-y-4">
                    <p>
                      The LE7's iQ-LED technology allows precise control over spectral composition, making it ideal for measuring the spectral response characteristics of image sensors across the entire VIS-IR range.
                    </p>
                    <p>
                      This capability is essential for camera calibration, color accuracy validation, and ensuring consistent performance across different lighting conditions that automotive cameras may encounter.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Technical Specifications */}
        <section id="specifications" className="py-20 bg-gray-50 scroll-mt-[280px]">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Technical Specifications
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Detailed technical specifications and performance data
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Parameter</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Specification</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Spectral Range</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">380 - 1050 nm (VIS-IR)</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Light Technology</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">iQ-LED with custom spectral control</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Uniformity</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">&gt;95% across illumination area</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Control Interface</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">USB/Ethernet with software control</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Power Supply</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">DC powered, flicker-free operation</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Chart Compatibility</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Transparent charts, camSPECS plates</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-white scroll-mt-[280px]">
          <div className="container mx-auto px-6">
            <ProductFAQ 
              title="LE7 FAQ's"
              faqs={faqData}
              productName="LE7 VIS-IR"
            />
          </div>
        </section>

        {/* Related Downloads */}
        <section id="downloads" className="py-20 bg-gray-50 scroll-mt-[280px]">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Related Downloads
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Documentation and resources for the LE7 VIS-IR system
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">LE7 Datasheet</h3>
                  <p className="text-sm text-gray-600 mb-4">Technical specifications and performance data</p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    PDF Download
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                    <FileText className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">User Manual</h3>
                  <p className="text-sm text-gray-600 mb-4">Complete setup and operation guide</p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    PDF Download
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                    <FileText className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Note</h3>
                  <p className="text-sm text-gray-600 mb-4">NIR testing best practices and guidelines</p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    PDF Download
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                    <FileText className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Software Guide</h3>
                  <p className="text-sm text-gray-600 mb-4">Control software installation and usage</p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    PDF Download
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default ProductLE7;