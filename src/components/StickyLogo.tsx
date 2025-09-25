import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import logoIE from "@/assets/logo-ie-white.png";

interface StickyLogoProps {
  adaptToBackground?: boolean;
}

const StickyLogo = ({ adaptToBackground = true }: StickyLogoProps) => {
  const [logoStyle, setLogoStyle] = useState("");

  useEffect(() => {
    if (!adaptToBackground) return;

    const detectBackground = () => {
      const scrollY = window.scrollY;
      const logoElement = document.querySelector('[data-sticky-logo]');
      
      if (!logoElement) return;
      
      // Get the actual background color at the logo position
      const logoRect = logoElement.getBoundingClientRect();
      const centerX = logoRect.left + logoRect.width / 2;
      const centerY = logoRect.top + logoRect.height / 2;
      
      // Get element at logo position (excluding the logo itself)
      const logoHTMLElement = logoElement as HTMLElement;
      logoHTMLElement.style.pointerEvents = 'none';
      const elementBelow = document.elementFromPoint(centerX, centerY);
      logoHTMLElement.style.pointerEvents = 'auto';
      
      if (elementBelow) {
        const computedStyle = window.getComputedStyle(elementBelow);
        const backgroundColor = computedStyle.backgroundColor;
        const backgroundImage = computedStyle.backgroundImage;
        
        // Check if we're over a light background
        const isLightBackground = 
          backgroundColor.includes('rgb(255') || // White background
          backgroundColor.includes('rgba(255') ||
          backgroundColor === 'rgb(255, 255, 255)' ||
          backgroundColor === 'rgba(0, 0, 0, 0)' || // Transparent, likely over white
          elementBelow.classList.contains('bg-white') ||
          elementBelow.classList.contains('bg-gray-50') ||
          elementBelow.classList.contains('bg-background');
        
        // Apply appropriate filter
        if (isLightBackground && !backgroundImage.includes('url(')) {
          // Dark logo on light background
          setLogoStyle("brightness-0 invert");
        } else {
          // Light logo on dark background or over image
          setLogoStyle("");
        }
      }
    };

    // Initial detection
    setTimeout(detectBackground, 100);
    
    // Listen for scroll events
    window.addEventListener('scroll', detectBackground);
    window.addEventListener('resize', detectBackground);
    
    return () => {
      window.removeEventListener('scroll', detectBackground);
      window.removeEventListener('resize', detectBackground);
    };
  }, [adaptToBackground]);

  const getLogoClasses = () => {
    const baseClasses = "h-[60px] w-auto max-w-[300px] object-contain transition-all duration-300";
    return `${baseClasses} ${logoStyle}`;
  };

  return (
    <div className="fixed top-[2rem] left-4 z-50">
      <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
        <img 
          src={logoIE} 
          alt="Image Engineering" 
          className={getLogoClasses()}
          style={{ width: '300px' }}
          data-sticky-logo="true"
        />
      </Link>
    </div>
  );
};

export default StickyLogo;