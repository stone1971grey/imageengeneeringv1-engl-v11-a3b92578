import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import logoIEWhite from "@/assets/logo-ie-white.png";
import logoIEBlack from "@/assets/logo-ie-black.png";

const StickyLogo = () => {
  const [isDarkLogo, setIsDarkLogo] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When viewport top is past 600px (end of hero), switch to dark logo
          const rect = entry.boundingClientRect;
          const scrollY = window.scrollY;
          
          if (scrollY > 600) {
            setIsDarkLogo(true);
          } else {
            setIsDarkLogo(false);
          }
        });
      },
      {
        rootMargin: '0px',
        threshold: 0
      }
    );

    // Create a scroll listener for more precise control
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Switch to dark logo when scrolled past 600px
      setIsDarkLogo(scrollY > 600);
    };

    // Initial check
    handleScroll();
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div ref={logoRef} className="fixed top-[2rem] left-4 z-50">
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