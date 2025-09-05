import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface ProductFAQProps {
  title?: string;
  faqs: FAQItem[];
  productName?: string;
}

const ProductFAQ: React.FC<ProductFAQProps> = ({
  title = "Frequently Asked Questions",
  faqs,
  productName = "Product"
}) => {
  // Generate JSON-LD schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq, index) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  React.useEffect(() => {
    // Add JSON-LD schema to head
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(faqSchema);
    script.id = 'faq-schema';
    
    // Remove existing schema if present
    const existingSchema = document.getElementById('faq-schema');
    if (existingSchema) {
      existingSchema.remove();
    }
    
    document.head.appendChild(script);
    
    return () => {
      const schemaToRemove = document.getElementById('faq-schema');
      if (schemaToRemove) {
        schemaToRemove.remove();
      }
    };
  }, [faqSchema]);

  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            {title}
          </h2>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white rounded-lg border border-gray-200 shadow-sm"
              >
                <AccordionTrigger className="px-6 py-4 text-left font-medium text-gray-900 hover:text-blue-600 transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-lg text-gray-600 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default ProductFAQ;