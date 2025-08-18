import { Button } from "@/components/ui/button";
import { Mail, Phone, Clock } from "lucide-react";
import { useLocation } from "react-router-dom";
import teamLaura from "@/assets/team-laura-color.jpg";
import teamMarkus from "@/assets/team-markus-color.jpg";
import teamStefan from "@/assets/team-stefan-color.jpg";
import teamAnna from "@/assets/team-anna-automotive.jpg";

const Footer = () => {
  const location = useLocation();
  const isChartsPage = location.pathname === '/products/charts' || location.pathname.startsWith('/products/charts/');
  const isSolutionBundlePage = location.pathname.startsWith('/solution/');
  const isAutomotivePage = location.pathname === '/automotive';

  return (
    <footer className="bg-background border-t border-border">
      {/* Vision CTA Section */}
      <div className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          {isChartsPage 
            ? 'Beratung bei Testcharts?' 
            : isSolutionBundlePage 
              ? 'Maßgeschneiderte Lösungspakete für Ihre Anwendung'
            : isAutomotivePage
              ? 'Automotive Kameratest-Lösungen der nächsten Generation'
              : 'Bereit, Ihre Vision zu transformieren?'
          }
        </h2>
        <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
          {isChartsPage 
            ? 'Unsere Experten helfen Ihnen bei der Auswahl der richtigen Testcharts für Ihre spezifischen Anforderungen. Profitieren Sie von unserer langjährigen Erfahrung in der Bildqualitätsanalyse.'
            : isSolutionBundlePage
              ? 'Profitieren Sie von unseren kompletten Testlösungen und Kalibrierungspaketen. Wir entwickeln individuelle Lösungen, die perfekt auf Ihre Anforderungen zugeschnitten sind.'
            : isAutomotivePage
              ? 'Von ADAS-Kameras bis zu Fahrerassistenzsystemen - unsere spezialisierten Automotive-Testlösungen gewährleisten höchste Sicherheitsstandards. Lassen Sie uns gemeinsam die Zukunft des autonomen Fahrens gestalten.'
              : 'Lassen Sie uns besprechen, wie unsere Bildverarbeitungslösungen Ihr Unternehmen revolutionieren können. Kontaktieren Sie noch heute unsere Experten.'
          }
        </p>
      </div>

      {/* Contact & Team Quote Section */}
      <div className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left Column - Contact */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                {isChartsPage 
                  ? 'Fragen zu Testcharts?' 
                  : isSolutionBundlePage 
                    ? 'Individuelle Lösungspakete gewünscht?'
                  : isAutomotivePage
                    ? 'Automotive Kameratests?'
                    : 'Sie haben Fragen?'
                }<br />
                {isChartsPage 
                  ? 'Sprechen Sie mit unseren Chart-Experten.' 
                  : isSolutionBundlePage 
                    ? 'Sprechen Sie mit unseren Lösungsexperten.'
                  : isAutomotivePage
                    ? 'Sprechen Sie mit unseren Automotive-Experten.'
                    : 'Sprechen Sie mit uns.'
                }
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {isChartsPage 
                  ? 'Unsere Testchart-Experten beraten Sie gerne bei der Auswahl der optimalen Charts für Ihre Bildqualitätsmessungen und unterstützen Sie bei der Konfiguration Ihrer Testsysteme.'
                  : isSolutionBundlePage
                    ? 'Unsere Lösungsexperten entwickeln maßgeschneiderte Testlösungen und Kalibrierungspakete für Ihre spezifischen Anforderungen. Von der Beratung bis zur Implementierung begleiten wir Sie.'
                  : isAutomotivePage
                    ? 'Unsere Automotive-Spezialisten entwickeln präzise Testverfahren für Fahrzeugkameras, ADAS-Systeme und autonome Fahrfunktionen. Von der IEEE-P2020 Zertifizierung bis zu individuellen Testprotokollen.'
                    : 'Unsere Experten beraten Sie gerne persönlich zu Ihrer Anwendung oder unterstützen Sie bei der Planung Ihrer Testlösung.'
                }
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-primary mr-3" />
                <span className="text-foreground">info@image-engineering.de</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-primary mr-3" />
                  <span className="text-foreground">Telefon (DE): +49 2273 99 99 1-0</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-primary mr-3" />
                  <span className="text-foreground">Telefon (USA): +1 408 386 1496</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-primary mr-3" />
                  <span className="text-foreground">Telefon (China): +86 158 8961 9096</span>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-primary mr-3" />
                <span className="text-foreground">Bürozeiten: Mo–Fr, 9–17 Uhr (CET)</span>
              </div>
            </div>

            <Button className="bg-[#3D7BA2] hover:bg-[#326591] text-white px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
              {isChartsPage 
                ? 'Ihre Frage zu unseren Charts' 
                : isSolutionBundlePage 
                  ? 'Jetzt beratungstermin vereinbaren'
                : isAutomotivePage
                  ? 'Jetzt Beratungstermin vereinbaren'
                  : 'Jetzt Demo vereinbaren'
              }
            </Button>
          </div>

          {/* Right Column - Team Quote */}
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0">
                 <img 
                   src={isChartsPage ? teamMarkus : isSolutionBundlePage ? teamStefan : isAutomotivePage ? teamAnna : teamLaura}
                   alt={isChartsPage 
                     ? "Markus Weber, Technical Chart Specialist" 
                     : isSolutionBundlePage 
                       ? "Dr. Stefan Mueller, Experte für Test Lösungen"
                     : isAutomotivePage
                       ? "Dr. Anna Hoffmann, Automotive Vision Expert"
                       : "Laura Neumann, Head of Optical Systems"
                   }
                   className="w-[150px] h-[150px] rounded-full object-cover"
                 />
              </div>
              <div className="flex-1">
                <blockquote className="text-lg text-foreground leading-relaxed mb-4">
                  {isChartsPage 
                    ? '"Präzise Testcharts sind das Fundament jeder seriösen Bildqualitätsanalyse. Mit über 15 Jahren Erfahrung helfe ich Ihnen dabei, die perfekten Charts für Ihre Messungen zu finden."'
                    : isSolutionBundlePage
                      ? '"Als Experte für Test Lösungen und Kalibrierungslösungen entwickle ich täglich maßgeschneiderte Pakete für unsere Kunden. Jede Lösung ist einzigartig und perfekt auf die individuellen Anforderungen abgestimmt."'
                    : isAutomotivePage
                      ? '"Sicherheit steht bei Automotive-Anwendungen an erster Stelle. Mit über 12 Jahren Erfahrung in der Fahrzeugkamera-Entwicklung sorge ich dafür, dass jeder Test den höchsten Industriestandards entspricht."'
                      : '"Was mich jeden Tag begeistert, ist der direkte Einfluss unserer Arbeit auf Bildqualität weltweit. Ob bei Smartphones oder Fahrzeugkameras – unsere Lösungen machen den Unterschied."'
                  }
                </blockquote>
                <cite className="text-muted-foreground not-italic">
                  <div className="font-semibold text-foreground">
                    {isChartsPage 
                      ? 'Markus Weber' 
                      : isSolutionBundlePage 
                        ? 'Dr. Stefan Mueller'
                      : isAutomotivePage
                        ? 'Dr. Anna Hoffmann'
                        : 'Laura Neumann'
                    }
                  </div>
                  <div className="text-sm">
                    {isChartsPage 
                      ? 'Technical Chart Specialist' 
                      : isSolutionBundlePage 
                        ? 'Experte für Test Lösungen & Kalibrierungslösungen'
                      : isAutomotivePage
                        ? 'Automotive Vision Expert & IEEE-P2020 Spezialist'
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
      <div className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-6 py-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              © Image Engineering GmbH & Co. KG – Mitglied der Nynomic Group
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Impressum
              </a>
              <span className="text-muted-foreground">•</span>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Datenschutz
              </a>
              <span className="text-muted-foreground">•</span>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                AGB
              </a>
              <span className="text-muted-foreground">•</span>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Recycling & Entsorgung
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;