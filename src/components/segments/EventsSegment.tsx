import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  date: string;
  time_start: string;
  time_end: string | null;
  location_city: string;
  location_country: string;
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
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

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
            {filteredEvents.map((event) => (
              <Card 
                key={event.id} 
                className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
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
                    <Link to={`/en/events#${event.slug}`}>
                      <Button className="w-full bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black">
                        Register Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsSegment;
