import { useTranslation } from "@/hooks/useTranslation";

const PartnerSection = () => {
  const { t } = useTranslation();
  
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-light-foreground mb-6 tracking-tight">
            {t.partner.title}
          </h2>
          <p className="text-xl text-light-muted max-w-2xl mx-auto font-light">
            {t.partner.description}
          </p>
        </div>
      </div>
    </section>
  );
};

export default PartnerSection;
