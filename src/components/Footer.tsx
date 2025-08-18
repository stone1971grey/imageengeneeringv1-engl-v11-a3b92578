import { Button } from "@/components/ui/button";
import { Mail, Phone, Clock } from "lucide-react";
import { useLocation } from "react-router-dom";
import teamLaura from "@/assets/team-laura-color.jpg";
import teamMarkus from "@/assets/team-markus-color.jpg";

const Footer = () => {
  const location = useLocation();
  const isChartsPage = location.pathname === '/products/charts';

  return (
    <footer className="bg-background border-t border-border">
      {/* Vision CTA Section */}
      <div className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          {isChartsPage ? 'Beratung bei Testcharts?' : 'Bereit, Ihre Vision zu transformieren?'}
        </h2>
        <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
          {isChartsPage 
            ? 'Unsere Experten helfen Ihnen bei der Auswahl der richtigen Testcharts für Ihre spezifischen Anforderungen. Profitieren Sie von unserer langjährigen Erfahrung in der Bildqualitätsanalyse.'
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
                {isChartsPage ? 'Fragen zu Testcharts?' : 'Sie haben Fragen?'}<br />
                {isChartsPage ? 'Sprechen Sie mit unseren Chart-Experten.' : 'Sprechen Sie mit uns.'}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {isChartsPage 
                  ? 'Unsere Testchart-Experten beraten Sie gerne bei der Auswahl der optimalen Charts für Ihre Bildqualitätsmessungen und unterstützen Sie bei der Konfiguration Ihrer Testsysteme.'
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

            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-3">
              {isChartsPage ? 'Ihre Frage zu unseren Charts' : 'Jetzt Demo vereinbaren'}
            </Button>
          </div>

          {/* Right Column - Team Quote */}
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0">
                 <img 
                   src={isChartsPage ? teamMarkus : teamLaura}
                   alt={isChartsPage ? "Markus Weber, Technical Chart Specialist" : "Laura Neumann, Head of Optical Systems"}
                   className="w-[150px] h-[150px] rounded-full object-cover"
                 />
              </div>
              <div className="flex-1">
                <blockquote className="text-lg text-foreground leading-relaxed mb-4">
                  {isChartsPage 
                    ? '"Präzise Testcharts sind das Fundament jeder seriösen Bildqualitätsanalyse. Mit über 15 Jahren Erfahrung helfe ich Ihnen dabei, die perfekten Charts für Ihre Messungen zu finden."'
                    : '"Was mich jeden Tag begeistert, ist der direkte Einfluss unserer Arbeit auf Bildqualität weltweit. Ob bei Smartphones oder Fahrzeugkameras – unsere Lösungen machen den Unterschied."'
                  }
                </blockquote>
                <cite className="text-muted-foreground not-italic">
                  <div className="font-semibold text-foreground">
                    {isChartsPage ? 'Markus Weber' : 'Laura Neumann'}
                  </div>
                  <div className="text-sm">
                    {isChartsPage ? 'Technical Chart Specialist' : 'Head of Optical Systems'}
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