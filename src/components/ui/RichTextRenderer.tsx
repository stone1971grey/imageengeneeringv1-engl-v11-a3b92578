import React, { useMemo } from 'react';
import { ExternalLink, ArrowRight, Hash, Download } from 'lucide-react';

interface RichTextRendererProps {
  html: string;
  className?: string;
}

type LinkType = 'external' | 'internal' | 'anchor' | 'download';

const detectLinkType = (href: string): LinkType => {
  if (!href) return 'internal';
  
  // Anchor links start with #
  if (href.startsWith('#')) return 'anchor';
  
  // Download links (PDF, DOC, etc.)
  const downloadExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.zip', '.rar'];
  if (downloadExtensions.some(ext => href.toLowerCase().endsWith(ext))) return 'download';
  
  // External links start with http://, https://, or www.
  if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('www.')) return 'external';
  
  // Everything else is internal
  return 'internal';
};

const getIconSvg = (type: LinkType): string => {
  const color = '#2563eb';
  const style = 'display:inline-block;vertical-align:middle;margin-right:4px;width:14px;height:14px;position:relative;top:-1px;';
  
  switch (type) {
    case 'external':
      return `<svg style="${style}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;
    case 'anchor':
      return `<svg style="${style}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>`;
    case 'download':
      return `<svg style="${style}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
    case 'internal':
    default:
      return `<svg style="${style}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
  }
};

/**
 * Transform HTML to add icons before links
 */
const transformHtmlWithLinkIcons = (html: string): string => {
  if (!html) return html;
  
  // Match anchor tags and capture href and content
  const linkRegex = /<a\s+([^>]*href=["']([^"']*)["'][^>]*)>([^<]*)<\/a>/gi;
  
  return html.replace(linkRegex, (match, attrs, href, text) => {
    const type = detectLinkType(href);
    const iconSvg = getIconSvg(type);
    
    // Add target="_blank" for external links if not present
    let finalAttrs = attrs;
    if (type === 'external' && !attrs.includes('target=')) {
      finalAttrs += ' target="_blank" rel="noopener noreferrer"';
    }
    
    // Style the link with unified blue color
    const style = 'color:#2563eb;text-decoration:underline;';
    
    // Check if style attribute exists and append, or add new
    if (finalAttrs.includes('style=')) {
      finalAttrs = finalAttrs.replace(/style=["']([^"']*)["']/, `style="$1${style}"`);
    } else {
      finalAttrs += ` style="${style}"`;
    }
    
    return `<a ${finalAttrs}>${iconSvg}${text}</a>`;
  });
};

/**
 * RichTextRenderer - Renders HTML content with link icons
 * Use this component instead of dangerouslySetInnerHTML for rich text content
 */
export const RichTextRenderer: React.FC<RichTextRendererProps> = ({ html, className = '' }) => {
  const transformedHtml = useMemo(() => transformHtmlWithLinkIcons(html), [html]);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: transformedHtml }}
    />
  );
};

/**
 * Hook to transform HTML with link icons
 * Use this when you need the transformed HTML string directly
 */
export const useRichTextWithIcons = (html: string): string => {
  return useMemo(() => transformHtmlWithLinkIcons(html), [html]);
};

/**
 * Standalone function to transform HTML
 * Use this for one-off transformations
 */
export { transformHtmlWithLinkIcons };

export default RichTextRenderer;
