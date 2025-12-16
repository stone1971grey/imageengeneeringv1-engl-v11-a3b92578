import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileText, Video, BookOpen, Presentation, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

interface DescriptionSection {
  id: string;
  heading: string;
  content: string;
  isBulletList: boolean;
}

const DOWNLOAD_TYPES = {
  whitepaper: { label: "White Paper", color: "bg-blue-600", icon: BookOpen },
  conference: { label: "Conference Paper", color: "bg-purple-600", icon: Presentation },
  video: { label: "Video", color: "bg-red-600", icon: Video },
};

const DownloadDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();

  const { data: download, isLoading, error } = useQuery({
    queryKey: ["download-detail", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("downloads")
        .select("*")
        .eq("slug", slug)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  // Parse description sections
  const descriptionSections: DescriptionSection[] = (() => {
    if (!download?.description) return [];
    try {
      const parsed = JSON.parse(download.description);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // Legacy format - single text
      return [{ id: '1', heading: '', content: download.description, isBulletList: false }];
    }
    return [];
  })();

  const typeInfo = download ? DOWNLOAD_TYPES[download.download_type as keyof typeof DOWNLOAD_TYPES] || DOWNLOAD_TYPES.whitepaper : DOWNLOAD_TYPES.whitepaper;
  const TypeIcon = typeInfo.icon;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 pb-20 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !download) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-32 pb-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Download not found</h1>
            <Link to={`/${language}/info-hub/downloads`}>
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Downloads
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section with Cover Image */}
      <div className="relative pt-24">
        {download.image_url && (
          <div className="relative h-[300px] md:h-[400px] overflow-hidden">
            <img
              src={download.image_url}
              alt={download.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>
        )}
        
        {/* Content overlay */}
        <div className={`container mx-auto px-4 ${download.image_url ? '-mt-32 relative z-10' : 'pt-8'}`}>
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link 
              to={`/${language}/info-hub/downloads`}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Downloads
            </Link>
          </div>

          {/* Type Badge */}
          <Badge className={`${typeInfo.color} text-white mb-4`}>
            <TypeIcon className="w-3 h-3 mr-1" />
            {typeInfo.label}
          </Badge>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {download.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            {download.publish_date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(download.publish_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            )}
            {download.pages && (
              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {download.pages} pages
              </span>
            )}
            {download.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {download.duration}
              </span>
            )}
            {download.category && (
              <Badge variant="outline">{download.category}</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl">
          {/* Teaser */}
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            {download.teaser}
          </p>

          {/* Description Sections */}
          {descriptionSections.length > 0 && (
            <div className="prose prose-lg max-w-none mb-12">
              {descriptionSections.map((section) => (
                <div key={section.id} className="mb-8">
                  {section.heading && (
                    <h2 className="text-2xl font-semibold text-foreground mb-4">
                      {section.heading}
                    </h2>
                  )}
                  {section.content && (
                    section.isBulletList ? (
                      <div className="space-y-2 ml-4">
                        {section.content.split('\n').filter(line => line.trim()).map((line, i) => (
                          <div key={i} className="flex items-start gap-3 text-muted-foreground">
                            <span className="text-[#f9dc24] mt-1">•</span>
                            <span>{line.trim()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground leading-relaxed">
                        {section.content}
                      </p>
                    )
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Download Button */}
          {download.download_url && (
            <div className="bg-muted/50 rounded-xl p-8 text-center">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Ready to Download?
              </h3>
              <p className="text-muted-foreground mb-6">
                Click below to download the {typeInfo.label.toLowerCase()}.
              </p>
              <a 
                href={download.download_url} 
                target="_blank" 
                rel="noopener noreferrer"
                download
              >
                <Button size="lg" className="bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black">
                  <Download className="w-5 h-5 mr-2" />
                  Download {download.download_type === 'video' ? 'Video' : 'PDF'}
                </Button>
              </a>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DownloadDetail;
