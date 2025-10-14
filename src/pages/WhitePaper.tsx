import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { FileText, Download, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import whitepaperHero from "@/assets/whitepaper-hero.jpg";

// Form validation schema
const downloadFormSchema = z.object({
  name: z.string().min(2, { message: "Name muss mindestens 2 Zeichen lang sein" }),
  email: z.string().email({ message: "Bitte geben Sie eine gültige E-Mail-Adresse ein" }),
  company: z.string().min(2, { message: "Unternehmen muss mindestens 2 Zeichen lang sein" }),
  position: z.string().min(2, { message: "Position muss mindestens 2 Zeichen lang sein" }),
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
  const [selectedPaper, setSelectedPaper] = useState<WhitePaper | null>(null);
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const form = useForm<DownloadFormValues>({
    resolver: zodResolver(downloadFormSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      position: "",
    },
  });

  const onSubmit = (data: DownloadFormValues) => {
    console.log("Download request:", { ...data, whitePaper: selectedPaper?.id });
    
    // Simulate download
    setTimeout(() => {
      setDownloadSuccess(true);
      toast.success("White Paper wird heruntergeladen!");
      
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

  const WhitePaperCard = ({ paper }: { paper: WhitePaper }) => (
    <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge className="bg-[hsl(58,95%,45%)] text-black hover:bg-[hsl(58,95%,55%)]">
            {paper.category}
          </Badge>
        </div>
        <CardTitle className="text-xl leading-tight flex items-start gap-3">
          <FileText className="h-6 w-6 text-[hsl(58,95%,45%)] flex-shrink-0 mt-1" />
          <span>{paper.title}</span>
        </CardTitle>
        <div className="flex gap-4 text-base text-muted-foreground">
          <span>{paper.pages} Seiten</span>
          <span>•</span>
          <span>{new Date(paper.publishDate).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <CardDescription className="text-base leading-relaxed flex-1">
          {paper.abstract}
        </CardDescription>
        
        <Button 
          className="w-full"
          onClick={() => {
            setSelectedPaper(paper);
          }}
        >
          Mehr erfahren
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
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-2xl">
              Technische Expertise und Branchenwissen für Ihre Projekte. Laden Sie unsere umfassenden White Papers herunter.
            </p>
            
            {/* Featured White Paper Banner */}
            {featuredPaper && (
              <Card className="bg-card/80 backdrop-blur-sm border-primary/20">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{featuredPaper.title}</h3>
                      <p className="text-base text-muted-foreground mb-2">
                        {featuredPaper.abstract}
                      </p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{featuredPaper.pages} Seiten</span>
                        <span>•</span>
                        <span>{featuredPaper.category}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* White Papers Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Verfügbare White Papers</h2>
            <p className="text-muted-foreground max-w-2xl">
              Unsere White Papers bieten tiefgehende Einblicke in Testmethoden, Standards und Best Practices für die Bildqualitätsmessung.
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
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Badge className="bg-[hsl(58,95%,45%)] text-black hover:bg-[hsl(58,95%,55%)]">{selectedPaper.category}</Badge>
                  <Button variant="ghost" onClick={() => setSelectedPaper(null)}>
                    Schließen
                  </Button>
                </div>
                <CardTitle className="text-3xl">{selectedPaper.title}</CardTitle>
                <CardDescription>
                  {selectedPaper.pages} Seiten • Veröffentlicht {new Date(selectedPaper.publishDate).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div 
                  className="text-base leading-relaxed [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-foreground [&_p]:mb-3 [&_p]:text-foreground [&_ul]:my-3 [&_ul]:ml-6 [&_ul]:list-disc [&_ul]:space-y-1 [&_li]:text-foreground [&_li]:pl-1"
                  dangerouslySetInnerHTML={{ __html: selectedPaper.fullDescription }}
                />
                
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => handleDownloadClick(selectedPaper)}
                >
                  <Download className="h-5 w-5 mr-2" />
                  White Paper jetzt herunterladen
                </Button>
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