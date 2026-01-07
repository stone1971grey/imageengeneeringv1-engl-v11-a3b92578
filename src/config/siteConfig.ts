/**
 * Site Configuration
 * 
 * Zentrale Konfigurationsdatei für mandantenspezifische Einstellungen.
 * Bei neuen Projekten nur diese Datei anpassen!
 * 
 * @version 1.0.0
 * @tenant Image Engineering
 */

export const siteConfig = {
  // ============================================================
  // TENANT INFORMATION
  // ============================================================
  tenant: {
    /** Eindeutiger Tenant-Identifier */
    id: "image-engineering",
    /** Anzeigename des Unternehmens */
    name: "Image Engineering",
    /** Vollständiger Firmenname */
    legalName: "Image Engineering GmbH & Co. KG",
    /** Untertitel / Slogan */
    tagline: "Member of the Nynomic Group",
    /** Kurzbeschreibung für SEO */
    description: "Your Partner for Objective Camera & Sensor Testing",
  },

  // ============================================================
  // BRANDING
  // ============================================================
  branding: {
    /** Logo-Pfade (relativ zu /src/assets/) */
    logos: {
      primary: "/assets/logo-ie-new-v7.png",
      dark: "/assets/logo-ie-new-v7.png",
      light: "/assets/logo-ie-new-v7.png",
      favicon: "/favicon.ico",
    },
    /** Primärfarben (HSL-Werte ohne 'hsl()') */
    colors: {
      primary: "211 77% 28%",        // IE Blue
      primaryGlow: "211 77% 38%",
      accent: "48 96% 56%",          // IE Yellow (#f9dc24)
      accentForeground: "0 0% 0%",   // Black text on yellow
    },
    /** Schriftarten */
    fonts: {
      heading: "Inter, sans-serif",
      body: "Inter, sans-serif",
    },
  },

  // ============================================================
  // CONTACT INFORMATION
  // ============================================================
  contact: {
    email: "info@image-engineering.de",
    phone: "+49 2234 99977 0",
    /** Support-spezifische Kontakte */
    support: {
      email: "support@image-engineering.de",
      phone: "+49 2234 99977 0",
    },
    /** Adresse */
    address: {
      street: "Im Gleisdreieck 5",
      city: "Frechen",
      zip: "50226",
      country: "Germany",
      countryCode: "DE",
    },
    /** Öffnungszeiten */
    businessHours: {
      weekdays: "9:00 - 17:00 CET",
      timezone: "Europe/Berlin",
    },
  },

  // ============================================================
  // SOCIAL MEDIA
  // ============================================================
  social: {
    linkedin: "https://www.linkedin.com/company/image-engineering",
    youtube: "https://www.youtube.com/@image-engineering",
    twitter: null, // Nicht aktiv
    facebook: null, // Nicht aktiv
  },

  // ============================================================
  // SEO DEFAULTS
  // ============================================================
  seo: {
    /** Standard-Titel-Suffix */
    titleSuffix: " | Image Engineering",
    /** Standard OG-Bild */
    defaultOgImage: "/og-default.jpg",
    /** Canonical Domain */
    canonicalDomain: "https://www.image-engineering.de",
    /** Google Analytics ID */
    googleAnalyticsId: null,
    /** Google Tag Manager ID */
    googleTagManagerId: null,
  },

  // ============================================================
  // FEATURE FLAGS
  // ============================================================
  features: {
    /** Aktivierte Module */
    modules: {
      products: true,
      news: true,
      events: true,
      downloads: true,
      training: true,
      seoTools: true,
      contentAutomation: true,
      contentGapAnalysis: true,
    },
    /** Aktivierte Sprachen */
    languages: {
      available: ["en", "de", "ja", "ko", "zh"] as const,
      default: "en" as const,
      fallback: "en" as const,
    },
    /** Frontend-Editing aktiviert */
    frontendEditing: true,
    /** Multi-User aktiviert */
    multiUser: true,
  },

  // ============================================================
  // INTEGRATIONS
  // ============================================================
  integrations: {
    /** Mautic Marketing Automation */
    mautic: {
      enabled: true,
      // Credentials werden über Secrets verwaltet
    },
    /** Resend E-Mail Service */
    resend: {
      enabled: true,
      fromEmail: "noreply@image-engineering.de",
      fromName: "Image Engineering",
    },
    /** Firecrawl für Content Import */
    firecrawl: {
      enabled: true,
    },
    /** Sistrix SEO Tools */
    sistrix: {
      enabled: true,
      domain: "image-engineering.de",
    },
  },

  // ============================================================
  // STORAGE
  // ============================================================
  storage: {
    /** Supabase Storage Buckets */
    buckets: {
      pageImages: "page-images",
      ogImages: "og-images",
      cmsMedia: "cms-media",
    },
  },

  // ============================================================
  // LEGACY URLS (für Redirects/Migration)
  // ============================================================
  legacy: {
    /** Alte Domain für Content-Import */
    sourceUrl: "https://www.image-engineering.de",
  },
} as const;

// ============================================================
// TYPE EXPORTS
// ============================================================
export type SiteConfig = typeof siteConfig;
export type AvailableLanguage = typeof siteConfig.features.languages.available[number];
export type FeatureModule = keyof typeof siteConfig.features.modules;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Prüft ob ein Feature-Modul aktiviert ist
 */
export const isModuleEnabled = (module: FeatureModule): boolean => {
  return siteConfig.features.modules[module] ?? false;
};

/**
 * Prüft ob eine Sprache verfügbar ist
 */
export const isLanguageAvailable = (lang: string): lang is AvailableLanguage => {
  return siteConfig.features.languages.available.includes(lang as AvailableLanguage);
};

/**
 * Gibt den vollständigen Seitentitel zurück
 */
export const getPageTitle = (title: string): string => {
  return `${title}${siteConfig.seo.titleSuffix}`;
};

/**
 * Gibt die Kontakt-E-Mail basierend auf Typ zurück
 */
export const getContactEmail = (type: 'general' | 'support' = 'general'): string => {
  return type === 'support' 
    ? siteConfig.contact.support.email 
    : siteConfig.contact.email;
};
