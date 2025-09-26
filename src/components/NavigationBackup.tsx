// Backup of the original Navigation component
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import logoIE from "@/assets/logo-ie-white.png";

const NavigationMinimal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-8 left-4 right-4 z-40 bg-[#4B4A4A]/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/10">
      <div className="w-full px-6 py-6">
        <div className="flex items-center justify-between w-full">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img 
              src={logoIE} 
              alt="IE Logo" 
              className="h-8 w-auto brightness-0 invert"
            />
          </Link>

          {/* Mobile menu button */}
          <div className="2xl:hidden ml-auto relative z-50">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center justify-center w-10 h-10 bg-[#d9c409] text-black rounded-md hover:bg-[#c5b008] transition-colors shadow-lg"
            >
              {isOpen ? (
                <X size={22} className="stroke-[3]" />
              ) : (
                <Menu size={22} className="stroke-[3]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="2xl:hidden relative">
          {isOpen && (
            <div className="absolute top-full right-0 w-full max-w-[800px] bg-white border border-gray-200 rounded-lg shadow-xl z-50 mt-2 max-h-[80vh] overflow-y-auto">
              <nav className="px-6 py-4">
                <div className="space-y-4">
                  <Link to="/automotive" className="block py-2 text-gray-700 hover:text-gray-900" onClick={() => setIsOpen(false)}>
                    Automotive
                  </Link>
                  <Link to="/products" className="block py-2 text-gray-700 hover:text-gray-900" onClick={() => setIsOpen(false)}>
                    Products
                  </Link>
                  <Link to="/contact" className="block py-2 text-gray-700 hover:text-gray-900" onClick={() => setIsOpen(false)}>
                    Contact
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavigationMinimal;