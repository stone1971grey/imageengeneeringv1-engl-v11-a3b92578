import { cn } from "@/lib/utils";

interface SmartBreakProps {
  text: string;
  breakAfter?: string;
  className?: string;
  mobileBreakpoint?: "sm" | "md" | "lg";
}

const SmartBreak = ({ 
  text, 
  breakAfter = "Image", 
  className = "",
  mobileBreakpoint = "md"
}: SmartBreakProps) => {
  if (!breakAfter || !text.includes(breakAfter)) {
    return <span className={className}>{text}</span>;
  }

  const parts = text.split(breakAfter);
  const breakpointClass = `${mobileBreakpoint}:hidden`;
  
  return (
    <span className={className}>
      {parts[0]}{breakAfter}
      <br className={breakpointClass} />
      {parts.slice(1).join(breakAfter)}
    </span>
  );
};

export default SmartBreak;