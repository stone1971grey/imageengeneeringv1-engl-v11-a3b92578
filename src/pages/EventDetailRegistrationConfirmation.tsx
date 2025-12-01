import { useLocation, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ActionHero from "@/components/ActionHero";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, CheckCircle2 } from "lucide-react";

const EventDetailRegistrationConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get event data from location.state or fallback to localStorage
  const getEventData = () => {
    if (location.state) return location.state;
    
    const stored = localStorage.getItem('lastEventRegistration');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored event data', e);
      }
    }
    return {};
  };
  
  const { eventTitle, eventDate, eventTime, eventLocation, eventImageUrl } = getEventData();

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
        subtitle="Registration confirmed"
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
                Registration Confirmed
              </h2>
              <p className="text-lg text-muted-foreground">
                Thank you for your registration. We have received your information and you will receive a confirmation email shortly with all event details.
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Event Details</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#f9dc24] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Event Date</p>
                    <p className="font-medium text-foreground">{formatDate(eventDate)}</p>
                  </div>
                </div>
                {eventTime && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#f9dc24] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium text-foreground">{eventTime}</p>
                    </div>
                  </div>
                )}
                {eventLocation && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#f9dc24] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium text-foreground">{eventLocation}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#f9dc24]/10 border border-[#f9dc24]/20 rounded-lg p-6 mb-8">
              <p className="text-sm text-foreground leading-relaxed">
                <span className="font-semibold">Important Note:</span> You will receive a reminder email 2 days before the event with all relevant details and directions to the venue.
              </p>
            </div>

            <div className="text-center">
              <Button
                onClick={() => navigate('/events')}
                size="lg"
                className="min-w-[200px] bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black"
              >
                Browse Other Events
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
