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
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 id="trusted-industries" className="text-4xl md:text-5xl font-bold text-light-foreground mb-6 tracking-tight scroll-mt-32">
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
                {/* Icon Circle - Image Engineering grün */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-[#7a933b]/10 rounded-full flex items-center justify-center border-2 border-[#7a933b]/20 shadow-lg hover:shadow-xl hover:bg-[#7a933b] hover:border-[#7a933b] transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-105 cursor-pointer">
                    <IconComponent 
                      size={28} 
                      className="text-[#7a933b] group-hover:scale-125 transition-all duration-300" 
                      strokeWidth={1.8}
                    />
                  </div>
                  
                  {/* Image Engineering grün Glow-Effekt */}
                  <div className="absolute inset-0 w-20 h-20 md:w-24 md:h-24 bg-[#7a933b] rounded-full opacity-0 hover:opacity-20 transition-opacity duration-500 blur-xl" />
                </div>

                {/* Text Content - warme Farbtöne */}
                <div className="text-center space-y-1">
                  <h3 className="font-medium text-light-foreground text-base md:text-lg tracking-wide">
                    {industry.name}
                  </h3>
                  <p className="text-base text-light-muted font-light max-w-[160px] leading-relaxed">
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