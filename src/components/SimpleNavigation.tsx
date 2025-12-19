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
          {/* Invisible hover bridge to prevent gap */}
          <div className="absolute top-full left-0 right-0 h-4 z-[9998]" />
          <div className={`absolute top-[calc(100%+16px)] z-[9999] ${
            isRightAligned ? 'left-auto right-0' : 'left-0'
          }`}>
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-[20px]">
              {children}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
