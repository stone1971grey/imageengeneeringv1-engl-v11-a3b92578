import { useState, useEffect } from "react";
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
import { storeMauticEmail } from "@/lib/mauticTracking";
import { supabase } from "@/integrations/supabase/client";
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
  };
  category: string;
  language: string;
  description: string;
  fullDescription?: string;
  image: string;
  imageUrl?: string;
  isPast: boolean;
  isOnline?: boolean;
}

const Events = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load events from database
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('published', true)
          .order('date', { ascending: true });

        if (error) throw error;

        const mappedEvents: Event[] = (data || []).map(event => ({
          id: event.id,
          slug: event.slug,
          title: event.title,
          date: event.date,
          time: event.time_end ? `${event.time_start} - ${event.time_end}` : event.time_start,
          location: {
            city: event.location_city,
            country: event.location_country,
          },
          category: event.category,
          language: event.language_code,
          description: event.teaser,
          fullDescription: event.description || undefined,
          image: event.image_url,
          imageUrl: event.image_url,
          isPast: new Date(event.date) < new Date(),
          isOnline: event.is_online || false,
        }));

        setEvents(mappedEvents);
      } catch (error) {
        console.error('Error loading events:', error);
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

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
      // Construct absolute URL for event image
      const imageUrl = selectedEvent.imageUrl || selectedEvent.image;
      const absoluteImageUrl = imageUrl.startsWith('http') 
        ? imageUrl 
        : `${window.location.origin}${imageUrl}`;
      
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
          eventImage: absoluteImageUrl,
        }),
      });

      const result = await response.json();
      
      // Check if user is already registered
      if (response.status === 409 && result.error === 'already_registered') {
        navigate('/event-already-registered', {
          state: {
            eventTitle: result.registrationData.eventTitle,
            eventDate: selectedEvent.date,
            eventTime: selectedEvent.time,
            eventImageUrl: selectedEvent.image,
            registrationDate: result.registrationData.registrationDate
          }
        });
        return;
      }
      
      // Determine which page to navigate to based on existing contact status
      const isExistingContact = result?.isExistingContact || false;
      const targetPage = isExistingContact 
        ? "/event-detail-registration-confirmation" 
        : "/event-registration-success";
      
      // Store email for Mautic tracking
      storeMauticEmail(data.email);
      
      // Store event data in localStorage as backup
      const eventData = {
        eventTitle: selectedEvent.title,
        eventDate: selectedEvent.date,
        eventTime: selectedEvent.time,
        eventLocation: `${selectedEvent.location.city}, ${selectedEvent.location.country}`,
        eventImageUrl: absoluteImageUrl
      };
      localStorage.setItem('lastEventRegistration', JSON.stringify(eventData));
      
      // Navigate to the appropriate confirmation page
      navigate(targetPage, {
        state: eventData
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

  // Events are already sorted from database
  const sortedEvents = events;

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
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f9dc24]"></div>
            </div>
          ) : sortedEvents.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p>No upcoming events at the moment. Check back soon!</p>
            </div>
          ) : (
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
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Events;