import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FileText, Video, FileDown, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import downloadsHero from "@/assets/downloads-hero.jpg";
import { supabase } from "@/integrations/supabase/client";

// Form validation schema
const downloadFormSchema = z.object({
  firstName: z.string().trim().min(2, { message: "First name must be at least 2 characters" }).max(100, { message: "First name must be less than 100 characters" }),
  lastName: z.string().trim().min(2, { message: "Last name must be at least 2 characters" }).max(100, { message: "Last name must be less than 100 characters" }),
  email: z.string().trim().email({ message: "Please enter a valid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  company: z.string().trim().min(2, { message: "Company must be at least 2 characters" }).max(200, { message: "Company must be less than 200 characters" }),
  position: z.string().trim().min(2, { message: "Position must be at least 2 characters" }).max(200, { message: "Position must be less than 200 characters" }),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must agree to receive information",
  }),
});

type DownloadFormValues = z.infer<typeof downloadFormSchema>;

// Data types
interface DownloadItem {
  id: string;
  title: string;
  type: "whitepaper" | "conference" | "video";
  category: string;
  pages?: number;
  duration?: string;
  publishDate: string;
  abstract: string;
  fullDescription: string;
  downloadUrl: string;
}

// Sample data
const downloadItems: DownloadItem[] = [
  {
    id: "wp-p2020",
    title: "How Well Do Vehicles Really \"See\"? – The IEEE P2020 Automotive Imaging White Paper",
    type: "whitepaper",
    category: "Standards & Compliance",
    pages: 24,
    publishDate: "2024-01",
    abstract: "Cameras are the eyes of modern vehicles – yet until recently, the automotive industry lacked a common standard to objectively measure their performance. The IEEE P2020 Automotive Imaging White Paper reveals how international experts are closing this gap.",
    fullDescription: `
      <h3>How Well Do Vehicles Really "See"?</h3>
      <p>Cameras are the eyes of modern vehicles – yet until recently, the automotive industry lacked a common standard to objectively measure their performance.</p>
      <p>The IEEE P2020 Automotive Imaging White Paper reveals how international experts are closing this gap by defining the first unified framework for automotive image quality.</p>
      <p>Discover why traditional image quality standards from consumer electronics fail to meet the demanding conditions of vehicle cameras – and how P2020 introduces consistent KPIs, testing procedures, and evaluation models that ensure safety, reliability, and comparability across imaging systems.</p>
      <h3>What You'll Learn</h3>
      <p>This white paper provides valuable insights for OEMs, suppliers, and technology decision-makers who want to understand:</p>
      <ul>
        <li>Where current standards fall short</li>
        <li>How LED flicker, HDR, fisheye optics, and temperature extremes affect image performance</li>
        <li>Why standardized metrics are key to safer driver assistance and autonomous systems</li>
      </ul>
    `,
    downloadUrl: "#download-p2020",
  },
  {
    id: "wp-printer",
    title: "Printer and Print Life Tests",
    type: "whitepaper",
    category: "Testing Methodology",
    pages: 18,
    publishDate: "2023-11",
    abstract: "Comprehensive guide to printer quality testing and print longevity assessment. Learn industry-standard methodologies for evaluating printer performance and output quality.",
    fullDescription: `
      <h3>Introduction</h3>
      <p>Printer testing and print life assessment are critical components of quality assurance in the printing industry.</p>
      <p>This white paper explores comprehensive testing methodologies and best practices.</p>
      <h3>Testing Approaches</h3>
      <ul>
        <li>Color accuracy and consistency testing</li>
        <li>Resolution and sharpness measurements</li>
        <li>Print durability and longevity tests</li>
        <li>Environmental stability testing</li>
        <li>Test chart applications and usage</li>
      </ul>
    `,
    downloadUrl: "#download-printer"
  },
  {
    id: "wp-camera",
    title: "Camera Tests",
    type: "whitepaper",
    category: "Image Quality",
    pages: 32,
    publishDate: "2024-02",
    abstract: "Advanced camera testing techniques for automotive, mobile, and industrial applications. Explore comprehensive testing methodologies for modern camera systems.",
    fullDescription: `
      <h3>Scope</h3>
      <p>Modern camera systems require rigorous testing to ensure optimal performance across diverse applications.</p>
      <p>This white paper covers comprehensive testing approaches for various camera technologies.</p>
      <h3>Testing Categories</h3>
      <ul>
        <li>Resolution and MTF testing</li>
        <li>Color accuracy and reproduction</li>
        <li>Dynamic range and HDR performance</li>
        <li>Low-light sensitivity testing</li>
        <li>Geometric distortion analysis</li>
      </ul>
    `,
    downloadUrl: "#download-camera"
  },
  {
    id: "cp-adas",
    title: "ADAS Camera Standards and Testing Requirements",
    type: "conference",
    category: "Standards & Compliance",
    pages: 16,
    publishDate: "2024-03",
    abstract: "Presented at the International Automotive Conference 2024. Covers the latest standards and testing requirements for Advanced Driver Assistance Systems cameras.",
    fullDescription: `
      <h3>Overview</h3>
      <p>This conference paper was presented at the International Automotive Conference 2024, addressing critical testing standards for ADAS cameras.</p>
      <h3>Key Topics</h3>
      <ul>
        <li>Current ADAS testing standards</li>
        <li>IEEE P2020 compliance requirements</li>
        <li>Safety-critical performance metrics</li>
        <li>Future standardization efforts</li>
      </ul>
      <h3>Target Audience</h3>
      <p>Automotive engineers, test engineers, and quality assurance professionals working on ADAS development.</p>
    `,
    downloadUrl: "#download-adas-paper"
  },
  {
    id: "cp-hdr",
    title: "HDR Performance Metrics for Automotive Imaging",
    type: "conference",
    category: "Image Quality",
    pages: 12,
    publishDate: "2024-05",
    abstract: "Research paper on High Dynamic Range performance evaluation methods, presented at the IEEE Vision Conference.",
    fullDescription: `
      <h3>HDR in Automotive Applications</h3>
      <p>This research paper explores the critical role of High Dynamic Range imaging in modern automotive camera systems.</p>
      <h3>Research Focus</h3>
      <ul>
        <li>HDR performance measurement methodologies</li>
        <li>Real-world testing scenarios</li>
        <li>Comparative analysis of HDR techniques</li>
        <li>Standards compliance evaluation</li>
      </ul>
    `,
    downloadUrl: "#download-hdr-paper"
  },
  {
    id: "vid-intro",
    title: "Introduction to Automotive Camera Testing",
    type: "video",
    category: "Testing Methodology",
    duration: "12:34",
    publishDate: "2024-06",
    abstract: "Comprehensive introduction to automotive camera testing methodologies, standards, and best practices. Perfect for engineers new to the field.",
    fullDescription: `
      <h3>Video Overview</h3>
      <p>This comprehensive video provides an introduction to automotive camera testing, covering essential methodologies and industry standards.</p>
      <h3>Topics Covered</h3>
      <ul>
        <li>Fundamentals of automotive camera testing</li>
        <li>Key performance indicators</li>
        <li>Testing equipment and setup</li>
        <li>Industry standards overview</li>
        <li>Best practices and common pitfalls</li>
      </ul>
      <h3>Who Should Watch</h3>
      <p>Engineers new to automotive imaging, test engineers transitioning to the automotive sector, and quality assurance professionals.</p>
    `,
    downloadUrl: "#video-intro"
  },
  {
    id: "vid-arcturus",
    title: "Arcturus Testing Platform Overview",
    type: "video",
    category: "Testing Methodology",
    duration: "8:45",
    publishDate: "2024-04",
    abstract: "Detailed walkthrough of the Arcturus testing platform, demonstrating key features and testing capabilities for automotive imaging.",
    fullDescription: `
      <h3>Platform Introduction</h3>
      <p>Learn about the Arcturus testing platform and its comprehensive capabilities for automotive camera testing.</p>
      <h3>Video Content</h3>
      <ul>
        <li>Platform architecture and components</li>
        <li>Hardware setup and configuration</li>
        <li>Software features and capabilities</li>
        <li>Real-world testing demonstrations</li>
        <li>Integration with existing workflows</li>
      </ul>
    `,
    downloadUrl: "#video-arcturus"
  },
  {
    id: "vid-standards",
    title: "IEEE P2020 Standard Explained",
    type: "video",
    category: "Standards & Compliance",
    duration: "15:20",
    publishDate: "2024-02",
    abstract: "Deep dive into the IEEE P2020 automotive imaging standard, explaining key metrics, test procedures, and implementation guidelines.",
    fullDescription: `
      <h3>Understanding IEEE P2020</h3>
      <p>This video provides a comprehensive explanation of the IEEE P2020 standard for automotive imaging systems.</p>
      <h3>Content Overview</h3>
      <ul>
        <li>Background and motivation for P2020</li>
        <li>Key performance metrics and KPIs</li>
        <li>Test procedures and methodologies</li>
        <li>Implementation guidelines</li>
        <li>Compliance and certification</li>
      </ul>
      <h3>Learning Outcomes</h3>
      <p>After watching, you'll understand how to implement P2020 testing in your organization and achieve compliance.</p>
    `,
    downloadUrl: "#video-p2020"
  }
];

export default function Downloads() {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<DownloadItem | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  
  const whitepapers = downloadItems.filter(item => item.type === "whitepaper");
  const conferencePapers = downloadItems.filter(item => item.type === "conference");
  const videos = downloadItems.filter(item => item.type === "video");

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
      setDownloadSuccess(true);
      
      // Save to database
      const { error: dbError } = await supabase
        .from('download_requests')
        .insert({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          company: data.company,
          position: data.position,
          download_type: selectedItem.type,
          item_id: selectedItem.id,
          item_title: selectedItem.title,
          consent: data.consent
        });

      if (dbError) {
        console.error("Database error:", dbError);
        toast.error("Failed to save your request. Please try again.");
        setDownloadSuccess(false);
        return;
      }
      
      // Determine which page to navigate to based on download type
      let targetPage = "";
      if (selectedItem.type === "whitepaper") {
        targetPage = "/whitepaper_download";
      } else if (selectedItem.type === "conference") {
        targetPage = "/conference_paper_download";
      } else {
        targetPage = "/video_download";
      }

      // Navigate to the download confirmation page
      navigate(targetPage, {
        state: {
          firstName: data.firstName,
          lastName: data.lastName,
          downloadUrl: selectedItem.downloadUrl,
          title: selectedItem.title,
        },
      });
      
      form.reset();
      setDownloadSuccess(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Something went wrong. Please try again.");
      setDownloadSuccess(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedItem(null);
      setIsClosing(false);
      form.reset();
      setDownloadSuccess(false);
    }, 500);
  };

  const DownloadCard = ({ item }: { item: DownloadItem }) => (
    <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge className="bg-[#f5743a] text-black hover:bg-[#f5743a]/90 text-base px-3 py-1.5 font-normal">
            {item.category}
          </Badge>
        </div>
        <CardTitle className="text-xl leading-relaxed flex items-start gap-3">
          {item.type === "video" ? (
            <Video className="h-6 w-6 text-[#f5743a] flex-shrink-0 mt-1" />
          ) : (
            <FileText className="h-6 w-6 text-[#f5743a] flex-shrink-0 mt-1" />
          )}
          <span>{item.title}</span>
        </CardTitle>
        <div className="flex gap-4 text-sm text-white">
          {item.pages && <span>{item.pages} Pages</span>}
          {item.duration && <span>{item.duration}</span>}
          {(item.pages || item.duration) && <span>•</span>}
          <span>{new Date(item.publishDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <CardDescription className="text-base leading-relaxed flex-1 text-white">
          {item.abstract}
        </CardDescription>
        
        <Button 
          className="w-full bg-[#f5743a] hover:bg-[#f5743a]/90 text-white"
          onClick={() => setSelectedItem(item)}
        >
          Learn More
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-56 pb-16 lg:pt-64 lg:pb-20">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${downloadsHero})`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent"></div>
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Downloadcenter
            </h1>
            <p className="text-xl lg:text-2xl text-white mb-8 max-w-2xl">
              Alle Ressourcen – Software, Handbücher, API‑Dokumente und mehr.
            </p>
          </div>
        </div>
      </section>

      {/* White Papers Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">White Papers</h2>
            <p className="text-white max-w-2xl">
              In-depth insights into testing methodologies, standards, and best practices for image quality measurement.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whitepapers.map(item => (
              <DownloadCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Selected Item Detail (White Papers) */}
      {selectedItem && selectedItem.type === "whitepaper" && (
        <section className={`py-16 bg-muted/30 transition-all duration-500 ${isClosing ? 'opacity-0' : 'opacity-100 animate-fade-in'}`}>
          <div className="container mx-auto px-6">
            <Card className={`max-w-4xl mx-auto transition-all duration-500 ${isClosing ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0 animate-scale-in'}`}>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-[#f5743a] text-black hover:bg-[#f5743a]/90 text-base px-3 py-1.5 font-normal">{selectedItem.category}</Badge>
                  <Button variant="ghost" onClick={handleClose} className="hover:bg-[#f5743a] hover:text-white transition-colors">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <CardTitle className="text-3xl">{selectedItem.title}</CardTitle>
                <CardDescription className="text-white">
                  {selectedItem.pages} Pages • Published {new Date(selectedItem.publishDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div 
                  className="text-base leading-relaxed [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-foreground [&_p]:mb-3 [&_p]:text-foreground [&_ul]:my-3 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-1 [&_li]:text-foreground [&_li]:pl-1"
                  dangerouslySetInnerHTML={{ __html: selectedItem.fullDescription }}
                />
                
                <div className="pt-6 border-t border-border">
                  <div className="space-y-4 mb-6">
                    <p className="text-lg font-semibold">
                      Download Now
                    </p>
                    
                    <p className="text-base text-white">
                      To receive access to the white paper, please enter your contact details and confirm your email address. This verification step ensures that your download link is sent securely and that we comply with current data protection regulations (GDPR).
                    </p>
                    
                    <p className="text-base text-white">
                      After confirming your email, you'll be redirected to the download page for the {selectedItem.title}.
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
                              <Input type="email" placeholder="john@company.com" {...field} className="bg-[#606060] text-white placeholder:text-white/60 text-base border-white/20" />
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
                              <AlertCircle className="h-8 w-8 text-[#f5743a] flex-shrink-0" />
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
                                className="border-[#f5743a] data-[state=checked]:bg-[#f5743a] data-[state=checked]:text-white h-8 w-8 flex-shrink-0"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit"
                        className="w-full bg-[#f5743a] hover:bg-[#f5743a]/90 text-white text-base py-6"
                        disabled={downloadSuccess}
                      >
                        <FileDown className="h-5 w-5 mr-2" />
                        {downloadSuccess ? "Download Started..." : "Download"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Conference Papers Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Conference Papers</h2>
            <p className="text-white max-w-2xl">
              Research and technical papers presented at international conferences and industry events.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conferencePapers.map(item => (
              <DownloadCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Selected Item Detail (Conference Papers) */}
      {selectedItem && selectedItem.type === "conference" && (
        <section className={`py-16 transition-all duration-500 ${isClosing ? 'opacity-0' : 'opacity-100 animate-fade-in'}`}>
          <div className="container mx-auto px-6">
            <Card className={`max-w-4xl mx-auto transition-all duration-500 ${isClosing ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0 animate-scale-in'}`}>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-[#f5743a] text-black hover:bg-[#f5743a]/90 text-base px-3 py-1.5 font-normal">{selectedItem.category}</Badge>
                  <Button variant="ghost" onClick={handleClose} className="hover:bg-[#f5743a] hover:text-white transition-colors">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <CardTitle className="text-3xl">{selectedItem.title}</CardTitle>
                <CardDescription className="text-white">
                  {selectedItem.pages} Pages • Published {new Date(selectedItem.publishDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div 
                  className="text-base leading-relaxed [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-foreground [&_p]:mb-3 [&_p]:text-foreground [&_ul]:my-3 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-1 [&_li]:text-foreground [&_li]:pl-1"
                  dangerouslySetInnerHTML={{ __html: selectedItem.fullDescription }}
                />
                
                <div className="pt-6 border-t border-border">
                  <div className="space-y-4 mb-6">
                    <p className="text-lg font-semibold">
                      Download Now
                    </p>
                    
                    <p className="text-base text-white">
                      To receive access to the conference paper, please enter your contact details and confirm your email address. This verification step ensures that your download link is sent securely and that we comply with current data protection regulations (GDPR).
                    </p>
                    
                    <p className="text-base text-white">
                      After confirming your email, you'll be redirected to the download page for the {selectedItem.title}.
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
                              <Input type="email" placeholder="john@company.com" {...field} className="bg-[#606060] text-white placeholder:text-white/60 text-base border-white/20" />
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
                              <AlertCircle className="h-8 w-8 text-[#f5743a] flex-shrink-0" />
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
                                className="border-[#f5743a] data-[state=checked]:bg-[#f5743a] data-[state=checked]:text-white h-8 w-8 flex-shrink-0"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit"
                        className="w-full bg-[#f5743a] hover:bg-[#f5743a]/90 text-white text-base py-6"
                        disabled={downloadSuccess}
                      >
                        <FileDown className="h-5 w-5 mr-2" />
                        {downloadSuccess ? "Download Started..." : "Download"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Videos Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4 text-white">Videos</h2>
            <p className="text-white max-w-2xl">
              Educational videos covering testing platforms, standards, and methodologies.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map(item => (
              <DownloadCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Selected Item Detail (Videos) */}
      {selectedItem && selectedItem.type === "video" && (
        <section className={`py-16 bg-muted/30 transition-all duration-500 ${isClosing ? 'opacity-0' : 'opacity-100 animate-fade-in'}`}>
          <div className="container mx-auto px-6">
            <Card className={`max-w-4xl mx-auto transition-all duration-500 ${isClosing ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0 animate-scale-in'}`}>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-[#f5743a] text-black hover:bg-[#f5743a]/90 text-base px-3 py-1.5 font-normal">{selectedItem.category}</Badge>
                  <Button variant="ghost" onClick={handleClose} className="hover:bg-[#f5743a] hover:text-white transition-colors">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <CardTitle className="text-3xl">{selectedItem.title}</CardTitle>
                <CardDescription className="text-white">
                  {selectedItem.duration} • Published {new Date(selectedItem.publishDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div 
                  className="text-base leading-relaxed [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-foreground [&_p]:mb-3 [&_p]:text-foreground [&_ul]:my-3 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-1 [&_li]:text-foreground [&_li]:pl-1"
                  dangerouslySetInnerHTML={{ __html: selectedItem.fullDescription }}
                />
                
                <div className="pt-6 border-t border-border">
                  <div className="space-y-4 mb-6">
                    <p className="text-lg font-semibold">
                      Access Video
                    </p>
                    
                    <p className="text-base text-white">
                      To receive access to the video, please enter your contact details and confirm your email address. This verification step ensures that your access link is sent securely and that we comply with current data protection regulations (GDPR).
                    </p>
                    
                    <p className="text-base text-white">
                      After confirming your email, you'll be redirected to watch {selectedItem.title}.
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
                              <Input type="email" placeholder="john@company.com" {...field} className="bg-[#606060] text-white placeholder:text-white/60 text-base border-white/20" />
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
                              <AlertCircle className="h-8 w-8 text-[#f5743a] flex-shrink-0" />
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
                                className="border-[#f5743a] data-[state=checked]:bg-[#f5743a] data-[state=checked]:text-white h-8 w-8 flex-shrink-0"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit"
                        className="w-full bg-[#f5743a] hover:bg-[#f5743a]/90 text-white text-base py-6"
                        disabled={downloadSuccess}
                      >
                        <Video className="h-5 w-5 mr-2" />
                        {downloadSuccess ? "Starting Video..." : "Watch Video"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
