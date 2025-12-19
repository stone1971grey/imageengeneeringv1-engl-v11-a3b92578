import { ImageMetadata } from '@/types/imageMetadata';

// Type definitions for CMS content structures

export interface TileItem {
  title: string;
  description: string;
  ctaLink: string;
  ctaStyle: string;
  ctaText: string;
  imageUrl: string;
  icon: string;
  metadata?: ImageMetadata;
}

export interface BannerImage {
  imageUrl: string;
  altText: string;
  metadata?: ImageMetadata;
}

export interface SolutionItem {
  imageUrl: string;
  title: string;
  description: string;
  metadata?: ImageMetadata;
}

export interface ContentItem {
  id: string;
  section_key: string;
  content_type: string;
  content_value: string;
}
