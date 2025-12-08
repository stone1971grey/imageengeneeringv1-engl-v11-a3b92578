import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface NewsSegmentProps {
  id?: string;
  sectionTitle?: string;
  sectionDescription?: string;
  articleLimit?: number;
  categories?: string[];
}

const NewsSegment = ({
  id,
  sectionTitle = "Latest News",
  sectionDescription = "Stay updated with the latest developments in image quality testing and measurement technology",
  articleLimit = 12,
  categories: filterCategories = [],
}: NewsSegmentProps) => {
  // Fetch news articles with category filter applied from backend configuration
  const { data: newsItems, isLoading } = useQuery({
    queryKey: ["news-articles-segment", articleLimit, filterCategories],
    queryFn: async () => {
      let query = supabase
        .from("news_articles")
        .select("*")
        .eq("published", true)
        .order("date", { ascending: false })
        .limit(articleLimit);

      // Apply category filter if specific categories are selected in CMS backend
      if (filterCategories && filterCategories.length > 0) {
        query = query.in("category", filterCategories);
      }

      const { data, error } = await query;
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
    return null;
  }

  return (
    <section id={id} className="pt-[150px] pb-24 bg-[#373737]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">{sectionTitle}</h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            {sectionDescription}
          </p>
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
              {newsItems.map((item) => (
                <CarouselItem
                  key={item.id}
                  className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3"
                >
                  <Card className="h-full hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] group flex flex-col">
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
                          <span className="text-sm text-muted-foreground font-medium">
                            {formatDate(item.date)}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed flex-1">
                          {item.teaser}
                        </p>
                        <Link to={`/news/${item.slug}`} className="w-full block">
                          <Button className="w-full bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90 transition-colors duration-300 mt-auto">
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

export default NewsSegment;
