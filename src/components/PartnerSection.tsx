import { useTranslation } from "@/hooks/useTranslation";

const PartnerSection = () => {
  const { t } = useTranslation();
  
  return (
    <section className="py-16 px-6 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
          {t.partner.title}
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          {t.partner.description}
        </p>
      </div>
    </section>
  );
};

export default PartnerSection;
