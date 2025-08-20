import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import lauraImage from "@/assets/team-laura.jpg";
import markusImage from "@/assets/team-markus.jpg";
import aishaImage from "@/assets/team-aisha.jpg";
import danielImage from "@/assets/team-daniel.jpg";

const engineers = [
  {
    id: 1,
    name: "Laura Neumann",
    title: "Lead Optical Systems",
    quote: "I help you turn complex test setups into reliable, reproducible workflows.",
    image: lauraImage,
    ctaLink: "/contact"
  },
  {
    id: 2,
    name: "Markus Stein",
    title: "Senior Imaging Engineer",
    quote: "From sensor tuning to ISO/VCX compliance—let's make your measurements future-proof.",
    image: markusImage,
    ctaLink: "/contact"
  },
  {
    id: 3,
    name: "Aisha Rahman",
    title: "Image Quality Specialist", 
    quote: "I focus on practical, automated pipelines for camera validation at scale.",
    image: aishaImage,
    ctaLink: "/contact"
  },
  {
    id: 4,
    name: "Daniel Weber",
    title: "Illumination & Charts Expert",
    quote: "Lighting stability and the right charts are the foundation of trustworthy results.",
    image: danielImage,
    ctaLink: "/contact"
  }
];

const EngineersSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % engineers.length);
    setProgress(0);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + engineers.length) % engineers.length);
    setProgress(0);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    setProgress(0);
  }, []);

  // Auto-rotation every 12 seconds
  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + (100 / 120); // 120 steps for 12 seconds (100ms intervals)
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "ArrowRight") {
        nextSlide();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  const currentEngineer = engineers[currentSlide];

  return (
    <section 
      className="py-24 bg-muted"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      role="region"
      aria-label="Engineers slider"
    >
      <div className="container mx-auto px-4">
        {/* Headline */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Speak with Our Engineers
          </h2>
        </div>

        {/* Slider Content */}
        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Mobile: Image first */}
            <div className="lg:hidden flex justify-center mb-8">
              <div className="relative">
                <img
                  src={currentEngineer.image}
                  alt={`${currentEngineer.name}, ${currentEngineer.title}`}
                  className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-elegant"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            {/* Text Content */}
            <div className="text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
                Meet {currentEngineer.name}
              </h2>
              <p className="text-xl text-primary font-medium mb-4">
                {currentEngineer.title}
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
                "{currentEngineer.quote}"
              </p>
              <Button 
                size="lg" 
                className="text-lg px-8 py-3"
                onClick={() => window.location.href = currentEngineer.ctaLink}
              >
                Book a consultation
              </Button>
            </div>

            {/* Desktop: Image */}
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <img
                  src={currentEngineer.image}
                  alt={`${currentEngineer.name}, ${currentEngineer.title}`}
                  className="w-64 h-64 rounded-full object-cover border-4 border-white shadow-elegant"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>

          {/* Navigation Arrows (Desktop) */}
          <button
            onClick={prevSlide}
            className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 w-12 h-12 items-center justify-center rounded-full bg-background border border-border hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Previous engineer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={nextSlide}
            className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 w-12 h-12 items-center justify-center rounded-full bg-background border border-border hover:bg-accent hover:text-accent-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Next engineer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center items-center gap-3 mt-12">
          {engineers.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                index === currentSlide
                  ? "w-4 h-4 bg-primary rounded-full"
                  : "w-3 h-3 bg-muted-foreground/30 rounded-full hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              {index === currentSlide && (
                <div 
                  className="absolute inset-0 bg-primary/20 rounded-full transition-all duration-100"
                  style={{
                    transform: `scale(${1 + (progress / 100) * 0.2})`
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="flex justify-center mt-4">
          <div className="w-32 h-1 bg-muted-foreground/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default EngineersSlider;