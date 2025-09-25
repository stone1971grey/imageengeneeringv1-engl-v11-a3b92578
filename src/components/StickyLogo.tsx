import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import logoIE from "@/assets/logo-ie-white.png";

const StickyLogo = () => {
  const [isDarkLogo, setIsDarkLogo] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create invisible markers to detect sections
    const heroMarker = document.createElement('div');
    heroMarker.id = 'hero-marker';
    heroMarker.style.position = 'absolute';
    heroMarker.style.top = '900px';
    heroMarker.style.height = '1px';
    heroMarker.style.width = '1px';
    heroMarker.style.pointerEvents = 'none';
    document.body.appendChild(heroMarker);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target.id === 'hero-marker') {
            // When hero marker is visible, we're still in hero (dark background)
            // When it's not visible, we're past hero (light background)
            setIsDarkLogo(!entry.isIntersecting);
          }
        });
      },
      {
        rootMargin: '-100px 0px 0px 0px', // Trigger slightly before the exact point
        threshold: 0
      }
    );

    observer.observe(heroMarker);

    return () => {
      observer.disconnect();
      document.body.removeChild(heroMarker);
    };
  }, []);

  return (
    <div ref={logoRef} className="fixed top-[2rem] left-4 z-50">
      <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
        <img 
          src={logoIE} 
          alt="Image Engineering" 
          className={`h-[60px] w-auto max-w-[300px] object-contain transition-all duration-300 ${
            isDarkLogo ? 'brightness-0 invert' : ''
          }`}
          style={{ width: '300px' }}
        />
      </Link>
    </div>
  );
};

export default StickyLogo;