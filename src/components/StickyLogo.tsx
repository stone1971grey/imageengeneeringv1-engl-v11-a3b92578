import { Link } from "react-router-dom";
import logoIE from "@/assets/logo-ie-white.png";

const StickyLogo = () => {
  return (
    <div className="fixed top-[2rem] left-4 z-50">
      <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
        {/* Logo that adapts automatically to background */}
        <img 
          src={logoIE} 
          alt="Image Engineering" 
          className="h-[60px] w-auto max-w-[300px] object-contain"
          style={{ 
            width: '300px',
            mixBlendMode: 'difference'
          }}
        />
      </Link>
    </div>
  );
};

export default StickyLogo;