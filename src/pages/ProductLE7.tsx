import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Download, FileText, BarChart3, Zap, Shield, Eye, Lightbulb, Monitor, ChevronLeft, ChevronRight, Expand, X, Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import ProductFAQ from "@/components/ProductFAQ";
import AnnouncementBanner from "@/components/AnnouncementBanner";

import le7Product from "@/assets/le7-product.png";
import arcturusRealisticLab from "@/assets/arcturus-realistic-lab.jpg";
import le7SupportReal from "@/assets/le7-support-real.png";
import le7IntroductionReal from "@/assets/le7-introduction-real.png";
import le7VideoThumbnail from "@/assets/le7-video-thumbnail.jpg";
import vcxLogo from "@/assets/vcx-logo.png";
import ieeeLogo from "@/assets/ieee-logo-standards.jpg";
import isoLogo from "@/assets/iso-standards-logo-banner.jpg";

const ProductLE7 = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const productImages = [
    {
      src: le7Product,
      title: "",
      description: ""
    },
    {
      src: le7IntroductionReal,
      title: "",
      description: ""
    },
    {
      src: le7SupportReal,
      title: "",
      description: ""
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
      question: "Can I use the LE7 also in other positions, for example, with the output window facing downwards?",
      answer: "Yes, the LE7 can also be operated lying down or on the side, but you should then make sure that the side with the housing fan is on top or at least is not blocked."
    },
    {
      question: "How do you measure the uniformity of LE7?",
      answer: "For the Uniformity measurement, our TE291 test chart is applied. In each quadrant of the TE291, the luminance is measured with a Class L luminance meter. The uniformity is then calculated as: Uniformity = Lmin/Lmax"
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
                  </Button>
                </div>
              </div>

              {/* Right Product Image Gallery */}
              <div className="relative">
                <div className="relative overflow-hidden rounded-lg shadow-soft group cursor-pointer" onClick={() => setIsModalOpen(true)}>
                  {/* Animated glow effect behind image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-soft-blue/20 via-transparent to-accent-soft-blue/20 animate-pulse"></div>
                  
                  <img 
                    src={productImages[currentImageIndex].src} 
                    alt={productImages[currentImageIndex].title}
                    className="w-full h-[500px] lg:h-[600px] object-contain bg-white relative z-10 transition-all duration-300"
                  />
                  
                  {/* Subtle overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent z-20"></div>
                  
                  {/* Moving light beam effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] animate-[slide-in-right_3s_ease-in-out_infinite] z-30"></div>
                  
                  {/* Expand Icon Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center z-40">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3 shadow-lg">
                      <Expand className="w-6 h-6 text-light-foreground" />
                    </div>
                  </div>
                </div>
                
                {/* Thumbnail Navigation */}
                <div className="flex justify-center gap-3 mt-4">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative aspect-[4/3] w-16 lg:w-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        currentImageIndex === index 
                          ? 'border-accent-soft-blue shadow-md' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img 
                        src={image.src} 
                        alt={image.title}
                        className="w-full h-full object-contain bg-white"
                      />
                    </button>
                  ))}
                </div>
                
                {/* Image Description */}
                <div className="text-center mt-4">
                  {productImages[currentImageIndex].title && (
                    <h4 className="font-medium text-light-foreground mb-1 text-sm lg:text-base">
                      {productImages[currentImageIndex].title}
                    </h4>
                  )}
                  {productImages[currentImageIndex].description && (
                    <p className="text-xs lg:text-sm text-scandi-grey">
                      {productImages[currentImageIndex].description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Description Section - Wide Container Style */}
          <div className="bg-gray-50 py-16">
            <div className="container mx-auto px-6">
              <Card className="bg-white border-gray-200 shadow-lg">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Product Overview</h3>
                  <div className="text-gray-600 leading-relaxed space-y-4">
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
                </CardContent>
              </Card>
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
                  <h3 className="text-xl font-bold text-gray-800 mb-4">iQ-LED Light Source</h3>
                  <p className="text-gray-600 leading-relaxed">
                    The LE7 is a uniform lightbox that uses iQ-LED technology to generate custom spectra for more accurate and flexible camera testing.
                  </p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Multiple Variants</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Choose from variants that include 2x, 4x, or 6x iQ-LED modules. Using more modules increases your minimum and maximum illumination values.
                  </p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Spectral Range</h3>
                  <p className="text-gray-600 leading-relaxed">
                    The LE7 has a spectral range of 380-820 nm and a range of 380-1050 nm for the LE7 VIS-IR variant. A mini spectrometer is delivered with the product. <span className="text-sm">**An LE7 Basic variant is available for delivery without a spectrometer to reduce costs if desired. Up to 40 preconfigured illuminants based on your requirements will be programmed into the LE7 before delivery.</span>
                  </p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">NIR Testing</h3>
                  <p className="text-gray-600 leading-relaxed">
                    The LE7 VIS-IR variant uses two standard iQ-LED modules and four iQ-LED IR modules that expand the spectral range for camera testing in the near-infrared (NIR) range.
                  </p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Extended Dynamic Range</h3>
                  <p className="text-gray-600 leading-relaxed">
                    The LE7-E variant can create a dynamic range of up to 1:100.00 to expand testing in low-light scenarios.
                  </p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Color Calibrations</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Using the LE7 with the TE292 camSPECS plate test chart allows you to perform camera color calibrations using the power of iQ-LED technology to increase accuracy.
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

            <div className="max-w-7xl mx-auto">
              <div className="bg-gray-50 rounded-xl overflow-hidden shadow-soft">
                <div className="overflow-x-auto">
                  {/* Header */}
                  <div className="grid grid-cols-6 bg-gradient-to-r from-[#577eb4] to-[#4a6b9a] text-white min-w-[800px]">
                    <div className="p-4 text-center font-semibold text-lg">
                      Criterion
                    </div>
                    <div className="p-4 text-center font-semibold text-lg border-l border-[#4a6b9a]">
                      LE7-2x
                    </div>
                    <div className="p-4 text-center font-semibold text-lg border-l border-[#4a6b9a]">
                      LE7-4x
                    </div>
                    <div className="p-4 text-center font-semibold text-lg border-l border-[#4a6b9a]">
                      LE7-6x
                    </div>
                    <div className="p-4 text-center font-semibold text-lg border-l border-[#4a6b9a]">
                      LE7 VIS-IR
                    </div>
                    <div className="p-4 text-center font-semibold text-lg border-l border-[#4a6b9a]">
                      LE7-E
                    </div>
                  </div>
                  
                  {/* Specification Rows */}
                  <div className="divide-y divide-gray-200">
                    {/* Light Sources */}
                    <div className="grid grid-cols-6 bg-white min-w-[800px]">
                      <div className="p-6 font-medium text-gray-900 border-r border-gray-200">
                        Light Sources
                      </div>
                      <div className="p-6 border-r border-gray-200">
                        <span className="text-gray-800">2x iQ-LED</span>
                      </div>
                      <div className="p-6 border-r border-gray-200">
                        <span className="text-gray-800">4x iQ-LED</span>
                      </div>
                      <div className="p-6 border-r border-gray-200">
                        <span className="text-gray-800">6x iQ-LED</span>
                      </div>
                      <div className="p-6 border-r border-gray-200">
                        <span className="text-gray-800">2x iQ-LED / 4x iQ-LED VIS-IR</span>
                      </div>
                      <div className="p-6">
                        <span className="text-gray-800">5x iQ-LED / 1x iQ-LED + 1.9 ND filter</span>
                      </div>
                    </div>

                    {/* Intensity */}
                    <div className="grid grid-cols-6 bg-gray-50 min-w-[800px]">
                      <div className="p-6 font-medium text-gray-900 border-r border-gray-200">
                        Intensity
                      </div>
                      <div className="p-6 border-r border-gray-200">
                        <span className="text-gray-800 text-sm leading-relaxed">Controlled via 4000 steps per channel and 32 kHz PWM (switchable to 1000 steps with 128 kHz)</span>
                      </div>
                      <div className="p-6 border-r border-gray-200">
                        <span className="text-gray-800 text-sm leading-relaxed">Controlled via 4000 steps per channel and 32 kHz PWM (switchable to 1000 steps with 128 kHz)</span>
                      </div>
                      <div className="p-6 border-r border-gray-200">
                        <span className="text-gray-800 text-sm leading-relaxed">Controlled via 4000 steps per channel and 32 kHz PWM (switchable to 1000 steps with 128 kHz)</span>
                      </div>
                      <div className="p-6 border-r border-gray-200">
                        <span className="text-gray-800 text-sm leading-relaxed">Controlled via 4000 steps per channel and 32 kHz PWM (switchable to 1000 steps with 128 kHz)</span>
                      </div>
                      <div className="p-6">
                        <span className="text-gray-800 text-sm leading-relaxed">Controlled via 4000 steps per channel and 32 kHz PWM (switchable to 1000 steps with 128 kHz)</span>
                      </div>
                    </div>

                    {/* Spectral Range */}
                    <div className="grid grid-cols-6 bg-white min-w-[800px]">
                      <div className="p-6 font-medium text-gray-900 border-r border-gray-200">
                        Spectral Range
                      </div>
                      <div className="p-6 border-r border-gray-200">
                        <span className="text-gray-800">380-820 nm</span>
                      </div>
                      <div className="p-6 border-r border-gray-200">
                        <span className="text-gray-800">380-820 nm</span>
                      </div>
                      <div className="p-6 border-r border-gray-200">
                        <span className="text-gray-800">380-820 nm</span>
                      </div>
                      <div className="p-6 border-r border-gray-200">
                        <span className="text-gray-800">380-1050 nm</span>
                      </div>
                      <div className="p-6">
                        <span className="text-gray-800">380-820 nm</span>
                      </div>
                    </div>

                    {/* Uniformity */}
                    <div className="grid grid-cols-6 bg-gray-50 min-w-[800px]">
                      <div className="p-6 font-medium text-gray-900 border-r border-gray-200">
                        Uniformity
                      </div>
                      <div className="p-6 border-r border-gray-200">
                        <span className="text-gray-800 text-sm leading-relaxed">97% for active chart area, 280 x 157.5 mm / 96% for full output window, 290 x 220 mm</span>
                      </div>
                      <div className="p-6 border-r border-gray-200">
                        <span className="text-gray-800 text-sm leading-relaxed">97% for active chart area, 280 x 157.5 mm / 96% for full output window</span>
                      </div>
                      <div className="p-6 border-r border-gray-200">
                        <span className="text-gray-800 text-sm leading-relaxed">97% for active chart area, 280 x 157.5 mm / 96% for full output window</span>
                      </div>
                      <div className="p-6 border-r border-gray-200">
                        <span className="text-gray-800 text-sm leading-relaxed">97% for active chart area, 280 x 157.5 mm / 96% for full output window</span>
                      </div>
                      <div className="p-6">
                        <span className="text-gray-800 text-sm leading-relaxed">97% for active chart area, 280 x 157.5 mm / 96% for full output window</span>
                      </div>
                    </div>

                    {/* Max/Min Illumination values */}
                    <div className="grid grid-cols-6 bg-white min-w-[800px]">
                      <div className="p-6 font-medium text-gray-900 border-r border-gray-200">
                        Max/Min Illumination values
                      </div>
                      <div className="p-6 border-r border-gray-200">
                        <span className="text-gray-800">25 – 8000 lx</span>
                      </div>
                      <div className="p-6 border-r border-gray-200">
                        <span className="text-gray-800">100 – 16,000 lx</span>
                      </div>
                      <div className="p-6 border-r border-gray-200">
                        <span className="text-gray-800">25 – 24,000 lx</span>
                      </div>
                      <div className="p-6 border-r border-gray-200">
                        <span className="text-gray-800">25 – 8000 lx</span>
                      </div>
                      <div className="p-6">
                        <span className="text-gray-800">0.25 – 20,000 lx</span>
                      </div>
                    </div>
                  </div>
                </div>
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
              <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col h-full">
                <CardContent className="p-6 text-center flex-1 flex flex-col">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors" style={{backgroundColor: '#ebf2f5'}}>
                    <FileText className="w-10 h-10" style={{color: '#3e7da1'}} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">LE7 Datasheet</h3>
                  <p className="text-sm text-gray-600 mb-6 flex-1">Technical specifications and performance data</p>
                  <Button variant="outline" size="sm" className="w-full mt-auto">
                    <Download className="w-4 h-4 mr-2" />
                    PDF Download
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col h-full">
                <CardContent className="p-6 text-center flex-1 flex flex-col">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors" style={{backgroundColor: '#ebf2f5'}}>
                    <FileText className="w-10 h-10" style={{color: '#3e7da1'}} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">User Manual</h3>
                  <p className="text-sm text-gray-600 mb-6 flex-1">Complete setup and operation guide</p>
                  <Button variant="outline" size="sm" className="w-full mt-auto">
                    <Download className="w-4 h-4 mr-2" />
                    PDF Download
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col h-full">
                <CardContent className="p-6 text-center flex-1 flex flex-col">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors" style={{backgroundColor: '#ebf2f5'}}>
                    <FileText className="w-10 h-10" style={{color: '#3e7da1'}} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Application Note</h3>
                  <p className="text-sm text-gray-600 mb-6 flex-1">NIR testing best practices and guidelines</p>
                  <Button variant="outline" size="sm" className="w-full mt-auto">
                    <Download className="w-4 h-4 mr-2" />
                    PDF Download
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col h-full">
                <CardContent className="p-6 text-center flex-1 flex flex-col">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors" style={{backgroundColor: '#ebf2f5'}}>
                    <FileText className="w-10 h-10" style={{color: '#3e7da1'}} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Software Guide</h3>
                  <p className="text-sm text-gray-600 mb-6 flex-1">Control software installation and usage</p>
                  <Button variant="outline" size="sm" className="w-full mt-auto">
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
      
      {/* Image Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-full p-0 bg-white">
          <div className="relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-50 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="relative group">
              <img 
                src={productImages[currentImageIndex].src} 
                alt={productImages[currentImageIndex].title}
                className="w-full max-h-[80vh] object-contain bg-white"
              />
              
              {/* Navigation Arrows */}
              <button 
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              
              <button 
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6 text-center">
              {productImages[currentImageIndex].title && (
                <h4 className="font-semibold text-lg text-gray-900 mb-2">
                  {productImages[currentImageIndex].title}
                </h4>
              )}
              {productImages[currentImageIndex].description && (
                <p className="text-gray-600">
                  {productImages[currentImageIndex].description}
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductLE7;