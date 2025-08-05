import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, Database, Cloud, GitBranch } from "lucide-react";

const Technology = () => {
  const techStack = [
    {
      category: "KI/ML Frameworks",
      technologies: ["TensorFlow", "PyTorch", "OpenCV", "CUDA"],
      icon: Cpu,
      description: "Modernste Deep Learning und Computer Vision Frameworks"
    },
    {
      category: "Cloud-Infrastruktur",
      technologies: ["AWS", "Docker", "Kubernetes", "Redis"],
      icon: Cloud,
      description: "Skalierbare, Enterprise-taugliche Cloud-Deployment-Lösungen"
    },
    {
      category: "Datenverarbeitung",
      technologies: ["Apache Spark", "PostgreSQL", "MongoDB", "Kafka"],
      icon: Database,
      description: "Hochleistungs-Daten-Pipelines und Speichersysteme"
    },
    {
      category: "Entwicklung",
      technologies: ["Python", "C++", "TypeScript", "Go"],
      icon: GitBranch,
      description: "Moderner Entwicklungsstack für optimale Leistung"
    }
  ];

  return (
    <section id="technology" className="py-24 bg-gradient-hero">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Aufgebaut auf
            <span className="bg-gradient-primary bg-clip-text text-transparent"> modernster Technologie</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Unser Technologie-Stack kombiniert die neuesten Fortschritte in KI, Cloud Computing 
            und Software-Engineering für unvergleichliche Leistung.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {techStack.map((stack, index) => (
            <Card 
              key={index}
              className="bg-gradient-card border-border/50 hover:shadow-card transition-all duration-300 group"
            >
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-primary/10 rounded-lg mr-4 group-hover:bg-primary/20 transition-colors">
                    <stack.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">{stack.category}</h3>
                </div>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {stack.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {stack.technologies.map((tech, idx) => (
                    <Badge 
                      key={idx} 
                      variant="secondary" 
                      className="bg-secondary/50 hover:bg-primary/10 hover:text-primary transition-colors cursor-default"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Performance Metrics */}
        <div className="mt-20 grid md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-card/30 rounded-lg border border-border/30">
            <div className="text-3xl font-bold text-primary mb-2">10TB+</div>
            <div className="text-muted-foreground">Täglich verarbeitete Daten</div>
          </div>
          <div className="text-center p-6 bg-card/30 rounded-lg border border-border/30">
            <div className="text-3xl font-bold text-primary mb-2">99.99%</div>
            <div className="text-muted-foreground">Verfügbarkeitsgarantie</div>
          </div>
          <div className="text-center p-6 bg-card/30 rounded-lg border border-border/30">
            <div className="text-3xl font-bold text-primary mb-2">1M+</div>
            <div className="text-muted-foreground">Bilder pro Stunde</div>
          </div>
          <div className="text-center p-6 bg-card/30 rounded-lg border border-border/30">
            <div className="text-3xl font-bold text-primary mb-2">24/7</div>
            <div className="text-muted-foreground">Expertenunterstützung</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Technology;