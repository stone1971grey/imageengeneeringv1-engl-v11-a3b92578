interface IntroProps {
  title?: string;
  description?: string;
}

const Intro = ({ 
  title = "Your Partner for Objective Camera & Sensor Testing",
  description = "Industry-leading solutions for comprehensive camera and sensor evaluation",
}: IntroProps) => {
  return (
    <section className="pt-20 pb-12 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-light-foreground mb-8 tracking-tight">
            {title}
          </h1>
          <p className="text-xl text-light-muted max-w-2xl mx-auto font-light whitespace-pre-line">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Intro;
