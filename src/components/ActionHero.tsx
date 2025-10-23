interface ActionHeroProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
}

const ActionHero = ({ title, subtitle, backgroundImage }: ActionHeroProps) => {
  return (
    <section className="relative pt-56 pb-16 lg:pt-64 lg:pb-20">
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImage})`
        }}
      />
      <div className="relative container mx-auto px-6">
        <div className="max-w-4xl">
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            {title}
          </h1>
          <p className="text-xl lg:text-2xl text-white mb-8 max-w-2xl">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ActionHero;
