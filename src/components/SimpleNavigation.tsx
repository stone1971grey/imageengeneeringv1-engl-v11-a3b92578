import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SimpleDropdownProps {
  trigger: string;
  children: React.ReactNode;
  className?: string;
}

export const SimpleDropdown = ({ trigger, children, className = "" }: SimpleDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className={`relative mx-4 ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Button 
        variant="ghost"
        className="px-4 py-2 rounded-md text-lg font-medium text-white hover:bg-[#d9c409] hover:text-black transition-colors duration-200 bg-transparent border-none h-auto"
      >
        {trigger}
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-lg shadow-xl border border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};