import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import logoIE from "@/assets/logo-ie-white.png";

interface StickyLogoProps {
  adaptToBackground?: boolean;
}

const StickyLogo = ({ adaptToBackground = true }: StickyLogoProps) => {
  const [isDarkBackground, setIsDarkBackground] = useState(true);

  useEffect(() => {
    if (!adaptToBackground) return;

    const detectBackground = () => {
      // Check scroll position to determine background
      const scrollY = window.scrollY;
      const heroHeight = 800; // Approximate hero section height
      
      // Also check if there's a navigation background
      const navigation = document.querySelector('nav');
      const hasNavBackground = navigation && getComputedStyle(navigation).backgroundColor !== 'rgba(0, 0, 0, 0)';
      
      // Dark background when in hero section or when nav has dark background
      setIsDarkBackground(scrollY < heroHeight || hasNavBackground);
    };

    // Initial check
    detectBackground();
    
    // Listen for scroll events
    window.addEventListener('scroll', detectBackground);
    
    return () => window.removeEventListener('scroll', detectBackground);
  }, [adaptToBackground]);

  // Dynamic classes based on background
  const getLogoClasses = () => {
    if (!adaptToBackground) {
      return "h-[60px] w-auto max-w-[300px] object-contain";
    }
    
    if (isDarkBackground) {
      // White logo on dark background (default)
      return "h-[60px] w-auto max-w-[300px] object-contain";
    } else {
      // Black logo on light background
      return "h-[60px] w-auto max-w-[300px] object-contain brightness-0 invert";
    }
  };

  return (
    <div className="fixed top-[2rem] left-4 z-50">
      <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
        <img 
          src={logoIE} 
          alt="Image Engineering" 
          className={getLogoClasses()}
          style={{ width: '300px' }}
        />
      </Link>
    </div>
  );
};

export default StickyLogo;