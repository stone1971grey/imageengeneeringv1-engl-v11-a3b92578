import { Car, Shield, Smartphone, Camera, Cog, Stethoscope, ScanLine, Monitor, Zap, Target, FileText, FlaskConical, CheckCircle, Settings } from "lucide-react";

// Static segment IDs - these are fixed and never change
export const STATIC_SEGMENT_IDS = {
  hero: 1,
  tiles: 2, 
  banner: 3,
  solutions: 4
};

// Mapping from parent page slugs to navigation "industry" categories (Industries)
export const INDUSTRY_PARENT_CATEGORY_BY_SLUG: Record<string, string> = {
  'industries/automotive': 'Automotive',
  'industries/security-surveillance': 'Security & Surveillance',
  'industries/mobile-phone': 'Mobile Phone',
  'industries/web-camera': 'Web Camera',
  'industries/machine-vision': 'Machine Vision',
  'industries/medical-endoscopy': 'Medical & Endoscopy',
  'industries/scanners-archiving': 'Scanners & Archiving',
  'industries/photography': 'Photo & Video',
};

// Mapping from parent page slugs to navigation "products" categories
export const PRODUCTS_PARENT_CATEGORY_BY_SLUG: Record<string, string> = {
  'products/test-charts': 'Test Charts',
  'products/illumination-devices': 'Illumination Devices',
  'products/software': 'Software',
  'products/camera-test-systems': 'Camera Test Systems',
  'products/bundles-services': 'Bundles & Services',
};

// Mapping from parent page slugs to navigation "testServices" categories (Test Lab)
export const TEST_LAB_PARENT_CATEGORY_BY_SLUG: Record<string, string> = {
  'test-lab': 'Overview',
  'test-lab/automotive': 'Automotive',
  'test-lab/image-quality': 'Image Quality',
  'test-lab/standardized': 'Standardized',
  'test-lab/specialized': 'Specialized',
  'test-lab/vcx': 'VCX',
};

// Mapping from parent page slugs to navigation "training-events" categories
export const TRAINING_EVENTS_PARENT_CATEGORY_BY_SLUG: Record<string, string> = {
  'training-events': 'Training & Events',
};

// Mapping from parent page slugs to navigation "info-hub" categories
export const INFO_HUB_PARENT_CATEGORY_BY_SLUG: Record<string, string> = {
  'info-hub': 'Info Hub',
  'info-hub/standards': 'Standards',
  'info-hub/resources': 'Resources',
  'info-hub/support': 'Support',
};

// Mapping from parent page slugs to navigation "company" categories
export const COMPANY_PARENT_CATEGORY_BY_SLUG: Record<string, string> = {
  'company': 'Company',
  'company/news': 'News',
  'company/about': 'About',
  'company/careers': 'Careers',
  'company/contact': 'Contact',
};

// Multilingual Rainbow - Languages Definition
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
];

export const DESIGN_ICON_OPTIONS = [
  { key: 'car', label: 'Automotive', Icon: Car },
  { key: 'shield', label: 'Security', Icon: Shield },
  { key: 'smartphone', label: 'Mobile / VCX', Icon: Smartphone },
  { key: 'camera', label: 'Camera / Image Quality', Icon: Camera },
  { key: 'cog', label: 'Machine Vision', Icon: Cog },
  { key: 'stethoscope', label: 'Medical', Icon: Stethoscope },
  { key: 'scanline', label: 'Scanners', Icon: ScanLine },
  { key: 'monitor', label: 'Display / Monitor', Icon: Monitor },
  { key: 'zap', label: 'Technology', Icon: Zap },
  { key: 'target', label: 'Siemens', Icon: Target },
  { key: 'file', label: 'Generic Page', Icon: FileText },
  { key: 'flask', label: 'Test Lab / Overview', Icon: FlaskConical },
  { key: 'check-circle', label: 'Standardized', Icon: CheckCircle },
  { key: 'settings', label: 'Specialized / Custom', Icon: Settings },
];

export const CTA_GROUP_OPTIONS = [
  { key: 'none', label: 'No CTA (disabled)' },
  { key: 'industries', label: 'Industries flyout' },
  { key: 'products', label: 'Products & Test Services flyout' },
  { key: 'test-lab', label: 'Test Lab flyout' },
  { key: 'training-events', label: 'Training & Events flyout' },
  { key: 'info-hub', label: 'Info Hub flyout' },
];

// Helper: build label exactly like in the segment tab bar
// IMPORTANT: All segment types MUST be listed here with their letter code
export const buildSegmentLabel = (segType: string, displayNumber: number): string => {
  const segmentLabels: Record<string, string> = {
    // Hero segments (F, G)
    'product-hero': 'Product Hero - F',
    'hero': 'Product Hero - F', // Legacy alias
    'product-hero-gallery': 'Product Gallery - G',
    
    // Core content segments (A, B, C, D, E)
    'full-hero': 'Full Hero - A',
    'intro': 'Intro - B',
    'industries': 'Industries - C',
    'news': 'Latest News - D',
    'meta-navigation': 'Meta Navigation - E',
    
    // Content segments (H, I, J, K, L, M, N, O)
    'tiles': 'Tiles - H',
    'image-text': 'Image & Text - I',
    'banner': 'Banner - J',
    'feature-overview': 'Features - K',
    'table': 'Table - L',
    'video': 'Video - M',
    'specification': 'Specification - N',
    'faq': 'FAQ - O',
    
    // Special templates (P, Q, R, S, T, U)
    'news-list': 'News List - P',
    'action-hero': 'Action Hero - Q',
    'events': 'Events List - R',
    'product-list': 'Product List - S',
    'downloads': 'Downloads - T',
    'mini-footer': 'Mini Footer - U',
    
    // Debug
    'debug': 'Debug',
  };
  
  const baseLabel = segmentLabels[segType];
  if (baseLabel) {
    return `${baseLabel}-${displayNumber}`;
  }
  
  // Fallback for unknown segment types
  const formattedType = segType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return `${formattedType} - ${displayNumber}`;
};

// Get segment type display name
export const getSegmentTypeName = (type: string): string => {
  const typeMap: Record<string, string> = {
    'action-hero': 'Action Hero',
    'news-list': 'News List',
    'full-hero': 'Full Hero',
    'meta-navigation': 'Meta Navigation',
    'product-hero-gallery': 'Product Hero Gallery',
    'feature-overview': 'Feature Overview',
    'image-text': 'Image Text',
    
    'product-list': 'Product List',
    'mini-footer': 'Mini Footer',
  };
  return typeMap[type] || type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};
