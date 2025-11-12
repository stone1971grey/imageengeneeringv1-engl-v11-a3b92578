interface MetaNavigationProps {
  data: {
    links: Array<{
      label: string;
      anchor: string;
    }>;
  };
}

const MetaNavigation = ({ data }: MetaNavigationProps) => {
  return (
    <nav className="sticky top-[85px] z-30 bg-[#F7F9FB] py-4 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex flex-wrap gap-6 justify-center text-lg">
            {data.links.map((link, index) => (
              <a
                key={index}
                href={`#${link.anchor}`}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors scroll-smooth"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(link.anchor);
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
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MetaNavigation;
