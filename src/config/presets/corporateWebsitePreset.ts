/**
 * Corporate Website Preset
 * 
 * Vollständige Unternehmenswebsite mit allen Modulen.
 * Fokus auf: Alles - maximale Funktionalität
 * 
 * @version 1.5.0
 */

export interface CorporateWebsiteConfig {
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

export const corporateWebsitePreset: CorporateWebsiteConfig = {
  tenant: {
    id: "meine-firma",
    name: "Meine Firma",
    legalName: "Meine Firma GmbH & Co. KG",
    tagline: "Ihr Partner für Exzellenz",
    description: "Umfassende Lösungen für Ihr Unternehmen - von Produkten bis Services.",
  },

  branding: {
    logos: {
      primary: "/assets/logo-primary.png",
      dark: "/assets/logo-dark.png",
      light: "/assets/logo-light.png",
      favicon: "/favicon.ico",
    },
    colors: {
      primary: "211 77% 28%",        // Corporate Blue
      primaryGlow: "211 77% 38%",
      accent: "48 96% 56%",          // Corporate Accent
      accentForeground: "0 0% 0%",
    },
    fonts: {
      heading: "Inter, sans-serif",
      body: "Inter, sans-serif",
    },
  },

  contact: {
    email: "info@meine-firma.de",
    phone: "+49 123 456 789",
    support: {
      email: "support@meine-firma.de",
      phone: "+49 123 456 780",
    },
    address: {
      street: "Hauptstraße 1",
      city: "Frankfurt",
      zip: "60311",
      country: "Deutschland",
      countryCode: "DE",
    },
    businessHours: {
      weekdays: "9:00 - 17:00 CET",
      timezone: "Europe/Berlin",
    },
  },

  social: {
    linkedin: "https://linkedin.com/company/meine-firma",
    youtube: "https://youtube.com/@meinefirma",
    twitter: "https://twitter.com/meine_firma",
    facebook: "https://facebook.com/meinefirma",
  },

  seo: {
    titleSuffix: " | Meine Firma",
    defaultOgImage: "/og-default.jpg",
    canonicalDomain: "https://www.meine-firma.de",
    googleAnalyticsId: null,
    googleTagManagerId: null,
  },

  features: {
    modules: {
      products: true,            // ✅ Alle Module aktiviert
      news: true,                // ✅
      events: true,              // ✅
      downloads: true,           // ✅
      training: true,            // ✅
      seoTools: true,            // ✅
      contentAutomation: true,   // ✅
      contentGapAnalysis: true,  // ✅
    },
    languages: {
      available: ["en", "de", "ja", "ko", "zh"] as const,
      default: "en" as const,
      fallback: "en" as const,
    },
    frontendEditing: true,
    multiUser: true,
  },

  integrations: {
    mautic: { enabled: true },
    resend: { 
      enabled: true, 
      fromEmail: "noreply@meine-firma.de",
      fromName: "Meine Firma",
    },
    firecrawl: { enabled: true },
    sistrix: { enabled: true, domain: "meine-firma.de" },
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
 * Generiert den siteConfig.ts Inhalt für Corporate Website
 */
export const generateCorporateWebsiteConfig = (customizations?: Partial<CorporateWebsiteConfig>): string => {
  const config = { ...corporateWebsitePreset, ...customizations };
  
  return `/**
 * Site Configuration - Corporate Website Template
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
