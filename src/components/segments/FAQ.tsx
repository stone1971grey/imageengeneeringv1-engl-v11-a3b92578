import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  id?: string;
  title?: string;
  subtext?: string;
  items?: FAQItem[];
}

const FAQ: React.FC<FAQProps> = ({
  id,
  title = '',
  subtext = '',
  items = []
}) => {
  // Generate Schema.org FAQPage JSON-LD
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items
      .filter(item => item.question && item.answer)
      .map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
  };

  return (
    <section id={id} className="py-16 bg-background">
      {items.length > 0 && (
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      )}
        <div className="container mx-auto px-4">
          {title && (
            <h2 className={`text-3xl font-bold text-foreground text-center ${subtext ? 'mb-4' : 'mb-12'}`}>
              {title}
            </h2>
          )}
          {subtext && (
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl text-center mx-auto">
              {subtext}
            </p>
          )}
          
          {items.length > 0 && (
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {items.map((item, index) => (
                  item.question && item.answer && (
                    <AccordionItem 
                      key={index} 
                      value={`item-${index}`}
                      className="border border-border rounded-lg px-6 bg-card"
                    >
                      <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-4">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4 pt-2">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  )
                ))}
              </Accordion>
            </div>
          )}
        </div>
      </section>
  );
};

export default FAQ;
