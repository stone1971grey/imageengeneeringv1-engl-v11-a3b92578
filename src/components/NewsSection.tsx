import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const NewsSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch unique categories from database
  const { data: categoriesData } = useQuery({
    queryKey: ["news-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("category")
        .eq("published", true)
        .not("category", "is", null);

      if (error) throw error;
      // Extract unique categories
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

  const { data: newsItems, isLoading } = useQuery({
    queryKey: ["news-articles-published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .eq("published", true)
        .order("date", { ascending: false })
        .limit(12);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-24 bg-[#373737]">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-white">Loading news...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!newsItems || newsItems.length === 0) {
    return null;
  }

  // Filter news by selected category
  const filteredNews = selectedCategory === "all" 
    ? newsItems 
    : newsItems.filter(item => item.category === selectedCategory);

  return (
    <section className="py-24 bg-[#373737]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">Latest News</h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Stay updated with the latest developments in image quality testing and measurement technology
          </p>
        </div>

        {/* Category Filter */}
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

        <div className="relative max-w-7xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {filteredNews.map((item) => (
                <CarouselItem key={item.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                  <Card className={`h-full hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] group flex flex-col ${
                    item.slug === 'geometric-camera-calibration' ? 'ring-2 ring-[#0f407b] shadow-lg' : ''
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
                        <div className="flex items-center gap-2 mb-2">
                          {item.category && (
                            <Badge className="bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 text-sm px-3 py-1">
                              {item.category}
                            </Badge>
                          )}
                          <span className="text-sm text-muted-foreground font-medium">
                            {item.date}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed flex-1">
                          {item.teaser}
                        </p>
                        <Link to={`/news/${item.slug}`} className="w-full block">
                          <Button 
                            className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 transition-colors duration-300 mt-auto"
                          >
                            Read more
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
