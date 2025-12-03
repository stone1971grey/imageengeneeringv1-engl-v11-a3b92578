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
  rows?: '1' | '2' | '3';
  items?: FeatureItem[];
}

const FeatureOverview: React.FC<FeatureOverviewProps> = ({
  id,
  title = '',
  subtext = '',
  layout = '3',
  rows = '1',
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

  const columnsPerRow = parseInt(layout);
  const numberOfRows = parseInt(rows);
  const itemsPerRow = columnsPerRow;

  // Group items into rows
  const groupedItems: FeatureItem[][] = [];
  for (let i = 0; i < numberOfRows; i++) {
    const startIndex = i * itemsPerRow;
    const endIndex = startIndex + itemsPerRow;
    const rowItems = items.slice(startIndex, endIndex);
    if (rowItems.length > 0) {
      groupedItems.push(rowItems);
    }
  }

  return (
    <section id={id} className="bg-gradient-to-br from-gray-50 to-blue-50 pt-[150px] pb-16">
      <div className="container mx-auto px-4">
        {title && (
          <h2 className={`text-3xl font-bold text-gray-800 text-center ${subtext ? 'mb-4' : 'mb-12'}`}>
            {title}
          </h2>
        )}
        {subtext && (
          <p className="text-xl text-gray-600 mb-12 max-w-3xl text-center mx-auto">
            {subtext}
          </p>
        )}
        
        <div className="space-y-12">
          {groupedItems.map((rowItems, rowIndex) => (
            <div key={rowIndex} className={`grid ${getGridColumns()} gap-8`}>
              {rowItems.map((item, itemIndex) => (
                <div key={itemIndex} className="text-center">
                  {item.title && (
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                      {item.title}
                    </h3>
                  )}
                  {item.description && (
                    <p className="text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureOverview;
