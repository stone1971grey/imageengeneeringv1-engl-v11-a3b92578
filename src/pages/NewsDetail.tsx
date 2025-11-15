import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";

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
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto px-6 py-32">
          <p className="text-center">Loading article...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="container mx-auto px-6 py-32">
          <p className="text-center">Article not found</p>
          <div className="text-center mt-4">
            <Link to="/news">
              <Button variant="outline">
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
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-56 pb-16 lg:pt-64 lg:pb-20">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${article.image_url})`,
          }}
        />
        <div className="relative container mx-auto px-6">
          <div className="max-w-4xl">
            <Link to="/news" className="inline-block mb-6">
              <Button variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to News
              </Button>
            </Link>
            <div className="text-sm text-white/80 mb-4">
              {article.date}
              {article.category && <> • {article.category}</>}
              {article.author && <> • By {article.author}</>}
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              {article.title}
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-3xl">
              {article.teaser}
            </p>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <article className="max-w-4xl mx-auto prose prose-lg prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-p:text-gray-700 prose-p:leading-relaxed prose-img:rounded-lg prose-img:shadow-lg prose-a:text-[#0f407b] prose-a:no-underline hover:prose-a:underline">
            <ReactMarkdown>
              {article.content}
            </ReactMarkdown>
          </article>
        </div>
      </section>

      {/* Related News */}
      {relatedNews && relatedNews.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Related News</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedNews.map((item) => (
                  <Card key={item.id} className="hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] group">
                    <CardContent className="p-0">
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-6">
                        <div className="text-sm text-gray-500 mb-2">
                          {item.date}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                          {item.teaser}
                        </p>
                        <Link to={`/news/${item.slug}`}>
                          <Button variant="outline" className="w-full">
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
