import { useEffect, useRef, useState } from "react";
import { Loader2, FileText } from "lucide-react";

interface PdfPreviewProps {
  url: string;
  className?: string;
}

export function PdfPreview({ url, className = "" }: PdfPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const renderPdf = async () => {
      if (!canvasRef.current || !url) return;

      setLoading(true);
      setError(false);

      try {
        // Dynamically import PDF.js
        const pdfjsLib = await import("pdfjs-dist");
        
        // Set worker source
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;

        if (cancelled) return;

        // Get the first page
        const page = await pdf.getPage(1);

        if (cancelled) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (!context) {
          setError(true);
          return;
        }

        // Calculate scale to fit the container
        const containerWidth = canvas.parentElement?.clientWidth || 400;
        const containerHeight = canvas.parentElement?.clientHeight || 192;
        
        const viewport = page.getViewport({ scale: 1 });
        const scaleX = containerWidth / viewport.width;
        const scaleY = containerHeight / viewport.height;
        const scale = Math.min(scaleX, scaleY);

        const scaledViewport = page.getViewport({ scale });

        // Set canvas dimensions
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        // Render the page
        await page.render({
          canvasContext: context,
          viewport: scaledViewport,
        }).promise;

        if (!cancelled) {
          setLoading(false);
        }
      } catch (err) {
        console.error("PDF preview error:", err);
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    };

    renderPdf();

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center gap-2 bg-gray-800 ${className}`}>
        <FileText className="h-12 w-12 text-gray-500" />
        <span className="text-xs text-gray-500">PDF preview unavailable</span>
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center bg-gray-800 ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`max-w-full max-h-full ${loading ? "opacity-0" : "opacity-100"} transition-opacity duration-300`}
      />
      {!loading && (
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded font-medium">
          PDF - Page 1
        </div>
      )}
    </div>
  );
}
