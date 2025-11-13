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
    <section id={id} className="container mx-auto px-4 pb-20">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10">
        {title && (
          <h2 className="text-2xl font-semibold text-[#2D2D2D] mb-6">{title}</h2>
        )}
        {rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-[#2D2D2D]">Specification</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#2D2D2D]">Value</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr 
                    key={index} 
                    className={index !== rows.length - 1 ? "border-b border-gray-100" : ""}
                  >
                    <td className="py-3 px-4 text-[#555]">{row.specification}</td>
                    <td className="py-3 px-4 text-[#555]">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default Specification;
