import logoIeBlack from "@/assets/logo-ie-black.png";
import logoIeWhite from "@/assets/logo-ie-white.png";
import logoIeNewV7 from "@/assets/logo-ie-new-v7.png";
import logoIeEmail from "/logo-ie-email.png";
import logoEmail from "/logo-email.png";
import logoIeNavbar from "/logo-ie-navbar.png";

const LogoDownload = () => {
  const logos = [
    { src: logoIeNewV7, name: "IE Logo New V7 (Primary)", filename: "logo-ie-new-v7.png" },
    { src: logoIeBlack, name: "IE Logo Black", filename: "logo-ie-black.png" },
    { src: logoIeWhite, name: "IE Logo White", filename: "logo-ie-white.png", bgDark: true },
    { src: logoIeEmail, name: "IE Logo Email", filename: "logo-ie-email.png" },
    { src: logoEmail, name: "Logo Email", filename: "logo-email.png" },
    { src: logoIeNavbar, name: "IE Logo Navbar", filename: "logo-ie-navbar.png" },
  ];

  const handleDownload = (src: string, filename: string) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-foreground">
          Image Engineering Logo Downloads
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {logos.map((logo, index) => (
            <div key={index} className="border rounded-lg p-4 bg-card">
              <div className={`mb-4 p-4 rounded flex items-center justify-center min-h-[150px] ${logo.bgDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <img 
                  src={logo.src}
                  alt={logo.name}
                  className="max-h-[120px] w-auto object-contain"
                />
              </div>
              
              <h3 className="font-semibold mb-2 text-foreground">{logo.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{logo.filename}</p>
              
              <button
                onClick={() => handleDownload(logo.src, logo.filename)}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded transition-colors"
              >
                Download
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Rechtsklick auf das Logo → "Bild speichern unter..." funktioniert auch.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogoDownload;
