import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import emvaLogo from "@/assets/news-emva-1288-logo.png";
import te300Image from "@/assets/news-te300.png";
import iqAnalyzerImage from "@/assets/news-iq-analyzer-x.png";
import geocalImage from "@/assets/news-geocal-xl.png";

const newsItems = [
  {
    id: 1,
    date: "July 21, 2025",
    headline: "EMVA 1288 becoming ISO 24942",
    teaser: "Dietmar Wueller is leading the international effort to migrate EMVA 1288 into ISO 24942, enhancing global standards for image quality testing.",
    image: emvaLogo
  },
  {
    id: 2,
    date: "June 20, 2025",
    headline: "TE300 – A new skin tone test chart",
    teaser: "Introducing the TE300 Skin Tone Checker: a modern tool for assessing skin tone accuracy in camera systems with real-world spectral data.",
    image: te300Image
  },
  {
    id: 3,
    date: "May 27, 2025",
    headline: "AI-powered image quality analysis software",
    teaser: "The iQ-Analyzer-X introduces advanced AI-powered tools for chart detection, automation, and video file analysis to streamline workflows.",
    image: iqAnalyzerImage
  },
  {
    id: 4,
    date: "July 21, 2025",
    headline: "Geometric Camera Calibration",
    teaser: "GEOCAL offers a compact, laser-based solution for geometric calibration, improving accuracy compared to traditional checkerboard targets.",
    image: geocalImage
  }
];

const NewsSection = () => {
  return (
    <section className="py-24 bg-[#373737]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Latest News</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay updated with the latest developments in image quality testing and measurement technology
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
                <CarouselItem key={item.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] group">
                    <CardContent className="p-0">
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={item.image}
                          alt={item.headline}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-6">
                        <div className="text-sm text-muted-foreground mb-2 font-medium">
                          {item.date}
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2 leading-tight">
                          {item.headline}
                        </h3>
                        <p className="text-muted-foreground mb-6 line-clamp-3 leading-relaxed">
                          {item.teaser}
                        </p>
                        <Button 
                          variant="outline" 
                          className="w-full group-hover:bg-[#3D7BA2] group-hover:text-white transition-colors duration-300"
                        >
                          Read more
                        </Button>
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