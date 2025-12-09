import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface NewsListSegmentProps {
  id?: string;
  pageSlug?: string;
  sectionTitle?: string;
  sectionDescription?: string;
}

const NewsListSegment = ({
  id,
  pageSlug = "index",
  sectionTitle = "All News",
  sectionDescription = "Stay updated with the latest developments in image quality testing and measurement technology",
}: NewsListSegmentProps) => {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Normalize language code (e.g., 'de-DE' -> 'de')
  const normalizedLang = language?.split('-')[0] || 'en';

  // Fetch unique categories from database
  const { data: categoriesData } = useQuery({
    queryKey: ["news-categories-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("category")
        .eq("published", true)
        .eq("language", "en") // Categories from English articles as master
        .not("category", "is", null);

      if (error) throw error;
      const uniqueCategories = [...new Set(data.map(item => item.category).filter(Boolean))];
      return uniqueCategories.sort();
    },
  });

  // Build categories array dynamically
  const categories = useMemo(() => {
    const cats = [{ value: "all", label: "All" }];
    if (categoriesData) {
      categoriesData.forEach(cat => {
        if (cat) cats.push({ value: cat, label: cat });
      });
    }
    return cats;
  }, [categoriesData]);

  // Fetch all news articles - language-specific with English fallback
  const { data: newsItems, isLoading } = useQuery({
    queryKey: ["news-articles-list", normalizedLang],
    queryFn: async () => {
      // First try to get articles in the current language
      const { data: langData, error: langError } = await supabase
        .from("news_articles")
        .select("*")
        .eq("published", true)
        .eq("language", normalizedLang)
        .order("date", { ascending: false });
      
      // If we found articles in the target language, return them
      if (!langError && langData && langData.length > 0) {
        return langData;
      }
      
      // Fallback to English articles
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .eq("published", true)
        .eq("language", "en")
        .order("date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Filter news by selected category (frontend filtering)
  const filteredNews = useMemo(() => {
    if (!newsItems) return [];
    if (selectedCategory === "all") return newsItems;
    return newsItems.filter(item => item.category === selectedCategory);
  }, [newsItems, selectedCategory]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getReadMoreLabel = () => {
    switch (normalizedLang) {
      case 'de': return 'Mehr lesen';
      case 'ja': return '続きを読む';
      case 'ko': return '더 읽기';
      case 'zh': return '阅读更多';
      default: return 'Read more';
    }
  };

  if (isLoading) {
    return (
      <section id={id} className="py-24 bg-[#373737]">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-white">Loading news...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!newsItems || newsItems.length === 0) {
    return (
      <section id={id} className="py-24 bg-[#373737]">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-white">No news articles available.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id={id} className="pt-[70px] pb-24 bg-[#373737]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">{sectionTitle}</h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            {sectionDescription}
          </p>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === category.value
                  ? "bg-[#f9dc24] text-black"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* News Grid (3 columns) */}
        <div className="max-w-7xl mx-auto">
          {filteredNews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/70">No articles found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredNews.map((item) => (
                <Card
                  key={item.id}
                  className="h-full hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] group flex flex-col bg-black border-none"
                >
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="aspect-video overflow-hidden rounded-t-lg relative">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {item.category && (
                          <Badge className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 text-sm px-3 py-1">
                            {item.category}
                          </Badge>
                        )}
                        <span className="text-sm text-white/60 font-medium">
                          {formatDate(item.date)}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-white/70 mb-6 line-clamp-3 leading-relaxed flex-1">
                        {item.teaser}
                      </p>
                      <Link to={`/${language}/news/${item.slug}`} className="w-full block">
                        <button className="w-full py-2.5 px-4 bg-[#f9dc24] text-black font-medium rounded-md hover:bg-[#f9dc24]/90 transition-colors duration-300 mt-auto">
                          {getReadMoreLabel()}
                        </button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsListSegment;
