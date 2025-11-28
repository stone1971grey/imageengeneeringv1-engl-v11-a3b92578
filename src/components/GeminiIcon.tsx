interface GeminiIconProps {
  className?: string;
}

export const GeminiIcon = ({ className = "h-4 w-4" }: GeminiIconProps) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      className={className}
      fill="currentColor"
    >
      {/* Google Gemini inspired sparkle design - white/currentColor for visibility */}
      <path 
        d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" 
        fill="currentColor"
      />
      <path 
        d="M17 6L17.8 8.2L20 9L17.8 9.8L17 12L16.2 9.8L14 9L16.2 8.2L17 6Z" 
        fill="currentColor"
        opacity="0.8"
      />
      <path 
        d="M7 14L7.5 15.5L9 16L7.5 16.5L7 18L6.5 16.5L5 16L6.5 15.5L7 14Z" 
        fill="currentColor"
        opacity="0.7"
      />
    </svg>
  );
};
