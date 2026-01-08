import downloadsHero from "@/assets/downloads-hero.jpg";
import whitepaperHero from "@/assets/whitepaper-hero.jpg";

const HeroImageDownload = () => {
  const handleDownload = (imageSrc: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          Hero Images Download
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Downloads Hero */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Downloads Hero
            </h2>
            <div className="border rounded-lg overflow-hidden shadow-lg">
              <img 
                src={downloadsHero}
                alt="Downloads Hero Image"
                className="w-full h-auto"
              />
            </div>
            <button
              onClick={() => handleDownload(downloadsHero, 'downloads-hero.jpg')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Download Downloads Hero
            </button>
          </div>

          {/* Whitepaper Hero */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Whitepaper Hero
            </h2>
            <div className="border rounded-lg overflow-hidden shadow-lg">
              <img 
                src={whitepaperHero}
                alt="Whitepaper Hero Image"
                className="w-full h-auto"
              />
            </div>
            <button
              onClick={() => handleDownload(whitepaperHero, 'whitepaper-hero.jpg')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Download Whitepaper Hero
            </button>
          </div>
        </div>

        <p className="text-gray-600 mt-8 text-center">
          Right-click on any image and select "Save image as..." for alternative download.
        </p>
      </div>
    </div>
  );
};

export default HeroImageDownload;
