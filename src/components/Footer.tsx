import { Button } from "@/components/ui/button";
import { Phone, Clock } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import teamLaura from "@/assets/team-laura-color.jpg";
import teamMarkus from "@/assets/team-markus-color.jpg";
import teamStefan from "@/assets/team-stefan-color.jpg";
import teamAnna from "@/assets/team-anna-automotive.jpg";
import teamThomas from "@/assets/team-thomas-lighting.jpg";
import trainingInstructor from "@/assets/training-instructor.jpg";

const Footer = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const isChartsPage = location.pathname === '/products/charts' || location.pathname.startsWith('/products/charts/');
  const isSolutionBundlePage = location.pathname.startsWith('/solution/');
  const isAutomotivePage = location.pathname === '/automotive';
  const isArcturusPage = location.pathname === '/product/arcturus';
  const isEventsPage = location.pathname === '/events';

  return (
    <footer id="footer" className="bg-[#4B4A4A] border-t border-[#4B4A4A]">
      {/* Vision CTA Section */}
      <div className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          {isChartsPage || isSolutionBundlePage || isAutomotivePage || isArcturusPage || isEventsPage
            ? (isChartsPage 
                ? 'Test Chart Consultation?' 
                : isSolutionBundlePage 
                  ? 'Customized Solution Packages for Your Application'
                : isAutomotivePage
                  ? 'Next-Generation Automotive Camera Testing Solutions'
                : isArcturusPage
                  ? 'Professional LED Lighting Solutions for Testing'
                : 'Need Training?')
            : t('footer.vision')
          }
        </h2>
        <p className="text-xl text-white max-w-4xl mx-auto leading-relaxed">
          {isChartsPage || isSolutionBundlePage || isAutomotivePage || isArcturusPage || isEventsPage
            ? (isChartsPage 
                ? 'Our experts help you select the right test charts for your specific requirements. Benefit from our years of experience in image quality analysis.'
                : isSolutionBundlePage
                  ? 'Benefit from our complete testing solutions and calibration packages. We develop individual solutions perfectly tailored to your requirements.'
                : isAutomotivePage
                  ? 'From ADAS cameras to driver assistance systems - our specialized automotive testing solutions ensure the highest safety standards. Let us shape the future of autonomous driving together.'
                : isArcturusPage
                  ? 'From high-intensity LED systems to precision lighting control - our Arcturus specialists ensure optimal illumination for your most demanding testing scenarios. Maximum luminance meets unmatched stability.'
                : 'Ask our team for a training near you. Our experienced instructors provide hands-on workshops and seminars worldwide, helping you master the latest testing technologies and industry standards.')
            : t('footer.visionDesc')
          }
        </p>
      </div>

      {/* Contact & Team Quote Section */}
      <div className="border-t border-[#4B4A4A] bg-[#4B4A4A]">
        <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left Column - Contact */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                {isChartsPage || isSolutionBundlePage || isAutomotivePage || isArcturusPage || isEventsPage
                  ? (isChartsPage 
                      ? 'Questions About Test Charts?' 
                      : isSolutionBundlePage 
                        ? 'Looking for Individual Solution Packages?'
                      : isAutomotivePage
                        ? 'Automotive Camera Testing?'
                      : isArcturusPage
                        ? 'Questions About LED Lighting Systems?'
                        : 'Looking for Training & Workshops?')
                  : t('footer.questions')
                }<br />
                {isChartsPage || isSolutionBundlePage || isAutomotivePage || isArcturusPage || isEventsPage
                  ? (isChartsPage 
                      ? 'Speak with Our Chart Experts.' 
                      : isSolutionBundlePage 
                        ? 'Speak with Our Solution Experts.'
                      : isAutomotivePage
                        ? 'Speak with Our Automotive Experts.'
                      : isArcturusPage
                        ? 'Speak with Our Lighting Specialists.'
                        : 'Speak with Our Training Team.')
                  : t('footer.speakWithUs')
                }
              </h2>
              <p className="text-white leading-relaxed">
                {isChartsPage || isSolutionBundlePage || isAutomotivePage || isArcturusPage || isEventsPage
                  ? (isChartsPage 
                      ? 'Our test chart experts are happy to advise you on selecting the optimal charts for your image quality measurements and support you in configuring your test systems.'
                      : isSolutionBundlePage
                        ? 'Our solution experts develop customized testing solutions and calibration packages for your specific requirements. From consultation to implementation, we accompany you.'
                      : isAutomotivePage
                        ? 'Our automotive specialists develop precise testing procedures for vehicle cameras, ADAS systems and autonomous driving functions. From IEEE-P2020 certification to individual test protocols.'
                      : isArcturusPage
                        ? 'Our lighting specialists design optimal LED illumination systems for your testing requirements. From maximum luminance configuration to precise spectral control - we ensure your Arcturus system delivers perfect results.'
                        : 'Our training specialists organize professional workshops, seminars and hands-on training sessions worldwide. From basic camera testing to advanced ADAS certification - we bring expertise directly to your location.')
                  : t('footer.expertDesc')
                }
              </p>
            </div>

            <div className="space-y-4">              
              <div className="space-y-2">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3" style={{ color: '#d9c409' }} />
                  <span className="text-foreground">{t('footer.phoneDE')}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3" style={{ color: '#d9c409' }} />
                  <span className="text-foreground">{t('footer.phoneUSA')}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3" style={{ color: '#d9c409' }} />
                  <span className="text-foreground">{t('footer.phoneChina')}</span>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-3" style={{ color: '#d9c409' }} />
                <span className="text-foreground">{t('footer.officeHours')}</span>
              </div>
            </div>

            <Button className="bg-[#d9c409] hover:bg-[#c4b108] text-black px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
              {isChartsPage || isSolutionBundlePage || isAutomotivePage || isArcturusPage || isEventsPage
                ? (isChartsPage 
                    ? 'Your Questions About Our Charts' 
                    : isSolutionBundlePage 
                      ? 'Schedule Consultation Now'
                    : isAutomotivePage
                      ? 'Schedule Consultation Now'
                    : isArcturusPage
                      ? 'Lighting Consultation Now'
                      : 'Request Training Information')
                : t('footer.contact')
              }
            </Button>
          </div>

          {/* Right Column - Team Quote */}
          <div className="bg-[#4B4A4A] border border-[#4B4A4A] rounded-lg p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0 mx-auto md:mx-0">
                 <img 
                   src={isChartsPage ? teamMarkus : isSolutionBundlePage ? teamStefan : isAutomotivePage ? teamAnna : isArcturusPage ? teamThomas : isEventsPage ? trainingInstructor : teamLaura}
                    alt={isChartsPage 
                      ? "Markus Weber, Technical Chart Specialist" 
                      : isSolutionBundlePage 
                        ? "Dr. Stefan Mueller, Test Solutions Expert"
                      : isAutomotivePage
                        ? "Dr. Anna Hoffmann, Automotive Vision Expert"
                      : isArcturusPage
                        ? "Dr. Thomas Lichtner, LED Lighting Technology Specialist"
                      : isEventsPage
                        ? "Training Specialist, Professional Instructor"
                        : "Laura Neumann, Head of Optical Systems"
                    }
                   className="w-[150px] h-[150px] rounded-full object-cover"
                 />
              </div>
              <div className="flex-1 text-center md:text-left">
                <blockquote className="text-lg text-white leading-relaxed mb-4">
                  {isChartsPage 
                    ? '"Precise test charts are the foundation of every serious image quality analysis. With over 15 years of experience, I help you find the perfect charts for your measurements."'
                    : isSolutionBundlePage
                      ? '"As an expert in test solutions and calibration solutions, I develop customized packages for our customers daily. Each solution is unique and perfectly tailored to individual requirements."'
                    : isAutomotivePage
                      ? '"Safety comes first in automotive applications. With over 12 years of experience in vehicle camera development, I ensure that every test meets the highest industry standards."'
                    : isArcturusPage
                      ? '"Maximum luminance with perfect stability - that\'s what sets Arcturus apart. With over 18 years in LED technology development, I ensure every system delivers the precise lighting conditions your sensors demand."'
                    : isEventsPage
                      ? '"Training is the key to unlocking the full potential of testing technology. I have conducted over 200 workshops worldwide and love sharing knowledge that transforms how teams approach image quality testing."'
                      : '"What excites me every day is the direct impact of our work on image quality worldwide. Whether in smartphones or vehicle cameras – our solutions make the difference."'
                  }
                </blockquote>
                <cite className="text-white not-italic">
                  <div className="font-semibold text-white">
                    {isChartsPage 
                      ? 'Markus Weber' 
                      : isSolutionBundlePage 
                        ? 'Dr. Stefan Mueller'
                      : isAutomotivePage
                        ? 'Dr. Anna Hoffmann'
                      : isArcturusPage
                        ? 'Dr. Thomas Lichtner'
                      : isEventsPage
                        ? 'Michael Training'
                        : 'Laura Neumann'
                    }
                  </div>
                  <div className="text-sm">
                    {isChartsPage 
                      ? 'Technical Chart Specialist' 
                      : isSolutionBundlePage 
                        ? 'Test Solutions & Calibration Expert'
                      : isAutomotivePage
                        ? 'Automotive Vision Expert & IEEE-P2020 Specialist'
                      : isArcturusPage
                        ? 'LED Lighting Technology Specialist & Arcturus Expert'
                      : isEventsPage
                        ? 'Head of Training & Professional Development'
                        : 'Head of Optical Systems'
                    }
                  </div>
                </cite>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Bottom Section - Footer Menu */}
      <div className="border-t border-[#4B4A4A] bg-[#4B4A4A]">
        <div className="container mx-auto px-6 py-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-white">
              {t('footer.copyright')}
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a href="#" className="text-white hover:text-white transition-colors">
                {t('footer.terms')}
              </a>
              <span className="text-white">•</span>
              <a href="#" className="text-white hover:text-white transition-colors">
                {t('footer.imprint')}
              </a>
              <span className="text-white">•</span>
              <a href="#" className="text-white hover:text-white transition-colors">
                {t('footer.privacy')}
              </a>
              <span className="text-white">•</span>
              <a href="#" className="text-white hover:text-white transition-colors">
                {t('footer.compliance')}
              </a>
              <span className="text-white">•</span>
              <a href="#" className="text-white hover:text-white transition-colors">
                {t('footer.carbon')}
              </a>
              <span className="text-white">•</span>
              <a href="#" className="text-white hover:text-white transition-colors">
                {t('footer.esg')}
              </a>
              <span className="text-white">•</span>
              <a href="#" className="text-white hover:text-white transition-colors">
                {t('footer.disposal')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;