import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FileText, Video, X, BookOpen, Presentation, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { storeMauticEmail } from "@/lib/mauticTracking";
import { useLanguage } from "@/contexts/LanguageContext";

interface DownloadsSegmentProps {
  segmentId: number;
  pageSlug?: string;
  config?: {
    title?: string;
    description?: string;
    selectedTypes?: string[];
    maxItems?: number;
    showCategories?: boolean;
    filterType?: string; // legacy
    showForm?: boolean;
  };
}

interface Download {
  id: string;
  slug: string;
  title: string;
  teaser: string;
  description: string | null;
  download_type: "whitepaper" | "conference" | "video" | "thesis" | "technote" | "datatools";
  category: string | null;
  pages: number | null;
  duration: string | null;
  publish_date: string;
  download_url: string | null;
  image_url: string | null;
}

interface DescriptionSection {
  id: string;
  heading: string;
  content: string;
  isBulletList: boolean;
}

// Form validation schema
const downloadFormSchema = z.object({
  firstName: z.string().trim().min(2, { message: "First name must be at least 2 characters" }).max(100),
  lastName: z.string().trim().min(2, { message: "Last name must be at least 2 characters" }).max(100),
  email: z.string().trim().email({ message: "Please enter a valid email address" }).max(255),
  company: z.string().trim().min(2, { message: "Company must be at least 2 characters" }).max(200),
  position: z.string().trim().min(2, { message: "Position must be at least 2 characters" }).max(200),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must agree to receive information",
  }),
});

type DownloadFormValues = z.infer<typeof downloadFormSchema>;

const TYPE_INFO = {
  whitepaper: { label: "White Paper", color: "bg-blue-500", icon: BookOpen, groupTitle: "White Papers" },
  thesis: { label: "Diploma Thesis", color: "bg-indigo-500", icon: BookOpen, groupTitle: "Diploma Theses" },
  conference: { label: "Conference Paper", color: "bg-purple-500", icon: Presentation, groupTitle: "Conference Papers" },
  video: { label: "Video", color: "bg-emerald-500", icon: Video, groupTitle: "Video Archive" },
  technote: { label: "Tech Note", color: "bg-amber-500", icon: FileText, groupTitle: "Tech Notes" },
  datatools: { label: "Data & Tools", color: "bg-cyan-500", icon: FileText, groupTitle: "Data & Tools" },
} as const;

// Order for displaying groups
const GROUP_ORDER: Array<keyof typeof TYPE_INFO> = ['whitepaper', 'thesis', 'conference', 'technote', 'datatools', 'video'];

// Helper to normalize unicode characters
const normalizeText = (text: string): string => {
  if (!text) return text;
  return text
    .replace(/[\u2010-\u2015]/g, '-') // Various dashes to regular hyphen
    .replace(/[\u2018\u2019]/g, "'")  // Smart quotes to regular apostrophe
    .replace(/[\u201C\u201D]/g, '"')  // Smart double quotes
    .replace(/\u00A0/g, ' ')          // Non-breaking space to regular space
    .replace(/\u2026/g, '...')        // Ellipsis
    .trim();
};

// Description renderer component
const DownloadDescription = ({ description }: { description: string }) => {
  let sections: DescriptionSection[] = [];
  try {
    const parsed = JSON.parse(description);
    if (Array.isArray(parsed)) {
      sections = parsed;
    }
  } catch {
    // Legacy plain text
    return <p className="mb-3 leading-relaxed text-foreground">{normalizeText(description)}</p>;
  }

  if (sections.length === 0) return null;

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        if (!section.heading && !section.content) return null;
        return (
          <div key={section.id}>
            {section.heading && (
              <h3 className="text-lg font-bold text-foreground mt-4 mb-2">{normalizeText(section.heading)}</h3>
            )}
            {section.content && (
              section.isBulletList ? (
                <ul className="my-3 ml-6 list-disc space-y-1">
                  {section.content.split('\n').filter(line => line.trim()).map((line, i) => (
                    <li key={i} className="pl-1 text-foreground">{normalizeText(line.trim())}</li>
                  ))}
                </ul>
              ) : (
                <p className="mb-3 leading-relaxed text-foreground">{normalizeText(section.content)}</p>
              )
            )}
          </div>
        );
      })}
    </div>
  );
};

const DownloadsSegment = ({ segmentId, pageSlug, config: initialConfig }: DownloadsSegmentProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Load segment configuration from database
  const { data: segmentConfig } = useQuery({
    queryKey: ["downloads-segment-config", segmentId, pageSlug, language],
    queryFn: async () => {
      if (!pageSlug) return null;
      
      const { data, error } = await supabase
        .from("page_content")
        .select("content_value")
        .eq("page_slug", pageSlug)
        .eq("section_key", `downloads-${segmentId}`)
        .eq("language", language)
        .maybeSingle();

      if (error || !data?.content_value) {
        // Try English fallback
        const { data: fallbackData } = await supabase
          .from("page_content")
          .select("content_value")
          .eq("page_slug", pageSlug)
          .eq("section_key", `downloads-${segmentId}`)
          .eq("language", "en")
          .maybeSingle();
        
        if (fallbackData?.content_value) {
          return JSON.parse(fallbackData.content_value);
        }
        return null;
      }

      return JSON.parse(data.content_value);
    },
    enabled: !!pageSlug,
  });

  // Merge initialConfig with database config (database takes priority)
  const config = {
    ...initialConfig,
    ...segmentConfig,
  };

  const selectedTypes = config?.selectedTypes || [];
  const maxItems = config?.maxItems || 50;
  const showCategories = config?.showCategories !== false;
  const showForm = config?.showForm !== false;

  // Fetch downloads from database with type filtering
  const { data: downloads = [], isLoading } = useQuery({
    queryKey: ["downloads-segment", selectedTypes, maxItems, language],
    queryFn: async () => {
      let query = supabase
        .from("downloads")
        .select("*")
        .eq("published", true)
        .eq("language_code", language.toUpperCase())
        .order("position", { ascending: true })
        .order("publish_date", { ascending: false });

      // Filter by selected types if any are selected
      if (selectedTypes.length > 0) {
        query = query.in("download_type", selectedTypes);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching downloads:", error);
        // Fallback to English
        let fallbackQuery = supabase
          .from("downloads")
          .select("*")
          .eq("published", true)
          .eq("language_code", "EN")
          .order("position", { ascending: true })
          .order("publish_date", { ascending: false });

        if (selectedTypes.length > 0) {
          fallbackQuery = fallbackQuery.in("download_type", selectedTypes);
        }

        const { data: fallbackData } = await fallbackQuery;
        const items = (fallbackData || []) as Download[];
        return items.slice(0, maxItems);
      }

      if (!data || data.length === 0) {
        // Fallback to English if no data in current language
        let fallbackQuery = supabase
          .from("downloads")
          .select("*")
          .eq("published", true)
          .eq("language_code", "EN")
          .order("position", { ascending: true })
          .order("publish_date", { ascending: false });

        if (selectedTypes.length > 0) {
          fallbackQuery = fallbackQuery.in("download_type", selectedTypes);
        }

        const { data: fallbackData } = await fallbackQuery;
        const items = (fallbackData || []) as Download[];
        return items.slice(0, maxItems);
      }

      return (data as Download[]).slice(0, maxItems);
    },
  });

  const form = useForm<DownloadFormValues>({
    resolver: zodResolver(downloadFormSchema),
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

  const handleExpandItem = (itemId: string) => {
    if (expandedItemId === itemId) {
      // Closing - scroll back to the card first, then close
      const cardElement = document.getElementById(`download-card-${itemId}`);
      if (cardElement) {
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setTimeout(() => {
        setExpandedItemId(null);
      }, 400);
    } else {
      // Opening
      setExpandedItemId(itemId);
      form.reset();
      
      setTimeout(() => {
        const element = document.getElementById(`download-detail-${itemId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    }
  };

  const onSubmit = async (data: DownloadFormValues) => {
    const selectedItem = downloads.find(d => d.id === expandedItemId);
    if (!selectedItem) return;

    setIsSubmitting(true);
    try {
      const categoryTagMap: Record<string, string> = {
        whitepaper: "dl:whitepaper",
        thesis: "dl:diploma-thesis",
        conference: "dl:conference-paper",
        technote: "dl:tech-note",
        datatools: "dl:data-tools",
        video: "dl:video",
      };
      const categoryTag = categoryTagMap[selectedItem.download_type] || `dl:${selectedItem.download_type}`;

      const { data: responseData, error } = await supabase.functions.invoke('send-download-email', {
        body: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          company: data.company,
          position: data.position,
          downloadType: selectedItem.download_type,
          title: selectedItem.title,
          itemId: selectedItem.id,
          consent: data.consent,
          categoryTag: categoryTag,
          downloadUrl: selectedItem.download_url,
        }
      });

      if (error) {
        console.error("Edge function error:", error);
        toast.error("Failed to process your request. Please try again.");
        return;
      }

      const isExistingContact = responseData?.isExistingContact || false;
      const targetPage = isExistingContact 
        ? "/download-confirmation" 
        : "/download-registration-success";

      storeMauticEmail(data.email);

      navigate(targetPage, {
        state: {
          downloadTitle: selectedItem.title,
          downloadType: selectedItem.download_type,
        },
      });
      
      form.reset();
      setExpandedItemId(null);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get unique types from downloads for filter buttons
  const availableTypes = [...new Set(downloads.map(d => d.download_type))];

  // Filter downloads based on active filter
  const filteredDownloads = activeFilter 
    ? downloads.filter(d => d.download_type === activeFilter)
    : downloads;

  // Group downloads by type
  const getGroupedDownloads = () => {
    const groups: Record<string, Download[]> = {};
    
    filteredDownloads.forEach(download => {
      const type = download.download_type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(download);
    });
    
    return groups;
  };

  // Group downloads in rows of 3 within each category
  const getDownloadRows = (items: Download[]) => {
    const rows: Download[][] = [];
    for (let i = 0; i < items.length; i += 3) {
      rows.push(items.slice(i, i + 3));
    }
    return rows;
  };

  // Find which group and row contains the selected item
  const getSelectedItemInfo = () => {
    if (!expandedItemId) return { groupType: null, rowIndex: -1 };
    const item = filteredDownloads.find(d => d.id === expandedItemId);
    if (!item) return { groupType: null, rowIndex: -1 };
    
    const groupType = item.download_type;
    const groupedDownloads = getGroupedDownloads();
    const groupItems = groupedDownloads[groupType] || [];
    const indexInGroup = groupItems.findIndex(d => d.id === expandedItemId);
    const rowIndex = Math.floor(indexInGroup / 3);
    
    return { groupType, rowIndex };
  };

  const selectedItem = filteredDownloads.find(d => d.id === expandedItemId);

  const DownloadCard = ({ item }: { item: Download }) => {
    const typeInfo = TYPE_INFO[item.download_type];
    const TypeIcon = typeInfo.icon;
    const isExpanded = expandedItemId === item.id;

    return (
      <Card 
        id={`download-card-${item.id}`}
        className={`h-full overflow-hidden transition-all duration-300 flex flex-col bg-card ${
          isExpanded ? 'ring-2 ring-[#f9dc24] shadow-lg' : 'hover:shadow-lg border-border'
        }`}
      >
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 text-base px-3 py-1.5 font-normal">
              {item.category || typeInfo.label}
            </Badge>
          </div>
          <CardTitle className="text-xl leading-relaxed flex items-start gap-3 text-foreground">
            <TypeIcon className="h-6 w-6 text-[#f9dc24] flex-shrink-0 mt-1" />
            <span>{normalizeText(item.title)}</span>
          </CardTitle>
          <div className="flex gap-4 text-sm text-muted-foreground">
            {item.pages && <span>{item.pages} Pages</span>}
            {item.duration && <span>{item.duration}</span>}
            {(item.pages || item.duration) && <span>•</span>}
            <span>{new Date(item.publish_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 flex flex-col">
          <CardDescription className="text-base leading-relaxed flex-1 text-muted-foreground">
            {normalizeText(item.teaser)}
          </CardDescription>
          
          <Button 
            className="w-full bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black"
            onClick={() => handleExpandItem(item.id)}
          >
            {isExpanded ? (
              <>
                Close Details
                <ChevronUp className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Learn More
                <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <section className="pt-32 pb-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f9dc24]"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-32 pb-16 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        {(config?.title || config?.description) && (
          <div className="mb-12">
            {config?.title && (
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">{config.title}</h1>
            )}
            {config?.description && (
              <p className="text-muted-foreground max-w-2xl">{config.description}</p>
            )}
          </div>
        )}

        {/* Category Filter Buttons */}
        {showCategories && availableTypes.length > 1 && (
          <div className="mb-8 flex flex-wrap gap-3">
            <Button
              variant={activeFilter === null ? "default" : "outline"}
              onClick={() => setActiveFilter(null)}
              className={activeFilter === null 
                ? "bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90" 
                : "border-border text-foreground hover:bg-muted"
              }
            >
              All ({downloads.length})
            </Button>
            {GROUP_ORDER.filter(type => availableTypes.includes(type)).map(type => {
              const typeInfo = TYPE_INFO[type];
              const count = downloads.filter(d => d.download_type === type).length;
              const TypeIcon = typeInfo.icon;
              return (
                <Button
                  key={type}
                  variant={activeFilter === type ? "default" : "outline"}
                  onClick={() => setActiveFilter(activeFilter === type ? null : type)}
                  className={activeFilter === type 
                    ? "bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90" 
                    : "border-border text-foreground hover:bg-muted"
                  }
                >
                  <TypeIcon className="h-4 w-4 mr-2" />
                  {typeInfo.groupTitle} ({count})
                </Button>
              );
            })}
          </div>
        )}

        {/* Downloads */}
        {downloads.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No downloads available at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-16">
            {(() => {
              const groupedDownloads = getGroupedDownloads();
              const selectedInfo = getSelectedItemInfo();
              
              return GROUP_ORDER.map((groupType) => {
                const groupItems = groupedDownloads[groupType];
                if (!groupItems || groupItems.length === 0) return null;
                
                const typeInfo = TYPE_INFO[groupType];
                const GroupIcon = typeInfo.icon;
                const rows = getDownloadRows(groupItems);
                
                return (
                  <div key={groupType} className="space-y-6">
                    {/* Group Header */}
                    <div className="flex items-center gap-4 border-b border-border pb-4">
                      <div className="p-3 rounded-lg bg-[#f9dc24]/10">
                        <GroupIcon className="h-8 w-8 text-[#f9dc24]" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">{typeInfo.groupTitle}</h2>
                        <p className="text-muted-foreground text-sm">{groupItems.length} {groupItems.length === 1 ? 'item' : 'items'} available</p>
                      </div>
                    </div>
                    
                    {/* Group Content */}
                    <div className="space-y-6">
                      {rows.map((row, rowIndex) => (
                        <div key={rowIndex}>
                          {/* Download Cards Row */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                            {row.map((item) => (
                              <DownloadCard key={item.id} item={item} />
                            ))}
                          </div>
                          
                          {/* Detail View - appears under the row containing the selected item */}
                          {selectedItem && showForm && selectedInfo.groupType === groupType && selectedInfo.rowIndex === rowIndex && (
                            <div 
                              id={`download-detail-${selectedItem.id}`}
                              className="mb-6 max-w-4xl mx-auto animate-fade-in scroll-mt-24"
                            >
                              <Card className="animate-scale-in border-2 border-[#f9dc24]/30">
                                <CardHeader className="pb-4">
                                  <div className="flex items-center justify-between mb-4">
                                    <Badge className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 text-base px-3 py-1.5 font-normal">
                                      {selectedItem.category || TYPE_INFO[selectedItem.download_type].label}
                                    </Badge>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => handleExpandItem(selectedItem.id)} 
                                      className="hover:bg-[#f9dc24] hover:text-black transition-colors"
                                    >
                                      <X className="h-5 w-5" />
                                    </Button>
                                  </div>
                                  
                                  <div className="flex flex-col lg:flex-row gap-8">
                                    {/* Left: Content */}
                                    <div className="lg:w-1/2">
                                      <h2 className="text-2xl font-bold mb-4 text-foreground">{normalizeText(selectedItem.title)}</h2>
                                      
                                      <div className="flex gap-4 text-sm text-muted-foreground mb-6">
                                        {selectedItem.pages && <span>{selectedItem.pages} Pages</span>}
                                        {selectedItem.duration && <span>{selectedItem.duration}</span>}
                                        {(selectedItem.pages || selectedItem.duration) && <span>•</span>}
                                        <span>{new Date(selectedItem.publish_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                      </div>

                                      {selectedItem.description && (
                                        <div className="prose prose-invert max-w-none">
                                          <DownloadDescription description={selectedItem.description} />
                                        </div>
                                      )}
                                    </div>

                                    {/* Right: Form */}
                                    <div className="lg:w-1/2">
                                      <div className="bg-card border border-border rounded-lg p-6">
                                        <h3 className="text-xl font-semibold mb-4 text-foreground">Request Download</h3>
                                        <p className="text-muted-foreground mb-6 text-sm">
                                          Please fill out the form below to receive access to this resource.
                                        </p>

                                        <Form {...form}>
                                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                              <FormField
                                                control={form.control}
                                                name="firstName"
                                                render={({ field }) => (
                                                  <FormItem>
                                                    <FormLabel className="text-foreground text-sm">First Name *</FormLabel>
                                                    <FormControl>
                                                      <Input {...field} className="bg-background border-border" />
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
                                                    <FormLabel className="text-foreground text-sm">Last Name *</FormLabel>
                                                    <FormControl>
                                                      <Input {...field} className="bg-background border-border" />
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
                                                  <FormLabel className="text-foreground text-sm">Email *</FormLabel>
                                                  <FormControl>
                                                    <Input {...field} type="email" className="bg-background border-border" />
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
                                                  <FormLabel className="text-foreground text-sm">Company *</FormLabel>
                                                  <FormControl>
                                                    <Input {...field} className="bg-background border-border" />
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
                                                  <FormLabel className="text-foreground text-sm">Position *</FormLabel>
                                                  <FormControl>
                                                    <Input {...field} className="bg-background border-border" />
                                                  </FormControl>
                                                  <FormMessage />
                                                </FormItem>
                                              )}
                                            />

                                            <FormField
                                              control={form.control}
                                              name="consent"
                                              render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                                                  <FormControl>
                                                    <Checkbox
                                                      checked={field.value}
                                                      onCheckedChange={field.onChange}
                                                      className="border-border data-[state=checked]:bg-[#f9dc24] data-[state=checked]:border-[#f9dc24]"
                                                    />
                                                  </FormControl>
                                                  <div className="space-y-1 leading-none">
                                                    <FormLabel className="text-sm text-muted-foreground font-normal">
                                                      I agree to receive information about products and services *
                                                    </FormLabel>
                                                    <FormMessage />
                                                  </div>
                                                </FormItem>
                                              )}
                                            />

                                            <Button 
                                              type="submit" 
                                              className={`w-full mt-4 transition-all ${
                                                form.formState.isValid 
                                                  ? 'bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black' 
                                                  : 'bg-muted text-muted-foreground cursor-not-allowed'
                                              }`}
                                              disabled={!form.formState.isValid || isSubmitting}
                                            >
                                              {isSubmitting ? "Processing..." : "Request Download"}
                                            </Button>
                                          </form>
                                        </Form>
                                      </div>
                                    </div>
                                  </div>
                                </CardHeader>
                              </Card>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>
    </section>
  );
};

export default DownloadsSegment;
