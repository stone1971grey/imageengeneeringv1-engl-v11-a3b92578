import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import industriesHero from "@/assets/industries-hero.jpg";

const News = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const { data: newsItems, isLoading } = useQuery({
    queryKey: ["news-articles-all"],
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
  
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-56 pb-16 lg:pt-64 lg:pb-20">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${industriesHero})`
          }}
        />
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              {t.newsPage.title}
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-2xl">
              {t.newsPage.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* News Grid Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">All News Articles</h2>
              <p className="text-lg text-gray-600">
                Comprehensive coverage of innovations, partnerships, and developments in image quality testing
              </p>
            </div>
            
            {/* 3-Column Grid */}
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading news articles...</p>
              </div>
            ) : newsItems && newsItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {newsItems.map((item) => (
                  <Card key={item.id} className={`h-full hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] group bg-white flex flex-col ${
                    item.slug === 'geometric-camera-calibration' ? 'ring-2 ring-[#0f407b] border-[#0f407b] shadow-lg' : 'border border-gray-200'
                  }`}>
                    <CardContent className="p-0 flex flex-col h-full">
                      <div className="aspect-video overflow-hidden rounded-t-lg relative">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {item.slug === 'geometric-camera-calibration' && (
                          <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                            ACTIVE
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <div className="text-sm text-gray-500 mb-2 font-medium">
                          {item.date}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                          {item.title}
                        </h3>
                      <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed flex-1">
                        {item.teaser}
                      </p>
                      <Link to={`/${language}/news/${item.slug}`} className="w-full block mt-auto">
                        <Button 
                          className="w-full bg-[#0f407b] text-white hover:bg-[#0d3468] transition-colors duration-300"
                        >
                          {t.newsPage.readMore}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">No news articles available yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default News;