import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import emvaLogo from "@/assets/news-emva-1288-logo.png";
import te300Image from "@/assets/news-te300.png";
import iqAnalyzerImage from "@/assets/news-iq-analyzer-x.png";
import geocalImage from "@/assets/news-geocal-xl.png";
import industriesHero from "@/assets/industries-hero.jpg";

const newsItems = [
  {
    id: 1,
    slug: "emva-1288-iso-24942",
    date: "July 21, 2025",
    headline: "EMVA 1288 becoming ISO 24942",
    teaser: "Dietmar Wueller is leading the international effort to migrate EMVA 1288 into ISO 24942, enhancing global standards for image quality testing.",
    image: emvaLogo
  },
  {
    id: 2,
    slug: "te300-skin-tone-chart",
    date: "June 20, 2025",
    headline: "TE300 – A new skin tone test chart",
    teaser: "Introducing the TE300 Skin Tone Checker: a modern tool for assessing skin tone accuracy in camera systems with real-world spectral data.",
    image: te300Image
  },
  {
    id: 3,
    slug: "iq-analyzer-x-ai",
    date: "May 27, 2025",
    headline: "AI-powered image quality analysis software",
    teaser: "The iQ-Analyzer-X introduces advanced AI-powered tools for chart detection, automation, and video file analysis to streamline workflows.",
    image: iqAnalyzerImage
  },
  {
    id: 4,
    slug: "geometric-camera-calibration",
    date: "July 21, 2025",
    headline: "Geometric Camera Calibration",
    teaser: "GEOCAL offers a compact, laser-based solution for geometric calibration, improving accuracy compared to traditional checkerboard targets.",
    image: geocalImage
  },
  {
    id: 5,
    slug: "emva-1288-iso-24942",
    date: "June 15, 2025",
    headline: "Advanced HDR Testing Solutions",
    teaser: "New HDR test methodologies for automotive and mobile applications, enabling more accurate dynamic range assessments in real-world conditions.",
    image: emvaLogo
  },
  {
    id: 6,
    slug: "emva-1288-iso-24942",
    date: "May 10, 2025",
    headline: "Partnership with Leading Automotive OEMs",
    teaser: "Expanding our collaboration with major automotive manufacturers to develop next-generation camera testing standards for autonomous vehicles.",
    image: te300Image
  }
];

const News = () => {
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
              Latest News & Updates
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-2xl">
              Stay informed about the latest developments in image quality testing technology and industry standards.
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {newsItems.map((item) => (
                <Card key={item.id} className={`h-full hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] group bg-white flex flex-col ${
                  item.slug === 'geometric-camera-calibration' ? 'ring-2 ring-[#0f407b] border-[#0f407b] shadow-lg' : 'border border-gray-200'
                }`}>
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="aspect-video overflow-hidden rounded-t-lg relative">
                      <img
                        src={item.image}
                        alt={item.headline}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.slug === 'geometric-camera-calibration' && (
                        <div className="absolute top-3 right-3 bg-[#0f407b] text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                          FEATURED
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="text-sm text-gray-500 mb-2 font-medium">
                        {item.date}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
                        {item.headline}
                      </h3>
                      <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed flex-1">
                        {item.teaser}
                      </p>
                      <Link to={`/news/${item.slug}`} className="w-full block mt-auto">
                        <Button 
                          className="w-full bg-[#0f407b] text-white hover:bg-[#0d3468] transition-colors duration-300"
                        >
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

      <Footer />
    </div>
  );
};

export default News;