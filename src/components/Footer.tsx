import { Button } from "@/components/ui/button";
import { Phone, Clock } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import teamLaura from "@/assets/team-laura-color.jpg";
import teamMarkus from "@/assets/team-markus-color.jpg";
import teamStefan from "@/assets/team-stefan-color.jpg";
import teamAnna from "@/assets/team-anna-automotive.jpg";
import teamThomas from "@/assets/team-thomas-lighting.jpg";
import trainingInstructor from "@/assets/training-instructor.jpg";

const Footer = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const isChartsPage = location.pathname === '/products/charts' || location.pathname.startsWith('/products/charts/');
  const isSolutionBundlePage = location.pathname.startsWith('/solution/');
  const isAutomotivePage = location.pathname === '/automotive';
  const isArcturusPage = location.pathname === '/product/arcturus';
  const isEventsPage = location.pathname === '/events';
  
  const getPageType = () => {
    if (isChartsPage) return 'charts';
    if (isSolutionBundlePage) return 'solution';
    if (isAutomotivePage) return 'automotive';
    if (isArcturusPage) return 'arcturus';
    if (isEventsPage) return 'events';
    return 'default';
  };
  
  const pageType = getPageType();

  return (
    <footer id="footer" className="bg-[#4B4A4A] border-t border-[#4B4A4A]">
      {/* Vision CTA Section */}
      <div className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          {t.footer.cta[pageType]}
        </h2>
        <p className="text-xl text-white max-w-4xl mx-auto leading-relaxed">
          {t.footer.ctaDesc[pageType]}
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
                {t.footer.contactHeadline[pageType]}<br />
                {t.footer.contactSubline[pageType]}
              </h2>
              <p className="text-white leading-relaxed">
                {t.footer.contactDesc[pageType]}
              </p>
            </div>

            <div className="space-y-4">              
              <div className="space-y-2">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3" style={{ color: '#f5743a' }} />
                  <span className="text-foreground">{t.footer.phoneDE}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3" style={{ color: '#f5743a' }} />
                  <span className="text-foreground">{t.footer.phoneUSA}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3" style={{ color: '#f5743a' }} />
                  <span className="text-foreground">{t.footer.phoneChina}</span>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-3" style={{ color: '#f5743a' }} />
                <span className="text-foreground">{t.footer.officeHours}</span>
              </div>
            </div>

            <Button className="bg-[#f5743a] hover:bg-[#e66428] text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
              {t.footer.button[pageType]}
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
                   className="w-[150px] h-[150px] rounded-lg object-cover"
                 />
              </div>
              <div className="flex-1 text-center md:text-left">
                <blockquote className="text-lg text-white leading-relaxed mb-4">
                  "{t.footer.teamQuote[pageType]}"
                </blockquote>
                <cite className="text-white not-italic">
                  <div className="font-semibold text-white">
                    {t.footer.teamName[pageType]}
                  </div>
                  <div className="text-sm">
                    {t.footer.teamTitle[pageType]}
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
              {t.footer.copyright}
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a href="#" className="text-white hover:text-white transition-colors">
                {t.footer.terms}
              </a>
              <span className="text-white">•</span>
              <a href="#" className="text-white hover:text-white transition-colors">
                {t.footer.imprint}
              </a>
              <span className="text-white">•</span>
              <a href="#" className="text-white hover:text-white transition-colors">
                {t.footer.privacy}
              </a>
              <span className="text-white">•</span>
              <a href="#" className="text-white hover:text-white transition-colors">
                {t.footer.compliance}
              </a>
              <span className="text-white">•</span>
              <a href="#" className="text-white hover:text-white transition-colors">
                {t.footer.carbon}
              </a>
              <span className="text-white">•</span>
              <a href="#" className="text-white hover:text-white transition-colors">
                {t.footer.esg}
              </a>
              <span className="text-white">•</span>
              <a href="#" className="text-white hover:text-white transition-colors">
                {t.footer.disposal}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;