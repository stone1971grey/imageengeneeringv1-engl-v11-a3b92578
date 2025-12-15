import { useEffect, useState } from "react";
import { Loader2, FileText, ExternalLink } from "lucide-react";

interface PdfPreviewProps {
  url: string;
  className?: string;
}

export function PdfPreview({ url, className = "" }: PdfPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Some PDFs return a valid HTTP response but still won't render in an iframe
  // (e.g., wrong content-type). Add a timeout so we don't keep the spinner forever.
  useEffect(() => {
    if (!url) return;
    setLoading(true);
    setError(false);

    const t = window.setTimeout(() => {
      setLoading(false);
      setError(true);
    }, 6000);

    return () => window.clearTimeout(t);
  }, [url]);

  if (!url) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 bg-gray-800 ${className}`}>
        <FileText className="h-12 w-12 text-gray-500" />
        <span className="text-xs text-gray-500">No PDF URL</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center gap-3 bg-gray-800 ${className}`}>
        <FileText className="h-12 w-12 text-gray-500" />
        <span className="text-xs text-gray-500">PDF preview unavailable</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-[#f9dc24] hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          Open PDF
        </a>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center bg-gray-800 ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-10">
          <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
        </div>
      )}

      <iframe
        src={`${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
        className="w-full h-full border-0"
        title="PDF Preview"
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-medium hover:bg-black/90 flex items-center gap-1"
      >
        <ExternalLink className="h-3 w-3" />
        Open
      </a>
    </div>
  );
}
