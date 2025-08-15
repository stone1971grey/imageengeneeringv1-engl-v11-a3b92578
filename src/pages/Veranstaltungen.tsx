import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Clock, Users, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const Veranstaltungen = () => {
  const upcomingEvents = [
    {
      id: 1,
      title: "Vision Stuttgart 2024",
      date: "5.-7. November 2024",
      location: "Messe Stuttgart",
      time: "09:00 - 18:00 Uhr",
      description: "Besuchen Sie uns auf der führenden Fachmesse für Bildverarbeitung. Wir präsentieren unsere neuesten Testcharts und Beleuchtungslösungen.",
      standNumber: "Halle 1, Stand A15",
      isHighlight: true
    },
    {
      id: 2,
      title: "Automotive Testing Expo",
      date: "12.-14. März 2025",
      location: "Stuttgart",
      time: "10:00 - 17:00 Uhr",
      description: "Spezialmesse für Automotive-Testtechnologien. Präsentation unserer ADAS-Testlösungen und IEEE P2020-konformen Setups.",
      standNumber: "Halle 3, Stand B22"
    },
    {
      id: 3,
      title: "Webinar: HDR Testing Best Practices",
      date: "18. April 2025",
      location: "Online",
      time: "14:00 - 15:30 Uhr",
      description: "Kostenloses Webinar über bewährte Verfahren für HDR-Tests in der Automobilindustrie.",
      isWebinar: true
    }
  ];

  const pastEvents = [
    {
      id: 4,
      title: "IBC 2024",
      date: "13.-16. September 2024",
      location: "Amsterdam",
      description: "Internationale Broadcast-Messe mit Fokus auf Bildqualität in der Medienproduktion."
    },
    {
      id: 5,
      title: "Mobile World Congress",
      date: "26. Februar - 1. März 2024",
      location: "Barcelona",
      description: "Präsentation von VCX-konformen Testlösungen für Mobile-Kamerasysteme."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Veranstaltungen
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8">
              Treffen Sie uns auf Messen, Konferenzen und bei Webinaren rund um Bildqualitätstests
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
              Kommende Veranstaltungen
            </h2>
            
            <div className="grid gap-8 lg:gap-12">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className={`overflow-hidden ${event.isHighlight ? 'border-primary shadow-lg' : ''}`}>
                  <CardHeader className={`${event.isHighlight ? 'bg-primary/5' : ''}`}>
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <CardTitle className="text-2xl flex items-center gap-3">
                        {event.isWebinar ? (
                          <ExternalLink className="h-6 w-6 text-primary" />
                        ) : (
                          <Calendar className="h-6 w-6 text-primary" />
                        )}
                        {event.title}
                        {event.isHighlight && (
                          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                            Highlight
                          </span>
                        )}
                      </CardTitle>
                      <div className="text-lg font-semibold text-primary">
                        {event.date}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <MapPin className="h-5 w-5" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Clock className="h-5 w-5" />
                          <span>{event.time}</span>
                        </div>
                        {event.standNumber && (
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <Users className="h-5 w-5" />
                            <span>{event.standNumber}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-4">
                          {event.description}
                        </p>
                        <Button variant="outline" className="w-full lg:w-auto">
                          {event.isWebinar ? 'Anmelden' : 'Mehr erfahren'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Past Events */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
              Vergangene Veranstaltungen
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
                <Card key={event.id} className="opacity-75 hover:opacity-100 transition-opacity">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      {event.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {event.date}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {event.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Verpassen Sie keine Veranstaltung
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Kontaktieren Sie uns, um über kommende Events informiert zu werden oder um ein persönliches Treffen zu vereinbaren.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg">
                Newsletter abonnieren
              </Button>
              <Button variant="outline" size="lg" className="text-lg">
                Kontakt aufnehmen
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Veranstaltungen;