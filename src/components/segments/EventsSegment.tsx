import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
      setExpandedEventId(null);
    } else {
      setExpandedEventId(eventId);
      form.reset();
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

        {/* Events Grid/List */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No upcoming events at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className={layout === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-6"
          }>
            {filteredEvents.map((event) => {
              const isExpanded = expandedEventId === event.id;
              
              return (
                <Card 
                  key={event.id} 
                  className={`overflow-hidden transition-all duration-300 flex flex-col ${
                    isExpanded ? 'col-span-1 md:col-span-2 lg:col-span-3 shadow-xl' : 'hover:shadow-lg'
                  }`}
                >
                  <div className={`flex ${isExpanded ? 'flex-col lg:flex-row' : 'flex-col'}`}>
                    {/* Image */}
                    <div className={`overflow-hidden ${isExpanded ? 'lg:w-1/2' : 'aspect-video w-full'}`}>
                      <img 
                        src={event.image_url} 
                        alt={event.title}
                        className={`w-full object-cover ${isExpanded ? 'h-64 lg:h-full' : 'h-full'}`}
                        loading="lazy"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className={`flex-1 flex flex-col ${isExpanded ? 'lg:w-1/2' : ''}`}>
                      <CardHeader className="space-y-3">
                        <div className="flex items-center justify-between">
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
                          {isExpanded && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setExpandedEventId(null)}
                              className="h-8 w-8"
                            >
                              <X className="h-4 w-4" />
                            </Button>
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
                            <span>
                              {event.location_venue && `${event.location_venue}, `}
                              {event.location_city}, {event.location_country}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4 flex-1 flex flex-col">
                        <CardDescription className="text-sm leading-relaxed">
                          {event.teaser}
                        </CardDescription>
                        
                        {/* Expanded Description */}
                        {isExpanded && event.description && (
                          <div 
                            className="prose prose-sm max-w-none text-muted-foreground"
                            dangerouslySetInnerHTML={{ __html: event.description }}
                          />
                        )}
                        
                        {/* Register Button or Form */}
                        <div className="mt-auto pt-4">
                          {!isExpanded ? (
                            <Button 
                              onClick={() => handleExpandEvent(event.id)}
                              className="w-full bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black"
                            >
                              Register Now
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          ) : (
                            <div className="space-y-6">
                              <div className="border-t pt-6">
                                <h4 className="text-lg font-semibold mb-4">Register for this Event</h4>
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
                                        disabled={isSubmitting}
                                        className="flex-1 bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black"
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
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsSegment;
