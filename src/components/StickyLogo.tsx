import { Link } from "react-router-dom";
import logoIE from "@/assets/logo-ie-white.png";

const StickyLogo = () => {
  return (
    <div className="fixed top-[2rem] left-4 z-50">
      <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
        {/* White logo with dark shadow - works on all backgrounds */}
        <img 
          src={logoIE} 
          alt="Image Engineering" 
          className="h-[60px] w-auto max-w-[300px] object-contain"
          style={{ 
            width: '300px',
            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8)) drop-shadow(-1px -1px 2px rgba(0,0,0,0.3))'
          }}
        />
      </Link>
    </div>
  );
};

export default StickyLogo;