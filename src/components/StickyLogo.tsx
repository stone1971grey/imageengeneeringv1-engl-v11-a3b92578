import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import logoIE from "@/assets/logo-ie-white.png";

const StickyLogo = () => {
  const [isOnLightSection, setIsOnLightSection] = useState(false);

  useEffect(() => {
    const checkSection = () => {
      const scrollY = window.scrollY;
      
      // Hero section is dark (0-1000px) - use white logo
      // Other sections are light (>1000px) - use dark logo
      const heroHeight = 1000;
      
      setIsOnLightSection(scrollY > heroHeight);
    };

    // Initial check
    checkSection();
    
    // Update on scroll
    const handleScroll = () => {
      requestAnimationFrame(checkSection);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-[2rem] left-4 z-50">
      <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
        {/* Show different logo based on section */}
        <img 
          src={logoIE} 
          alt="Image Engineering" 
          className={`h-[60px] w-auto max-w-[300px] object-contain transition-all duration-500 ${
            isOnLightSection 
              ? 'brightness-0 invert' // Dark logo on light sections
              : '' // White logo on dark sections (hero)
          }`}
          style={{ width: '300px' }}
        />
      </Link>
    </div>
  );
};

export default StickyLogo;