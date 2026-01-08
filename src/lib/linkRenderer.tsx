import React from 'react';
import { ExternalLink, ArrowRight, Hash, Download } from 'lucide-react';

// Unified link color
export const LINK_COLOR = '#2563eb'; // blue-600
export const LINK_HOVER_COLOR = '#1d4ed8'; // blue-700

export type LinkType = 'external' | 'internal' | 'anchor' | 'download';

/**
 * Detect the type of link based on href
 */
export const detectLinkType = (href: string): LinkType => {
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

/**
 * Get the appropriate icon component for a link type
 */
export const getLinkIcon = (type: LinkType): React.ReactNode => {
  const iconProps = { 
    className: 'inline-block mr-1 align-baseline', 
    size: 12, 
    strokeWidth: 2 
  };
  
  switch (type) {
    case 'external':
      return <ExternalLink {...iconProps} />;
    case 'anchor':
      return <Hash {...iconProps} />;
    case 'download':
      return <Download {...iconProps} />;
    case 'internal':
    default:
      return <ArrowRight {...iconProps} />;
  }
};

/**
 * CSS for link styling in Tiptap and prose content
 */
export const LINK_CSS_CLASS = `text-[${LINK_COLOR}] underline hover:text-[${LINK_HOVER_COLOR}]`;

/**
 * Transform HTML content to add link icons
 * This processes rendered HTML and injects icons before link text
 */
export const transformLinksWithIcons = (html: string): string => {
  if (!html) return html;
  
  // Use a regex to find all anchor tags
  const linkRegex = /<a\s+([^>]*href=["']([^"']*)["'][^>]*)>([^<]*)<\/a>/gi;
  
  return html.replace(linkRegex, (match, attrs, href, text) => {
    const type = detectLinkType(href);
    
    // SVG icons for each type
    const iconSvg = getIconSvg(type);
    
    // Add target="_blank" for external links if not present
    let finalAttrs = attrs;
    if (type === 'external' && !attrs.includes('target=')) {
      finalAttrs += ' target="_blank" rel="noopener noreferrer"';
    }
    
    return `<a ${finalAttrs} style="color: ${LINK_COLOR}; text-decoration: underline;">${iconSvg}${text}</a>`;
  });
};

/**
 * Get SVG icon string for inline HTML injection
 */
const getIconSvg = (type: LinkType): string => {
  const style = 'display: inline-block; vertical-align: baseline; margin-right: 3px; width: 12px; height: 12px;';
  const stroke = LINK_COLOR;
  
  switch (type) {
    case 'external':
      return `<svg style="${style}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`;
    case 'anchor':
      return `<svg style="${style}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>`;
    case 'download':
      return `<svg style="${style}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`;
    case 'internal':
    default:
      return `<svg style="${style}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
  }
};

/**
 * React component to render a link with icon
 */
interface StyledLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const StyledLink: React.FC<StyledLinkProps> = ({ href, children, className = '' }) => {
  const type = detectLinkType(href);
  const Icon = () => getLinkIcon(type);
  const isExternal = type === 'external';
  
  return (
    <a 
      href={href}
      className={`text-[#2563eb] underline hover:text-[#1d4ed8] ${className}`}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
    >
      <Icon />
      {children}
    </a>
  );
};

export default { 
  detectLinkType, 
  getLinkIcon, 
  transformLinksWithIcons,
  StyledLink,
  LINK_COLOR, 
  LINK_HOVER_COLOR 
};
