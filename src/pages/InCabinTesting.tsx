import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Car, Eye, Shield, CheckCircle, Zap, Target } from "lucide-react";
import inCabinHero from "@/assets/in-cabin-hero.png";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const InCabinTesting = () => {
  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      <Navigation />
      
      {/* Main content wrapper with top margin to clear fixed navigation */}
      <div className="pt-[140px]">
        {/* Quick Navigation */}
        <nav className="sticky top-[195px] z-30 bg-[#F7F9FB] py-4 border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex flex-wrap gap-6 justify-center text-lg">
                <a href="#overview" className="text-[#3D7BA2] hover:text-[#3D7BA2]/80 font-medium transition-colors scroll-smooth" 
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}>Overview</a>
                <a href="#systems" className="text-[#3D7BA2] hover:text-[#3D7BA2]/80 font-medium transition-colors scroll-smooth"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('systems')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}>Systems</a>
                <a href="#kpis" className="text-[#3D7BA2] hover:text-[#3D7BA2]/80 font-medium transition-colors scroll-smooth"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('kpis')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}>KPIs</a>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section id="overview" className="min-h-[60vh] bg-scandi-white font-roboto scroll-mt-[280px] relative overflow-hidden">
          {/* Animated background light effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-soft-blue/20 to-accent-soft-blue/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-l from-soft-blue/15 to-accent-soft-blue/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-1/4 left-1/3 w-48 h-48 bg-gradient-to-r from-accent-soft-blue/10 to-soft-blue/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
          </div>
          
          <div className="container mx-auto px-6 py-16 lg:py-24 pt-32 relative z-10">
            <div className="grid lg:grid-cols-5 gap-16 items-center">
              
              {/* Left Content - 2/5 */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h1 className="text-6xl lg:text-7xl xl:text-8xl font-light leading-[0.9] tracking-tight mb-6" style={{ color: 'black' }}>
                    In-Cabin
                    <br />
                    <span className="font-medium" style={{ color: '#3D7BA2' }}>Performance Testing</span>
                  </h1>
                  
                  <p className="text-xl lg:text-2xl text-scandi-grey font-light leading-relaxed max-w-lg">
                    Advanced testing solutions for in-cabin monitoring systems, ensuring optimal performance and safety in automotive environments.
                  </p>
                </div>
                
                <div className="pt-4">
                  <Button 
                    size="lg"
                    className="text-white border-0 px-8 py-4 text-lg font-medium shadow-soft hover:shadow-lg transition-all duration-300 group"
                    style={{ backgroundColor: '#74952a' }}
                  >
                    Find Your Solution
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>

              {/* Right Product Image - 3/5 */}
              <div className="lg:col-span-3 relative">
                <div className="relative overflow-hidden rounded-lg shadow-soft">
                  {/* Animated glow effect behind image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-soft-blue/20 via-transparent to-accent-soft-blue/20 animate-pulse"></div>
                  
                  <img 
                    src={inCabinHero} 
                    alt="In-Cabin Testing Introduction"
                    className="w-full h-[500px] lg:h-[600px] object-cover bg-white relative z-10"
                    style={{ objectPosition: '-80px center' }}
                  />
                  
                  {/* Subtle overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent z-20"></div>
                  
                  {/* Moving light beam effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] animate-[slide-in-right_3s_ease-in-out_infinite] z-30"></div>
                </div>
                
                {/* Floating feature highlight */}
                <div className="absolute -bottom-6 -left-6 bg-scandi-white p-6 rounded-lg shadow-soft border border-scandi-light-grey z-40">
                  <div className="text-sm text-scandi-grey font-light mb-1">DMS/OMS</div>
                  <div className="text-2xl font-medium text-light-foreground">EU GSR Ready</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* In-Cabin Overview Section */}
        <section id="systems" className="py-16 bg-gray-50 scroll-mt-[280px]">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg p-8 shadow-sm mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">In-Cabin Overview</h2>
              <p className="text-lg text-gray-600 mb-6 font-medium">
                An in-depth look at the emergence of in-cabin systems in the automotive industry.
              </p>
              
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Overview</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                As the automotive industry continues its path toward full automation, one area of focus has become the in-cabin monitoring systems, often referred to as driver and occupant monitoring systems (DMS/OMS). These systems use cameras and sensors to enhance the safety and comfort of drivers and passengers.
              </p>
              <p className="text-gray-700 mb-6 leading-relaxed">
                In-cabin systems are responsible for monitoring the vehicle's interior and the driver's response to the driving environment. So, they often need to work in sync with the exterior systems to ensure the driver makes proper adjustments as the conditions dictate. They can also further reduce human error accidents by focusing on the driver's alertness and making adjustments when necessary, e.g., slowing down the car due to drowsiness in the driver. In-cabin systems have seen so much positive improvement in the last few years that the European Union's General Safety Regulation (GSR) has begun mandating that all new cars from 2024 must implement DMS systems.
              </p>
              <p className="text-gray-700 leading-relaxed">
                As these systems continue to become indispensable to road safety, manufacturers must have access to the proper calibration and characterization solutions during the development process to ensure the highest level of image quality performance and safety.
              </p>
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">What do In-Cabin systems monitor?</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">
                In-cabin systems monitor drivers' and passengers' behavior and facial cues by capturing videos and images. They mostly use near-infrared (NIR) sensors combined with active illumination (e.g., LED or VCSEL) to ensure accuracy in very low-light conditions. NIR sensors are preferred as they do not need to rely on a visible light source that would be noticeable to the driver and passengers. Captured results are then fed into embedded software to analyze the car's interior.
              </p>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Many of the aspects that in-cabin systems monitor fall into the area of machine vision, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                <li>Driver facial expressions to assess distraction or unsafe emotional states</li>
                <li>Driver eye openness for drowsiness detection</li>
                <li>Driver gaze, e.g., looking down at a phone</li>
                <li>Driver's hand positions on the steering wheel</li>
                <li>Occupant presence and seatbelt usage</li>
                <li>Detection of children and proper child safety, e.g., child seats</li>
                <li>Size and posture of occupants to optimize airbag deployment</li>
              </ul>
              <p className="text-gray-700 mb-6 leading-relaxed">
                These in-cabin systems can make real-time assessments and adjustments (or recommendations) using machine vision learning algorithms when necessary.
              </p>
              <p className="text-gray-700 leading-relaxed">
                When the car drives autonomously, these systems can also focus on human vision applications, such as webcam conferences or selfie-taking. A combination of RGB and IR camera systems could potentially be used to ensure proper functionality.
              </p>
              <p className="text-gray-700 leading-relaxed mt-6">
                All told, these systems can significantly improve safety by detecting distraction and fatigue in the driver and optimizing safety features to enhance the safety of all occupants in the event of an accident. In addition, in-cabin cameras can improve user experience by personalizing commands and controlling various aspects of the driving experience.
              </p>
            </div>
          </div>
        </div>
      </section>

        {/* In-Cabin KPIs Section */}
        <section id="kpis" className="py-16 bg-white scroll-mt-[280px]">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">In-Cabin KPIs</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                The Key Performance Indicators that are crucial to understanding the performance of an in-cabin system
              </p>
            </div>

            <div className="space-y-8">
              <p className="text-gray-700 mb-8 leading-relaxed">
                As the reliance on in-cabin systems continues to grow, these systems must be rigorously tested during the development stages to ensure optimal performance and safety. Several image quality factors should be evaluated when testing their systems, including:
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Resolution (SFR)</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Camera resolution describes a camera's ability to reproduce a scene's fine details. One way to determine resolution performance is by measuring the spatial frequency response (SFR). These SFRs will produce a range of spatial frequencies on scale from 0% (a complete loss of scene information) to 100% (a perfect scene reproduction without data loss).
                  </p>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    Resolution performance is crucial to determining the number of pixels per eye we have. It ensures enough detail is preserved, even in low-light settings, for determining eye movements and analyzing other driver and passenger facial cues. ISO 12233 outlines test methods that can be utilized for resolution measurements.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Distortion</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Image distortion occurs when an image's straight lines appear to curve unnaturally. It is often the result of the lens's geometry. Distortion can be seen as a variation of the reproduction scale over the field. As a result, the same object is smaller in the image corner than in the image center. So, if the algorithm needs, e.g., 15 pixels per eye to work properly, this might work for the center but not for the corners.
                  </p>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    ISO 17850 offers test methods for local geometric distortion measurements. In addition, our GEOCAL device provides geometric camera calibrations. It creates a grid of light spots originating from infinity for distortion measurements.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Dynamic Range (OECF)</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Dynamic range is the maximum contrast a digital camera system can capture from its maximum output level (saturation) down to an even signal-to-noise ratio. A camera system's dynamic range is determined by obtaining the OECF (opto-electronic conversion function), which describes how a camera converts varying light levels (optical input) into electronic signals (digital output).
                  </p>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    Dynamic range performance is essential for in-cabin systems, as these systems must be able to perform in low-light or even almost no-light scenarios when analyzing, e.g., facial expressions. ISO 14524 outlines test methods for obtaining the OECF for dynamic range measurements.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Noise (SNR)</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Noise describes the presence of artifacts in the image that do not originate from the original scene content. The noise level is determined using the signal-to-noise ratio, which plots the amount of noise compared to the desired signal. Using the SNR can help reduce the noise in low-light environments. However, noise mustn't be lowered to the point where the signal is no longer clear. Often, a little noise is necessary, especially in low-light environments.
                  </p>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    In-cabin systems must ensure a balanced SNR to detect the correct contrasts and signals in a low-light cabin. ISO 15739 describes test methods for determining a camera system's noise levels.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Color Accuracy</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Color accuracy describes the camera's ability to separate and reproduce colors in a scene. To measure color performance, a camera system must be calibrated based on a particular color space, such as sRGB. Correcting white balance is also a crucial aspect of color accuracy.
                  </p>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    Color is primarily relevant for human vision applications, as machine vision relies on NIR camera systems and does not see color. RGB camera systems must, therefore, be properly color-calibrated to ensure color accuracy.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Timing Accuracy</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Camera systems rely heavily on timing parameters to capture real-time scenes, particularly moving scenes. Frame rate, shutter speed, and autofocus are vital timing parameters that should be tested to ensure the system is not misinterpreting a scene due to movement or motion blur.
                  </p>
                  <p className="text-gray-700 leading-relaxed mt-4">
                    Even though in-cabin systems monitor people sitting, they are still moving around—especially important is monitoring the driver's head movements—and the camera system must be able to compensate for these movements and motion blurs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* In-Cabin Products and Solutions */}
      <section className="py-20 bg-gray-50 scroll-mt-[280px]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              In-Cabin Products and Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Industry-leading tools and solutions for in-cabin performance testing
            </p>
          </div>

          <div className="mb-12">
            <p className="text-gray-700 leading-relaxed text-lg max-w-6xl mx-auto text-center">
              Ensuring that in-cabin camera and sensor systems function in low-light or almost no-light scenarios requires using near-infrared (NIR) systems. Most systems use internal illumination up to 850 (visible) or 940 nm (not visible). We recommend testing these systems using illumination and measurement devices to measure and generate an illumination spectrum up to 940 nm.
            </p>
          </div>

          <div className="space-y-8">
            {/* Top row - 4 products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              
              {/* LE7 VIS-IR */}
              <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col bg-blue-100 border-4 border-blue-300 shadow-lg ring-4 ring-blue-200">
                <CardContent className="p-0 flex flex-col flex-1">
                  <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                    <img 
                      src="/src/assets/le7-product.png"
                      alt="LE7 VIS-IR"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        ACTIVE
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold mb-3 transition-colors group-hover:text-[#577eb4] text-blue-700">
                      LE7 VIS-IR
                      <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">
                        CLICKABLE
                      </span>
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed mb-6 flex-1">
                      A uniform light source for testing cameras with transparent test targets in the NIR range.
                    </p>
                    <Link to="/product/le7">
                      <Button 
                        variant="decision"
                        size="lg"
                        className="w-full group"
                      >
                        Learn More
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* iQ-Flatlight VIS-IR */}
              <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col">
                <CardContent className="p-0 flex flex-col flex-1">
                  <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                    <img 
                      src="/src/assets/iq-led-illumination.png"
                      alt="iQ-Flatlight VIS-IR"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold mb-3 transition-colors group-hover:text-[#577eb4] text-gray-900">
                      iQ-Flatlight VIS-IR
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed mb-6 flex-1">
                      A uniform light source for testing cameras with reflective test targets in the NIR range.
                    </p>
                    <Button 
                      variant="decision"
                      size="lg"
                      className="w-full group"
                    >
                      Learn More
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* LED-Panel IR */}
              <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col">
                <CardContent className="p-0 flex flex-col flex-1">
                  <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                    <img 
                      src="/src/assets/iq-led-illumination.png"
                      alt="LED-Panel IR"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold mb-3 transition-colors group-hover:text-[#577eb4] text-gray-900">
                      LED-Panel IR
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed mb-6 flex-1">
                      A timing measurement device for measuring the essential timing parameters of camera systems, including those in the NIR range.
                    </p>
                    <Button 
                      variant="decision"
                      size="lg"
                      className="w-full group"
                    >
                      Learn More
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* TE292 VIS-IR */}
              <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col">
                <CardContent className="p-0 flex flex-col flex-1">
                  <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                    <img 
                      src="/src/assets/te292-vis-ir.png"
                      alt="TE292 VIS-IR"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold mb-3 transition-colors group-hover:text-[#577eb4] text-gray-900">
                      TE292 VIS-IR
                    </h3>
                    <p className="text-lg text-gray-600 leading-relaxed mb-6 flex-1">
                      A test chart for spectral sensitivity measurements and color calibrations in the NIR range.
                    </p>
                    <Button 
                      variant="decision"
                      size="lg"
                      className="w-full group"
                    >
                      Learn More
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom row - 1 product left-aligned */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              <div className="">
                <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col">
                  <CardContent className="p-0 flex flex-col flex-1">
                    <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                      <img 
                        src="/src/assets/iq-analyzer-x.png"
                        alt="iQ-Analyzer-X"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold mb-3 transition-colors group-hover:text-[#577eb4] text-gray-900">
                        iQ-Analyzer-X
                      </h3>
                      <p className="text-lg text-gray-600 leading-relaxed mb-6 flex-1">
                        Advanced software for evaluating the performance of various image quality factors.
                      </p>
                      <Button 
                        variant="decision"
                        size="lg"
                        className="w-full group"
                      >
                        Learn More
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      </div>
    </div>
  );
};

export default InCabinTesting;