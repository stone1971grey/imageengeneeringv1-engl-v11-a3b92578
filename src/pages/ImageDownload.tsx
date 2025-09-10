import automotiveHeroClean from "@/assets/automotive-hero-clean.jpg";

const ImageDownload = () => {
  const handleDownload = () => {
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = automotiveHeroClean;
    link.download = 'automotive-hero-clean.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-8">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          Automotive Hero Image Download
        </h1>
        
        <div className="mb-8">
          <img 
            src={automotiveHeroClean}
            alt="Automotive Hero Clean - Original ohne Hotspots"
            className="w-full h-auto rounded-lg shadow-lg border"
          />
        </div>
        
        <button
          onClick={handleDownload}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Bild herunterladen
        </button>
        
        <p className="text-gray-600 mt-4">
          Rechtsklick auf das Bild → "Bild speichern unter..." funktioniert auch.
        </p>
      </div>
    </div>
  );
};

export default ImageDownload;