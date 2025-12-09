interface ActionHeroProps {
  id?: string;
  title: string;
  description: string;
  backgroundImage: string;
  flipImage?: boolean;
}

const ActionHero = ({ id, title, description, backgroundImage, flipImage = false }: ActionHeroProps) => {
  return (
    <section 
      id={id}
      className="relative h-[380px]"
    >
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-10" />
      
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          transform: flipImage ? 'scaleX(-1)' : 'none'
        }}
      />
      
      {/* Content */}
      <div className="relative container mx-auto px-6 z-20 h-full flex items-center">
        <div className="max-w-4xl pt-20">
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            {title}
          </h1>
          <p className="text-xl lg:text-2xl text-white max-w-2xl line-clamp-3">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ActionHero;
