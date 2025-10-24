import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "react-router-dom";
import logoIE from "@/assets/logo-ie-black.png";
import eventCameraWorkshop from "@/assets/event-camera-workshop.jpg";
import { Calendar, MapPin, Clock } from "lucide-react";

const EventRegistrationConfirmation = () => {
  const location = useLocation();
  const state = location.state as { 
    firstName?: string; 
    lastName?: string; 
    selectedEvent?: {
      id: string;
      title: string;
      date: string;
      time: string;
      location: { city: string; country: string };
      image: string;
    }
  } | null;
  
  // Fallback data for preview
  const firstName = state?.firstName || "Max";
  const lastName = state?.lastName || "Mustermann";
  const selectedEvent = state?.selectedEvent || {
    id: "1",
    title: "Advanced Camera Testing Workshop",
    date: "2025-03-15",
    time: "09:00 - 17:00",
    location: {
      city: "Köln",
      country: "Deutschland"
    },
    image: eventCameraWorkshop
  };
  
  const userName = firstName && lastName ? `${firstName} ${lastName}` : "Leserin/Leser";

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Sample similar events for teaser
  const similarEvents = [
    {
      title: "HDR Masterclass",
      date: "2025-04-22",
      location: "München, Deutschland"
    },
    {
      title: "Automotive Standards Conference",
      date: "2025-05-10",
      location: "Stuttgart, Deutschland"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-6">
      <Card className="max-w-3xl w-full bg-white shadow-2xl border-0 overflow-hidden">
        {/* Modern Header with Logo */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-8">
          <div className="flex items-center justify-center">
            <img src={logoIE} alt="Image Engineering" className="h-16 brightness-0 invert" />
          </div>
        </div>

        {/* Email Content */}
        <CardContent className="px-8 py-10 space-y-8">
          {/* Title Section */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">
              Vielen Dank für Ihre Anmeldung
            </h1>
            <div className="h-1 w-20 rounded-full" style={{ backgroundColor: '#f5743a' }}></div>
          </div>

          {/* Greeting */}
          <div className="space-y-4">
            <p className="text-lg text-slate-700">
              Sehr geehrte/r {userName},
            </p>
            <p className="text-base text-slate-600 leading-relaxed">
              vielen Dank für Ihre Anmeldung. Wir freuen uns, Sie bei unserer Veranstaltung begrüßen zu dürfen.
            </p>
          </div>

          {/* Event Details Section */}
          {selectedEvent && (
            <div className="rounded-2xl overflow-hidden border border-slate-200">
              {selectedEvent.image && (
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={selectedEvent.image} 
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6 space-y-4" style={{ backgroundColor: '#f3f3f5' }}>
                <h2 className="text-xl font-semibold text-slate-900">
                  {selectedEvent.title}
                </h2>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" style={{ color: '#f5743a' }} />
                    <span>{formatDate(selectedEvent.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" style={{ color: '#f5743a' }} />
                    <span>{selectedEvent.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" style={{ color: '#f5743a' }} />
                    <span>{selectedEvent.location.city}, {selectedEvent.location.country}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reminder Information */}
          <div className="pt-6 border-t border-slate-200">
            <div className="border-l-4 p-4 rounded-r-lg" style={{ backgroundColor: '#f3f3f5', borderLeftColor: '#f5743a' }}>
              <p className="text-sm text-slate-700 leading-relaxed">
                <span className="font-semibold text-slate-900">Wichtiger Hinweis:</span> Sie erhalten 2 Tage vor der Veranstaltung eine Erinnerung mit allen relevanten Details und Informationen zur Anfahrt.
              </p>
            </div>
          </div>

          {/* Similar Events Teaser */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Weitere interessante Veranstaltungen
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {similarEvents.map((event, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                  style={{ backgroundColor: '#f3f3f5' }}
                >
                  <h4 className="font-semibold text-slate-900 mb-2">{event.title}</h4>
                  <p className="text-sm text-slate-600 flex items-center gap-2">
                    <Calendar className="h-4 w-4" style={{ color: '#f5743a' }} />
                    {formatDate(event.date)}
                  </p>
                  <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4" style={{ color: '#f5743a' }} />
                    {event.location}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Closing */}
          <div className="space-y-3 pt-4">
            <p className="text-base text-slate-600">
              Wir freuen uns auf Ihre Teilnahme!
            </p>
            <div>
              <p className="text-lg font-semibold text-slate-900">
                Ihr Image Engineering Team
              </p>
              <p className="text-sm text-slate-500">
                Experten für Automotive Imaging Standards
              </p>
            </div>
          </div>
        </CardContent>

        {/* Modern Footer */}
        <div className="bg-slate-900 px-8 py-6 text-center space-y-2">
          <p className="text-xs text-slate-400">
            info@image-engineering.de
          </p>
          <p className="text-xs text-slate-400">
            © 2024 Image Engineering. Alle Rechte vorbehalten.
          </p>
          <p className="text-xs text-slate-500">
            Führender Anbieter von Automotive Kamera-Testlösungen
          </p>
        </div>
      </Card>
    </div>
  );
};

export default EventRegistrationConfirmation;
