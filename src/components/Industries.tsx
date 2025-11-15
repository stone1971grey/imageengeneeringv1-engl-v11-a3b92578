import { 
  Camera, 
  Smartphone, 
  Car, 
  Tv, 
  Shield, 
  Cog, 
  Stethoscope, 
  ScanLine
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";

const Industries = () => {
  const { t } = useTranslation();
  const industries = [
    {
      icon: Camera,
      name: t.industries.photo.title,
      description: t.industries.photo.description
    },
    {
      icon: Smartphone,
      name: t.industries.mobile.title,
      description: t.industries.mobile.description
    },
    {
      icon: Car,
      name: t.industries.automotive.title,
      description: t.industries.automotive.description,
      link: "/automotive"
    },
    {
      icon: Tv,
      name: "Broadcast & HDTV",
      description: "Video transmission, TV cameras, color-accurate reproduction"
    },
    {
      icon: Shield,
      name: t.industries.security.title,
      description: t.industries.security.description
    },
    {
      icon: Cog,
      name: t.industries.machineVision.title,
      description: t.industries.machineVision.description
    },
    {
      icon: Stethoscope,
      name: t.industries.medical.title,
      description: t.industries.medical.description
    },
    {
      icon: ScanLine,
      name: t.industries.scanners.title,
      description: t.industries.scanners.description
    }
  ];

  return (
    <section className="pt-12 pb-20 bg-slate-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 id="trusted-industries" className="text-4xl md:text-5xl font-bold text-light-foreground mb-6 tracking-tight scroll-mt-48">
            {t.industries.title}
          </h2>
          <p className="text-xl text-light-muted max-w-2xl mx-auto font-light">
            {t.industries.subtitle}
          </p>
        </div>

        {/* Industry Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-6xl mx-auto">
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
                {/* Icon Circle - Yellow Styling */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-[#f9dc24]/10 rounded-full flex items-center justify-center border-2 border-[#f9dc24]/20 shadow-lg hover:shadow-xl hover:bg-[#f9dc24]/20 hover:border-[#f9dc24]/40 transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-105 cursor-pointer">
                    <IconComponent 
                      size={36} 
                      className="text-black group-hover:text-gray-900 group-hover:scale-125 transition-all duration-300" 
                      strokeWidth={1.8}
                    />
                  </div>
                  
                  {/* Yellow Glow-Effekt */}
                  <div className="absolute inset-0 w-20 h-20 md:w-24 md:h-24 bg-[#f9dc24] rounded-full opacity-0 hover:opacity-15 transition-opacity duration-500 blur-xl" />
                </div>

                {/* Text Content - warme Farbtöne */}
                <div className="text-center space-y-1">
                  <h3 className="font-medium text-light-foreground text-lg md:text-xl tracking-wide">
                    {industry.name}
                  </h3>
                  <p className="text-lg text-light-muted font-light max-w-[160px] leading-relaxed">
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