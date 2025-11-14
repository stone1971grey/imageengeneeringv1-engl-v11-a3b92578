import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Ruler, Camera, CheckCircle, Target } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import geometricCalibration from "@/assets/solutions-geometric-calibration.jpg";
import { SEOHead } from "@/components/SEOHead";

const GeometricCalibrationAutomotive = () => {
  return (
    <>
      <SEOHead 
        title="Geometric Calibration for Automotive Cameras | Image Engineering"
        description="Professional geometric calibration solutions for automotive camera systems. Ensure accurate spatial measurements and distortion correction for ADAS and autonomous driving applications."
        canonical="https://www.image-engineering.de/your-solution/automotive/geometric-calibration-automotive"
      />
      
      <div className="min-h-screen bg-[#F7F9FB]">
        <Navigation />
        
        <div>
          {/* Hero Section */}
          <section className="min-h-[60vh] bg-white font-roboto relative overflow-hidden py-8">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-soft-blue/20 to-accent-soft-blue/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-l from-soft-blue/15 to-accent-soft-blue/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
            
            <div className="container mx-auto px-6 py-16 lg:py-24 pt-3 md:pt-32 pb-8 lg:pb-12 relative z-10">
              <div className="grid lg:grid-cols-5 gap-16 items-center">
                
                {/* Left Content - 2/5 */}
                <div className="lg:col-span-2 space-y-8">
                  <div>
                    <h1 className="text-5xl lg:text-6xl xl:text-7xl font-light leading-[0.9] tracking-tight mb-6 text-black mt-8 md:mt-0">
                      Geometric
                      <br />
                      <span className="font-medium text-black">Calibration</span>
                    </h1>
                    
                    <p className="text-xl lg:text-2xl text-black font-light leading-relaxed max-w-lg">
                      Precision calibration solutions for automotive camera systems ensuring accurate spatial measurements and distortion correction.
                    </p>
                  </div>
                  
                  <div className="pt-4">
                    <Link to="/contact">
                      <Button 
                        size="lg"
                        className="text-black border-0 px-8 py-4 text-lg font-medium shadow-soft hover:shadow-lg transition-all duration-300 group"
                        style={{ backgroundColor: '#f9dc24' }}
                      >
                        Get Expert Consultation
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Right Product Image - 3/5 */}
                <div className="lg:col-span-3 relative px-6">
                  <div className="relative overflow-hidden rounded-lg shadow-soft">
                    <div className="absolute inset-0 bg-gradient-to-br from-soft-blue/20 via-transparent to-accent-soft-blue/20 animate-pulse"></div>
                    
                    <img 
                      src={geometricCalibration} 
                      alt="Geometric Calibration for Automotive Cameras"
                      className="w-full min-h-[500px] lg:h-[600px] object-cover bg-white relative z-10"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Key Features Section */}
          <section className="py-20 bg-gradient-to-b from-white to-[#F7F9FB]">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl lg:text-5xl font-light mb-6 text-black">
                  Why <span className="font-medium">Geometric Calibration</span> Matters
                </h2>
                <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                  Accurate geometric calibration is essential for ADAS and autonomous driving systems to correctly interpret spatial information from camera sensors.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                {[
                  {
                    icon: Ruler,
                    title: "Distortion Correction",
                    description: "Remove lens distortion effects for accurate spatial measurements"
                  },
                  {
                    icon: Camera,
                    title: "Multi-Camera Systems",
                    description: "Calibrate complex multi-camera setups for surround view systems"
                  },
                  {
                    icon: Target,
                    title: "Precision Alignment",
                    description: "Ensure perfect camera alignment for stereo and depth perception"
                  },
                  {
                    icon: CheckCircle,
                    title: "Quality Validation",
                    description: "Verify calibration accuracy with standardized test procedures"
                  }
                ].map((feature, index) => (
                  <Card key={index} className="border-none shadow-soft hover:shadow-lg transition-all duration-300 bg-white">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-soft-blue to-accent-soft-blue flex items-center justify-center">
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-black">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Applications Section */}
          <section className="py-20 bg-white">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl lg:text-5xl font-light mb-6 text-black">
                  <span className="font-medium">Calibration</span> Applications
                </h2>
                <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                  Our geometric calibration solutions support a wide range of automotive camera applications
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {[
                  {
                    title: "Surround View Systems",
                    description: "360° bird's eye view calibration for parking assistance and low-speed maneuvering"
                  },
                  {
                    title: "Forward-Facing ADAS",
                    description: "Lane keeping, collision warning, and traffic sign recognition calibration"
                  },
                  {
                    title: "Rear View Cameras",
                    description: "Backup camera calibration with accurate distance markers and guidelines"
                  },
                  {
                    title: "Side Mirror Replacement",
                    description: "Digital side view camera systems with precise field of view calibration"
                  },
                  {
                    title: "Stereo Vision Systems",
                    description: "Dual-camera depth perception for autonomous driving applications"
                  },
                  {
                    title: "In-Cabin Monitoring",
                    description: "Driver and passenger monitoring with accurate facial landmark detection"
                  }
                ].map((app, index) => (
                  <Card key={index} className="border-none shadow-soft hover:shadow-lg transition-all duration-300 bg-[#F7F9FB]">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-3 text-black">{app.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{app.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-gradient-to-br from-soft-blue to-accent-soft-blue">
            <div className="container mx-auto px-6 text-center">
              <h2 className="text-4xl lg:text-5xl font-light mb-6 text-white">
                Ready to calibrate your <span className="font-medium">camera systems?</span>
              </h2>
              <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
                Get expert guidance on geometric calibration solutions for your automotive applications
              </p>
              <Link to="/contact">
                <Button 
                  size="lg"
                  className="text-black border-0 px-12 py-6 text-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{ backgroundColor: '#f9dc24' }}
                >
                  Contact Our Experts
                </Button>
              </Link>
            </div>
          </section>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default GeometricCalibrationAutomotive;
