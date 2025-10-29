interface ActionHeroProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
  flipImage?: boolean;
}

const ActionHero = ({ title, subtitle, backgroundImage, flipImage = true }: ActionHeroProps) => {
  return (
    <section className="relative pt-56 pb-16 lg:pt-64 lg:pb-20">
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent z-10"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          transform: flipImage ? 'scaleX(-1)' : 'none'
        }}
      />
      <div className="relative container mx-auto px-6 z-20">
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
