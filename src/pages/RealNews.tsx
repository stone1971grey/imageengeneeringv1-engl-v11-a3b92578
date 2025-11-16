import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ActionHero from "@/components/ActionHero";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import eventsHero from "@/assets/events-hero.jpg";

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

  const getCategoryColor = (category: string | null) => {
    if (!category) return "bg-gray-500/10 text-gray-600 border-gray-300";
    
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes("product")) return "bg-blue-500/10 text-blue-600 border-blue-300";
    if (categoryLower.includes("innovation")) return "bg-purple-500/10 text-purple-600 border-purple-300";
    if (categoryLower.includes("event")) return "bg-green-500/10 text-green-600 border-green-300";
    if (categoryLower.includes("partnership")) return "bg-orange-500/10 text-orange-600 border-orange-300";
    if (categoryLower.includes("research")) return "bg-pink-500/10 text-pink-600 border-pink-300";
    return "bg-gray-500/10 text-gray-600 border-gray-300";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      
      <ActionHero
        title="Latest News & Updates"
        subtitle="Stay informed about our latest innovations, partnerships, and developments in image quality testing technology"
        backgroundImage={eventsHero}
      />

      {/* News Grid Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Loading news articles...</p>
            </div>
          ) : newsItems && newsItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="group h-full flex flex-col overflow-hidden hover:shadow-elegant transition-all duration-300 border-gray-200 bg-white"
                >
                  {/* Image Section */}
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Category Badge */}
                    {item.category && (
                      <div className="absolute top-4 right-4">
                        <Badge 
                          variant="outline" 
                          className={`${getCategoryColor(item.category)} backdrop-blur-sm font-semibold px-3 py-1`}
                        >
                          {item.category}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <CardContent className="p-6 flex-1 flex flex-col">
                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">{formatDate(item.date)}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#0f407b] transition-colors">
                      {item.title}
                    </h3>

                    {/* Teaser */}
                    <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed flex-1">
                      {item.teaser}
                    </p>

                    {/* Author (if available) */}
                    {item.author && (
                      <p className="text-sm text-gray-500 mb-4 italic">
                        By {item.author}
                      </p>
                    )}

                    {/* Button */}
                    <Link to={`/news/${item.slug}`} className="w-full block mt-auto">
                      <Button 
                        className="w-full bg-[#0f407b] text-white hover:bg-[#0d3468] transition-all duration-300 group/btn"
                      >
                        Read Full Story
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No news articles available yet.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default RealNews;
