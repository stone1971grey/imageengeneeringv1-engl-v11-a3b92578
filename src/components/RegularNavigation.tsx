import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logoIE from "@/assets/logo-ie-new-v7.png";

const RegularNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkBackground, setIsDarkBackground] = useState(false);

  useEffect(() => {
    const detectBackground = () => {
      // Check if we're on a light background by examining the navigation background
      const navigation = document.querySelector('nav');
      if (navigation) {
        const bgColor = getComputedStyle(navigation).backgroundColor;
        // If background is transparent or light, use dark logo
        setIsDarkBackground(bgColor === 'rgba(0, 0, 0, 0)' || bgColor.includes('255'));
      }
    };

    detectBackground();
    
    // Check on scroll and resize
    window.addEventListener('scroll', detectBackground);
    window.addEventListener('resize', detectBackground);
    
    return () => {
      window.removeEventListener('scroll', detectBackground);
      window.removeEventListener('resize', detectBackground);
    };
  }, []);

  const getLogoClasses = () => {
    const baseClasses = "h-12 md:h-16 w-auto max-w-[200px] object-contain";
    // Apply black filter for transparent background
    return baseClasses;
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border py-12">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <Link to="/en" className="flex items-center hover:opacity-80 transition-opacity">
            <img 
              src={logoIE} 
              alt="Image Engineering" 
              className={getLogoClasses()}
            />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/en#services" className="text-muted-foreground hover:text-foreground transition-colors">
              Leistungen
            </a>
            <Link to="/en/your-solution/automotive" className="text-muted-foreground hover:text-foreground transition-colors">
              Automotive
            </Link>
            <Link to="/en/downloads" className="text-muted-foreground hover:text-foreground transition-colors">
              Downloads
            </Link>
            <a href="/en#technology" className="text-muted-foreground hover:text-foreground transition-colors">
              Technologie
            </a>
            <a href="/en#about" className="text-muted-foreground hover:text-foreground transition-colors">
              Über uns
            </a>
            <Button variant="default" className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
              Kontakt
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-3">
              <a href="/en#services" className="text-muted-foreground hover:text-foreground transition-colors">
                Leistungen
              </a>
              <Link to="/en/your-solution/automotive" className="text-muted-foreground hover:text-foreground transition-colors">
                Automotive
              </Link>
              <Link to="/en/downloads" className="text-muted-foreground hover:text-foreground transition-colors">
                Downloads
              </Link>
              <a href="/en#technology" className="text-muted-foreground hover:text-foreground transition-colors">
                Technologie
              </a>
              <a href="/en#about" className="text-muted-foreground hover:text-foreground transition-colors">
                Über uns
              </a>
              <Button variant="default" className="bg-gradient-primary w-fit">
                Kontakt
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default RegularNavigation;