import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ArrowRight, Camera, TestTube, Monitor, Play } from "lucide-react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import ManufacturerSupplierShowcase from "@/components/ManufacturerSupplierShowcase";
import Footer from "@/components/Footer";
import automotiveLab from "@/assets/automotive-lab.jpg";
import manufacturersImage from "@/assets/manufacturers-image.png";
import suppliersImage from "@/assets/suppliers-image.png";

// Automotive landing page component
const Automotive = () => {
  const sections = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'applications', label: 'Use Cases' },
    { id: 'products', label: 'Products' },
    { id: 'contact', label: 'Contact' }
  ];

  const applications = [
    {
      title: "Camera Testing for ADAS Systems",
      description: "Comprehensive validation of driver assistance cameras for safety compliance",
      icon: Camera
    },
    {
      title: "High-End Sensor Testing",
      description: "Precision LED lighting for testing demanding sensor systems and components",
      icon: TestTube
    },
    {
      title: "HDR Scene Creation",
      description: "Advanced lighting control for creating High Dynamic Range test scenarios",
      icon: Monitor
    },
    {
      title: "Low-Light Performance Testing",
      description: "Critical validation for night driving and challenging lighting conditions",
      icon: Camera
    }
  ];

  const products = [
    {
      title: "Arcturus",
      description: "High-performance LED lighting for automotive testing, HDR scenes & high-end sensors",
      image: "/src/assets/arcturus-main-product.png",
      link: "/product/arcturus"
    },
    {
      title: "TE42-LL",
      description: "Low-light test chart for automotive camera validation",
      image: "/placeholder.svg"
    },
    {
      title: "camSPECS XL",
      description: "Spectral sensitivity measurement system",
      image: "/placeholder.svg"
    },
    {
      title: "iQ-Analyzer-X",
      description: "Image quality assessment software suite",
      image: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />
        <AnnouncementBanner 
        message="Automotive Vision Excellence"
        ctaText="Learn More"
        ctaLink="#"
        icon="calendar"
      />

      {/* Hero Section - starts immediately after navigation */}
      <section id="introduction" className="min-h-screen bg-scandi-white font-inter">
        {/* Navigation Spacer */}
        <div className="h-16"></div>
        
        {/* Hero Content */}
        <div id="hero-start" className="container mx-auto px-6 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
            
            {/* Left Content */}
            <div className="space-y-8 lg:pr-8">
              <div>
                <h1 id="automotive-hero" className="text-6xl lg:text-7xl xl:text-8xl font-light text-light-foreground leading-[0.9] tracking-tight mb-6 -mt-64 pt-64">
                  Image Quality
                  <br />
                  <span className="font-medium text-soft-blue">for the Road</span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-scandi-grey font-light leading-relaxed max-w-lg">
                  Precision-engineered camera testing solutions 
                  for vehicle safety and innovation.
                </p>
              </div>
              
              <div className="pt-4">
                <Button 
                  size="lg"
                  className="bg-soft-blue hover:bg-soft-blue/90 text-white border-0 px-8 py-4 text-lg font-medium shadow-soft hover:shadow-lg transition-all duration-300 group"
                >
                  Discover Automotive Solutions
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Minimal stats */}
              <div className="flex items-center space-x-12 pt-8">
                <div>
                  <div className="text-2xl font-medium text-light-foreground">99.9%</div>
                  <div className="text-sm text-scandi-grey font-light">Accuracy</div>
                </div>
                <div>
                  <div className="text-2xl font-medium text-light-foreground">50ms</div>
                  <div className="text-sm text-scandi-grey font-light">Response</div>
                </div>
                <div>
                  <div className="text-2xl font-medium text-light-foreground">100+</div>
                  <div className="text-sm text-scandi-grey font-light">Projects</div>
                </div>
              </div>
            </div>

            {/* Right Content - Video/Image */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-lg shadow-soft">
                <img 
                  src={automotiveLab}
                  alt="Automotive camera testing laboratory"
                  className="w-full h-[500px] lg:h-[600px] object-cover"
                />
                
                {/* Video overlay simulation */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                
                {/* Play button overlay for video feeling */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                    <Play className="h-6 w-6 text-white ml-1" fill="currentColor" />
                  </div>
                </div>
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

      {/* Applications Overview */}
      <section id="applications" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Main Applications
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Essential testing solutions for automotive camera systems
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {applications.map((app, index) => {
              const IconComponent = app.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
                >
                  <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center mb-6">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
                    {app.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {app.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* camPAS Testing Section */}
        <div className="container mx-auto px-6 mt-20">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100">
              <div className="text-center mb-12">
                <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  camPAS - Camera Performance for Automotive Systems
                </h3>
                <p className="text-xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
                  The camPAS (Camera Performance for Automotive Systems) test is a uniquely developed image quality performance test for camera image quality and sensor systems in the automotive industry. We offer camPAS for customers who need independent and objective test results from a neutral third party to support their development decisions.
                </p>
              </div>

              <div className="mb-12">
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Current working groups, e.g. <a href="https://sagroups.ieee.org/2020/" className="text-blue-600 hover:underline">IEEE-P2020</a>, are working on an internationally recognized image quality testing standard for automotive camera systems. The publication of IEEE-P2020 is expected by the end of 2024. Currently, there are no industry-wide testing standards. The development of the camPAS test arose from supporting our customers in finding and creating test methods that deliver unbiased results. As an active member of IEEE-P2020, we can directly implement the latest automotive camera testing methods and procedures from the standard to keep camPAS relevant and current.
                </p>
              </div>

              {/* Interactive Manufacturer/Supplier Showcase */}
              <ManufacturerSupplierShowcase />

              {/* What tests are included */}
              <div className="bg-blue-50 rounded-2xl p-8">
                <h4 className="text-2xl font-bold text-gray-900 mb-6">What tests are included in camPAS?</h4>
                <p className="text-gray-700 leading-relaxed mb-6">
                  The difference between a camPAS test and a standard test method is the ability to fully customize the camPAS test to customer specifications. We evaluate camera systems based on various image quality KPIs or use tests to analyze sensor smoothness or error susceptibility.
                </p>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Some of the most common image quality KPIs we test include Contrast Transfer Accuracy (CTA), Modulated Light Reduction Probability (Flicker), High Dynamic Range (HDR), visual assessment of low-light performance, etc. These tests are performed using the latest techniques (as described in IEEE-P2020) and equipment to ensure the highest results.
                </p>
                <p className="text-gray-700 leading-relaxed mb-8">
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
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mt-12">
                <h4 className="text-2xl font-bold text-gray-900 mb-6">IEEE-P2020 Product Package</h4>
                
                <p className="text-gray-700 leading-relaxed mb-6">
                  <a href="https://sagroups.ieee.org/2020/" className="text-blue-600 hover:underline">IEEE-P2020</a> establishes an internationally recognized standard for automotive and ADAS applications. This standard addresses the fundamental KPIs that contribute to the image quality of automotive camera systems. Unlike most camera industries, automotive and ADAS applications are unique because they directly affect consumer safety.
                </p>

                <p className="text-gray-700 leading-relaxed mb-6">
                  During the development of the standard, it became clear that new metrics must be established to account for the unique environments in which autonomous driving systems must operate. Direct sunlight, dense fog, low light, flickering lights and heavy pedestrian traffic are just some of the environments in which ADAS systems operate. The new KPIs to address these testing challenges include Contrast Transfer Accuracy (CTA), Modulated Light Reduction Probability (MMP - Flicker), Contrast Signal-to-Noise Ratio (CSNR) and High Dynamic Range (HDR), among others.
                </p>

                <p className="text-gray-700 leading-relaxed mb-8">
                  These KPIs require new testing methods and equipment. We have developed many of our newer camera testing devices based on the testing procedures described in the standard and offer a product package for those who want to start with IEEE-P2020 measurements today.
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Vega Light Source */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h5 className="text-lg font-bold text-gray-900 mb-3">Vega High-Intensity Light Source</h5>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      A high-intensity light source based on DC technology with extremely high stability for measuring cameras with very short exposure times.
                    </p>
                  </div>

                  {/* TE294 Test Chart */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h5 className="text-lg font-bold text-gray-900 mb-3">Vega Test Chart (TE294)</h5>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      A unique grayscale test chart with 36 fields and 10:1 contrast for high-precision measurements of automotive camera systems.
                    </p>
                  </div>

                  {/* VLS Software */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h5 className="text-lg font-bold text-gray-900 mb-3">VLS Software</h5>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Evaluation software that supports CTA, MMP and CSNR measurements and evaluations for versatile lighting system testing.
                    </p>
                  </div>

                  {/* Vega API */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h5 className="text-lg font-bold text-gray-900 mb-3">Vega API</h5>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Flexible workflows with C++-based API that provides C interfaces and Python example scripts for complete integration flexibility.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-6">
                  <p className="text-sm text-gray-700 mb-4">
                    <strong>Important Note:</strong> This package includes one Vega device, one controller and one test chart. Additional Vega devices and charts can be purchased separately (one controller can control up to seven Vega devices).
                  </p>
                  <div className="text-center">
                    <Button 
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                    >
                      Contact Sales for IEEE-P2020 Package
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Products */}
      <section id="products" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Recommended Products
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Industry-leading tools for automotive camera testing
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {products.map((product, index) => (
              <Card 
                key={index}
                className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                    <img 
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {product.description}
                    </p>
                    {product.link ? (
                      <Link to={product.link}>
                        <Button 
                          variant="outline" 
                          className="w-full border-gray-200 hover:border-blue-600 hover:text-blue-600"
                        >
                          Learn More
                        </Button>
                      </Link>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full border-gray-200 hover:border-blue-600 hover:text-blue-600"
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

      {/* Quote/Testimonial Block */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <blockquote className="text-2xl md:text-3xl font-light text-gray-900 italic mb-8 leading-relaxed">
              "Trusted by OEMs and Tier-1 suppliers worldwide"
            </blockquote>
            <div className="flex items-center justify-center space-x-8 text-gray-600">
              <span className="font-medium">BMW</span>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <span className="font-medium">Bosch</span>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <span className="font-medium">Continental</span>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <span className="font-medium">Aptiv</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Automotive;