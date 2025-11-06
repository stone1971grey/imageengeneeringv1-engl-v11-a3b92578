import { useLocation, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ActionHero from "@/components/ActionHero";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";

const EventAlreadyRegistered = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { eventTitle, eventDate, eventTime, eventImageUrl, registrationDate } = location.state || {};

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <ActionHero
        title={eventTitle || "Event Registration"}
        subtitle="You are already registered"
        backgroundImage={eventImageUrl || "/images/event-placeholder.jpg"}
        flipImage={false}
      />

      <main className="flex-grow container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Already Registered
              </h2>
              <p className="text-lg text-muted-foreground">
                You have already registered for this event on{' '}
                <span className="font-semibold text-foreground">
                  {formatDate(registrationDate)}
                </span>{' '}
                at{' '}
                <span className="font-semibold text-foreground">
                  {formatTime(registrationDate)}
                </span>
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Event Details</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Event Date</p>
                    <p className="font-medium text-foreground">{eventDate}</p>
                  </div>
                </div>
                {eventTime && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Event Time</p>
                      <p className="font-medium text-foreground">{eventTime}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={() => navigate('/events')}
                size="lg"
                className="min-w-[200px]"
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

export default EventAlreadyRegistered;
