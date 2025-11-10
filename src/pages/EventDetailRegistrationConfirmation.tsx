import { useLocation, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ActionHero from "@/components/ActionHero";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, CheckCircle2 } from "lucide-react";

const EventDetailRegistrationConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { eventTitle, eventDate, eventTime, eventLocation, eventImageUrl } = location.state || {};

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <ActionHero
        title={eventTitle || "Event Registration"}
        subtitle="Anmeldung bestätigt"
        backgroundImage={eventImageUrl || "/images/event-placeholder.jpg"}
        flipImage={false}
      />

      <main className="flex-grow container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Anmeldung Bestätigt
              </h2>
              <p className="text-lg text-muted-foreground">
                Vielen Dank für Ihre Anmeldung. Wir haben Ihre Informationen erhalten und Sie erhalten in Kürze eine Bestätigungs-E-Mail mit allen Event-Details.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Event Details</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#f9dc24] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Event Datum</p>
                    <p className="font-medium text-foreground">{formatDate(eventDate)}</p>
                  </div>
                </div>
                {eventTime && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#f9dc24] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Uhrzeit</p>
                      <p className="font-medium text-foreground">{eventTime}</p>
                    </div>
                  </div>
                )}
                {eventLocation && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#f9dc24] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ort</p>
                      <p className="font-medium text-foreground">{eventLocation}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#f9dc24]/10 border border-[#f9dc24]/20 rounded-lg p-6 mb-8">
              <p className="text-sm text-foreground leading-relaxed">
                <span className="font-semibold">Wichtiger Hinweis:</span> Sie erhalten 2 Tage vor der Veranstaltung eine Erinnerungs-E-Mail mit allen relevanten Details und Wegbeschreibungen zum Veranstaltungsort.
              </p>
            </div>

            <div className="text-center">
              <Button
                onClick={() => navigate('/events')}
                size="lg"
                className="min-w-[200px] bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black"
              >
                Weitere Events ansehen
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventDetailRegistrationConfirmation;
