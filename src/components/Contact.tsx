import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const Contact = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Bereit, Ihre Vision zu
            <span className="bg-gradient-primary bg-clip-text text-transparent"> transformieren?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Lassen Sie uns besprechen, wie unsere Bildverarbeitungslösungen Ihr Unternehmen revolutionieren können. 
            Kontaktieren Sie noch heute unsere Experten.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-6">Senden Sie uns eine Nachricht</h3>
              
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Vorname</label>
                    <Input placeholder="Max" className="bg-background/50" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nachname</label>
                    <Input placeholder="Mustermann" className="bg-background/50" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">E-Mail</label>
                  <Input type="email" placeholder="max@unternehmen.com" className="bg-background/50" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Unternehmen</label>
                  <Input placeholder="Ihr Unternehmen" className="bg-background/50" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Projektdetails</label>
                  <Textarea 
                    placeholder="Erzählen Sie uns von Ihren Bildverarbeitungsanforderungen..."
                    className="bg-background/50 min-h-[120px]"
                  />
                </div>
                
                <Button className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300 group">
                  Nachricht senden
                  <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">Kontaktieren Sie uns</h3>
              <p className="text-muted-foreground leading-relaxed">
                Unser Team von Bildverarbeitungsexperten ist bereit, Ihnen dabei zu helfen, 
                das volle Potenzial Ihrer visuellen Daten zu erschließen. Von der ersten Beratung 
                bis zur Bereitstellung und darüber hinaus sind wir da, um Sie zu unterstützen.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="p-3 bg-primary/10 rounded-lg mr-4">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">E-Mail</h4>
                  <p className="text-muted-foreground">contact@image-engineering.de</p>
                  <p className="text-muted-foreground">support@image-engineering.de</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-3 bg-primary/10 rounded-lg mr-4">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Telefon</h4>
                  <p className="text-muted-foreground">+49 (0) 123 456 789</p>
                  <p className="text-muted-foreground text-sm">Mo-Fr, 9:00-18:00 MEZ</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-3 bg-primary/10 rounded-lg mr-4">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Standort</h4>
                  <p className="text-muted-foreground">Berlin, Deutschland</p>
                  <p className="text-muted-foreground text-sm">Europäische Union</p>
                </div>
              </div>
            </div>

            {/* CTA Box */}
            <Card className="bg-gradient-primary p-6 text-primary-foreground">
              <div className="text-center">
                <h4 className="text-lg font-semibold mb-2">Starten Sie Ihr Projekt heute</h4>
                <p className="text-primary-foreground/80 mb-4">
                  Kostenlose Beratung und technische Bewertung
                </p>
                <Button variant="secondary" className="bg-background text-foreground hover:bg-background/90">
                  Termin vereinbaren
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;