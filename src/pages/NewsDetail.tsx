import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const NewsDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading } = useQuery({
    queryKey: ["news-article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();

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
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
        <Navigation />
        <div className="container mx-auto px-6 py-32">
          <p className="text-center text-white">Loading article...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
        <Navigation />
        <div className="container mx-auto px-6 py-32">
          <p className="text-center text-white mb-4">Article not found</p>
          <div className="text-center mt-4">
            <Link to="/news">
              <Button variant="outline" className="bg-white/5 text-white border-white/10 hover:bg-white/10">
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
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <Navigation />

      {/* Back Button */}
      <div className="container mx-auto px-6 pt-32 pb-8">
        <Link to="/news" className="inline-block group">
          <Button variant="outline" className="bg-white/5 backdrop-blur-sm text-white border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to News
          </Button>
        </Link>
      </div>

      {/* Article Header Card */}
      <section className="container mx-auto px-6 pb-12">
        <Card className="bg-gradient-to-br from-gray-900/90 to-black/90 border-white/10 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 overflow-hidden group">
          <CardContent className="p-0">
            {/* Featured Image */}
            <div className="aspect-[21/9] overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
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
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/20 backdrop-blur-sm animate-fade-in">
                    {article.category}
                  </span>
                )}
                <span className="text-sm text-gray-400">{article.date}</span>
                {article.author && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className="text-sm text-gray-400">By {article.author}</span>
                  </>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl lg:text-5xl font-bold text-white mb-6 leading-tight animate-fade-in">
                {article.title}
              </h1>

              {/* Teaser */}
              <p className="text-lg lg:text-xl text-gray-300 mb-8 leading-relaxed animate-fade-in">
                {article.teaser}
              </p>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-8"></div>

              {/* Article Content */}
              <article className="prose prose-lg prose-invert max-w-none 
                prose-headings:font-bold prose-headings:text-white
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-4
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6
                prose-img:rounded-lg prose-img:shadow-2xl prose-img:border prose-img:border-white/10 prose-img:my-8
                prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800 prose-a:transition-all
                prose-strong:text-white prose-strong:font-semibold
                prose-ul:text-gray-300 prose-ol:text-gray-300
                prose-li:mb-2
                prose-hr:border-white/10 prose-hr:my-8
                prose-code:text-primary prose-code:bg-white/5 prose-code:px-2 prose-code:py-1 prose-code:rounded
                whitespace-pre-wrap
                animate-fade-in"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Related News */}
      {relatedNews && relatedNews.length > 0 && (
        <section className="py-16 container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8 animate-fade-in">Related News</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedNews.map((item, index) => (
                <Card 
                  key={item.id} 
                  className="bg-gradient-to-br from-gray-900/70 to-black/70 border-white/10 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:scale-[1.03] hover:border-primary/30 group overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-0">
                    <div className="aspect-video overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-sm text-gray-400">{item.date}</span>
                        {item.category && (
                          <>
                            <span className="text-gray-600">•</span>
                            <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                              {item.category}
                            </span>
                          </>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                        {item.title}
                      </h3>
                      <p className="text-gray-400 mb-4 line-clamp-2 text-sm">
                        {item.teaser}
                      </p>
                      <Link to={`/news/${item.slug}`}>
                        <Button variant="outline" className="w-full bg-white/5 text-white border-white/10 hover:bg-primary/20 hover:border-primary/40 hover:text-primary transition-all duration-300">
                          Read more
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default NewsDetail;
