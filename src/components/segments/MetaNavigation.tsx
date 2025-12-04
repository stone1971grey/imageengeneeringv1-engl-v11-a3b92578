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
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, anchor: string) => {
    e.preventDefault();

    const targetElement = document.getElementById(anchor);
    if (!targetElement) return;

    // Dynamisch die Höhen der fixierten Navigationsleisten ermitteln
    const fixedNavs = document.querySelectorAll('nav.fixed');
    let mainNavHeight = 0;
    let metaNavHeight = 0;

    if (fixedNavs.length > 0) {
      mainNavHeight = (fixedNavs[0] as HTMLElement).getBoundingClientRect().height || 0;
    }
    if (fixedNavs.length > 1) {
      metaNavHeight = (fixedNavs[1] as HTMLElement).getBoundingClientRect().height || 0;
    }

    const extraOffset = 8; // kleiner Luftabstand unterhalb der Meta Navigation
    const totalOffset = mainNavHeight + metaNavHeight + extraOffset;

    const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - totalOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  };

  return (
    <nav className="fixed top-[64px] md:top-[85px] left-0 right-0 z-30 bg-[#F7F9FB] pt-4 md:pt-6 pb-3 md:pb-4 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex flex-wrap gap-6 justify-center text-lg">
            {data.links.map((link, index) => (
              <a
                key={index}
                href={`#${link.anchor}`}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors scroll-smooth"
                onClick={(e) => handleClick(e, link.anchor)}
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
