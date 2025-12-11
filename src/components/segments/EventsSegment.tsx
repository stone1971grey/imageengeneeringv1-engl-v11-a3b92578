import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, MapPin, Clock, Globe, ChevronDown, ChevronUp, X } from "lucide-react";
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

interface EventsSegmentProps {
  id?: string;
  pageSlug: string;
  sectionTitle?: string;
  sectionDescription?: string;
  showFilters?: boolean;
  showPastEvents?: boolean;
  layout?: 'grid' | 'list';
  maxEvents?: number;
  sortOrder?: 'asc' | 'desc';
  categories?: string[];
}

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
}

const EVENT_CATEGORIES = [
  { value: "Workshop", label: "Workshop" },
  { value: "Schulung", label: "Training" },
  { value: "Messe", label: "Trade Fair" },
  { value: "Webinar", label: "Webinar" },
  { value: "Conference", label: "Conference" },
];

const EventsSegment = ({
  id,
  pageSlug,
  sectionTitle = "Upcoming Events & Training",
  sectionDescription,
  showFilters = true,
  showPastEvents = false,
  layout = 'grid',
  maxEvents,
  sortOrder = 'asc',
  categories = [],
}: EventsSegmentProps) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    mode: 'onChange',
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
    const loadEvents = async () => {
      try {
        let query = supabase
          .from('events')
          .select('*')
          .eq('published', true);

        // Filter past events if not showing them
        if (!showPastEvents) {
          const today = new Date().toISOString().split('T')[0];
          query = query.gte('date', today);
        }

        // Filter by categories if specified in CMS settings
        if (categories.length > 0) {
          query = query.in('category', categories);
        }

        // Sort order
        query = query.order('date', { ascending: sortOrder === 'asc' });

        // Limit events
        if (maxEvents) {
          query = query.limit(maxEvents);
        }

        const { data, error } = await query;

        if (error) throw error;

        setEvents(data || []);

        // Extract unique categories from loaded events
        const uniqueCategories = [...new Set((data || []).map(e => e.category))];
        setAvailableCategories(uniqueCategories);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [showPastEvents, categories, sortOrder, maxEvents]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleExpandEvent = (eventId: string) => {
    if (expandedEventId === eventId) {
      // Closing - scroll back to the event card first, then close
      const cardElement = document.getElementById(`event-card-${eventId}`);
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      // Delay state change to allow scroll to complete
      setTimeout(() => {
        setExpandedEventId(null);
      }, 400);
    } else {
      // Opening - scroll to detail view
      setExpandedEventId(eventId);
      form.reset();
      
      setTimeout(() => {
        const element = document.getElementById(`event-detail-${eventId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    }
  };

  const onSubmit = async (data: RegistrationFormValues) => {
    const event = events.find(e => e.id === expandedEventId);
    if (!event) return;

    setIsSubmitting(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('register-event', {
        body: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          company: data.company,
          position: data.position,
          eventTitle: event.title,
          eventDate: event.date,
          eventLocation: `${event.location_city}, ${event.location_country}`,
          eventSlug: event.slug,
          evtImageUrl: event.image_url,
        },
      });

      if (error) throw error;

      if (result?.alreadyRegistered) {
        navigate('/en/event-already-registered', {
          state: {
            eventTitle: event.title,
            eventDate: formatDate(event.date),
            eventLocation: `${event.location_city}, ${event.location_country}`,
          }
        });
      } else {
        navigate('/en/event-registration-success', {
          state: {
            eventTitle: event.title,
            eventDate: formatDate(event.date),
            eventLocation: `${event.location_city}, ${event.location_country}`,
            firstName: data.firstName,
          }
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter events by selected categories (frontend filtering)
  const filteredEvents = selectedCategories.length === 0 
    ? events 
    : events.filter(e => selectedCategories.includes(e.category));

  const getCategoryLabel = (value: string) => {
    return EVENT_CATEGORIES.find(c => c.value === value)?.label || value;
  };

  if (loading) {
    return (
      <section id={id} className="pt-32 pb-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f9dc24]"></div>
          </div>
        </div>
      </section>
    );
  }

  // Group events in rows of 3
  const getEventRows = () => {
    const rows: Event[][] = [];
    for (let i = 0; i < filteredEvents.length; i += 3) {
      rows.push(filteredEvents.slice(i, i + 3));
    }
    return rows;
  };

  const selectedEvent = filteredEvents.find(e => e.id === expandedEventId);

  // Find which row contains the selected event
  const getSelectedEventRowIndex = () => {
    if (!expandedEventId) return -1;
    const index = filteredEvents.findIndex(e => e.id === expandedEventId);
    return Math.floor(index / 3);
  };

  const EventCard = ({ event }: { event: Event }) => (
    <Card 
      id={`event-card-${event.id}`}
      className={`h-full overflow-hidden transition-all duration-300 flex flex-col ${
        expandedEventId === event.id ? 'ring-2 ring-[#f9dc24] shadow-lg' : 'hover:shadow-lg'
      }`}
    >
      <div className="aspect-video w-full overflow-hidden">
        <img 
          src={event.image_url} 
          alt={event.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 text-sm px-3 py-1 font-normal">
            {getCategoryLabel(event.category)}
          </Badge>
          {event.is_online && (
            <Badge variant="outline" className="text-sm">
              <Globe className="w-3 h-3 mr-1" />
              Online
            </Badge>
          )}
        </div>
        <CardTitle className="text-xl leading-tight">{event.title}</CardTitle>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{event.time_start}{event.time_end ? ` - ${event.time_end}` : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{event.location_city}, {event.location_country}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <CardDescription className="text-sm leading-relaxed flex-1">
          {event.teaser}
        </CardDescription>
        
        <div className="mt-auto pt-4">
          <Button 
            onClick={() => handleExpandEvent(event.id)}
            className="w-full bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black"
          >
            {expandedEventId === event.id ? (
              <>
                Close Details
                <ChevronUp className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Register Now
                <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section id={id} className="pt-32 pb-16 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-4">{sectionTitle}</h2>
          {sectionDescription && (
            <p className="text-muted-foreground max-w-2xl">
              {sectionDescription}
            </p>
          )}
        </div>

        {/* Category Filters */}
        {showFilters && availableCategories.length > 1 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {availableCategories.map(category => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategories.length === 0 || selectedCategories.includes(category)
                      ? 'bg-[#f9dc24] text-black'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {getCategoryLabel(category)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Events */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No upcoming events at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {getEventRows().map((row, rowIndex) => (
              <div key={rowIndex}>
                {/* Event Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {row.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
                
                {/* Detail View - appears under the row containing the selected event */}
                {selectedEvent && getSelectedEventRowIndex() === rowIndex && (
                  <div 
                    id={`event-detail-${selectedEvent.id}`}
                    className="mb-6 max-w-4xl mx-auto animate-fade-in scroll-mt-24"
                  >
                    <Card className="animate-scale-in border-2 border-[#f9dc24]/30">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-4">
                          <Badge className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 text-base px-3 py-1.5 font-normal">
                            {getCategoryLabel(selectedEvent.category)}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleExpandEvent(selectedEvent.id)} 
                            className="hover:bg-[#f9dc24] hover:text-black transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                        
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* Small Image */}
                          <div className="lg:w-1/3 overflow-hidden rounded-lg">
                            <img 
                              src={selectedEvent.image_url} 
                              alt={selectedEvent.title}
                              className="w-full h-48 object-cover"
                            />
                          </div>
                          
                          {/* Event Info */}
                          <div className="lg:w-2/3">
                            <CardTitle className="text-2xl mb-4">{selectedEvent.title}</CardTitle>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center gap-2 text-foreground">
                                <Calendar className="h-5 w-5 text-[#f9dc24]" />
                                <span>{formatDate(selectedEvent.date)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-foreground">
                                <Clock className="h-5 w-5 text-[#f9dc24]" />
                                <span>{selectedEvent.time_start}{selectedEvent.time_end ? ` - ${selectedEvent.time_end}` : ''}</span>
                              </div>
                              <div className="flex items-center gap-2 text-foreground">
                                <MapPin className="h-5 w-5 text-[#f9dc24]" />
                                <span>
                                  {selectedEvent.location_venue && `${selectedEvent.location_venue}, `}
                                  {selectedEvent.location_city}, {selectedEvent.location_country}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-6">
                        {/* Description */}
                        {selectedEvent.description && (
                          <div 
                            className="prose prose-sm max-w-none text-foreground 
                              prose-h2:text-xl prose-h2:font-bold prose-h2:mt-6 prose-h2:mb-3 prose-h2:border-b prose-h2:border-border prose-h2:pb-2
                              prose-h3:text-lg prose-h3:font-bold prose-h3:mt-4 prose-h3:mb-2 
                              prose-p:mb-3 prose-p:leading-relaxed
                              prose-ul:my-3 prose-ul:ml-6 prose-ul:list-disc prose-ul:space-y-1 
                              prose-ol:my-3 prose-ol:ml-6 prose-ol:list-decimal prose-ol:space-y-1 
                              prose-li:pl-1
                              prose-strong:font-bold
                              prose-a:text-primary prose-a:underline
                              prose-blockquote:border-l-4 prose-blockquote:border-[#f9dc24] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground"
                          >
                            <ReactMarkdown>{selectedEvent.description}</ReactMarkdown>
                          </div>
                        )}
                        
                        {/* Registration Form */}
                        <div className="pt-6 border-t border-border">
                          <div className="space-y-2 mb-6">
                            <h4 className="text-lg font-semibold">Register for this Event</h4>
                            <p className="text-sm text-muted-foreground">
                              Please fill out the registration form below. We will send you a confirmation email with all event details.
                            </p>
                          </div>
                          
                          <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="company"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Company *</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Company Inc." {...field} />
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
                                        <Input placeholder="Engineer" {...field} />
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
                              
                              <div className="flex gap-3 pt-2">
                                <Button
                                  type="submit"
                                  disabled={isSubmitting || !form.formState.isValid}
                                  className={`flex-1 transition-colors ${
                                    form.formState.isValid 
                                      ? 'bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black' 
                                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                                  }`}
                                >
                                  {isSubmitting ? "Registering..." : "Complete Registration"}
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => setExpandedEventId(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </div>
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
  );
};

export default EventsSegment;
