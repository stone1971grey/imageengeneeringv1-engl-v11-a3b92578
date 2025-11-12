interface TableProps {
  id: string;
  title?: string;
  subtext?: string;
  headers: string[];
  rows: string[][];
}

const Table = ({ id, title, subtext, headers, rows }: TableProps) => {
  const columnCount = headers.length;

  return (
    <section id={id} className="py-16 bg-[#F7F9FB] scroll-mt-[170px]">
      <div className="container mx-auto px-6">
        {title && (
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h2>
            {subtext && (
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {subtext}
              </p>
            )}
          </div>
        )}

        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-50 rounded-xl overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              {/* Header */}
              <div 
                className="grid min-w-[800px] text-black" 
                style={{ 
                  gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
                  background: '#f9dc24' 
                }}
              >
                {headers.map((header, index) => (
                  <div 
                    key={index}
                    className={`p-4 text-center font-semibold text-lg ${
                      index > 0 ? 'border-l border-yellow-600' : ''
                    }`}
                  >
                    {header}
                  </div>
                ))}
              </div>
              
              {/* Rows */}
              <div className="divide-y divide-gray-200">
                {rows.map((row, rowIndex) => (
                  <div 
                    key={rowIndex}
                    className={`grid min-w-[800px] ${
                      rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                    style={{ gridTemplateColumns: `repeat(${columnCount}, 1fr)` }}
                  >
                    {row.map((cell, cellIndex) => (
                      <div 
                        key={cellIndex}
                        className={`p-6 ${
                          cellIndex === 0 
                            ? 'font-medium text-gray-900' 
                            : 'text-gray-800 text-sm leading-relaxed'
                        } ${
                          cellIndex < columnCount - 1 ? 'border-r border-gray-200' : ''
                        }`}
                      >
                        {cell}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Table;
