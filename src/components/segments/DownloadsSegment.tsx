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
import { FileText, Video, X, BookOpen, Presentation } from "lucide-react";
import { toast } from "sonner";
import { storeMauticEmail } from "@/lib/mauticTracking";
import { useLanguage } from "@/contexts/LanguageContext";

interface DownloadsSegmentProps {
  segmentId: number;
  config?: {
    title?: string;
    description?: string;
    filterType?: string; // 'all' | 'whitepaper' | 'conference' | 'video'
    showForm?: boolean;
  };
}

interface Download {
  id: string;
  slug: string;
  title: string;
  teaser: string;
  description: string | null;
  download_type: "whitepaper" | "conference" | "video";
  category: string | null;
  pages: number | null;
  duration: string | null;
  publish_date: string;
  download_url: string | null;
  image_url: string | null;
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
  whitepaper: { label: "White Paper", color: "bg-blue-500", icon: BookOpen },
  conference: { label: "Conference Paper", color: "bg-purple-500", icon: Presentation },
  video: { label: "Video", color: "bg-emerald-500", icon: Video },
} as const;

const DownloadsSegment = ({ segmentId, config }: DownloadsSegmentProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [selectedItem, setSelectedItem] = useState<Download | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const detailSectionRef = useRef<HTMLDivElement>(null);

  const filterType = config?.filterType || "all";
  const showForm = config?.showForm !== false;

  // Fetch downloads from database
  const { data: downloads = [], isLoading } = useQuery({
    queryKey: ["downloads-segment", filterType, language],
    queryFn: async () => {
      let query = supabase
        .from("downloads")
        .select("*")
        .eq("published", true)
        .eq("language_code", language.toUpperCase())
        .order("position", { ascending: true })
        .order("publish_date", { ascending: false });

      if (filterType !== "all") {
        query = query.eq("download_type", filterType);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching downloads:", error);
        // Fallback to EN if no results for current language
        const fallbackQuery = supabase
          .from("downloads")
          .select("*")
          .eq("published", true)
          .eq("language_code", "EN")
          .order("position", { ascending: true })
          .order("publish_date", { ascending: false });

        if (filterType !== "all") {
          fallbackQuery.eq("download_type", filterType);
        }

        const { data: fallbackData } = await fallbackQuery;
        return (fallbackData || []) as Download[];
      }

      // If no results, try English fallback
      if (!data || data.length === 0) {
        const fallbackQuery = supabase
          .from("downloads")
          .select("*")
          .eq("published", true)
          .eq("language_code", "EN")
          .order("position", { ascending: true })
          .order("publish_date", { ascending: false });

        if (filterType !== "all") {
          fallbackQuery.eq("download_type", filterType);
        }

        const { data: fallbackData } = await fallbackQuery;
        return (fallbackData || []) as Download[];
      }

      return data as Download[];
    },
  });

  // Group downloads by type
  const whitepapers = downloads.filter(d => d.download_type === "whitepaper");
  const conferencePapers = downloads.filter(d => d.download_type === "conference");
  const videos = downloads.filter(d => d.download_type === "video");

  useEffect(() => {
    if (selectedItem && detailSectionRef.current) {
      setTimeout(() => {
        detailSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [selectedItem]);

  const form = useForm<DownloadFormValues>({
    resolver: zodResolver(downloadFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      position: "",
      consent: false,
    },
  });

  const onSubmit = async (data: DownloadFormValues) => {
    if (!selectedItem) return;

    try {
      const categoryTag = selectedItem.download_type === "whitepaper" 
        ? "dl:whitepaper" 
        : selectedItem.download_type === "conference" 
        ? "dl:conference-paper" 
        : "dl:video";

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
      setSelectedItem(null);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedItem(null);
      setIsClosing(false);
      form.reset();
    }, 500);
  };

  const DownloadCard = ({ item }: { item: Download }) => {
    const typeInfo = TYPE_INFO[item.download_type];
    const TypeIcon = typeInfo.icon;

    return (
      <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col bg-card border-border">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 text-base px-3 py-1.5 font-normal">
              {item.category || typeInfo.label}
            </Badge>
          </div>
          <CardTitle className="text-xl leading-relaxed flex items-start gap-3 text-foreground">
            <TypeIcon className="h-6 w-6 text-[#f9dc24] flex-shrink-0 mt-1" />
            <span>{item.title}</span>
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
            {item.teaser}
          </CardDescription>
          
          <Button 
            className="w-full bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black"
            onClick={() => setSelectedItem(item)}
          >
            Learn More
          </Button>
        </CardContent>
      </Card>
    );
  };

  const DownloadSection = ({ title, description, items }: { title: string; description: string; items: Download[] }) => {
    if (items.length === 0) return null;

    return (
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">{title}</h2>
            <p className="text-muted-foreground max-w-2xl">{description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <DownloadCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>
    );
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        Loading downloads...
      </div>
    );
  }

  return (
    <div className="bg-background">
      {/* Title & Description from config */}
      {(config?.title || config?.description) && (
        <div className="container mx-auto px-6 pt-16">
          {config?.title && (
            <h2 className="text-3xl font-bold mb-4 text-foreground">{config.title}</h2>
          )}
          {config?.description && (
            <p className="text-muted-foreground max-w-2xl">{config.description}</p>
          )}
        </div>
      )}

      {/* Downloads by Type */}
      {filterType === "all" ? (
        <>
          <DownloadSection 
            title="White Papers" 
            description="In-depth insights into testing methodologies, standards, and best practices for image quality measurement."
            items={whitepapers}
          />
          <DownloadSection 
            title="Conference Papers" 
            description="Research and technical papers presented at international conferences and industry events."
            items={conferencePapers}
          />
          <DownloadSection 
            title="Videos" 
            description="Instructional videos, product demonstrations, and webinar recordings."
            items={videos}
          />
        </>
      ) : (
        <div className="py-16">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {downloads.map(item => (
                <DownloadCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Selected Item Detail with Form */}
      {selectedItem && showForm && (
        <section 
          ref={detailSectionRef}
          className={`py-16 bg-muted/50 transition-opacity duration-500 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
        >
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-end mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Left: Content */}
                <div>
                  <Badge className="bg-[#f9dc24] text-black mb-4">
                    {selectedItem.category || TYPE_INFO[selectedItem.download_type].label}
                  </Badge>
                  <h2 className="text-3xl font-bold mb-4 text-foreground">{selectedItem.title}</h2>
                  
                  <div className="flex gap-4 text-sm text-muted-foreground mb-6">
                    {selectedItem.pages && <span>{selectedItem.pages} Pages</span>}
                    {selectedItem.duration && <span>{selectedItem.duration}</span>}
                    {(selectedItem.pages || selectedItem.duration) && <span>•</span>}
                    <span>{new Date(selectedItem.publish_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>

                  {selectedItem.description && (
                    <div 
                      className="prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedItem.description }}
                    />
                  )}
                </div>

                {/* Right: Form */}
                <div className="bg-card border border-border rounded-lg p-8">
                  <h3 className="text-xl font-semibold mb-6 text-foreground">Request Download</h3>
                  <p className="text-muted-foreground mb-6">
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
                              <FormLabel className="text-foreground">First Name *</FormLabel>
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
                              <FormLabel className="text-foreground">Last Name *</FormLabel>
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
                            <FormLabel className="text-foreground">Email *</FormLabel>
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
                            <FormLabel className="text-foreground">Company *</FormLabel>
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
                            <FormLabel className="text-foreground">Position *</FormLabel>
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
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm text-muted-foreground">
                                I agree to receive information about products and services. I can unsubscribe at any time. *
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black mt-6"
                        disabled={form.formState.isSubmitting}
                      >
                        {form.formState.isSubmitting ? "Processing..." : "Request Download"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default DownloadsSegment;
