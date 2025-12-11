import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const eventImages = [
  { name: "ADAS Vision Testing Seminar", file: "event-adas-vision-seminar.jpg" },
  { name: "Image Quality Expo 2026", file: "event-image-quality-expo.jpg" },
  { name: "ADAS Streaming", file: "event-adas-streaming.jpg" },
  { name: "Automotive Conference", file: "event-automotive-conference.jpg" },
  { name: "Automotive Standards", file: "event-automotive-standards.jpg" },
  { name: "Camera Workshop", file: "event-camera-workshop.jpg" },
  { name: "HDR Masterclass", file: "event-hdr-masterclass.jpg" },
  { name: "Medical Seminar", file: "event-medical-seminar.jpg" },
  { name: "Tech Expo", file: "event-tech-expo.jpg" },
];

const EventImageDownload = () => {
  const handleDownload = (file: string) => {
    const link = document.createElement("a");
    link.href = `/images/${file}`;
    link.download = file;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">Event Images Download</h1>
        <p className="text-muted-foreground mb-8">
          Download event images for upload to Media Management
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventImages.map((image) => (
            <div key={image.file} className="bg-card border border-border rounded-lg overflow-hidden">
              <img 
                src={`/images/${image.file}`} 
                alt={image.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-medium text-foreground mb-2">{image.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{image.file}</p>
                <Button 
                  onClick={() => handleDownload(image.file)}
                  className="w-full"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventImageDownload;
