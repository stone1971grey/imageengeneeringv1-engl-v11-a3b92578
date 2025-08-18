import { Calendar, ExternalLink } from "lucide-react";

interface AnnouncementBannerProps {
  message: string;
  ctaText: string;
  ctaLink: string;
  icon?: "calendar" | "location";
}

const AnnouncementBanner = ({ 
  message, 
  ctaText, 
  ctaLink, 
  icon = "calendar" 
}: AnnouncementBannerProps) => {
  const IconComponent = icon === "calendar" ? Calendar : ExternalLink;

  return (
    <div className="w-full bg-downloads-bg border-b border-downloads-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between py-3 gap-4">
          <div className="flex items-center gap-3">
            <IconComponent 
              size={16} 
              className="text-scandi-grey flex-shrink-0" 
            />
            <span className="text-sm text-downloads-text font-medium">
              {message}
            </span>
          </div>
          
          <a
            href={ctaLink}
            className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors duration-200 flex items-center gap-1.5 whitespace-nowrap group"
          >
            {ctaText}
            <ExternalLink 
              size={12} 
              className="group-hover:translate-x-0.5 transition-transform duration-200" 
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;