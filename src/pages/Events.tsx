import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ActionHero from "@/components/ActionHero";
import { Calendar, MapPin, Clock, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Import event images
import eventCameraWorkshop from "@/assets/event-camera-workshop.jpg";
import eventAutomotiveConference from "@/assets/event-automotive-conference.jpg";
import eventTechExpo from "@/assets/event-tech-expo.jpg";
import eventHdrMasterclass from "@/assets/event-hdr-masterclass.jpg";
import eventMedicalSeminar from "@/assets/event-medical-seminar.jpg";
import eventAutomotiveStandards from "@/assets/event-automotive-standards.jpg";
import eventAdasStreaming from "@/assets/event-adas-streaming.jpg";
import eventsHero from "@/assets/events-hero.jpg";

// Form validation schema
const registrationFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  company: z.string().min(2, { message: "Company must be at least 2 characters" }),
  position: z.string().min(2, { message: "Position must be at least 2 characters" }),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must agree to receive information",
  }),
});

type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

// Event data types
interface Event {
  id: string;
  slug: string;
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
  fullDescription?: string;
  image: string;
  imageUrl?: string; // Public URL for email/external use
  isPast: boolean;
  registrationUrl?: string;
}

// Sample event data
const sampleEvents: Event[] = [
  {
    id: "1",
    slug: "advanced-camera-testing-workshop",
    title: "Advanced Camera Testing Workshop",
    date: "2026-03-15",
    time: "09:00 - 17:00",
    location: {
      city: "Köln",
      country: "Deutschland",
      coordinates: [6.9603, 50.9375]
    },
    category: "Workshop",
    language: "DE",
    description: "Comprehensive workshop covering advanced camera testing methodologies using Arcturus systems and industry-standard test charts.",
    fullDescription: `
      <h3>Advanced Camera Testing Workshop</h3>
      
      <p>Join our comprehensive workshop designed for test engineers, quality assurance professionals, and imaging specialists who want to master advanced camera testing methodologies.</p>
      
      <h3>What You'll Learn</h3>
      <ul>
        <li>Industry-standard testing protocols for automotive and mobile cameras</li>
        <li>Hands-on experience with Arcturus LED systems and test equipment</li>
        <li>Advanced measurement techniques for resolution, color accuracy, and HDR</li>
        <li>IEEE P2020 and EMVA 1288 compliance testing</li>
        <li>Practical analysis of test results and quality metrics</li>
      </ul>
      
      <h3>Workshop Highlights</h3>
      <p>This intensive full-day workshop combines theoretical knowledge with practical hands-on sessions. Participants will work directly with professional test equipment and learn to interpret complex measurement data.</p>
      
      <h3>Who Should Attend</h3>
      <p>Test engineers, quality assurance professionals, camera developers, and anyone involved in image quality assessment and camera performance evaluation.</p>
    `,
    image: eventCameraWorkshop,
    isPast: false,
    registrationUrl: "#"
  },
  {
    id: "2",
    slug: "adas-vision-testing-seminar",
    title: "ADAS Vision Testing Seminar",
    date: "2026-04-08",
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
    slug: "mobile-camera-quality-conference",
    title: "Mobile Camera Quality Conference",
    date: "2026-05-20",
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
    slug: "hdr-testing-masterclass",
    title: "HDR Testing Masterclass",
    date: "2026-06-12",
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
    slug: "automotive-vision-standards-workshop",
    title: "Automotive Vision Standards Workshop",
    date: "2026-07-15",
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
    slug: "image-quality-expo-2026",
    title: "Image Quality Expo 2026",
    date: "2026-09-25",
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
  {
    id: "7",
    slug: "medical-imaging-quality-seminar",
    title: "Medical Imaging Quality Seminar",
    date: "2025-12-15",
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
    isPast: false,
    registrationUrl: "#"
  },
  {
    id: "8",
    slug: "automotive-testing-conference-2026",
    title: "Automotive Testing Conference 2026",
    date: "2026-02-18",
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
    isPast: false,
    registrationUrl: "#"
  },
  {
    id: "9",
    slug: "adas-innovations-live-stream",
    title: "ADAS Innovations Live Stream",
    date: "2025-11-28",
    time: "14:00 - 16:00",
    location: {
      city: "Online Webinar",
      country: "Worldwide",
      coordinates: [0, 0]
    },
    category: "Schulung",
    language: "DE",
    description: "Erfahren Sie in unserem Live-Stream die neuesten Entwicklungen und Innovationen im ADAS-Testing. Experten präsentieren aktuelle Testmethoden, Standards und Best Practices für fortgeschrittene Fahrerassistenzsysteme.",
    fullDescription: `
      <h3>ADAS Innovations Live Stream</h3>
      
      <p>Nehmen Sie an unserem interaktiven Online-Webinar teil und erhalten Sie Einblicke in die neuesten Trends und Technologien im Bereich ADAS-Testing.</p>
      
      <h3>Themen des Webinars</h3>
      <ul>
        <li>Aktuelle IEEE P2020 Standards für ADAS-Kamerasysteme</li>
        <li>Innovative Testmethoden für Kamera- und Sensorsysteme</li>
        <li>HDR-Testing und Low-Light-Performance-Bewertung</li>
        <li>Praxisbeispiele aus der Automotive-Industrie</li>
        <li>Live-Demo: Arcturus LED-Systeme im ADAS-Testing</li>
        <li>Q&A Session mit unseren Experten</li>
      </ul>
      
      <h3>Für wen ist dieses Webinar geeignet?</h3>
      <p>Test-Ingenieure, Quality-Manager, ADAS-Entwickler und alle Fachleute, die sich mit der Bewertung von Fahrerassistenzsystemen beschäftigen.</p>
      
      <h3>Webinar-Details</h3>
      <p>Die Teilnahme ist kostenlos. Nach der Registrierung erhalten Sie die Zugangsdaten per E-Mail. Das Webinar wird aufgezeichnet - registrierte Teilnehmer erhalten im Anschluss Zugang zur Aufzeichnung.</p>
    `,
    image: eventAdasStreaming,
    isPast: false,
    registrationUrl: "#"
  }
];

const Events = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      position: "",
      consent: false,
    },
  });

  const onSubmit = async (data: RegistrationFormValues) => {
    if (!selectedEvent || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Call the edge function to save to database and send to Mautic
      const response = await fetch('https://afrcagkprhtvvucukubf.supabase.co/functions/v1/register-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          company: data.company,
          position: data.position,
          email: data.email,
          consent: true,
          eventName: selectedEvent.title,
          eventSlug: selectedEvent.slug,
          eventDate: selectedEvent.date,
          eventLocation: `${selectedEvent.location.city}, ${selectedEvent.location.country}`,
          eventImage: selectedEvent.imageUrl || selectedEvent.image,
        }),
      });

      await response.json();
      
      // Navigate to the simulated confirmation email page with form data
      navigate('/event_registration_confirmation', {
        state: {
          firstName: data.firstName,
          lastName: data.lastName,
          selectedEvent: {
            id: selectedEvent.id,
            title: selectedEvent.title,
            date: selectedEvent.date,
            time: selectedEvent.time,
            location: selectedEvent.location,
            image: selectedEvent.image
          }
        }
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Registration failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleDetailsClick = (event: Event) => {
    setSelectedEvent(event);
    setRegistrationSuccess(false);
    // Scroll to registration form after state update
    setTimeout(() => {
      const formElement = document.getElementById('registration-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedEvent(null);
      setIsClosing(false);
    }, 500);
  };

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
    <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <div className="aspect-video w-full overflow-hidden">
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <CardHeader className="space-y-3">
        <Badge className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 text-base px-3 py-1.5 font-normal w-fit">
          {event.category}
        </Badge>
        <CardTitle className="text-xl leading-tight">{event.title}</CardTitle>
        <div className="space-y-2 text-base text-white">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-white" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-white" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-white" />
            <span>{event.location.city}, {event.location.country}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <CardDescription className="text-base leading-relaxed text-white flex-1">
          {event.description}
        </CardDescription>
        
        {/* Simple map placeholder */}
        <div className="bg-muted rounded-lg h-32 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-white" />
            <p className="text-base text-white">{event.location.city}, {event.location.country}</p>
          </div>
        </div>
        
        <div className="mt-auto pt-4">
          <Button 
            className="w-full bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black"
            onClick={() => handleDetailsClick(event)}
          >
            {!event.isPast ? "Register Now" : "View Details"}
          </Button>
        </div>
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
          <div className="space-y-6">
            {sortedEvents.map((event, index) => (
              <div key={event.id}>
                {index % 3 === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {sortedEvents.slice(index, index + 3).map((gridEvent) => (
                      <EventCard key={gridEvent.id} event={gridEvent} />
                    ))}
                  </div>
                )}
                
                {/* Show detail view after the clicked event's row */}
                {selectedEvent && selectedEvent.id === event.id && (
                  <div id="registration-form" className={`mb-6 transition-all duration-500 ${isClosing ? 'opacity-0' : 'opacity-100 animate-fade-in'} max-w-4xl mx-auto`}>
                    <Card className={`transition-all duration-500 ${isClosing ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0 animate-scale-in'}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between mb-4">
                          <Badge className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 text-base px-3 py-1.5 font-normal">
                            {selectedEvent.category}
                          </Badge>
                          <Button variant="ghost" onClick={handleClose} className="hover:bg-[#f9dc24] hover:text-black transition-colors">
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                        <CardTitle className="text-3xl">{selectedEvent.title}</CardTitle>
                        <div className="space-y-2 text-base text-white mt-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-white" />
                            <span>{formatDate(selectedEvent.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-white" />
                            <span>{selectedEvent.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-white" />
                            <span>{selectedEvent.location.city}, {selectedEvent.location.country}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {selectedEvent.fullDescription && (
                          <div 
                            className="text-base leading-relaxed [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-foreground [&_p]:mb-3 [&_p]:text-foreground [&_ul]:my-3 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-1 [&_li]:text-foreground [&_li]:pl-1"
                            dangerouslySetInnerHTML={{ __html: selectedEvent.fullDescription }}
                          />
                        )}
                        
                        {!selectedEvent.isPast && (
                          <div className="pt-6 border-t border-border">
                            <div className="space-y-4 mb-6">
                              <p className="text-lg font-semibold">
                                Register for this Event
                              </p>
                              
                              <p className="text-base text-white">
                                Please fill out the registration form below. We will send you a confirmation email with all event details.
                              </p>
                            </div>
                            
                            <Form {...form}>
                              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-base">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-2xl font-medium text-white">First Name *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="John" {...field} className="bg-[#606060] text-white placeholder:text-white/60 text-base border-white/20" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-2xl font-medium text-white">Last Name *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Doe" {...field} className="bg-[#606060] text-white placeholder:text-white/60 text-base border-white/20" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                    )}
                                  />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <FormField
                                    control={form.control}
                                    name="company"
                                    render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-2xl font-medium text-white">Company *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Your Company Inc." {...field} className="bg-[#606060] text-white placeholder:text-white/60 text-base border-white/20" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={form.control}
                                    name="position"
                                    render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-2xl font-medium text-white">Position *</FormLabel>
                                    <FormControl>
                                      <Input placeholder="e.g. Test Engineer" {...field} className="bg-[#606060] text-white placeholder:text-white/60 text-base border-white/20" />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                    )}
                                  />
                                </div>
                                
                                <FormField
                                  control={form.control}
                                  name="email"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-base text-white">E-Mail *</FormLabel>
                                      <FormControl>
                                        <Input placeholder="john.doe@example.com" {...field} className="bg-[#606060] text-white placeholder:text-white/60 text-base border-white/20" />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={form.control}
                                  name="consent"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between space-x-4 space-y-0">
                                      <div className="flex items-center space-x-3 flex-1">
                                        <AlertCircle className="h-8 w-8 text-[#f9dc24] flex-shrink-0" />
                                        <div className="space-y-1 leading-none flex-1">
                                          <FormLabel className="text-2xl font-medium leading-tight text-white">
                                            I agree to receive information about image quality testing and related topics via email. *
                                          </FormLabel>
                                          <FormMessage />
                                        </div>
                                      </div>
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                          className="border-[#f9dc24] data-[state=checked]:bg-[#f9dc24] data-[state=checked]:text-black h-8 w-8 flex-shrink-0"
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                
                                <Button 
                                  type="submit" 
                                  className="w-full bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black text-base py-6"
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? "Submitting..." : "Complete Registration"}
                                </Button>
                              </form>
                            </Form>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Events;