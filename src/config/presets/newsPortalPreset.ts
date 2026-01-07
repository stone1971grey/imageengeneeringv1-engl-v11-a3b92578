/**
 * News-Portal Preset
 * 
 * Optimiert für Nachrichtenportale, Blogs und Magazine.
 * Fokus auf: Artikel, Newsletter, Events
 * 
 * @version 1.5.0
 */

export interface NewsPortalConfig {
  tenant: {
    id: string;
    name: string;
    legalName: string;
    tagline: string;
    description: string;
  };
  branding: {
    logos: {
      primary: string;
      dark: string;
      light: string;
      favicon: string;
    };
    colors: {
      primary: string;
      primaryGlow: string;
      accent: string;
      accentForeground: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
  };
  contact: {
    email: string;
    phone: string;
    support: {
      email: string;
      phone: string;
    };
    address: {
      street: string;
      city: string;
      zip: string;
      country: string;
      countryCode: string;
    };
    businessHours: {
      weekdays: string;
      timezone: string;
    };
  };
  social: {
    linkedin: string | null;
    youtube: string | null;
    twitter: string | null;
    facebook: string | null;
  };
  seo: {
    titleSuffix: string;
    defaultOgImage: string;
    canonicalDomain: string;
    googleAnalyticsId: string | null;
    googleTagManagerId: string | null;
  };
  features: {
    modules: {
      products: boolean;
      news: boolean;
      events: boolean;
      downloads: boolean;
      training: boolean;
      seoTools: boolean;
      contentAutomation: boolean;
      contentGapAnalysis: boolean;
    };
    languages: {
      available: readonly string[];
      default: string;
      fallback: string;
    };
    frontendEditing: boolean;
    multiUser: boolean;
  };
  integrations: {
    mautic: { enabled: boolean };
    resend: { enabled: boolean; fromEmail: string; fromName: string };
    firecrawl: { enabled: boolean };
    sistrix: { enabled: boolean; domain: string };
  };
  storage: {
    buckets: {
      pageImages: string;
      ogImages: string;
      cmsMedia: string;
    };
  };
  legacy: {
    sourceUrl: string;
  };
}

export const newsPortalPreset: NewsPortalConfig = {
  tenant: {
    id: "mein-news-portal",
    name: "Mein News-Portal",
    legalName: "News Portal GmbH",
    tagline: "Aktuelle Nachrichten und Analysen",
    description: "Ihr Portal für aktuelle Nachrichten, Analysen und Hintergrundberichte.",
  },

  branding: {
    logos: {
      primary: "/assets/logo-primary.png",
      dark: "/assets/logo-dark.png",
      light: "/assets/logo-light.png",
      favicon: "/favicon.ico",
    },
    colors: {
      primary: "220 70% 35%",        // Tiefes Blau
      primaryGlow: "220 70% 45%",
      accent: "0 85% 55%",           // Kräftiges Rot (typisch für News)
      accentForeground: "0 0% 100%", // Weiß auf Rot
    },
    fonts: {
      heading: "Georgia, serif",     // Klassisch für Zeitungen
      body: "Inter, sans-serif",
    },
  },

  contact: {
    email: "redaktion@mein-portal.de",
    phone: "+49 123 456 789",
    support: {
      email: "support@mein-portal.de",
      phone: "+49 123 456 789",
    },
    address: {
      street: "Pressestraße 1",
      city: "Berlin",
      zip: "10115",
      country: "Deutschland",
      countryCode: "DE",
    },
    businessHours: {
      weekdays: "9:00 - 18:00 CET",
      timezone: "Europe/Berlin",
    },
  },

  social: {
    linkedin: "https://linkedin.com/company/mein-portal",
    youtube: null,
    twitter: "https://twitter.com/mein_portal",
    facebook: "https://facebook.com/meinportal",
  },

  seo: {
    titleSuffix: " | Mein News-Portal",
    defaultOgImage: "/og-default.jpg",
    canonicalDomain: "https://www.mein-portal.de",
    googleAnalyticsId: null,
    googleTagManagerId: null,
  },

  features: {
    modules: {
      products: false,           // ❌ Keine Produkte
      news: true,                // ✅ Kern-Feature
      events: true,              // ✅ Veranstaltungen
      downloads: true,           // ✅ PDFs, Whitepapers
      training: false,           // ❌ Kein Training
      seoTools: false,           // ❌ Basis-Version
      contentAutomation: false,  // ❌ Basis-Version
      contentGapAnalysis: false, // ❌ Basis-Version
    },
    languages: {
      available: ["de", "en"] as const,
      default: "de" as const,
      fallback: "de" as const,
    },
    frontendEditing: true,
    multiUser: true,
  },

  integrations: {
    mautic: { enabled: true },
    resend: { 
      enabled: true, 
      fromEmail: "noreply@mein-portal.de",
      fromName: "Mein News-Portal",
    },
    firecrawl: { enabled: false },
    sistrix: { enabled: false, domain: "" },
  },

  storage: {
    buckets: {
      pageImages: "page-images",
      ogImages: "og-images",
      cmsMedia: "cms-media",
    },
  },

  legacy: {
    sourceUrl: "",
  },
};

/**
 * Generiert den siteConfig.ts Inhalt für News-Portal
 */
export const generateNewsPortalConfig = (customizations?: Partial<NewsPortalConfig>): string => {
  const config = { ...newsPortalPreset, ...customizations };
  
  return `/**
 * Site Configuration - News-Portal Template
 * 
 * Generiert mit Spade CMS Template System v1.5
 * @tenant ${config.tenant.name}
 */

export const siteConfig = ${JSON.stringify(config, null, 2)} as const;

export type SiteConfig = typeof siteConfig;
export type AvailableLanguage = typeof siteConfig.features.languages.available[number];
export type FeatureModule = keyof typeof siteConfig.features.modules;

export const isModuleEnabled = (module: FeatureModule): boolean => {
  return siteConfig.features.modules[module] ?? false;
};

export const isLanguageAvailable = (lang: string): lang is AvailableLanguage => {
  return siteConfig.features.languages.available.includes(lang as AvailableLanguage);
};

export const getPageTitle = (title: string): string => {
  return \`\${title}\${siteConfig.seo.titleSuffix}\`;
};

export const getContactEmail = (type: 'general' | 'support' = 'general'): string => {
  return type === 'support' 
    ? siteConfig.contact.support.email 
    : siteConfig.contact.email;
};
`;
};
