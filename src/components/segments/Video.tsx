interface VideoProps {
  id?: string;
  data: {
    title?: string;
    videoUrl?: string;
    caption?: string;
  };
}

export const Video = ({ id, data }: VideoProps) => {
  // Convert YouTube URL to embed format
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // Handle various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    
    return url;
  };

  if (!data.videoUrl) return null;

  return (
    <section id={id} className="bg-white pt-[60px] pb-20 scroll-mt-[170px]">
      <div className="container mx-auto px-4">
        {data.title && (
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            {data.title}
          </h2>
        )}
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
              <iframe
                src={getEmbedUrl(data.videoUrl)}
                title={data.title || "Video"}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
            {data.caption && (
              <p className="text-center text-gray-700 mt-6 text-lg">
                {data.caption}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
