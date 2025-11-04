import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "react-router-dom";
import logoIE from "@/assets/logo-ie-black.png";
import { Calendar, MapPin, Clock } from "lucide-react";

const EventDetailRegistrationConfirmation = () => {
  const location = useLocation();
  const state = location.state as { 
    firstName?: string; 
    lastName?: string; 
    eventData?: {
      title: string;
      date: string;
      time: string;
      location: string;
      image: string;
    }
  } | null;
  
  const firstName = state?.firstName || "Max";
  const lastName = state?.lastName || "Mustermann";
  const eventData = state?.eventData;
  
  const userName = `${firstName} ${lastName}`;

  // Sample similar events for teaser
  const similarEvents = [
    {
      title: "Advanced Camera Testing Workshop",
      date: "15. März 2025",
      location: "Köln, Deutschland"
    },
    {
      title: "HDR Testing Masterclass",
      date: "12. Juni 2025",
      location: "München, Deutschland"
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
            <div className="h-1 w-20 rounded-full" style={{ backgroundColor: '#f9dc24' }}></div>
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
          {eventData && (
            <div className="rounded-2xl overflow-hidden border border-slate-200">
              {eventData.image && (
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={eventData.image} 
                    alt={eventData.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6 space-y-4" style={{ backgroundColor: '#f3f3f5' }}>
                <h2 className="text-xl font-semibold text-slate-900">
                  {eventData.title}
                </h2>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" style={{ color: '#f9dc24' }} />
                    <span>{eventData.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" style={{ color: '#f9dc24' }} />
                    <span>{eventData.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" style={{ color: '#f9dc24' }} />
                    <span>{eventData.location}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reminder Information */}
          <div className="pt-6 border-t border-slate-200">
            <div className="border-l-4 p-4 rounded-r-lg" style={{ backgroundColor: '#f3f3f5', borderLeftColor: '#f9dc24' }}>
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
                    <Calendar className="h-4 w-4" style={{ color: '#f9dc24' }} />
                    {event.date}
                  </p>
                  <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4" style={{ color: '#f9dc24' }} />
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

export default EventDetailRegistrationConfirmation;
