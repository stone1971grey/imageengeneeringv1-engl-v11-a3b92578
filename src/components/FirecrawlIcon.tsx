interface FirecrawlIconProps {
  className?: string;
}

export const FirecrawlIcon = ({ className = "h-4 w-4" }: FirecrawlIconProps) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      className={className}
    >
      {/* Main flame shape - uses currentColor for white when text-white is applied */}
      <path 
        d="M50 5C50 5 25 30 25 55C25 72 36 85 50 85C64 85 75 72 75 55C75 30 50 5 50 5Z" 
        fill="currentColor"
      />
      {/* Inner flame - slightly transparent */}
      <path 
        d="M50 30C50 30 38 45 38 58C38 68 43 75 50 75C57 75 62 68 62 58C62 45 50 30 50 30Z" 
        fill="currentColor"
        opacity="0.6"
      />
      {/* Crawler legs/spider hints at bottom */}
      <path 
        d="M30 80L20 90M35 82L28 95M65 82L72 95M70 80L80 90" 
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};
