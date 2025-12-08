import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface SimpleDropdownProps {
  trigger: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  triggerLink?: string;
}

export const SimpleDropdown = ({ trigger, children, className = "", disabled = false, triggerLink }: SimpleDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const isRightAligned = className.includes('right-aligned');

  const buttonContent = (
    <Button 
      variant="ghost"
      className="px-3 py-2 rounded-md text-lg font-medium text-black hover:bg-[#f9dc24] hover:!text-black transition-colors duration-200 bg-transparent border-none h-auto"
    >
      {trigger}
    </Button>
  );

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => !disabled && setIsOpen(true)}
      onMouseLeave={() => !disabled && setIsOpen(false)}
    >
      {triggerLink ? (
        <Link to={triggerLink}>
          {buttonContent}
        </Link>
      ) : (
        buttonContent
      )}
      
      {!disabled && isOpen && (
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
