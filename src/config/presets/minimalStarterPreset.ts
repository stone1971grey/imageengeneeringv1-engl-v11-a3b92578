/**
 * Minimal Starter Preset
 * 
 * Minimales Setup für schnellen Start.
 * Module können nachträglich aktiviert werden.
 * 
 * @version 1.5.0
 */

export interface MinimalStarterConfig {
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

export const minimalStarterPreset: MinimalStarterConfig = {
  tenant: {
    id: "mein-projekt",
    name: "Mein Projekt",
    legalName: "Mein Projekt",
    tagline: "Willkommen",
    description: "Mein neues Spade CMS Projekt.",
  },

  branding: {
    logos: {
      primary: "/assets/logo-primary.png",
      dark: "/assets/logo-dark.png",
      light: "/assets/logo-light.png",
      favicon: "/favicon.ico",
    },
    colors: {
      primary: "220 15% 25%",        // Neutral Dunkel
      primaryGlow: "220 15% 35%",
      accent: "210 100% 50%",        // Klares Blau
      accentForeground: "0 0% 100%", // Weiß
    },
    fonts: {
      heading: "Inter, sans-serif",
      body: "Inter, sans-serif",
    },
  },

  contact: {
    email: "info@mein-projekt.de",
    phone: "",
    support: {
      email: "info@mein-projekt.de",
      phone: "",
    },
    address: {
      street: "",
      city: "",
      zip: "",
      country: "Deutschland",
      countryCode: "DE",
    },
    businessHours: {
      weekdays: "9:00 - 17:00 CET",
      timezone: "Europe/Berlin",
    },
  },

  social: {
    linkedin: null,
    youtube: null,
    twitter: null,
    facebook: null,
  },

  seo: {
    titleSuffix: " | Mein Projekt",
    defaultOgImage: "/og-default.jpg",
    canonicalDomain: "https://www.mein-projekt.de",
    googleAnalyticsId: null,
    googleTagManagerId: null,
  },

  features: {
    modules: {
      products: false,           // ❌ Deaktiviert
      news: false,               // ❌ Deaktiviert
      events: false,             // ❌ Deaktiviert
      downloads: false,          // ❌ Deaktiviert
      training: false,           // ❌ Deaktiviert
      seoTools: false,           // ❌ Deaktiviert
      contentAutomation: false,  // ❌ Deaktiviert
      contentGapAnalysis: false, // ❌ Deaktiviert
    },
    languages: {
      available: ["de"] as const,
      default: "de" as const,
      fallback: "de" as const,
    },
    frontendEditing: true,
    multiUser: false,
  },

  integrations: {
    mautic: { enabled: false },
    resend: { 
      enabled: true, 
      fromEmail: "noreply@mein-projekt.de",
      fromName: "Mein Projekt",
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
 * Generiert den siteConfig.ts Inhalt für Minimal Starter
 */
export const generateMinimalStarterConfig = (customizations?: Partial<MinimalStarterConfig>): string => {
  const config = { ...minimalStarterPreset, ...customizations };
  
  return `/**
 * Site Configuration - Minimal Starter Template
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
