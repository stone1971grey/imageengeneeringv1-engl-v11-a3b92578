import { Car, Stethoscope, Smartphone, Shield, Camera, Tv, Cog, ScanLine, FlaskConical, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const IndustrySection = () => {
  const [showAllIndustries, setShowAllIndustries] = useState(false);

  const industries = [
    {
      icon: Car,
      title: "Automotive & ADAS",
      description: "Camera systems in vehicles, driver assistance and autonomous driving",
      link: "/automotive#automotive-hero"
    },
    {
      icon: Stethoscope,
      title: "Medical / Endoscopy",
      description: "Image quality in medical imaging and diagnostic systems"
    },
    {
      icon: Smartphone,
      title: "Mobile Phones",
      description: "Image quality testing according to VCX standards"
    },
    {
      icon: Shield,
      title: "Security / Surveillance",
      description: "CCTV systems, video surveillance"
    }
  ];

  // Additional industries that show up when "Explore All Industries" is clicked
  const additionalIndustries = [
    {
      icon: Camera,
      title: "Photography",
      description: "Digital cameras for professional and amateur applications"
    },
    {
      icon: Tv,
      title: "Broadcast & HDTV",
      description: "Video transmission, TV cameras, color-accurate reproduction"
    },
    {
      icon: Cog,
      title: "Machine Vision",
      description: "Camera systems for inspection, robotics, quality control"
    },
    {
      icon: ScanLine,
      title: "Scanning & Archiving",
      description: "Quality assurance in digitization of documents, books, photos"
    },
    {
      icon: FlaskConical,
      title: "iQ‑Lab Testing",
      description: "Independent laboratory services for numerous industries (e.g. Mobile, Automotive)"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-green-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-100/30 via-indigo-100/20 to-[#74952a]/8"></div>
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-200/15 to-indigo-200/15 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-[#74952a]/8 to-green-100/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-indigo-100/10 to-blue-100/10 rounded-full blur-2xl"></div>
        <div className="absolute top-10 right-10 w-48 h-48 bg-gradient-to-br from-green-100/15 to-[#74952a]/5 rounded-full blur-2xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            We Serve Your{" "}
            <span className="text-[#74952a] relative">
              Industry
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#74952a] to-[#74952a]/60 rounded-full"></div>
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Leading organizations across various industries trust our precision solutions
          </p>
        </div>

        {/* Industry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {industries.map((industry, index) => {
            const IconComponent = industry.icon;
            const content = (
              <div
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in h-80 flex flex-col justify-between"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Icon container with animated background */}
                <div className="relative mb-6 flex-shrink-0">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#74952a] to-[#74952a]/80 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <IconComponent 
                      size={32} 
                      className="text-white group-hover:rotate-12 transition-transform duration-300" 
                    />
                  </div>
                  {/* Animated ring */}
                  <div className="absolute inset-0 w-20 h-20 mx-auto border-2 border-[#74952a]/20 rounded-xl animate-pulse"></div>
                </div>

                {/* Content */}
                <div className="text-center flex-grow flex flex-col justify-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#74952a] transition-colors duration-300">
                    {industry.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {industry.description}
                  </p>
                </div>

                {/* Hover effect gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#74952a]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            );

            return (
              <div key={industry.title}>
                {industry.link ? (
                  <Link to={industry.link}>
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </div>
            );
          })}
        </div>

        {/* Additional Industries - Expandable */}
        {showAllIndustries && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mt-8 animate-fade-in">
            {additionalIndustries.map((industry, index) => {
              const IconComponent = industry.icon;
              return (
                <div
                  key={industry.title}
                  className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-80 flex flex-col justify-between"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Icon container with animated background */}
                  <div className="relative mb-6 flex-shrink-0">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#74952a] to-[#74952a]/80 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <IconComponent 
                        size={32} 
                        className="text-white group-hover:rotate-12 transition-transform duration-300" 
                      />
                    </div>
                    {/* Animated ring */}
                    <div className="absolute inset-0 w-20 h-20 mx-auto border-2 border-[#74952a]/20 rounded-xl animate-pulse"></div>
                  </div>

                  {/* Content */}
                  <div className="text-center flex-grow flex flex-col justify-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#74952a] transition-colors duration-300">
                      {industry.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {industry.description}
                    </p>
                  </div>

                  {/* Hover effect gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#74952a]/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              );
            })}
          </div>
        )}

        {/* Call to action */}
        <div className="text-center mt-16">
          <Button
            variant="decision"
            size="lg"
            onClick={() => setShowAllIndustries(!showAllIndustries)}
            className="group"
          >
            <span>{showAllIndustries ? 'Show Less' : 'Explore All Industries'}</span>
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center ml-2 group-hover:translate-x-1 transition-transform duration-300">
              {showAllIndustries ? (
                <ChevronUp size={12} className="text-white" />
              ) : (
                <ChevronDown size={12} className="text-white" />
              )}
            </div>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default IndustrySection;