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
      className="relative pt-56 pb-16 lg:pt-64 lg:pb-20"
    >
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent z-10" />
      
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          transform: flipImage ? 'scaleX(-1)' : 'none'
        }}
      />
      
      {/* Content */}
      <div className="relative container mx-auto px-6 z-20">
        <div className="max-w-4xl">
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            {title}
          </h1>
          <p className="text-xl lg:text-2xl text-white max-w-2xl">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ActionHero;
