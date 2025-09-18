import Navigation from "@/components/Navigation";
import EngineersSlider from "@/components/EngineersSlider";
import ProductFAQ from "@/components/ProductFAQ";
import Footer from "@/components/Footer";
import le7TestlaborImage from "@/assets/le7-testlabor.jpg";

const Backlog = () => {
  const faqData = [
    {
      question: "Can I use the LE7 also in other positions, for example, with the output window facing downwards?",
      answer: "Yes, the LE7 can also be operated lying down or on the side, but you should then make sure that the side with the housing fan is on top or at least is not blocked."
    },
    {
      question: "How do you measure the uniformity of LE7?",
      answer: "For the Uniformity measurement, our TE291 test chart is applied. In each quadrant of the TE291, the luminance is measured with a Class L luminance meter. The uniformity is then calculated as: Uniformity = Lmin/Lmax"
    },
    {
      question: "How do you calculate the color temperature deviation for the LE7?",
      answer: "The color temperature deviation is calculated using the formula: Δuv = √[(u' - u'BBL)² + (v' - v'BBL)²] where u' and v' are the CIE 1976 chromaticity coordinates of the measured white point, and u'BBL and v'BBL are the coordinates of the blackbody locus at the target color temperature. For precise measurements, we recommend keeping Δuv < 0.006 for optimal performance."
    },
    {
      question: "What does the LE7 setup look like in a professional testing environment?",
      answer: `The LE7 integrates seamlessly into professional testing workflows. Here's a typical setup configuration:
      
      <div class="my-4">
        <img src="${le7TestlaborImage}" alt="LE7 Professional Testing Setup" class="w-full max-w-2xl mx-auto rounded-lg shadow-md" />
        <p class="text-sm text-gray-600 text-center mt-2">LE7 VIS-IR in a complete testing environment with laptop integration</p>
      </div>
      
      The setup typically includes the LE7 light source, measurement equipment, and our Vega software for comprehensive analysis and control.`
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