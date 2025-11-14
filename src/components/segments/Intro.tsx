interface IntroProps {
  title?: string;
  description?: string;
  headingLevel?: 'h1' | 'h2';
}

const Intro = ({ 
  title = "Your Partner for Objective Camera & Sensor Testing",
  description = "Industry-leading solutions for comprehensive camera and sensor evaluation",
  headingLevel = 'h2'
}: IntroProps) => {
  const HeadingTag = headingLevel;

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <HeadingTag className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
            {title}
          </HeadingTag>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Intro;
