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
  // Convert segment_key to segment_id if available
  const resolveAnchor = (anchor: string): string => {
    // If anchor is already numeric, use it as-is
    if (/^\d+$/.test(anchor)) return anchor;
    
    // Otherwise, try to map segment_key to segment_id
    const segmentId = segmentIdMap[anchor];
    console.log(`MetaNav: Resolving anchor "${anchor}" to ID:`, segmentId, 'SegmentIdMap:', segmentIdMap);
    return segmentId ? segmentId.toString() : anchor;
  };

  return (
    <nav className="sticky top-[85px] z-30 bg-[#F7F9FB] pt-6 pb-4 border-b border-gray-100">
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
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.getElementById(resolvedAnchor);
                    if (element) {
                      const navbarHeight = 85; // Main navigation height
                      const metaNavHeight = 85; // Meta navigation height
                      const totalOffset = navbarHeight + metaNavHeight;
                      const elementPosition = element.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.pageYOffset - totalOffset;

                      window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                      });
                    }
                  }}
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
