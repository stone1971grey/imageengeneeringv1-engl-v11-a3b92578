import { Link } from "react-router-dom";
import { 
  Camera, 
  Smartphone, 
  Car, 
  Tv, 
  Shield, 
  Cog, 
  Stethoscope, 
  ScanLine,
  Lightbulb,
  Microscope,
  Factory,
  Cpu,
  Layers,
  Zap,
  TrendingUp,
  Award,
  Globe,
  Target,
  Settings,
  Package
} from "lucide-react";

// Available icons mapping
export const availableIcons = {
  Camera,
  Smartphone,
  Car,
  Tv,
  Shield,
  Cog,
  Stethoscope,
  ScanLine,
  Lightbulb,
  Microscope,
  Factory,
  Cpu,
  Layers,
  Zap,
  TrendingUp,
  Award,
  Globe,
  Target,
  Settings,
  Package
} as const;

export type IconName = keyof typeof availableIcons;

export interface IndustryItem {
  icon: IconName;
  title: string;
  description: string;
  link?: string;
}

interface IndustriesSegmentProps {
  title?: string;
  subtitle?: string;
  columns?: number;
  items?: IndustryItem[];
}

const IndustriesSegment = ({ 
  title = "Trusted Across All Industries",
  subtitle = "Professional solutions for diverse applications",
  columns = 4,
  items = []
}: IndustriesSegmentProps) => {
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4'
  }[columns] || 'grid-cols-2 md:grid-cols-4';

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-light-foreground mb-6 tracking-tight">
            {title}
          </h2>
          <p className="text-xl text-light-muted max-w-2xl mx-auto font-light">
            {subtitle}
          </p>
        </div>

        {/* Industry Grid */}
        <div className={`grid ${gridColsClass} gap-8 md:gap-12 max-w-6xl mx-auto`}>
          {items.map((item, index) => {
            const IconComponent = availableIcons[item.icon];
            const content = (
              <div
                className="group flex flex-col items-center"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: 'slide-in-up 0.6s ease-out both'
                }}
              >
                {/* Icon Circle */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-[#f9dc24]/10 rounded-full flex items-center justify-center border-2 border-[#f9dc24]/20 shadow-lg hover:shadow-xl hover:bg-[#f9dc24]/20 hover:border-[#f9dc24]/40 transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-105 cursor-pointer">
                    <IconComponent 
                      size={36} 
                      className="text-black group-hover:text-gray-900 group-hover:scale-125 transition-all duration-300" 
                      strokeWidth={1.8}
                    />
                  </div>
                  
                  {/* Glow Effect */}
                  <div className="absolute inset-0 w-20 h-20 md:w-24 md:h-24 bg-[#f9dc24] rounded-full opacity-0 group-hover:opacity-15 transition-opacity duration-500 blur-xl" />
                </div>

                {/* Text Content */}
                <div className="text-center space-y-1">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-200">
                    {item.title}
                  </h3>
                  <p className="text-base text-gray-600 font-light leading-relaxed px-2">
                    {item.description}
                  </p>
                </div>
              </div>
            );

            if (item.link) {
              return (
                <Link 
                  key={index}
                  to={item.link}
                  className="block hover:scale-105 transition-transform duration-300"
                >
                  {content}
                </Link>
              );
            }

            return (
              <div key={index}>
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default IndustriesSegment;
