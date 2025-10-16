import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SimpleDropdownProps {
  trigger: string;
  children: React.ReactNode;
  className?: string;
}

export const SimpleDropdown = ({ trigger, children, className = "" }: SimpleDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const isRightAligned = className.includes('right-aligned');

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Button 
        variant="ghost"
        className="px-3 py-2 rounded-md text-lg font-medium text-black hover:bg-[#f5743a] hover:text-white transition-colors duration-200 bg-transparent border-none h-auto"
      >
        {trigger}
      </Button>
      
      {isOpen && (
        <>
          {/* Invisible bridge to prevent hover gaps */}
          <div className="absolute top-full w-full h-4 z-[9999]" />
          <div className={`absolute top-full mt-4 z-[9999] bg-white rounded-lg shadow-xl border border-gray-200 p-[20px] ${
            isRightAligned ? 'left-auto right-0 origin-top-right' : 'left-0'
          }`}>
            {children}
          </div>
        </>
      )}
    </div>
  );
};