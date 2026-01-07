/**
 * Produkt-Katalog Preset
 * 
 * Optimiert für Unternehmen mit Produktportfolio.
 * Fokus auf: Produkte, Downloads, SEO, Content Automation
 * 
 * @version 1.5.0
 */

export interface ProductCatalogConfig {
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

export const productCatalogPreset: ProductCatalogConfig = {
  tenant: {
    id: "mein-produkt-katalog",
    name: "Mein Unternehmen",
    legalName: "Mein Unternehmen GmbH",
    tagline: "Innovation trifft Qualität",
    description: "Entdecken Sie unser hochwertiges Produktportfolio.",
  },

  branding: {
    logos: {
      primary: "/assets/logo-primary.png",
      dark: "/assets/logo-dark.png",
      light: "/assets/logo-light.png",
      favicon: "/favicon.ico",
    },
    colors: {
      primary: "211 77% 28%",        // Professionelles Blau
      primaryGlow: "211 77% 38%",
      accent: "48 96% 56%",          // Energetisches Gelb
      accentForeground: "0 0% 0%",   // Schwarz auf Gelb
    },
    fonts: {
      heading: "Inter, sans-serif",
      body: "Inter, sans-serif",
    },
  },

  contact: {
    email: "info@mein-unternehmen.de",
    phone: "+49 123 456 789",
    support: {
      email: "support@mein-unternehmen.de",
      phone: "+49 123 456 780",
    },
    address: {
      street: "Industriestraße 10",
      city: "München",
      zip: "80331",
      country: "Deutschland",
      countryCode: "DE",
    },
    businessHours: {
      weekdays: "8:00 - 17:00 CET",
      timezone: "Europe/Berlin",
    },
  },

  social: {
    linkedin: "https://linkedin.com/company/mein-unternehmen",
    youtube: "https://youtube.com/@meinunternehmen",
    twitter: null,
    facebook: null,
  },

  seo: {
    titleSuffix: " | Mein Unternehmen",
    defaultOgImage: "/og-default.jpg",
    canonicalDomain: "https://www.mein-unternehmen.de",
    googleAnalyticsId: null,
    googleTagManagerId: null,
  },

  features: {
    modules: {
      products: true,            // ✅ Kern-Feature
      news: false,               // ❌ Optional
      events: false,             // ❌ Optional
      downloads: true,           // ✅ Datenblätter, Manuals
      training: true,            // ✅ Schulungen
      seoTools: true,            // ✅ SEO-Optimierung
      contentAutomation: true,   // ✅ Content-Import
      contentGapAnalysis: false, // ❌ Enterprise-Feature
    },
    languages: {
      available: ["de", "en"] as const,
      default: "de" as const,
      fallback: "en" as const,
    },
    frontendEditing: true,
    multiUser: true,
  },

  integrations: {
    mautic: { enabled: false },
    resend: { 
      enabled: true, 
      fromEmail: "noreply@mein-unternehmen.de",
      fromName: "Mein Unternehmen",
    },
    firecrawl: { enabled: true },
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
 * Generiert den siteConfig.ts Inhalt für Produkt-Katalog
 */
export const generateProductCatalogConfig = (customizations?: Partial<ProductCatalogConfig>): string => {
  const config = { ...productCatalogPreset, ...customizations };
  
  return `/**
 * Site Configuration - Produkt-Katalog Template
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
