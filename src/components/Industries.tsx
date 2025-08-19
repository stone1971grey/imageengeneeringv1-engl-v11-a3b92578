import { 
  Camera, 
  Smartphone, 
  Car, 
  Tv, 
  Shield, 
  Cog, 
  Stethoscope, 
  ScanLine, 
  FlaskConical 
} from "lucide-react";
import { Link } from "react-router-dom";

const Industries = () => {
  const industries = [
    {
      icon: Camera,
      name: "Photography",
      description: "Digital cameras for professional and amateur applications"
    },
    {
      icon: Smartphone,
      name: "Mobile Phones",
      description: "Image quality testing according to VCX standards"
    },
    {
      icon: Car,
      name: "Automotive & ADAS",
      description: "Camera systems in vehicles, driver assistance and autonomous driving",
      link: "/automotive"
    },
    {
      icon: Tv,
      name: "Broadcast & HDTV",
      description: "Video transmission, TV cameras, color-accurate reproduction"
    },
    {
      icon: Shield,
      name: "Security / Surveillance",
      description: "CCTV systems, video surveillance"
    },
    {
      icon: Cog,
      name: "Machine Vision",
      description: "Camera systems for inspection, robotics, quality control"
    },
    {
      icon: Stethoscope,
      name: "Medical / Endoscopy",
      description: "Image quality in medical imaging and diagnostic systems"
    },
    {
      icon: ScanLine,
      name: "Scanning & Archiving",
      description: "Quality assurance in digitization of documents, books, photos"
    },
    {
      icon: FlaskConical,
      name: "iQ‑Lab Testing",
      description: "Independent laboratory services for numerous industries (e.g. Mobile, Automotive)"
    }
  ];

  return (
    <section className="py-32 bg-slate-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-light-foreground mb-6 tracking-tight">
            Trusted Across All Industries
          </h2>
          <p className="text-xl text-light-muted max-w-2xl mx-auto font-light">
            Our advanced image processing solutions drive innovation 
            across various sectors worldwide.
          </p>
        </div>

        {/* Industry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
          {industries.map((industry, index) => {
            const IconComponent = industry.icon;
            const content = (
              <div
                className="group flex flex-col items-center"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: 'slide-in-up 0.6s ease-out both'
                }}
              >
                {/* Icon Circle - deutlich hervorgehobene Farben */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-[#3D7BA2]/10 rounded-full flex items-center justify-center border-2 border-[#3D7BA2]/20 shadow-lg hover:shadow-xl hover:bg-[#3D7BA2] hover:border-[#3D7BA2] transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-105 cursor-pointer">
                    <IconComponent 
                      size={28} 
                      className="text-[#3D7BA2] hover:text-white transition-colors duration-300 group-hover:text-white" 
                      strokeWidth={1.8}
                    />
                  </div>
                  
                  {/* Deutlicher Glow-Effekt */}
                  <div className="absolute inset-0 w-20 h-20 md:w-24 md:h-24 bg-[#3D7BA2] rounded-full opacity-0 hover:opacity-20 transition-opacity duration-500 blur-xl" />
                </div>

                {/* Text Content - warme Farbtöne */}
                <div className="text-center space-y-1">
                  <h3 className="font-medium text-light-foreground text-sm md:text-base tracking-wide">
                    {industry.name}
                  </h3>
                  <p className="text-xs md:text-sm text-light-muted font-light max-w-[140px] leading-relaxed">
                    {industry.description}
                  </p>
                </div>
              </div>
            );

            return (
              <div key={index}>
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
      </div>
    </section>
  );
};

export default Industries;