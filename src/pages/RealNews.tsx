import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ActionHero from "@/components/ActionHero";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import newsHero from "@/assets/news-hero.jpg";

const RealNews = () => {
  const { data: newsItems, isLoading } = useQuery({
    queryKey: ["real-news-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .eq("published", true)
        .order("date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };


  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <ActionHero
        title="News & Updates"
        subtitle="Our latest innovations, partnerships, and developments in image quality testing technology."
        backgroundImage={newsHero}
      />

      {/* News Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Latest News & Updates</h2>
            <p className="text-white max-w-2xl">
              Stay informed about our latest innovations, partnerships, and developments in image quality testing technology. Discover new products, research findings, and industry insights.
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-white text-lg">Loading news articles...</p>
            </div>
          ) : newsItems && newsItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
                >
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <CardHeader className="space-y-3">
                    {item.category && (
                      <Badge className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 text-base px-3 py-1.5 font-normal w-fit">
                        {item.category}
                      </Badge>
                    )}
                    <CardTitle className="text-xl leading-tight">{item.title}</CardTitle>
                    <div className="flex items-center gap-2 text-base text-white">
                      <Calendar className="h-5 w-5 text-white" />
                      <span>{formatDate(item.date)}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 flex-1 flex flex-col">
                    <CardDescription className="text-base leading-relaxed text-white flex-1">
                      {item.teaser.length > 140 ? `${item.teaser.substring(0, 140)}...` : item.teaser}
                    </CardDescription>

                    {item.author && (
                      <p className="text-sm text-white/70 italic">
                        By {item.author}
                      </p>
                    )}

                    <div className="mt-auto pt-4">
                      <Link to={`/news/${item.slug}`} className="w-full block">
                        <Button 
                          className="w-full bg-[#f9dc24] hover:bg-[#f9dc24]/90 text-black"
                        >
                          Read Full Story
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-white text-lg">No news articles available yet.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default RealNews;
