// ============================================
// CMS Configuration
// ============================================
// This file contains all configurable options for the CMS.
// When rolling out to a new project, adjust these values.

import { LanguageOption, SegmentType } from './types';

// ============================================
// LANGUAGE CONFIGURATION
// ============================================

/**
 * Supported languages in the CMS
 * Add or remove languages as needed for your project
 */
export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

/**
 * Default language for new content
 */
export const DEFAULT_LANGUAGE = 'en';

/**
 * Languages available for translation
 * (excludes the source language which is always English)
 */
export const TRANSLATION_TARGET_LANGUAGES = SUPPORTED_LANGUAGES.filter(
  lang => lang.code !== 'en'
);

// ============================================
// SEGMENT CONFIGURATION
// ============================================

/**
 * Available segment types in the CMS
 * Map of segment type to display configuration
 */
export const SEGMENT_CONFIG: Record<SegmentType, {
  label: string;
  shortCode: string;
  icon?: string;
  description?: string;
  category: 'hero' | 'content' | 'navigation' | 'footer' | 'utility';
  allowMultiple: boolean;
}> = {
  'hero': {
    label: 'Produkt Hero',
    shortCode: 'F',
    category: 'hero',
    allowMultiple: false,
    description: 'Main product hero with image and CTA'
  },
  'full-hero': {
    label: 'Full Hero',
    shortCode: 'A',
    category: 'hero',
    allowMultiple: true,
    description: 'Full-width hero section'
  },
  'action-hero': {
    label: 'Action Hero',
    shortCode: 'Q',
    category: 'hero',
    allowMultiple: true,
    description: 'Hero with action buttons'
  },
  'product-hero-gallery': {
    label: 'Product Gallery',
    shortCode: 'G',
    category: 'hero',
    allowMultiple: true,
    description: 'Product image gallery hero'
  },
  'tiles': {
    label: 'Tiles',
    shortCode: 'H',
    category: 'content',
    allowMultiple: true,
    description: 'Grid of content tiles'
  },
  'banner': {
    label: 'Banner',
    shortCode: 'J',
    category: 'content',
    allowMultiple: true,
    description: 'Banner with images and CTA'
  },
  'banner-p': {
    label: 'Banner P',
    shortCode: 'JP',
    category: 'content',
    allowMultiple: true,
    description: 'Promotional banner variant'
  },
  'image-text': {
    label: 'Image & Text',
    shortCode: 'I',
    category: 'content',
    allowMultiple: true,
    description: 'Image with text blocks'
  },
  'feature-overview': {
    label: 'Features',
    shortCode: 'K',
    category: 'content',
    allowMultiple: true,
    description: 'Feature list or grid'
  },
  'table': {
    label: 'Table',
    shortCode: 'L',
    category: 'content',
    allowMultiple: true,
    description: 'Data table segment'
  },
  'faq': {
    label: 'FAQ',
    shortCode: 'O',
    category: 'content',
    allowMultiple: true,
    description: 'Frequently asked questions'
  },
  'video': {
    label: 'Video',
    shortCode: 'M',
    category: 'content',
    allowMultiple: true,
    description: 'Video embed segment'
  },
  'specification': {
    label: 'Specification',
    shortCode: 'N',
    category: 'content',
    allowMultiple: true,
    description: 'Technical specifications'
  },
  'news': {
    label: 'Latest News',
    shortCode: 'D',
    category: 'content',
    allowMultiple: true,
    description: 'News teaser section'
  },
  'news-list': {
    label: 'News List',
    shortCode: 'P',
    category: 'content',
    allowMultiple: true,
    description: 'Full news listing'
  },
  'intro': {
    label: 'Intro',
    shortCode: 'B',
    category: 'content',
    allowMultiple: true,
    description: 'Introduction section'
  },
  'industries': {
    label: 'Industries',
    shortCode: 'C',
    category: 'content',
    allowMultiple: true,
    description: 'Industry showcase'
  },
  'debug': {
    label: 'Debug',
    shortCode: 'X',
    category: 'utility',
    allowMultiple: true,
    description: 'Debug information (dev only)'
  },
  'events': {
    label: 'Events List',
    shortCode: 'R',
    category: 'content',
    allowMultiple: true,
    description: 'Events listing'
  },
  'product-list': {
    label: 'Product List',
    shortCode: 'S',
    category: 'content',
    allowMultiple: true,
    description: 'Product listing grid'
  },
  'downloads': {
    label: 'Downloads',
    shortCode: 'T',
    category: 'content',
    allowMultiple: true,
    description: 'Download resources'
  },
  'footer': {
    label: 'Footer',
    shortCode: 'Z',
    category: 'footer',
    allowMultiple: false,
    description: 'Page footer section'
  },
  'mini-footer': {
    label: 'Mini Footer',
    shortCode: 'U',
    category: 'footer',
    allowMultiple: false,
    description: 'Compact footer variant'
  },
  'meta-navigation': {
    label: 'Meta Navigation',
    shortCode: 'E',
    category: 'navigation',
    allowMultiple: true,
    description: 'Secondary navigation'
  },
  'split-screen': {
    label: 'Split Screen',
    shortCode: 'SS',
    category: 'content',
    allowMultiple: true,
    description: 'Split content layout'
  }
};

/**
 * Segments that appear at fixed positions (not draggable)
 */
export const FIXED_POSITION_SEGMENTS: SegmentType[] = [
  'meta-navigation',
  'full-hero',
  'action-hero',
  'hero',
  'footer',
  'mini-footer'
];

/**
 * Static segment IDs (legacy, for backward compatibility)
 */
export const STATIC_SEGMENT_IDS = {
  hero: 1,
  tiles: 2,
  banner: 3,
  solutions: 4,
  footer: 7
} as const;

// ============================================
// DESIGN CONFIGURATION
// ============================================

/**
 * Available design icons for navigation
 */
export const DESIGN_ICON_OPTIONS = [
  { value: 'camera', label: 'Camera', icon: '📷' },
  { value: 'video', label: 'Video', icon: '🎬' },
  { value: 'car', label: 'Automotive', icon: '🚗' },
  { value: 'medical', label: 'Medical', icon: '🏥' },
  { value: 'industry', label: 'Industry', icon: '🏭' },
  { value: 'chart', label: 'Chart', icon: '📊' },
  { value: 'lightbulb', label: 'Innovation', icon: '💡' },
  { value: 'globe', label: 'Global', icon: '🌍' },
  { value: 'shield', label: 'Security', icon: '🛡️' },
  { value: 'cpu', label: 'Technology', icon: '🖥️' },
];

/**
 * CTA Group options for navigation
 */
export const CTA_GROUP_OPTIONS = [
  { value: 'none', label: 'No CTA' },
  { value: 'primary', label: 'Primary CTA' },
  { value: 'secondary', label: 'Secondary CTA' },
  { value: 'contact', label: 'Contact CTA' },
  { value: 'download', label: 'Download CTA' },
];

// ============================================
// INDUSTRY CONFIGURATION
// ============================================

/**
 * Industry parent category mapping
 * Maps page slugs to their parent industry category
 */
export const INDUSTRY_PARENT_CATEGORY_BY_SLUG: Record<string, string> = {
  'automotive': 'industries',
  'medical-endoscopy': 'industries',
  'photography': 'industries',
  'broadcast-video': 'industries',
  'machine-vision': 'industries',
  'mobile-phone': 'industries',
  'security-surveillance': 'industries',
  'scanners-archiving': 'industries',
  'web-camera': 'industries',
};

// ============================================
// UPLOAD CONFIGURATION
// ============================================

/**
 * Maximum file size for image uploads (in MB)
 */
export const MAX_IMAGE_SIZE_MB = 5;

/**
 * Allowed image file types
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

/**
 * Storage bucket for page images
 */
export const PAGE_IMAGES_BUCKET = 'page-images';

// ============================================
// AUTO-SAVE CONFIGURATION
// ============================================

/**
 * Debounce delay for auto-save (in ms)
 */
export const AUTOSAVE_DEBOUNCE_MS = 2000;

/**
 * Prefix for auto-save localStorage keys
 */
export const AUTOSAVE_KEY_PREFIX = 'cms_autosave_';

// ============================================
// UI CONFIGURATION
// ============================================

/**
 * CMS Version (displayed in welcome screen)
 */
export const CMS_VERSION = '0.9.3';

/**
 * Default number of columns for tiles segment
 */
export const DEFAULT_TILES_COLUMNS = '3';

/**
 * Available column layouts for tiles
 */
export const TILES_COLUMN_OPTIONS = ['2', '3', '4'];

/**
 * Available column layouts for solutions/image-text
 */
export const SOLUTIONS_COLUMN_OPTIONS = ['1-col', '2-col', '3-col'];

// ============================================
// FEATURE FLAGS
// ============================================

/**
 * Enable/disable CMS features
 */
export const CMS_FEATURES = {
  /** Enable split-screen translation mode */
  splitScreenTranslation: true,
  
  /** Enable version history */
  versionHistory: true,
  
  /** Enable glossary manager */
  glossary: true,
  
  /** Enable SEO editor */
  seoEditor: true,
  
  /** Enable design element picker */
  designElements: true,
  
  /** Enable CTA configuration */
  ctaConfig: true,
  
  /** Enable flyout content */
  flyoutContent: true,
  
  /** Enable auto-save */
  autoSave: true,
  
  /** Enable segment copy feature */
  segmentCopy: true,
  
  /** Show debug segments (dev only) */
  debugSegments: process.env.NODE_ENV === 'development',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get display label for a segment type
 */
export function getSegmentLabel(type: SegmentType, instanceNumber: number = 1): string {
  const config = SEGMENT_CONFIG[type];
  if (!config) return type;
  
  const suffix = config.allowMultiple && instanceNumber > 1 ? ` ${instanceNumber}` : '';
  return `${config.label}${suffix}`;
}

/**
 * Get segment type short code
 */
export function getSegmentShortCode(type: SegmentType): string {
  return SEGMENT_CONFIG[type]?.shortCode || '?';
}

/**
 * Check if segment is at a fixed position
 */
export function isFixedPositionSegment(type: SegmentType): boolean {
  return FIXED_POSITION_SEGMENTS.includes(type);
}

/**
 * Get category for a segment type
 */
export function getSegmentCategory(type: SegmentType): string {
  return SEGMENT_CONFIG[type]?.category || 'content';
}

/**
 * Filter segments by category
 */
export function getSegmentsByCategory(category: string): SegmentType[] {
  return Object.entries(SEGMENT_CONFIG)
    .filter(([_, config]) => config.category === category)
    .map(([type]) => type as SegmentType);
}
