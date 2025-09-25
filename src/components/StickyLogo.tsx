import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import logoIEWhite from "@/assets/logo-ie-white.png";
import logoIEBlack from "@/assets/logo-ie-black.png";

const StickyLogo = () => {
  const [isDarkLogo, setIsDarkLogo] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const detectBackgroundColor = () => {
      if (!logoRef.current) return;
      
      const logoRect = logoRef.current.getBoundingClientRect();
      const centerX = logoRect.left + logoRect.width / 2;
      const centerY = logoRect.top + logoRect.height / 2;
      
      // Get the element underneath the logo center
      const elementBelow = document.elementFromPoint(centerX, centerY);
      
      if (elementBelow) {
        const computedStyle = window.getComputedStyle(elementBelow);
        const backgroundColor = computedStyle.backgroundColor;
        
        // Check if we're over a dark background
        const isDarkBackground = isDarkColor(backgroundColor) || 
                                isElementInDarkSection(elementBelow);
        
        // Use white logo for dark backgrounds, black logo for light backgrounds
        setIsDarkLogo(!isDarkBackground);
      }
    };

    const isDarkColor = (color: string): boolean => {
      // Handle rgb/rgba colors
      if (color.includes('rgb')) {
        const matches = color.match(/\d+/g);
        if (matches && matches.length >= 3) {
          const r = parseInt(matches[0]);
          const g = parseInt(matches[1]);
          const b = parseInt(matches[2]);
          // Calculate luminance
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          return luminance < 0.5;
        }
      }
      return false;
    };

    const isElementInDarkSection = (element: Element): boolean => {
      // Check if element or its parents have dark backgrounds
      let current = element;
      while (current && current !== document.body) {
        const style = window.getComputedStyle(current);
        const bgColor = style.backgroundColor;
        
        // Check for specific dark background classes/colors
        if (bgColor.includes('rgb(55, 55, 55)') || // #373737 from NewsSection
            bgColor.includes('rgba(55, 55, 55') ||
            current.classList.contains('bg-[#373737]') ||
            isDarkColor(bgColor)) {
          return true;
        }
        current = current.parentElement as Element;
      }
      return false;
    };

    // Debounce function for performance
    let timeoutId: NodeJS.Timeout;
    const debouncedDetection = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(detectBackgroundColor, 10);
    };

    // Initial detection
    detectBackgroundColor();
    
    // Listen for scroll events
    window.addEventListener('scroll', debouncedDetection, { passive: true });
    window.addEventListener('resize', debouncedDetection, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', debouncedDetection);
      window.removeEventListener('resize', debouncedDetection);
    };
  }, []);

  return (
    <div ref={logoRef} className="fixed top-[3.5rem] left-4 z-50">
      <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
        <img 
          src={isDarkLogo ? logoIEBlack : logoIEWhite} 
          alt="Image Engineering" 
          className="h-[60px] w-auto max-w-[300px] object-contain transition-all duration-300"
          style={{ width: '300px' }}
        />
      </Link>
    </div>
  );
};

export default StickyLogo;