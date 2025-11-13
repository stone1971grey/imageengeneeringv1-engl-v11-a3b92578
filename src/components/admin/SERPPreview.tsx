import { useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface SERPPreviewProps {
  title: string;
  description: string;
  url: string;
}

export const SERPPreview = ({ title, description, url }: SERPPreviewProps) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  const displayTitle = title || 'Your Page Title - Appears in Search Results';
  const displayDescription = description || 'Your meta description appears here. This text will be shown in search engine results and should be compelling to encourage clicks.';
  const displayUrl = url || 'www.image-engineering.de › your-page-slug';

  return (
    <Card className="p-6 bg-white border-2 border-gray-200 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">SERP Preview</h3>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'desktop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('desktop')}
            className={viewMode === 'desktop' ? 'bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90' : ''}
          >
            <Monitor className="h-4 w-4 mr-2" />
            Desktop
          </Button>
          <Button
            variant={viewMode === 'mobile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('mobile')}
            className={viewMode === 'mobile' ? 'bg-[#f9dc24] text-black hover:bg-[#f9dc24]/90' : ''}
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Mobile
          </Button>
        </div>
      </div>

      {/* Desktop Preview */}
      {viewMode === 'desktop' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="max-w-[600px]">
            {/* Breadcrumb / URL */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">IE</span>
              </div>
              <div className="text-sm text-gray-600">
                {displayUrl}
              </div>
            </div>

            {/* Title - clickable link style */}
            <h3 className="text-[20px] leading-[1.3] mb-1 cursor-pointer">
              <span className="text-[#1a0dab] hover:underline font-normal">
                {displayTitle.length > 60 
                  ? displayTitle.substring(0, 60) + '...' 
                  : displayTitle}
              </span>
            </h3>

            {/* Description */}
            <p className="text-sm leading-[1.4] text-gray-600">
              {displayDescription.length > 160 
                ? displayDescription.substring(0, 160) + '...' 
                : displayDescription}
            </p>
          </div>
        </div>
      )}

      {/* Mobile Preview */}
      {viewMode === 'mobile' && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="max-w-[360px]">
            {/* Breadcrumb / URL */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-gray-600">IE</span>
              </div>
              <div className="text-xs text-gray-600 truncate">
                {displayUrl}
              </div>
            </div>

            {/* Title - clickable link style, mobile sizing */}
            <h3 className="text-[18px] leading-[1.3] mb-2 cursor-pointer">
              <span className="text-[#1a0dab] font-normal">
                {displayTitle.length > 60 
                  ? displayTitle.substring(0, 60) + '...' 
                  : displayTitle}
              </span>
            </h3>

            {/* Description - mobile sizing */}
            <p className="text-[13px] leading-[1.4] text-gray-600">
              {displayDescription.length > 120 
                ? displayDescription.substring(0, 120) + '...' 
                : displayDescription}
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-4 italic">
        {viewMode === 'desktop' 
          ? 'So erscheint dein Suchergebnis auf Desktop-Geräten in Google' 
          : 'So erscheint dein Suchergebnis auf Mobilgeräten in Google'}
      </p>
    </Card>
  );
};
