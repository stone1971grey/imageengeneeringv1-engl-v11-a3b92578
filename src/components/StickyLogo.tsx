import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import logoIE from "@/assets/logo-ie-white.png";

const StickyLogo = () => {
  const [showDarkLogo, setShowDarkLogo] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Switch at 800px scroll position
      setShowDarkLogo(scrollY > 800);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-[2rem] left-4 z-50">
      <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
        {/* White Logo - visible on dark backgrounds */}
        <img 
          src={logoIE} 
          alt="Image Engineering" 
          className={`h-[60px] w-auto max-w-[300px] object-contain absolute transition-opacity duration-500 ${
            showDarkLogo ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ width: '300px' }}
        />
        
        {/* Dark Logo - visible on light backgrounds */}
        <img 
          src={logoIE} 
          alt="Image Engineering" 
          className={`h-[60px] w-auto max-w-[300px] object-contain brightness-0 invert transition-opacity duration-500 ${
            showDarkLogo ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ width: '300px' }}
        />
      </Link>
    </div>
  );
};

export default StickyLogo;