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
};

export default function HotspotImage({
  src,
  alt = "",
  markers,
  dotColor = "bg-sky-500",
}: Props) {
  const [active, setActive] = useState<string | number | null>(null);

  return (
    <div className="relative w-full max-w-6xl mx-auto select-none">
      <img src={src} alt={alt} className="w-full h-auto block" />

      {markers.map((m) => (
        <button
          key={m.id}
          type="button"
          className={[
            "group absolute z-10 grid place-items-center",
            "w-7 h-7 rounded-full text-white text-[13px] font-semibold shadow",
            dotColor,
            // center the dot on the coordinate
            "transform -translate-x-1/2 -translate-y-1/2",
            // accessibility
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400",
          ].join(" ")}
          style={{ top: `${m.top}%`, left: `${m.left}%` }}
          aria-label={m.label}
          onMouseEnter={() => setActive(m.id)}
          onMouseLeave={() => setActive((cur) => (cur === m.id ? null : cur))}
          onFocus={() => setActive(m.id)}
          onBlur={() => setActive((cur) => (cur === m.id ? null : cur))}
          onClick={() => setActive((cur) => (cur === m.id ? null : m.id))}
        >
          {/* Optional number inside the dot */}
          <span className="pointer-events-none">{m.id}</span>

          {/* Tooltip */}
          <span
            className={[
              "absolute left-1/2 top-[115%] -translate-x-1/2 whitespace-nowrap",
              "rounded-md bg-white text-gray-800 text-[13px] px-2.5 py-1",
              "shadow-md border border-gray-200",
              active === m.id ? "opacity-100 scale-100" : "opacity-0 scale-95",
              "transition-all duration-150 origin-top",
            ].join(" ")}
            role="tooltip"
          >
            {m.label}
          </span>
        </button>
      ))}
    </div>
  );
}