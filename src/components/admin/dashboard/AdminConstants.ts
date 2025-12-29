import { Car, Shield, Smartphone, Camera, Cog, Stethoscope, ScanLine, Monitor, Zap, Target, FileText, FlaskConical, CheckCircle, Settings } from "lucide-react";

// Static segment IDs - these are fixed and never change
export const STATIC_SEGMENT_IDS = {
  hero: 1,
  tiles: 2, 
  banner: 3,
  solutions: 4
};

// Mapping from parent page slugs to navigation "industry" categories (Your Solution)
export const INDUSTRY_PARENT_CATEGORY_BY_SLUG: Record<string, string> = {
  'your-solution/automotive': 'Automotive',
  'your-solution/security-surveillance': 'Security & Surveillance',
  'your-solution/mobile-phone': 'Mobile Phone',
  'your-solution/web-camera': 'Web Camera',
  'your-solution/machine-vision': 'Machine Vision',
  'your-solution/medical-endoscopy': 'Medical & Endoscopy',
  'your-solution/scanners-archiving': 'Scanners & Archiving',
  'your-solution/photography': 'Photo & Video',
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
  { key: 'your-solution', label: 'Your Solution flyout' },
  { key: 'products', label: 'Products & Test Services flyout' },
  { key: 'test-lab', label: 'Test Lab flyout' },
  { key: 'training-events', label: 'Training & Events flyout' },
  { key: 'info-hub', label: 'Info Hub flyout' },
];

// Helper: build label exactly like in the segment tab bar
export const buildSegmentLabel = (segType: string, displayNumber: number): string => {
  if (segType === 'hero') return `Produkt Hero - F-${displayNumber}`;
  if (segType === 'meta-navigation') return `Meta Navigation - E-${displayNumber}`;
  if (segType === 'product-hero-gallery') return `Product Gallery - G-${displayNumber}`;
  if (segType === 'tiles') return `Tiles - H-${displayNumber}`;
  if (segType === 'banner') return `Banner - J-${displayNumber}`;
  
  if (segType === 'image-text') return `Image & Text - I-${displayNumber}`;
  if (segType === 'full-hero') return `Full Hero - A-${displayNumber}`;
  if (segType === 'intro') return `Intro - B-${displayNumber}`;
  if (segType === 'industries') return `Industries - C-${displayNumber}`;
  if (segType === 'news') return `Latest News - D-${displayNumber}`;
  if (segType === 'debug') return `Debug ${displayNumber}`;
  if (segType === 'news-list') return `News List - P-${displayNumber}`;
  if (segType === 'action-hero') return `Action Hero - Q-${displayNumber}`;
  if (segType === 'events') return `Events List - R-${displayNumber}`;
  if (segType === 'product-list') return `Product List - S-${displayNumber}`;
  if (segType === 'downloads') return `Downloads - T-${displayNumber}`;
  if (segType === 'mini-footer') return `Mini Footer - U-${displayNumber}`;
  if (segType === 'feature-overview') return `Features - K-${displayNumber}`;
  if (segType === 'table') return `Table - L-${displayNumber}`;
  if (segType === 'faq') return `FAQ - O-${displayNumber}`;
  if (segType === 'video') return `Video - M-${displayNumber}`;
  if (segType === 'specification') return `Specification - N-${displayNumber}`;
  return `${segType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} - ${displayNumber}`;
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
