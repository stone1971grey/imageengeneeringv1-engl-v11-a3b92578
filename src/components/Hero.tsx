import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import precisionTestingHero from "@/assets/precision-testing-hero.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden -mt-12">
      {/* Hero Background Image with Ken Burns Effect */}
      <div className="absolute inset-0 animate-fade-in">
        <img 
          src={precisionTestingHero}
          alt="Precision Engineering Process"
          className="w-full h-full object-cover animate-ken-burns"
        />
        <div className="absolute inset-0 bg-black/15"></div>
        {/* Left fade overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent"></div>
      </div>
      
      {/* Navigation Spacer */}
      <div className="h-16"></div>
      
      {/* Hero Content */}
      <div className="container mx-auto px-6 py-16 lg:py-24 relative z-10">
        <div className="flex items-center justify-start min-h-[80vh]">
          
          {/* Left-aligned Content */}
          <div className="text-left space-y-8 max-w-4xl">
            <div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-light text-white leading-[0.9] tracking-tight mb-6">
                Test Charts
                <br />
                <span className="font-medium">Made by Image<br className="md:hidden" /> Engineering</span>
              </h1>
              
              <p className="text-lg md:text-xl lg:text-2xl text-white/90 font-light leading-relaxed max-w-2xl">
                We develop and manufacture high-precision test charts for professional image quality testing. 
                Order directly from our shop now.
              </p>
            </div>
            
            <div className="pt-4 flex gap-4">
              <Button 
                size="lg"
                variant="contact"
                className="text-white border-0 px-12 py-4 group"
                onClick={() => window.location.href = '/products/charts'}
              >
                Discover Charts
              </Button>
              
              <Button 
                size="lg"
                variant="decision"
                className="border-0 px-12 py-4"
                style={{ backgroundColor: '#d9c409', color: 'black' }}
                onClick={() => {
                  const element = document.getElementById('trusted-industries');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Trusted Across All Industries
              </Button>
            </div>

            {/* Minimal stats */}
            <div className="flex items-center justify-start space-x-12 pt-8">
              <div>
                <div className="text-2xl font-medium text-white">200+</div>
                <div className="text-sm text-white/80 font-light">Test Chart Variants</div>
              </div>
              <div>
                <div className="text-2xl font-medium text-white">0.01%</div>
                <div className="text-sm text-white/80 font-light">Measurement Tolerance</div>
              </div>
              <div>
                <div className="text-2xl font-medium text-white">15+</div>
                <div className="text-sm text-white/80 font-light">Years of Experience</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;