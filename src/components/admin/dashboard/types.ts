// ============================================
// CMS Types - Central Type Definitions
// ============================================

import { ImageMetadata } from '@/types/imageMetadata';

// ============================================
// Core Page Types
// ============================================

export interface PageInfo {
  pageId: number;
  pageTitle: string;
  pageSlug: string;
  parentSlug?: string | null;
  designIcon?: string | null;
  flyoutImageUrl?: string | null;
  flyoutDescription?: string | null;
  ctaGroup?: string | null;
  ctaLabel?: string | null;
  ctaIcon?: string | null;
  targetPageSlug?: string | null;
}

export interface PageListItem {
  page_slug: string;
  page_title: string;
}

// ============================================
// Segment Types
// ============================================

export interface PageSegment {
  id: string;
  type: SegmentType;
  data: Record<string, any>;
  position?: number;
}

export type SegmentType = 
  | 'hero'
  | 'full-hero'
  | 'action-hero'
  | 'product-hero-gallery'
  | 'tiles'
  | 'banner'
  | 'banner-p'
  | 'image-text'
  | 'feature-overview'
  | 'table'
  | 'faq'
  | 'video'
  | 'specification'
  | 'news'
  | 'news-list'
  | 'intro'
  | 'industries'
  | 'debug'
  | 'events'
  | 'product-list'
  | 'downloads'
  | 'footer'
  | 'mini-footer'
  | 'meta-navigation'
  | 'split-screen';

// ============================================
// Tile Types
// ============================================

export interface TileItem {
  id?: string;
  title: string;
  description: string;
  icon?: string;
  imageUrl?: string;
  link?: string;
  ctaLink?: string;
  ctaStyle?: string;
  ctaText?: string;
  buttonText?: string;
  metadata?: ImageMetadata;
}

// ============================================
// Banner Types
// ============================================

export interface BannerImage {
  url?: string;
  imageUrl?: string;
  alt?: string;
  altText?: string;
  metadata?: ImageMetadata;
}

// ============================================
// Solution/Image-Text Types
// ============================================

export interface SolutionItem {
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
  metadata?: ImageMetadata;
}

// ============================================
// Content Types
// ============================================

export interface ContentItem {
  id: string;
  page_slug?: string;
  section_key: string;
  content_type: string;
  content_value: string;
  language?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface ContentRecord {
  [key: string]: string;
}

// ============================================
// SEO Types
// ============================================

export interface SEOData {
  title: string;
  metaDescription: string;
  slug: string;
  canonical: string;
  robotsIndex: 'index' | 'noindex';
  robotsFollow: 'follow' | 'nofollow';
  focusKeyword: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: 'summary' | 'summary_large_image';
}

// ============================================
// Language Types
// ============================================

export type SupportedLanguage = 'en' | 'de' | 'ja' | 'ko' | 'zh';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  flag: string;
}

// ============================================
// Context Types
// ============================================

export interface UploadContext {
  userId: string;
  resolvedPageSlug: string;
  selectedPage: string;
  editorLanguage: SupportedLanguage;
}

export interface SaveContext {
  userId: string;
  resolvedPageSlug: string;
  selectedPage: string;
  editorLanguage: SupportedLanguage;
}

export interface SegmentContext {
  pageSlug: string;
  language: SupportedLanguage;
  userId: string;
}

export interface SegmentOperationContext {
  pageSlug: string;
  language: SupportedLanguage;
  userId: string;
  nextSegmentId: number;
  setNextSegmentId: (id: number) => void;
}

// ============================================
// State Types
// ============================================

export interface HeroState {
  imageUrl: string;
  imageMetadata: ImageMetadata | null;
  imagePosition: 'left' | 'right' | 'center';
  layout: string;
  topPadding: string;
  ctaLink: string;
  ctaStyle: string;
}

export interface BannerState {
  title: string;
  subtext: string;
  images: BannerImage[];
  buttonText: string;
  buttonLink: string;
  buttonStyle: string;
}

export interface SolutionsState {
  title: string;
  subtext: string;
  layout: string;
  items: SolutionItem[];
}

export interface FooterState {
  ctaTitle: string;
  ctaDescription: string;
  contactHeadline: string;
  contactSubline: string;
  contactDescription: string;
  teamImageUrl: string;
  teamImageMetadata: ImageMetadata | null;
  teamQuote: string;
  teamName: string;
  teamTitle: string;
  buttonText: string;
}

// ============================================
// Registry Types
// ============================================

export interface SegmentRegistry {
  [segmentKey: string]: number;
}

export interface ReverseRegistry {
  [segmentId: string]: string;
}

export interface SegmentRegistryResult {
  registry: SegmentRegistry;
  reverseRegistry: ReverseRegistry;
}
