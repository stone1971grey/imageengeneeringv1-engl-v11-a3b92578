interface CustomTargetIconProps {
  className?: string;
}

export const CustomTargetIcon = ({ className = "h-5 w-5" }: CustomTargetIconProps) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      className={className}
      fill="none" 
      stroke="#009999" 
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="2" fill="#009999"/>
      <line x1="12" y1="2" x2="12" y2="6"/>
      <line x1="12" y1="18" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="6" y2="12"/>
      <line x1="18" y1="12" x2="22" y2="12"/>
      <line x1="4.5" y1="4.5" x2="7.5" y2="7.5"/>
      <line x1="16.5" y1="16.5" x2="19.5" y2="19.5"/>
      <line x1="4.5" y1="19.5" x2="7.5" y2="16.5"/>
      <line x1="16.5" y1="7.5" x2="19.5" y2="4.5"/>
    </svg>
  );
};