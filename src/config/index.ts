/**
 * Config Module Exports
 * 
 * Zentrale Exports für alle Konfigurationsdateien.
 * Import: import { siteConfig, isModuleEnabled } from '@/config';
 */

export { 
  siteConfig, 
  isModuleEnabled, 
  isLanguageAvailable, 
  getPageTitle, 
  getContactEmail,
  type SiteConfig,
  type AvailableLanguage,
  type FeatureModule,
} from './siteConfig';
