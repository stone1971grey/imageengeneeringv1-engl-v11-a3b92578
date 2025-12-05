import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

const NewsDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();

  const { data: article, isLoading } = useQuery({
    queryKey: ["news-article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const { data: relatedNews } = useQuery({
    queryKey: ["related-news", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .eq("published", true)
        .neq("slug", slug)
        .order("date", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navigation />
        <div className="container mx-auto px-6 py-32">
          <p className="text-center text-gray-600">Loading article...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navigation />
        <div className="container mx-auto px-6 py-32">
          <p className="text-center text-gray-600 mb-4">Article not found</p>
          <div className="text-center mt-4">
            <Link to={`/${language}/news`}>
              <Button variant="outline" className="border-gray-300 hover:bg-gray-100">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to News
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <Navigation />

      {/* Back Button */}
      <div className="container mx-auto px-6 pt-32 pb-8">
        <Link to={`/${language}/news`} className="inline-block group">
          <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all duration-300">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to News
          </Button>
        </Link>
      </div>

      {/* Article Header Card */}
      <section className="container mx-auto px-6 pb-12">
        <Card className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden group">
          <CardContent className="p-0">
            {/* Featured Image */}
            <div className="aspect-[21/9] overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10"></div>
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            
            {/* Content */}
            <div className="p-8 lg:p-12">
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {article.category && (
                  <Badge className="bg-[#0f407b] text-white hover:bg-[#0d3468] text-sm px-3 py-1.5 font-medium">
                    {article.category}
                  </Badge>
                )}
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                {article.author && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{article.author}</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {article.title}
              </h1>

              {/* Teaser */}
              <p className="text-lg lg:text-xl text-gray-600 mb-8 leading-relaxed">
                {article.teaser}
              </p>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-8"></div>

              {/* Article Content */}
              <article className="prose prose-lg max-w-none 
                prose-headings:font-bold prose-headings:text-gray-900
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-4
                prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-gray-800
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
                prose-img:rounded-lg prose-img:shadow-lg prose-img:border prose-img:border-gray-200 prose-img:my-8
                prose-a:text-[#0f407b] prose-a:underline hover:prose-a:text-[#0d3468] prose-a:transition-all
                prose-strong:text-gray-900 prose-strong:font-semibold
                prose-ul:text-gray-700 prose-ol:text-gray-700
                prose-li:mb-2
                prose-hr:border-gray-200 prose-hr:my-8
                prose-code:text-[#0f407b] prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Related News */}
      {relatedNews && relatedNews.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Related News</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedNews.map((item) => (
                  <Card 
                    key={item.id} 
                    className="bg-white border border-gray-200 shadow-md hover:shadow-xl transition-all duration-500 hover:scale-[1.02] group overflow-hidden"
                  >
                    <CardContent className="p-0">
                      <div className="aspect-video overflow-hidden relative">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          {item.category && (
                            <>
                              <span className="text-gray-300">•</span>
                              <Badge variant="outline" className="text-xs border-[#0f407b] text-[#0f407b]">
                                {item.category}
                              </Badge>
                            </>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#0f407b] transition-colors duration-300">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                          {item.teaser}
                        </p>
                        <Link to={`/${language}/news/${item.slug}`}>
                          <Button className="w-full bg-[#0f407b] text-white hover:bg-[#0d3468] transition-all duration-300">
                            Read more
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default NewsDetail;
