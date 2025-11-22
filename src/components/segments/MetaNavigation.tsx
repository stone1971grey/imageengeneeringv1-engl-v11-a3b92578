import React from "react";

interface MetaNavigationProps {
  data: {
    links: Array<{
      label: string;
      anchor: string;
    }>;
  };
  segmentIdMap?: Record<string, number>;
}

const MetaNavigation = ({ data, segmentIdMap = {} }: MetaNavigationProps) => {
  console.log('MetaNav: Render', { links: data.links, segmentIdMap });
  // Convert segment_key to segment_id if available
  const resolveAnchor = (anchor: string): string => {
    // If anchor is already numeric, use it as-is
    if (/^\d+$/.test(anchor)) return anchor;
    
    // Otherwise, try to map segment_key to segment_id
    const segmentId = segmentIdMap[anchor];
    console.log(`MetaNav: Resolving anchor "${anchor}" to ID:`, segmentId, 'Available keys:', Object.keys(segmentIdMap));
    return segmentId ? segmentId.toString() : anchor;
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, anchor: string, label: string) => {
    e.preventDefault();
    const resolvedAnchor = resolveAnchor(anchor);
    console.log(`MetaNav Click: Label="${label}", Original anchor="${anchor}", Resolved="${resolvedAnchor}"`);
    
    // Try to find the element by resolved ID
    let element = document.getElementById(resolvedAnchor);
    
    // If not found, try the original anchor as fallback
    if (!element && resolvedAnchor !== anchor) {
      console.log(`MetaNav: Element #${resolvedAnchor} not found, trying original anchor #${anchor}`);
      element = document.getElementById(anchor);
    }
    
    // If still not found, try to find by data-segment-key attribute
    if (!element) {
      console.log(`MetaNav: Element #${anchor} not found, trying data-segment-key="${anchor}"`);
      element = document.querySelector(`[data-segment-key="${anchor}"]`);
    }

    // As last resort, try to find a section by heading text matching the label
    if (!element) {
      console.log(`MetaNav: Trying to find section by heading text for label "${label}"`);
      const sections = Array.from(document.querySelectorAll('section')) as HTMLElement[];
      for (const section of sections) {
        const heading = section.querySelector('h1, h2, h3, h4');
        if (heading && heading.textContent && heading.textContent.includes(label)) {
          element = section;
          console.log('MetaNav: Matched section by heading text:', heading.textContent);
          break;
        }
      }
    }
    
    if (element) {
      console.log(`MetaNav: Found element, scrolling...`, element);
      const navbarHeight = 85; // Main navigation height
      const metaNavHeight = 85; // Meta navigation height
      const totalOffset = navbarHeight + metaNavHeight;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - totalOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else {
      console.error(`MetaNav: Could not find element for anchor "${anchor}" (resolved: "${resolvedAnchor}")`);
      console.log('Available IDs in DOM:', Array.from(document.querySelectorAll('[id]')).map(el => el.id));
    }
  };

  return (
    <nav className="fixed top-[85px] left-0 right-0 z-30 bg-[#F7F9FB] pt-6 pb-4 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex flex-wrap gap-6 justify-center text-lg">
            {data.links.map((link, index) => {
              const resolvedAnchor = resolveAnchor(link.anchor);
              return (
                <a
                  key={index}
                  href={`#${resolvedAnchor}`}
                  className="text-gray-700 hover:text-gray-900 font-medium transition-colors scroll-smooth"
                  onClick={(e) => handleClick(e, link.anchor, link.label)}
                >
                  {link.label}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MetaNavigation;
