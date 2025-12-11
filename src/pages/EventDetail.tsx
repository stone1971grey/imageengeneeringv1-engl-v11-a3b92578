import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Helmet } from "react-helmet";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, MapPin, Clock, Globe, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const registrationFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().min(2, "Company name must be at least 2 characters"),
  position: z.string().min(2, "Position must be at least 2 characters"),
  consent: z.boolean().refine(val => val === true, "You must agree to the terms"),
});

type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

interface Event {
  id: string;
  slug: string;
  title: string;
  teaser: string;
  description: string | null;
  date: string;
  time_start: string;
  time_end: string | null;
  location_city: string;
  location_country: string;
  location_venue: string | null;
  category: string;
  image_url: string;
  is_online: boolean;
  external_url: string | null;
}

interface DescriptionSection {
  id: string;
  heading: string;
  content: string;
  isBulletList: boolean;
}

const EventDescription = ({ description }: { description: string }) => {
  let sections: DescriptionSection[] = [];
  try {
    const parsed = JSON.parse(description);
    if (Array.isArray(parsed)) {
      sections = parsed;
    }
  } catch {
    return <p className="mb-3 leading-relaxed text-foreground">{description}</p>;
  }

  if (sections.length === 0) return null;

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        if (!section.heading && !section.content) return null;
        return (
          <div key={section.id}>
            {section.heading && (
              <h3 className="text-lg font-semibold text-foreground mb-2">{section.heading}</h3>
            )}
            {section.content && (
              section.isBulletList ? (
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {section.content.split('\n').filter(line => line.trim()).map((line, idx) => (
                    <li key={idx}>{line.trim()}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              )
            )}
          </div>
        );
      })}
    </div>
  );
};

const EventDetail = () => {
  const { eventSlug, lang } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      position: "",
      consent: false,
    },
  });

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventSlug) return;
      
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("slug", eventSlug)
        .eq("published", true)
        .single();

      if (error) {
        console.error("Error fetching event:", error);
        setLoading(false);
        return;
      }

      setEvent(data);
      setLoading(false);
    };

    fetchEvent();
  }, [eventSlug]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const handleSubmit = async (values: RegistrationFormValues) => {
    if (!event) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await supabase.functions.invoke('register-event', {
        body: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          company: values.company,
          position: values.position,
          eventName: event.title,
          eventSlug: event.slug,
          eventDate: event.date,
          eventLocation: `${event.location_city}, ${event.location_country}`,
          eventImage: event.image_url,
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data?.error === "already_registered") {
        navigate(`/${lang}/event-already-registered`, {
          state: {
            eventTitle: event.title,
            eventDate: event.date,
            eventLocation: `${event.location_city}, ${event.location_country}`,
            eventImageUrl: event.image_url,
          }
        });
        return;
      }
      
      const isExistingContact = response.data?.isExistingContact || false;
      
      if (isExistingContact) {
        navigate(`/${lang}/event-detail-registration-confirmation`, {
          state: {
            eventTitle: event.title,
            eventDate: event.date,
            eventTime: `${formatTime(event.time_start)}${event.time_end ? ` - ${formatTime(event.time_end)}` : ''}`,
            eventLocation: `${event.location_city}, ${event.location_country}`,
            eventImageUrl: event.image_url,
          }
        });
      } else {
        navigate(`/${lang}/event-registration-success`, {
          state: {
            eventTitle: event.title,
            eventDate: event.date,
            eventTime: `${formatTime(event.time_start)}${event.time_end ? ` - ${formatTime(event.time_end)}` : ''}`,
            eventLocation: `${event.location_city}, ${event.location_country}`,
            eventImageUrl: event.image_url,
          }
        });
      }
      
      toast.success("Registration successful!");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExternalRegistration = () => {
    if (event?.external_url) {
      window.open(event.external_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-32 pb-16">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-muted rounded mb-4"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-32 pb-16 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-8">The event you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate(`/${lang}/training-events/events`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{event.title} | Image Engineering</title>
        <meta name="description" content={event.teaser} />
        <meta property="og:title" content={event.title} />
        <meta property="og:description" content={event.teaser} />
        <meta property="og:image" content={event.image_url} />
        <meta property="og:type" content="event" />
      </Helmet>

      <Navigation />
      
      <main className="container mx-auto px-4 pt-32 pb-16 max-w-6xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/${lang}/training-events/events`)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to All Events
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Event Details */}
          <div>
            {/* Hero Image */}
            <div className="relative rounded-lg overflow-hidden mb-6">
              <img 
                src={event.image_url} 
                alt={event.title}
                className="w-full h-64 object-cover"
              />
              <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                {event.category}
              </Badge>
              {event.is_online && (
                <Badge className="absolute top-4 right-4 bg-blue-500 text-white">
                  <Globe className="w-3 h-3 mr-1" />
                  Online
                </Badge>
              )}
            </div>

            {/* Event Info */}
            <h1 className="text-3xl font-bold text-foreground mb-4">{event.title}</h1>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="w-5 h-5 text-primary" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="w-5 h-5 text-primary" />
                <span>
                  {formatTime(event.time_start)}
                  {event.time_end && ` - ${formatTime(event.time_end)}`}
                </span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary" />
                <span>
                  {event.location_venue && `${event.location_venue}, `}
                  {event.location_city}, {event.location_country}
                </span>
              </div>
            </div>

            <p className="text-lg text-muted-foreground mb-6">{event.teaser}</p>

            {event.description && (
              <div className="prose prose-sm max-w-none">
                <EventDescription description={event.description} />
              </div>
            )}
          </div>

          {/* Registration Form */}
          <div ref={formRef}>
            <Card className="sticky top-32">
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Register for this Event</h2>
                
                {event.external_url ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-6">
                      This event uses an external registration system.
                    </p>
                    <Button 
                      onClick={handleExternalRegistration}
                      className="bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black font-semibold"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Register on External Site
                    </Button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
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
                              <FormLabel>Last Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
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
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john.doe@company.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company *</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Company" {...field} />
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
                            <FormLabel>Position *</FormLabel>
                            <FormControl>
                              <Input placeholder="Your Position" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="consent"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal">
                                I agree to receive event updates and information about related products and services. *
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <Button
                        type="submit"
                        disabled={isSubmitting || !form.formState.isValid}
                        className={`w-full transition-colors ${
                          form.formState.isValid 
                            ? 'bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black font-semibold' 
                            : 'bg-[#f9dc24]/30 text-black/40 cursor-not-allowed hover:bg-[#f9dc24]/30'
                        }`}
                      >
                        {isSubmitting ? "Registering..." : "Complete Registration"}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventDetail;
