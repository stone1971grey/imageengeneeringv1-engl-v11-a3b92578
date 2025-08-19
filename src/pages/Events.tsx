import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Calendar, MapPin, Clock, Globe, Filter, ArrowUpDown } from "lucide-react";

// Import event images
import eventCameraWorkshop from "@/assets/event-camera-workshop.jpg";
import eventAutomotiveConference from "@/assets/event-automotive-conference.jpg";
import eventTechExpo from "@/assets/event-tech-expo.jpg";
import eventHdrMasterclass from "@/assets/event-hdr-masterclass.jpg";
import eventMedicalSeminar from "@/assets/event-medical-seminar.jpg";
import eventAutomotiveStandards from "@/assets/event-automotive-standards.jpg";
import eventsHero from "@/assets/events-hero.jpg";

// Event data types
interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: {
    city: string;
    country: string;
    coordinates: [number, number];
  };
  category: "Schulung" | "Workshop" | "Messe";
  language: "EN" | "DE";
  description: string;
  image: string;
  isPast: boolean;
  registrationUrl?: string;
}

// Sample event data
const sampleEvents: Event[] = [
  {
    id: "1",
    title: "Advanced Camera Testing Workshop",
    date: "2024-03-15",
    time: "09:00 - 17:00",
    location: {
      city: "Köln",
      country: "Deutschland",
      coordinates: [6.9603, 50.9375]
    },
    category: "Workshop",
    language: "DE",
    description: "Comprehensive workshop covering advanced camera testing methodologies using Arcturus systems and industry-standard test charts.",
    image: eventCameraWorkshop,
    isPast: false,
    registrationUrl: "#"
  },
  {
    id: "2",
    title: "ADAS Vision Testing Seminar",
    date: "2024-04-08",
    time: "10:00 - 16:00",
    location: {
      city: "Tokyo",
      country: "Japan",
      coordinates: [139.6917, 35.6895]
    },
    category: "Schulung",
    language: "EN",
    description: "Professional training on ADAS vision system testing protocols and IEEE P2020 compliance requirements.",
    image: eventAutomotiveConference,
    isPast: false,
    registrationUrl: "#"
  },
  {
    id: "3",
    title: "Mobile Camera Quality Conference",
    date: "2024-05-20",
    time: "08:30 - 18:00",
    location: {
      city: "San Francisco",
      country: "USA",
      coordinates: [-122.4194, 37.7749]
    },
    category: "Messe",
    language: "EN",
    description: "Industry conference showcasing the latest developments in mobile camera quality testing and VCX standards.",
    image: eventTechExpo,
    isPast: false,
    registrationUrl: "#"
  },
  {
    id: "4",
    title: "HDR Testing Masterclass",
    date: "2024-06-12",
    time: "09:30 - 17:30",
    location: {
      city: "München",
      country: "Deutschland",
      coordinates: [11.5820, 48.1351]
    },
    category: "Workshop",
    language: "DE",
    description: "In-depth masterclass on HDR testing techniques using Arcturus LED systems and advanced measurement tools.",
    image: eventHdrMasterclass,
    isPast: false,
    registrationUrl: "#"
  },
  {
    id: "5",
    title: "Automotive Vision Standards Workshop",
    date: "2024-07-15",
    time: "09:00 - 16:00",
    location: {
      city: "Shanghai",
      country: "China",
      coordinates: [121.4737, 31.2304]
    },
    category: "Schulung",
    language: "EN",
    description: "Comprehensive training on automotive vision testing standards and regulatory compliance.",
    image: eventAutomotiveStandards,
    isPast: false,
    registrationUrl: "#"
  },
  {
    id: "6",
    title: "Image Quality Expo 2024",
    date: "2024-09-25",
    time: "08:00 - 19:00",
    location: {
      city: "London",
      country: "United Kingdom",
      coordinates: [-0.1276, 51.5074]
    },
    category: "Messe",
    language: "EN",
    description: "Annual expo featuring the latest innovations in image quality testing technology and industry best practices.",
    image: eventTechExpo,
    isPast: false,
    registrationUrl: "#"
  },
  // Past events
  {
    id: "past1",
    title: "Medical Imaging Quality Seminar",
    date: "2023-11-15",
    time: "10:00 - 16:00",
    location: {
      city: "Berlin",
      country: "Deutschland",
      coordinates: [13.4050, 52.5200]
    },
    category: "Schulung",
    language: "DE",
    description: "Specialized training on medical imaging quality assessment and endoscopy testing standards.",
    image: eventMedicalSeminar,
    isPast: true
  },
  {
    id: "past2",
    title: "Automotive Testing Conference 2023",
    date: "2023-10-08",
    time: "09:00 - 18:00",
    location: {
      city: "Detroit",
      country: "USA",
      coordinates: [-83.0458, 42.3314]
    },
    category: "Messe",
    language: "EN",
    description: "Major automotive testing conference with focus on ADAS and autonomous vehicle vision systems.",
    image: eventAutomotiveConference,
    isPast: true
  }
];

const Events = () => {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-asc");

  // Get unique countries for filter
  const countries = [...new Set(sampleEvents.map(event => event.location.country))];

  // Filter and sort events
  const filteredEvents = sampleEvents
    .filter(event => {
      if (categoryFilter !== "all" && event.category !== categoryFilter) return false;
      if (countryFilter !== "all" && event.location.country !== countryFilter) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "date-asc":
        default:
          return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });

  const upcomingEvents = filteredEvents.filter(event => !event.isPast);
  const pastEvents = filteredEvents.filter(event => event.isPast);

  // Featured event (next upcoming)
  const featuredEvent = upcomingEvents[0];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const EventCard = ({ event }: { event: Event }) => (
    <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-video w-full overflow-hidden">
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant={event.category === "Messe" ? "default" : "secondary"}>
            {event.category}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {event.language}
          </Badge>
        </div>
        <CardTitle className="text-xl leading-tight">{event.title}</CardTitle>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{event.location.city}, {event.location.country}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="text-sm leading-relaxed">
          {event.description}
        </CardDescription>
        
        {/* Simple map placeholder */}
        <div className="bg-muted rounded-lg h-32 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">{event.location.city}, {event.location.country}</p>
          </div>
        </div>
        
          {!event.isPast && event.registrationUrl && (
            <Button className="w-full" asChild>
              <a href={event.registrationUrl}>Register Now</a>
            </Button>
          )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/70"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${eventsHero})`
          }}
        />
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Events & Training
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-2xl">
              Our current training courses, workshops and events worldwide.
            </p>
            
            {/* Featured Event Banner */}
            {featuredEvent && (
              <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <Badge className="mb-2">Next Event</Badge>
                      <h3 className="text-xl font-semibold mb-2">{featuredEvent.title}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(featuredEvent.date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {featuredEvent.location.city}, {featuredEvent.location.country}
                        </div>
                        <div className="flex items-center gap-1">
                          <Globe className="h-4 w-4" />
                          {featuredEvent.language}
                        </div>
                      </div>
                    </div>
                    <Button size="lg" asChild>
                      <a href={featuredEvent.registrationUrl}>Register Now</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Events Content */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {/* Filters and Sorting */}
          <div className="mb-8 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Kategorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Schulung">Training</SelectItem>
                  <SelectItem value="Workshop">Workshop</SelectItem>
                  <SelectItem value="Messe">Trade Fair</SelectItem>
                </SelectContent>
              </Select>

              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="w-48">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Land" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sortieren" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-asc">Date (ascending)</SelectItem>
                <SelectItem value="date-desc">Date (descending)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Events Tabs */}
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="upcoming">Current Events</TabsTrigger>
              <TabsTrigger value="past">Past Events</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-8">
              {upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No events found</h3>
                    <p className="text-muted-foreground">
                      No events were found with the current filters.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="past" className="mt-8">
              {pastEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No past events</h3>
                    <p className="text-muted-foreground">
                      No past events have been archived yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Events;