/**
 * Site Configuration for aftermarket-update.de
 * 
 * Zentrale Konfigurationsdatei für alle mandantenspezifischen Einstellungen.
 * Diese Datei nach src/config/siteConfig.ts kopieren.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type AvailableLanguage = 'de' | 'en';

export type FeatureModule = 
  | 'news' 
  | 'events' 
  | 'products' 
  | 'downloads' 
  | 'newsletter' 
  | 'contact' 
  | 'glossary'
  | 'seoTools';

export interface SiteConfig {
  tenant: {
    id: string;
    name: string;
    legalName: string;
    tagline: string;
  };
  branding: {
    logos: {
      primary: string;
      inverted?: string;
      icon?: string;
    };
    colors: {
      primary: string;
      primaryForeground: string;
      secondary: string;
      accent: string;
      background: string;
      foreground: string;
      muted: string;
      mutedForeground: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
  };
  contact: {
    email: string;
    phone?: string;
    address?: {
      street: string;
      city: string;
      zip: string;
      country: string;
    };
  };
  social: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  seo: {
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
    defaultOgImage?: string;
    twitterHandle?: string;
  };
  features: {
    modules: Record<FeatureModule, boolean>;
    languages: AvailableLanguage[];
    defaultLanguage: AvailableLanguage;
    frontendEditing: boolean;
  };
  integrations: {
    mautic?: {
      enabled: boolean;
      baseUrl?: string;
    };
    resend?: {
      enabled: boolean;
      fromEmail?: string;
    };
    analytics?: {
      enabled: boolean;
      googleAnalyticsId?: string;
    };
  };
  storage: {
    mediaBucket: string;
    publicBucket: string;
  };
}

// ============================================================================
// SITE CONFIGURATION - AFTERMARKET UPDATE
// ============================================================================

export const siteConfig: SiteConfig = {
  // === TENANT IDENTIFIKATION ===
  tenant: {
    id: 'aftermarket-update',
    name: 'Aftermarket Update',
    legalName: 'Aftermarket Update Media GmbH', // TODO: Anpassen
    tagline: 'Das Fachportal für den Automotive Aftermarket',
  },

  // === BRANDING ===
  branding: {
    logos: {
      primary: '/logo-aftermarket-update.svg',      // TODO: Logo hochladen
      inverted: '/logo-aftermarket-update-white.svg',
      icon: '/favicon.svg',
    },
    colors: {
      // Newspaper-typische Farbpalette - kann angepasst werden
      primary: '220 90% 45%',           // Kräftiges Blau (News-typisch)
      primaryForeground: '0 0% 100%',   // Weiß
      secondary: '220 15% 20%',         // Dunkles Grau-Blau
      accent: '45 100% 50%',            // Akzent-Gelb (Breaking News)
      background: '0 0% 100%',          // Weiß
      foreground: '220 15% 15%',        // Fast Schwarz
      muted: '220 10% 96%',             // Helles Grau
      mutedForeground: '220 10% 40%',   // Mittleres Grau
    },
    fonts: {
      heading: 'Georgia, serif',         // Klassische Zeitungsschrift
      body: 'system-ui, sans-serif',     // Moderne Leseschrift
    },
  },

  // === KONTAKT ===
  contact: {
    email: 'redaktion@aftermarket-update.de',  // TODO: Anpassen
    phone: '+49 123 456789',                    // TODO: Anpassen
    address: {
      street: 'Musterstraße 1',                 // TODO: Anpassen
      city: 'München',
      zip: '80331',
      country: 'Deutschland',
    },
  },

  // === SOCIAL MEDIA ===
  social: {
    linkedin: 'https://linkedin.com/company/aftermarket-update',  // TODO: Anpassen
    twitter: 'https://twitter.com/aftermarket_upd',
    // facebook: undefined,
    // instagram: undefined,
    // youtube: undefined,
  },

  // === SEO DEFAULTS ===
  seo: {
    defaultTitle: 'Aftermarket Update',
    titleTemplate: '%s | Aftermarket Update',
    defaultDescription: 'Aktuelle News, Analysen und Hintergründe aus dem Automotive Aftermarket. Das Fachportal für Werkstätten, Teilehandel und Industrie.',
    defaultOgImage: '/og-image-aftermarket.jpg',  // TODO: Erstellen
    twitterHandle: '@aftermarket_upd',
  },

  // === FEATURES ===
  features: {
    modules: {
      // Kern-Module für News-Portal
      news: true,           // ✅ Hauptfeature - Artikel & News
      newsletter: true,     // ✅ Newsletter-Anmeldung
      contact: true,        // ✅ Kontaktformular
      
      // Optionale Module
      events: true,         // ✅ Branchen-Events & Messen
      downloads: true,      // ✅ Whitepaper, Studien
      
      // Wahrscheinlich nicht benötigt
      products: false,      // ❌ Kein Produktkatalog
      glossary: false,      // ❌ Kein Glossar
      seoTools: false,      // ❌ Keine SEO-Admin-Tools
    },
    languages: ['de'],              // Erstmal nur Deutsch
    defaultLanguage: 'de',
    frontendEditing: true,          // Inline-Editing für Redakteure
  },

  // === INTEGRATIONEN ===
  integrations: {
    mautic: {
      enabled: false,  // Bei Bedarf aktivieren
    },
    resend: {
      enabled: true,
      fromEmail: 'noreply@aftermarket-update.de',  // TODO: Anpassen
    },
    analytics: {
      enabled: false,  // TODO: Google Analytics ID eintragen
      // googleAnalyticsId: 'G-XXXXXXXXXX',
    },
  },

  // === STORAGE ===
  storage: {
    mediaBucket: 'cms-media',
    publicBucket: 'public-assets',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Prüft ob ein Modul aktiviert ist
 */
export const isModuleEnabled = (module: FeatureModule): boolean => {
  return siteConfig.features.modules[module] ?? false;
};

/**
 * Prüft ob eine Sprache verfügbar ist
 */
export const isLanguageAvailable = (lang: string): lang is AvailableLanguage => {
  return siteConfig.features.languages.includes(lang as AvailableLanguage);
};

/**
 * Generiert den Seitentitel nach Template
 */
export const getPageTitle = (pageTitle?: string): string => {
  if (!pageTitle) return siteConfig.seo.defaultTitle;
  return siteConfig.seo.titleTemplate.replace('%s', pageTitle);
};

/**
 * Gibt die Kontakt-E-Mail zurück
 */
export const getContactEmail = (): string => {
  return siteConfig.contact.email;
};
