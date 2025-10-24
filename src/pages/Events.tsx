import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ActionHero from "@/components/ActionHero";
import { Calendar, MapPin, Clock } from "lucide-react";

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
  // Sort events by date (ascending)
  const sortedEvents = [...sampleEvents].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });


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
            <Button className="w-full bg-[#f5743a] hover:bg-[#f5743a]/90 text-white" asChild>
              <a href={event.registrationUrl}>Register Now</a>
            </Button>
          )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <ActionHero 
        title="Events & Training"
        subtitle="Our current training courses, workshops and events worldwide."
        backgroundImage={eventsHero}
      />

      {/* Events Content */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Upcoming Events & Training</h2>
            <p className="text-white max-w-2xl">
              Join our expert-led workshops, training sessions, and industry events to expand your knowledge in camera testing, image quality measurement, and industry standards.
            </p>
          </div>
          
          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Events;