interface DebugProps {
  id?: string;
  imageUrl?: string;
  title?: string;
}

const Debug = ({ id, imageUrl, title }: DebugProps) => {
  return (
    <section id={id?.toString()} className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
          {title && (
            <h2 className="text-3xl font-bold text-gray-900 mb-8">{title}</h2>
          )}
          {imageUrl ? (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <img
                src={imageUrl}
                alt={title || "Debug image"}
                className="w-full max-w-lg mx-auto h-auto object-contain"
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <p className="text-gray-500 italic">No image uploaded yet</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Debug;
