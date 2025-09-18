import Navigation from "@/components/Navigation";
import EngineersSlider from "@/components/EngineersSlider";
import ProductFAQ from "@/components/ProductFAQ";
import Footer from "@/components/Footer";

const Backlog = () => {
  const faqData = [
    {
      question: "Can I use the LE7 also in other positions, for example, with the output window facing downwards?",
      answer: "Yes, the LE7 can also be operated lying down or on the side, but you should then make sure that the side with the housing fan is on top or at least is not blocked."
    },
    {
      question: "How do you measure the uniformity of LE7?",
      answer: "For the Uniformity measurement, our TE291 test chart is applied. In each quadrant of the TE291, the luminance is measured with a Class L luminance meter. The uniformity is then calculated as: Uniformity = Lmin/Lmax"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div aria-hidden="true" className="block h-[320px]" />
      <div className="pb-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-center mb-8">Backlog</h1>
            <p className="text-xl text-center text-muted-foreground mb-16">
              Components and segments saved for future use.
            </p>
          </div>
        </div>
      </div>
      
      {/* LE7 FAQ Segment */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <ProductFAQ 
            title="LE7 FAQ's"
            faqs={faqData}
            productName="LE7 VIS-IR"
          />
        </div>
      </section>
      
      {/* Engineers Slider Segment - "Speak with Our Engineers" */}
      <EngineersSlider />
      
      <Footer />
    </div>
  );
};

export default Backlog;