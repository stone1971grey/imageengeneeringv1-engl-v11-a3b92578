import { Button } from "@/components/ui/button";
import { Mail, Phone, Clock } from "lucide-react";
import teamLaura from "@/assets/team-laura.jpg";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      {/* Top Section - Contact & Team Quote */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Left Column - Contact */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Sie haben Fragen? Sprechen Sie mit uns.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Unsere Experten beraten Sie gerne persönlich zu Ihrer Anwendung oder unterstützen Sie bei der Planung Ihrer Testlösung.
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

            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Jetzt Demo vereinbaren
            </Button>
          </div>

          {/* Right Column - Team Quote */}
          <div className="bg-card border border-border rounded-lg p-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="flex-shrink-0">
                <img 
                  src={teamLaura}
                  alt="Laura Neumann, Head of Optical Systems"
                  className="w-16 h-16 rounded-full object-cover grayscale"
                />
              </div>
              <div className="flex-1">
                <blockquote className="text-lg text-foreground leading-relaxed mb-4">
                  "Was mich jeden Tag begeistert, ist der direkte Einfluss unserer Arbeit auf Bildqualität weltweit. Ob bei Smartphones oder Fahrzeugkameras – unsere Lösungen machen den Unterschied."
                </blockquote>
                <cite className="text-muted-foreground not-italic">
                  <div className="font-semibold text-foreground">Laura Neumann</div>
                  <div className="text-sm">Head of Optical Systems</div>
                </cite>
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