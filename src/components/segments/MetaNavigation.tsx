import React from "react";

interface MetaNavigationProps {
  data: {
    links: Array<{
      label: string;
      anchor: string;
    }>;
  };
  segmentIdMap?: Record<string, number>; // kept for compatibility but not used
}

const MetaNavigation = ({ data }: MetaNavigationProps) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, anchor: string, label: string) => {
    e.preventDefault();
    const targetId = anchor; // Wir vertrauen direkt auf den gespeicherten Wert aus dem Backend
    const element = document.getElementById(targetId);

    if (element) {
      const navbarHeight = 85; // Main navigation (fixed header)
      const extraOffset = 10;   // Small breathing space below Meta Navigation
      const totalOffset = navbarHeight + extraOffset;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - totalOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <nav className="fixed top-[85px] left-0 right-0 z-30 bg-[#F7F9FB] pt-6 pb-4 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex flex-wrap gap-6 justify-center text-lg">
            {data.links.map((link, index) => (
              <a
                key={index}
                href={`#${link.anchor}`}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors scroll-smooth"
                onClick={(e) => handleClick(e, link.anchor, link.label)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MetaNavigation;
