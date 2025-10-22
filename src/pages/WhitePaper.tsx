import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { FileText, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import whitepaperHero from "@/assets/whitepaper-hero.jpg";
import { useTranslation } from "@/hooks/useTranslation";

// Form validation schema
const downloadFormSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  company: z.string().min(2, { message: "Company must be at least 2 characters" }),
  position: z.string().min(2, { message: "Position must be at least 2 characters" }),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must agree to receive information",
  }),
});

type DownloadFormValues = z.infer<typeof downloadFormSchema>;

// White Paper data types
interface WhitePaper {
  id: string;
  title: string;
  category: string;
  pages: number;
  publishDate: string;
  abstract: string;
  fullDescription: string;
  downloadUrl: string;
  featured?: boolean;
}

// Sample white paper data
const whitePapers: WhitePaper[] = [
  {
    id: "p2020",
    title: "How Well Do Vehicles Really \"See\"? – The IEEE P2020 Automotive Imaging White Paper",
    category: "Standards & Compliance",
    pages: 24,
    publishDate: "2024-01",
    abstract: "Cameras are the eyes of modern vehicles – yet until recently, the automotive industry lacked a common standard to objectively measure their performance. The IEEE P2020 Automotive Imaging White Paper reveals how international experts are closing this gap by defining the first unified framework for automotive image quality.",
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
      
      <h3>Why This Matters</h3>
      <p>Download now to learn how IEEE P2020 is shaping the future of automotive image quality – and why it is becoming the new global benchmark for vehicle vision.</p>
      
      <h3>Target Audience</h3>
      <p>This white paper is designed for automotive engineers, test engineers, quality assurance professionals, OEMs, suppliers, and technology decision-makers involved in ADAS development and testing.</p>
    `,
    downloadUrl: "#download-p2020",
    featured: true
  },
  {
    id: "printer-tests",
    title: "Printer and Print Life Tests",
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
        <li>Measurement equipment requirements</li>
      </ul>
      
      <h3>Industry Applications</h3>
      
      <p>These testing methodologies are applicable across various sectors including commercial printing, photography, fine art reproduction, and document management systems.</p>
      
      <h3>Benefits</h3>
      
      <p>Implementing these testing protocols ensures consistent output quality, extends equipment lifespan, and maintains customer satisfaction through reliable print performance.</p>
    `,
    downloadUrl: "#download-printer"
  },
  {
    id: "camera-tests",
    title: "Camera Tests",
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
        <li>Temporal noise characteristics</li>
        <li>Autofocus accuracy and speed</li>
      </ul>
      
      <h3>Application Areas</h3>
      
      <p>This white paper addresses testing requirements for automotive ADAS cameras, mobile phone cameras, security surveillance systems, and industrial machine vision applications.</p>
      
      <h3>Industry Standards</h3>
      
      <p>We explore relevant standards including IEEE P2020, EMVA 1288, ISO 12233, and industry-specific testing protocols to ensure comprehensive quality assessment.</p>
    `,
    downloadUrl: "#download-camera"
  }
];

const WhitePaper = () => {
  const { t } = useTranslation();
  const [selectedPaper, setSelectedPaper] = useState<WhitePaper | null>(null);
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

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

  const onSubmit = (data: DownloadFormValues) => {
    console.log("Download request:", { ...data, whitePaper: selectedPaper?.id });
    
    // Simulate download
    setTimeout(() => {
      setDownloadSuccess(true);
      toast.success("White Paper is being downloaded!");
      
      // Reset after 3 seconds
      setTimeout(() => {
        setIsDownloadDialogOpen(false);
        setDownloadSuccess(false);
        form.reset();
      }, 2000);
    }, 1000);
  };

  const handleDownloadClick = (paper: WhitePaper) => {
    setSelectedPaper(paper);
    setDownloadSuccess(false);
    setIsDownloadDialogOpen(true);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedPaper(null);
      setIsClosing(false);
    }, 500); // Increased duration for smoother close
  };

  const WhitePaperCard = ({ paper }: { paper: WhitePaper }) => (
    <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge className="bg-[#f5743a] text-black hover:bg-[#f5743a]/90 text-base px-3 py-1.5 font-normal">
            {paper.category}
          </Badge>
        </div>
        <CardTitle className="text-xl leading-tight flex items-start gap-3">
          <FileText className="h-6 w-6 text-[#f5743a] flex-shrink-0 mt-1" />
          <span>{paper.title}</span>
        </CardTitle>
          <div className="flex gap-4 text-base text-white">
            <span>{paper.pages} {t.whitepaper.pages}</span>
            <span>•</span>
            <span>{new Date(paper.publishDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <CardDescription className="text-base leading-relaxed flex-1 text-white">
          {paper.abstract}
        </CardDescription>
        
        <Button 
          className="w-full bg-[#f5743a] hover:bg-[#f5743a]/90 text-white"
          onClick={() => {
            setSelectedPaper(paper);
          }}
        >
          {t.whitepaper.learnMore}
        </Button>
      </CardContent>
    </Card>
  );

  const featuredPaper = whitePapers.find(p => p.featured);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-56 pb-16 lg:pt-64 lg:pb-20">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${whitepaperHero})`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent"></div>
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              White Papers
            </h1>
            <p className="text-xl lg:text-2xl text-white mb-8 max-w-2xl">
              Technical expertise and industry knowledge for your projects. Download our comprehensive white papers.
            </p>
          </div>
        </div>
      </section>

      {/* White Papers Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Available White Papers</h2>
            <p className="text-white max-w-2xl">
              Our white papers provide in-depth insights into testing methodologies, standards, and best practices for image quality measurement.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whitePapers.map(paper => (
              <WhitePaperCard key={paper.id} paper={paper} />
            ))}
          </div>
        </div>
      </section>

      {/* Selected Paper Detail */}
      {selectedPaper && !isDownloadDialogOpen && (
        <section className={`py-16 bg-muted/30 transition-all duration-500 ${isClosing ? 'opacity-0' : 'opacity-100 animate-fade-in'}`}>
          <div className="container mx-auto px-6">
            <Card className={`max-w-4xl mx-auto transition-all duration-500 ${isClosing ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0 animate-scale-in'}`}>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-[#f5743a] text-black hover:bg-[#f5743a]/90 text-base px-3 py-1.5 font-normal">{selectedPaper.category}</Badge>
                  <Button variant="ghost" onClick={handleClose}>
                    Close
                  </Button>
                </div>
                <CardTitle className="text-3xl">{selectedPaper.title}</CardTitle>
                <CardDescription>
                  {selectedPaper.pages} Pages • Published {new Date(selectedPaper.publishDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div 
                  className="text-base leading-relaxed [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-foreground [&_p]:mb-3 [&_p]:text-foreground [&_ul]:my-3 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-1 [&_li]:text-foreground [&_li]:pl-1"
                  dangerouslySetInnerHTML={{ __html: selectedPaper.fullDescription }}
                />
                
                <div className="pt-6 border-t border-border">
                  <div className="space-y-4 mb-6">
                    <p className="text-lg font-semibold">
                      {t.whitepaper.downloadNow}
                    </p>
                    
                    <p className="text-base text-white">
                      {t.whitepaper.downloadIntro} {t.whitepaper.gdprCompliance}
                    </p>
                    
                    <p className="text-base text-white">
                      {t.whitepaper.redirectInfo}
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
                      
                      <Button type="submit" size="lg" className="w-full bg-[#f5743a] hover:bg-[#f5743a]/90 text-white">
                        <Download className="h-5 w-5 mr-2" />
                        {t.whitepaper.download}
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
};

export default WhitePaper;