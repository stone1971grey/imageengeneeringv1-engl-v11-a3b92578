import React from 'react';

interface FeatureItem {
  title: string;
  description: string;
}

interface FeatureOverviewProps {
  id?: string;
  title?: string;
  subtext?: string;
  layout?: '1' | '2' | '3';
  items?: FeatureItem[];
}

const FeatureOverview: React.FC<FeatureOverviewProps> = ({
  id,
  title = '',
  subtext = '',
  layout = '3',
  items = []
}) => {
  const getGridColumns = () => {
    switch (layout) {
      case '1':
        return 'grid-cols-1';
      case '2':
        return 'md:grid-cols-2';
      case '3':
        return 'md:grid-cols-2 lg:grid-cols-3';
      default:
        return 'md:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <section id={id} className="bg-gradient-to-br from-gray-50 to-blue-50 py-16">
      <div className="container mx-auto px-4">
        {title && (
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
            {title}
          </h2>
        )}
        {subtext && (
          <p className="text-xl text-gray-600 mb-12 max-w-3xl text-center mx-auto">
            {subtext}
          </p>
        )}
        
        <div className={`grid ${getGridColumns()} gap-8`}>
          {items.map((item, index) => (
            <div key={index} className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {item.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureOverview;
