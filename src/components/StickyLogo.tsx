import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import logoIE from "@/assets/logo-ie-white.png";

const StickyLogo = () => {
  const [isOnLightSection, setIsOnLightSection] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const checkSection = () => {
      // Clear any pending timeout
      clearTimeout(timeoutId);
      
      // Add debounce to prevent rapid switching
      timeoutId = setTimeout(() => {
        const scrollY = window.scrollY;
        
        // Debug: Log current scroll position
        console.log('Scroll position:', scrollY);
        
        // More precise section detection based on actual content
        const heroHeight = 950; // Adjusted to be more precise
        const newState = scrollY > heroHeight;
        
        // Only update if state actually changed
        if (newState !== isOnLightSection) {
          console.log('Logo state changing to:', newState ? 'dark logo (light section)' : 'light logo (dark section)');
          setIsOnLightSection(newState);
        }
      }, 100); // 100ms debounce
    };

    // Initial check with delay to ensure page is loaded
    setTimeout(checkSection, 300);
    
    // Update on scroll with throttling
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          checkSection();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [isOnLightSection]);

  console.log('Current logo state:', isOnLightSection ? 'dark (inverted)' : 'light (normal)');

  return (
    <div className="fixed top-[2rem] left-4 z-50">
      <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
        <img 
          src={logoIE} 
          alt="Image Engineering" 
          className={`h-[60px] w-auto max-w-[300px] object-contain transition-all duration-700 ${
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