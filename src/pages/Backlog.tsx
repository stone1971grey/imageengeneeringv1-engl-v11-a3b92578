import EngineersSlider from "@/components/EngineersSlider";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

const Backlog = () => {
  const backlogItems = [
    {
      title: "In-Cabin Testing (Automotive)",
      description: "Detail page for in-cabin testing solution.",
      path: "/en/your-solution/automotive/in-cabin-testing",
    },
    {
      title: "Automotive overview",
      description: "Main automotive solution overview page.",
      path: "/en/your-solution/automotive",
    },
    {
      title: "LE7 – Test chart product page",
      description: "Product page for LE7 test chart in test charts category.",
      path: "/en/products/test-charts/le7",
    },
    {
      title: "Arcturus LED – Illumination device",
      description: "Product page for Arcturus LED illumination device.",
      path: "/en/products/illumination-devices/arcturus-led",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="py-12">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-4">Backlog</h1>
            <p className="text-muted-foreground">
              Overview of key pages currently in focus for design and implementation work.
            </p>
          </div>

          <div className="space-y-4">
            {backlogItems.map((item) => (
              <div
                key={item.path}
                className="p-4 border border-border rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-card"
              >
                <div>
                  <p className="font-semibold text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Link
                  to={item.path}
                  className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium"
                >
                  Open page
                  <span className="ml-1">→</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Backlog;