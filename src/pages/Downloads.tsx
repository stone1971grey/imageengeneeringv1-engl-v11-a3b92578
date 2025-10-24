import React from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Video, FileDown } from "lucide-react";
import downloadsHero from "@/assets/downloads-hero.jpg";

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
    downloadUrl: "#video-p2020"
  }
];

export default function Downloads() {
  const whitepapers = downloadItems.filter(item => item.type === "whitepaper");
  const conferencePapers = downloadItems.filter(item => item.type === "conference");
  const videos = downloadItems.filter(item => item.type === "video");

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
        <div className="flex gap-4 text-sm text-muted-foreground">
          {item.pages && <span>{item.pages} Pages</span>}
          {item.duration && <span>{item.duration}</span>}
          {(item.pages || item.duration) && <span>•</span>}
          <span>{new Date(item.publishDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <CardDescription className="text-base leading-relaxed flex-1">
          {item.abstract}
        </CardDescription>
        
        <Button 
          className="w-full bg-[#f5743a] hover:bg-[#f5743a]/90 text-white"
          asChild
        >
          <a href={item.downloadUrl} target="_blank" rel="noopener noreferrer">
            {item.type === "video" ? (
              <>
                <Video className="h-4 w-4 mr-2" />
                Watch Video
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4 mr-2" />
                Download
              </>
            )}
          </a>
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
            <h2 className="text-3xl font-bold mb-4">White Papers</h2>
            <p className="text-muted-foreground max-w-2xl">
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

      {/* Conference Papers Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Conference Papers</h2>
            <p className="text-muted-foreground max-w-2xl">
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

      {/* Videos Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Videos</h2>
            <p className="text-muted-foreground max-w-2xl">
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

      <Footer />
    </div>
  );
}
