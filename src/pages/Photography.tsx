import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, TestTube, Monitor, Play, Car, Lightbulb, Code, Shield, Zap, Eye, Brain, FileText, Download, BarChart3, Smartphone, Heart, CheckCircle } from "lucide-react";
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
import photographyHeroDefault from "@/assets/photography-hero-default.jpg";
import { supabase } from "@/integrations/supabase/client";

const iconMap: Record<string, any> = {
  FileText,
  Download,
  BarChart3,
  Zap,
  Shield,
  Eye,
  Car,
  Smartphone,
  Heart,
  CheckCircle,
  Lightbulb,
  Monitor,
};

interface Application {
  title: string;
  description: string;
  ctaLink: string;
  ctaStyle: string;
  ctaText: string;
  imageUrl: string;
  icon: string;
}

// Photography & Video landing page component
const Photography = () => {
  const [hoveredPoint, setHoveredPoint] = useState<string>("Live Processing");
  const [content, setContent] = useState<Record<string, string>>({});
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroImageUrl, setHeroImageUrl] = useState<string>("");
  const [heroImagePosition, setHeroImagePosition] = useState<string>("right");
  const [heroLayout, setHeroLayout] = useState<string>("2-5");
  const [heroTopPadding, setHeroTopPadding] = useState<string>("medium");
  const [heroCtaLink, setHeroCtaLink] = useState<string>("#applications-start");
  const [heroCtaStyle, setHeroCtaStyle] = useState<string>("standard");
  const [bannerTitle, setBannerTitle] = useState<string>("");
  const [bannerSubtext, setBannerSubtext] = useState<string>("");
  const [bannerImages, setBannerImages] = useState<any[]>([]);
  const [bannerButtonText, setBannerButtonText] = useState<string>("");
  const [bannerButtonLink, setBannerButtonLink] = useState<string>("");
  const [bannerButtonStyle, setBannerButtonStyle] = useState<string>("standard");
  const [solutionsTitle, setSolutionsTitle] = useState<string>("");
  const [solutionsLayout, setSolutionsLayout] = useState<string>("2-col"); // 1-col, 2-col, 3-col
  const [solutionsItems, setSolutionsItems] = useState<any[]>([]);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const { data, error } = await supabase
      .from("page_content")
      .select("*")
      .eq("page_slug", "photography");

    if (!error && data) {
      const contentMap: Record<string, string> = {};
      let apps: any[] = [];

      data.forEach((item: any) => {
        if (item.section_key === "applications_items") {
          apps = JSON.parse(item.content_value);
        } else if (item.section_key === "solutions_title") {
          setSolutionsTitle(item.content_value);
        } else if (item.section_key === "solutions_layout") {
          setSolutionsLayout(item.content_value || "2-col");
        } else if (item.section_key === "solutions_items") {
          setSolutionsItems(JSON.parse(item.content_value));
        } else if (item.section_key === "banner_images") {
          setBannerImages(JSON.parse(item.content_value));
        } else if (item.section_key === "banner_title") {
          setBannerTitle(item.content_value);
        } else if (item.section_key === "banner_subtext") {
          setBannerSubtext(item.content_value);
        } else if (item.section_key === "banner_button_text") {
          setBannerButtonText(item.content_value);
        } else if (item.section_key === "banner_button_link") {
          setBannerButtonLink(item.content_value);
        } else if (item.section_key === "banner_button_style") {
          setBannerButtonStyle(item.content_value || "standard");
        } else if (item.section_key === "hero_image_url") {
          setHeroImageUrl(item.content_value);
        } else if (item.section_key === "hero_image_position") {
          setHeroImagePosition(item.content_value || "right");
        } else if (item.section_key === "hero_layout") {
          setHeroLayout(item.content_value || "2-5");
        } else if (item.section_key === "hero_top_padding") {
          setHeroTopPadding(item.content_value || "medium");
        } else if (item.section_key === "hero_cta_link") {
          setHeroCtaLink(item.content_value || "#applications-start");
        } else if (item.section_key === "hero_cta_style") {
          setHeroCtaStyle(item.content_value || "standard");
        } else {
          contentMap[item.section_key] = item.content_value;
        }
      });

      setContent(contentMap);
      setApplications(apps);
    }
    setLoading(false);
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section id="introduction" className="min-h-[60vh] bg-white font-roboto relative overflow-hidden py-8">
        <div className={`container mx-auto px-6 pb-8 lg:pb-12 relative z-10 ${
          heroTopPadding === "small" ? "pt-16 lg:pt-16" :
          heroTopPadding === "medium" ? "pt-24 lg:pt-24" :
          heroTopPadding === "large" ? "pt-32 lg:pt-32" :
          heroTopPadding === "xlarge" ? "pt-40 lg:pt-40" :
          "pt-32 lg:pt-32"
        }`}>
          <div className={`grid gap-16 items-center ${
            heroLayout === "50-50" ? "lg:grid-cols-2" : 
            heroLayout === "2-3" ? "lg:grid-cols-5" :
            heroLayout === "1-2" ? "lg:grid-cols-3" :
            "lg:grid-cols-5"
          }`}>
            
            {/* Text Content */}
            <div className={`space-y-8 ${
              heroLayout === "50-50" ? "" :
              heroLayout === "2-3" ? "lg:col-span-2" :
              heroLayout === "1-2" ? "" :
              "lg:col-span-2"
            } ${heroImagePosition === "left" ? "order-2" : "order-1"}`}>
              <div>
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-light leading-[0.9] tracking-tight mb-6 text-black mt-8 md:mt-0">
                  {content.hero_title || "Photo & Video"}
                  <br />
                  <span className="font-medium text-black">{content.hero_subtitle || "Image Quality"}</span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-black font-light leading-relaxed max-w-lg">
                  {content.hero_description || "Precision-engineered camera system test solutions for professional photography and video production."}
                </p>
              </div>
              
              <div className="pt-4">
                {heroCtaLink.startsWith('http://') || heroCtaLink.startsWith('https://') ? (
                  <a 
                    href={heroCtaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button 
                      size="lg"
                      className={`border-0 px-8 py-4 text-lg font-medium shadow-soft hover:shadow-lg transition-all duration-300 group ${
                        heroCtaStyle === "technical" ? "text-white" : "text-black"
                      }`}
                      style={{ 
                        backgroundColor: heroCtaStyle === "technical" ? "#1f2937" : "#f9dc24"
                      }}
                    >
                      {content.hero_cta || "Discover Photography Solutions"}
                    </Button>
                  </a>
                ) : (
                  <Link to={heroCtaLink}>
                    <Button 
                      size="lg"
                      className={`border-0 px-8 py-4 text-lg font-medium shadow-soft hover:shadow-lg transition-all duration-300 group ${
                        heroCtaStyle === "technical" ? "text-white" : "text-black"
                      }`}
                      style={{ 
                        backgroundColor: heroCtaStyle === "technical" ? "#1f2937" : "#f9dc24"
                      }}
                    >
                      {content.hero_cta || "Discover Photography Solutions"}
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Image Content */}
            <div className={`relative px-6 ${
              heroLayout === "50-50" ? "" :
              heroLayout === "2-3" ? "lg:col-span-3" :
              heroLayout === "1-2" ? "lg:col-span-2" :
              "lg:col-span-3"
            } ${heroImagePosition === "left" ? "order-1" : "order-2"}`}>
              <div className="relative overflow-hidden rounded-lg shadow-soft">
                {heroImageUrl ? (
                  // Display uploaded custom image
                  <img 
                    src={heroImageUrl} 
                    alt="Photography testing laboratory" 
                    className="w-full h-[500px] object-cover"
                  />
                ) : (
                  // Display default generated image
                  <img 
                    src={photographyHeroDefault} 
                    alt="Photography testing laboratory" 
                    className="w-full h-[500px] object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Better anchor point for smooth scrolling */}
      <div id="applications-start" className="scroll-mt-32"></div>

      {/* Applications Overview */}
      <section id="applications" className="py-8 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {content.applications_title || "Main Applications"}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {content.applications_description || "Photography and video camera systems cover a broad spectrum of applications that contribute to image quality, color accuracy and overall performance."}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {applications.map((app: Application, index) => {
              const IconComponent = app.icon ? iconMap[app.icon] : null;
              
              return (
                 <div 
                   key={index}
                   className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col overflow-hidden group"
                 >
                   {/* Icon */}
                   {IconComponent && (
                     <div className="w-full flex justify-center pt-8">
                       <div className="relative">
                         <div className="w-20 h-20 bg-[#f9dc24]/10 rounded-full flex items-center justify-center border-2 border-[#f9dc24]/20 shadow-lg group-hover:shadow-xl group-hover:bg-[#f9dc24]/20 group-hover:border-[#f9dc24]/40 transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-105">
                           <IconComponent 
                             size={36} 
                             className="text-black group-hover:text-gray-900 group-hover:scale-125 transition-all duration-300" 
                             strokeWidth={1.8}
                           />
                         </div>
                         {/* Yellow Glow Effect */}
                         <div className="absolute inset-0 w-20 h-20 bg-[#f9dc24] rounded-full opacity-0 group-hover:opacity-15 transition-opacity duration-500 blur-xl" />
                       </div>
                     </div>
                   )}
                   
                   {/* Tile Image */}
                   {app.imageUrl && (
                     <div className={`w-full h-[200px] overflow-hidden ${IconComponent ? 'mt-4' : ''}`}>
                       <img 
                         src={app.imageUrl} 
                         alt={app.title} 
                         className="w-full h-full object-cover"
                       />
                     </div>
                   )}
                   
                   <div className={`p-8 flex flex-col items-center text-center flex-1 ${!IconComponent && !app.imageUrl ? 'pt-8' : ''}`}>
                     {/* Title */}
                     <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
                       {app.title}
                     </h3>
                     
                     {/* Description */}
                     <p className="text-base text-gray-600 leading-relaxed mb-6 flex-1">
                       {app.description}
                     </p>
                  
                   {/* CTA Button */}
                   {app.ctaLink ? (
                     app.ctaLink.startsWith('http://') || app.ctaLink.startsWith('https://') ? (
                       <a 
                         href={app.ctaLink}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="w-full"
                       >
                         <button
                           className="w-full px-4 py-2 rounded-md border-0 font-medium text-lg transition-opacity hover:opacity-90"
                           style={{
                             backgroundColor: app.ctaStyle === "technical" ? "#1f2937" : "#f9dc24",
                             color: app.ctaStyle === "technical" ? "#ffffff" : "#000000"
                           }}
                         >
                           {app.ctaText || "Learn More"}
                         </button>
                       </a>
                     ) : (
                       <Link to={app.ctaLink} className="w-full">
                         <button
                           className="w-full px-4 py-2 rounded-md border-0 font-medium text-lg transition-opacity hover:opacity-90"
                           style={{
                             backgroundColor: app.ctaStyle === "technical" ? "#1f2937" : "#f9dc24",
                             color: app.ctaStyle === "technical" ? "#ffffff" : "#000000"
                           }}
                         >
                           {app.ctaText || "Learn More"}
                         </button>
                       </Link>
                     )
                   ) : (
                     <button
                       className="w-full px-4 py-2 rounded-md border-0 font-medium text-lg transition-opacity hover:opacity-90"
                       style={{
                         backgroundColor: app.ctaStyle === "technical" ? "#1f2937" : "#f9dc24",
                         color: app.ctaStyle === "technical" ? "#ffffff" : "#000000"
                       }}
                     >
                       {app.ctaText || "Learn More"}
                     </button>
                     )}
                   </div>
                 </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* Banner Template Section */}
      <section id="standards" className="py-16" style={{ backgroundColor: '#f3f3f5' }}>
        <div className="container mx-auto px-6">
          {/* Title */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
            {bannerTitle || "Automotive International Standards"}
          </h2>
          
          {/* Optional Subtext */}
          {bannerSubtext && (
            <p className="text-lg text-gray-600 mb-12 text-center mx-auto" style={{ maxWidth: '600px' }}>
              {bannerSubtext}
            </p>
          )}
          
          {/* Images */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mb-12">
            {bannerImages.map((image: any, index: number) => (
              <div key={index} className="flex items-center justify-center h-24 w-40">
                <img 
                  src={image.url} 
                  alt={image.alt || `Banner image ${index + 1}`}
                  className="max-h-full max-w-full object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
            ))}
          </div>

          {/* Button */}
          {bannerButtonText && (
            <div className="flex justify-center">
              {bannerButtonLink ? (
                bannerButtonLink.startsWith('http://') || bannerButtonLink.startsWith('https://') ? (
                  <a 
                    href={bannerButtonLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button
                      className="px-8 py-4 text-lg font-medium rounded-md border-0 shadow-soft hover:shadow-lg transition-all duration-300"
                      style={{
                        backgroundColor: bannerButtonStyle === "technical" ? "#1f2937" : "#f9dc24",
                        color: bannerButtonStyle === "technical" ? "#ffffff" : "#000000"
                      }}
                    >
                      {bannerButtonText}
                    </button>
                  </a>
                ) : (
                  <Link to={bannerButtonLink}>
                    <button
                      className="px-8 py-4 text-lg font-medium rounded-md border-0 shadow-soft hover:shadow-lg transition-all duration-300"
                      style={{
                        backgroundColor: bannerButtonStyle === "technical" ? "#1f2937" : "#f9dc24",
                        color: bannerButtonStyle === "technical" ? "#ffffff" : "#000000"
                      }}
                    >
                      {bannerButtonText}
                    </button>
                  </Link>
                )
              ) : (
                <button
                  className="px-8 py-4 text-lg font-medium rounded-md border-0 shadow-soft hover:shadow-lg transition-all duration-300"
                  style={{
                    backgroundColor: bannerButtonStyle === "technical" ? "#1f2937" : "#f9dc24",
                    color: bannerButtonStyle === "technical" ? "#ffffff" : "#000000"
                  }}
                >
                  {bannerButtonText}
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Solutions Template Section */}
      <section className="py-20 bg-gray-50">
        <div className="w-full px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {solutionsTitle || "Automotive Camera Test Solutions"}
            </h2>
          </div>

          {/* Dynamic Grid Layout */}
          <div className={`grid gap-8 max-w-7xl mx-auto ${
            solutionsLayout === "1-col" ? "grid-cols-1" :
            solutionsLayout === "2-col" ? "grid-cols-1 md:grid-cols-2" :
            "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}>
            {solutionsItems.map((item: any, index: number) => (
              <Card key={index} className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardContent className="p-0">
                  {/* Optional Full-Width Image */}
                  {item.imageUrl && (
                    <div className="aspect-[4/3] bg-gray-900 overflow-hidden relative">
                      <img 
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {/* Content */}
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                    <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {item.description}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* Recommended Products */}
      <section id="products" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
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
                   className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col"
                 >
                 <CardContent className="p-0 flex flex-col flex-1">
                   <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                     <img 
                       src={product.image}
                       alt={product.title}
                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                     />
                      {(product.title === "Arcturus" || product.title === "LE7 VIS-IR") && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-[#f9dc24] text-black px-3 py-1 rounded-full text-sm font-bold">
                            ACTIVE
                          </span>
                        </div>
                      )}
                   </div>
                   <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 transition-colors group-hover:text-[#f9dc24]">
                        {product.title}
                      </h3>
                     <p className="text-lg text-gray-600 leading-relaxed mb-6 flex-1">
                       {product.description}
                     </p>
                     {product.link ? (
                       <Link to={product.link}>
                         <Button 
                           size="lg"
                           className="w-full text-black hover:opacity-90"
                           style={{ backgroundColor: '#f9dc24' }}
                         >
                            Learn More
                         </Button>
                       </Link>
                     ) : (
                       <Button 
                         size="lg"
                         className="w-full text-black hover:opacity-90"
                         style={{ backgroundColor: '#f9dc24' }}
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
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Automotive Camera Test Services</h3>
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

export default Photography;