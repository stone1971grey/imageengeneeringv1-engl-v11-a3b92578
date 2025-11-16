interface ActionHeroProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
  flipImage?: boolean;
}

const ActionHero = ({ title, subtitle, backgroundImage, flipImage = true }: ActionHeroProps) => {
  return (
    <section className="relative h-[380px]">
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          transform: flipImage ? 'scaleX(-1)' : 'none'
        }}
      />
      <div className="relative container mx-auto px-6 z-20 h-full flex items-center">
        <div className="max-w-4xl">
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            {title}
          </h1>
          <p className="text-xl lg:text-2xl text-white max-w-2xl line-clamp-3">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ActionHero;
