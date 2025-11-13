interface SpecificationRow {
  specification: string;
  value: string;
}

interface SpecificationProps {
  id: string;
  title?: string;
  rows?: SpecificationRow[];
}

const Specification = ({ id, title = "Detailed Specifications", rows = [] }: SpecificationProps) => {
  if (!title && rows.length === 0) return null;

  return (
    <section id={id} className="py-16 bg-white scroll-mt-[170px]">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {title && (
            <div className="px-8 pt-8 pb-4">
              <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            </div>
          )}
          {rows.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-y border-gray-200">
                    <th className="text-left py-4 px-8 font-semibold text-gray-900 text-base">Specification</th>
                    <th className="text-left py-4 px-8 font-semibold text-gray-900 text-base">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr 
                      key={index} 
                      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} ${index !== rows.length - 1 ? "border-b border-gray-200" : ""}`}
                    >
                      <td className="py-4 px-8 text-gray-700">{row.specification}</td>
                      <td className="py-4 px-8 text-gray-700">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Specification;
