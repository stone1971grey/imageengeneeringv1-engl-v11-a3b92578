/**
 * Spade CMS Template Presets
 * 
 * Vorkonfigurierte Templates für verschiedene Projekttypen.
 * Jedes Preset enthält eine vollständige siteConfig mit passenden Feature-Flags.
 * 
 * @version 1.5.0
 */

export { newsPortalPreset, type NewsPortalConfig } from './newsPortalPreset';
export { productCatalogPreset, type ProductCatalogConfig } from './productCatalogPreset';
export { corporateWebsitePreset, type CorporateWebsiteConfig } from './corporateWebsitePreset';
export { minimalStarterPreset, type MinimalStarterConfig } from './minimalStarterPreset';

export type PresetType = 'news-portal' | 'product-catalog' | 'corporate-website' | 'minimal-starter';

export interface PresetInfo {
  id: PresetType;
  name: string;
  description: string;
  icon: string;
  features: string[];
  modules: string[];
}

export const PRESET_INFO: PresetInfo[] = [
  {
    id: 'news-portal',
    name: 'News-Portal',
    description: 'Für Nachrichtenportale, Blogs und Magazine mit Fokus auf Artikel und Newsletter.',
    icon: 'Newspaper',
    features: ['News-Artikel', 'Newsletter', 'Events', 'Downloads'],
    modules: ['news', 'newsletter', 'events', 'downloads', 'contact'],
  },
  {
    id: 'product-catalog',
    name: 'Produkt-Katalog',
    description: 'Für Unternehmen mit Produktportfolio, technischen Dokumentationen und Downloads.',
    icon: 'Package',
    features: ['Produktseiten', 'Downloads', 'SEO-Tools', 'Content Automation'],
    modules: ['products', 'downloads', 'seoTools', 'contentAutomation'],
  },
  {
    id: 'corporate-website',
    name: 'Corporate Website',
    description: 'Vollständige Unternehmenswebsite mit allen Modulen und Integrationen.',
    icon: 'Building2',
    features: ['Alle Module', 'Multi-Language', 'Marketing Automation', 'Analytics'],
    modules: ['products', 'news', 'events', 'downloads', 'seoTools', 'contentAutomation'],
  },
  {
    id: 'minimal-starter',
    name: 'Minimal Starter',
    description: 'Minimales Setup für schnellen Start. Module können nachträglich aktiviert werden.',
    icon: 'Zap',
    features: ['Basis-CMS', 'Kontaktformular', 'Schneller Start'],
    modules: ['contact'],
  },
];

export const getPresetById = (id: PresetType): PresetInfo | undefined => {
  return PRESET_INFO.find(preset => preset.id === id);
};
