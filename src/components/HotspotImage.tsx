import React, { useState } from "react";

type Marker = {
  id: number | string;
  label: string;
  top: number;   // % from top (0..100)
  left: number;  // % from left (0..100)
};

type Props = {
  src: string;          // image URL
  alt?: string;
  markers: Marker[];
  dotColor?: string;    // Tailwind color (bg-*)
  onHoverChange?: (label: string | null) => void;
};

export default function HotspotImage({
  src,
  alt = "",
  markers,
  dotColor = "bg-blue-500",
  onHoverChange,
}: Props) {
  const [active, setActive] = useState<string | number | null>(null);

  const handleMouseEnter = (marker: Marker) => {
    setActive(marker.id);
    onHoverChange?.(marker.label);
  };

  const handleMouseLeave = () => {
    setActive(null);
    onHoverChange?.(null);
  };

  return (
    <div className="relative w-full mx-auto select-none">
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-auto block rounded-lg shadow-soft" 
      />

      {/* Overlay container */}
      <div className="absolute inset-0 pointer-events-none">
        {markers.map((m) => (
          <button
            key={m.id}
            type="button"
            className={[
              "group absolute z-10 grid place-items-center pointer-events-auto",
              "w-7 h-7 rounded-full text-white text-[13px] font-semibold shadow-lg border-2 border-white",
              dotColor,
              "transform -translate-x-1/2 -translate-y-1/2",
              "hover:scale-110 transition-transform cursor-pointer",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400",
            ].join(" ")}
            style={{ top: `${m.top}%`, left: `${m.left}%` }}
            aria-label={m.label}
            onMouseEnter={() => handleMouseEnter(m)}
            onMouseLeave={handleMouseLeave}
            onFocus={() => handleMouseEnter(m)}
            onBlur={handleMouseLeave}
            onClick={() => setActive((cur) => (cur === m.id ? null : m.id))}
          >
            <span className="pointer-events-none">{m.id}</span>
          </button>
        ))}
      </div>
    </div>
  );
}