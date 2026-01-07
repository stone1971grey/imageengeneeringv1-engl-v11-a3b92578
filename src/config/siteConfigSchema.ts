/**
 * Spade CMS - siteConfig Zod Validation Schema
 * 
 * Vollständige Validierung der siteConfig.ts mit detaillierten Fehlermeldungen.
 * 
 * @version 1.6.0
 */

import { z } from "zod";

// ============================================================================
// HELPER SCHEMAS
// ============================================================================

/**
 * HSL-Farbwert Validierung (z.B. "211 77% 28%")
 */
const hslColorSchema = z.string()
  .regex(
    /^\d{1,3}\s+\d{1,3}%\s+\d{1,3}%$/,
    "HSL-Format erwartet: 'H S% L%' (z.B. '211 77% 28%')"
  );

/**
 * URL Validierung (nullable)
 */
const urlSchema = z.string().url("Ungültige URL").nullable();

/**
 * E-Mail Validierung
 */
const emailSchema = z.string().email("Ungültige E-Mail-Adresse");

/**
 * Slug Validierung (lowercase, alphanumeric, hyphens)
 */
const slugSchema = z.string()
  .min(2, "Mindestens 2 Zeichen")
  .max(50, "Maximal 50 Zeichen")
  .regex(/^[a-z0-9-]+$/, "Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt");

// ============================================================================
// MAIN SCHEMAS
// ============================================================================

/**
 * Tenant Information Schema
 */
export const tenantSchema = z.object({
  id: slugSchema.describe("Eindeutiger Tenant-Identifier"),
  name: z.string().min(2, "Mindestens 2 Zeichen").max(100, "Maximal 100 Zeichen"),
  legalName: z.string().min(2, "Mindestens 2 Zeichen").max(200, "Maximal 200 Zeichen"),
  tagline: z.string().max(200, "Maximal 200 Zeichen"),
  description: z.string().max(500, "Maximal 500 Zeichen"),
});

/**
 * Branding Schema
 */
export const brandingSchema = z.object({
  logos: z.object({
    primary: z.string().min(1, "Pflichtfeld"),
    dark: z.string().min(1, "Pflichtfeld"),
    light: z.string().min(1, "Pflichtfeld"),
    favicon: z.string().min(1, "Pflichtfeld"),
  }),
  colors: z.object({
    primary: hslColorSchema.describe("Primärfarbe"),
    primaryGlow: hslColorSchema.describe("Primärfarbe Glow"),
    accent: hslColorSchema.describe("Akzentfarbe"),
    accentForeground: hslColorSchema.describe("Akzent Vordergrund"),
  }),
  fonts: z.object({
    heading: z.string().min(1, "Pflichtfeld"),
    body: z.string().min(1, "Pflichtfeld"),
  }),
});

/**
 * Contact Schema
 */
export const contactSchema = z.object({
  email: emailSchema,
  phone: z.string(),
  support: z.object({
    email: emailSchema,
    phone: z.string(),
  }),
  address: z.object({
    street: z.string(),
    city: z.string(),
    zip: z.string(),
    country: z.string(),
    countryCode: z.string().length(2, "ISO 3166-1 alpha-2 Code erwartet"),
  }),
  businessHours: z.object({
    weekdays: z.string(),
    timezone: z.string(),
  }),
});

/**
 * Social Media Schema
 */
export const socialSchema = z.object({
  linkedin: urlSchema,
  youtube: urlSchema,
  twitter: urlSchema,
  facebook: urlSchema,
});

/**
 * SEO Schema
 */
export const seoSchema = z.object({
  titleSuffix: z.string().max(60, "Maximal 60 Zeichen für SEO"),
  defaultOgImage: z.string(),
  canonicalDomain: z.string().url("Ungültige URL"),
  googleAnalyticsId: z.string().nullable(),
  googleTagManagerId: z.string().nullable(),
});

/**
 * Feature Modules Schema
 */
export const modulesSchema = z.object({
  products: z.boolean(),
  news: z.boolean(),
  events: z.boolean(),
  downloads: z.boolean(),
  training: z.boolean(),
  seoTools: z.boolean(),
  contentAutomation: z.boolean(),
  contentGapAnalysis: z.boolean(),
});

/**
 * Languages Schema
 */
export const languagesSchema = z.object({
  available: z.array(z.enum(["de", "en", "ja", "ko", "zh"])).min(1, "Mindestens eine Sprache erforderlich"),
  default: z.enum(["de", "en", "ja", "ko", "zh"]),
  fallback: z.enum(["de", "en", "ja", "ko", "zh"]),
});

/**
 * Features Schema
 */
export const featuresSchema = z.object({
  modules: modulesSchema,
  languages: languagesSchema,
  frontendEditing: z.boolean(),
  multiUser: z.boolean(),
});

/**
 * Integrations Schema
 */
export const integrationsSchema = z.object({
  mautic: z.object({
    enabled: z.boolean(),
  }),
  resend: z.object({
    enabled: z.boolean(),
    fromEmail: emailSchema,
    fromName: z.string(),
  }),
  firecrawl: z.object({
    enabled: z.boolean(),
  }),
  sistrix: z.object({
    enabled: z.boolean(),
    domain: z.string(),
  }),
});

/**
 * Storage Schema
 */
export const storageSchema = z.object({
  buckets: z.object({
    pageImages: z.string().min(1, "Pflichtfeld"),
    ogImages: z.string().min(1, "Pflichtfeld"),
    cmsMedia: z.string().min(1, "Pflichtfeld"),
  }),
});

/**
 * Legacy Schema
 */
export const legacySchema = z.object({
  sourceUrl: z.string(),
});

// ============================================================================
// COMPLETE SITE CONFIG SCHEMA
// ============================================================================

export const siteConfigSchema = z.object({
  tenant: tenantSchema,
  branding: brandingSchema,
  contact: contactSchema,
  social: socialSchema,
  seo: seoSchema,
  features: featuresSchema,
  integrations: integrationsSchema,
  storage: storageSchema,
  legacy: legacySchema,
});

export type ValidatedSiteConfig = z.infer<typeof siteConfigSchema>;

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  path: string;
  message: string;
  code: string;
}

export interface ValidationWarning {
  path: string;
  message: string;
  suggestion?: string;
}

/**
 * Validiert eine siteConfig und gibt detaillierte Fehler zurück
 */
export const validateSiteConfig = (config: unknown): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Zod Validation
  const result = siteConfigSchema.safeParse(config);

  if (!result.success) {
    for (const issue of result.error.issues) {
      errors.push({
        path: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      });
    }
  }

  // Additional Semantic Validation
  if (result.success) {
    const data = result.data;

    // Warning: Default language not in available languages
    if (!data.features.languages.available.includes(data.features.languages.default)) {
      errors.push({
        path: 'features.languages.default',
        message: 'Standard-Sprache muss in der Liste der verfügbaren Sprachen sein',
        code: 'custom',
      });
    }

    // Warning: Fallback language not in available languages
    if (!data.features.languages.available.includes(data.features.languages.fallback)) {
      errors.push({
        path: 'features.languages.fallback',
        message: 'Fallback-Sprache muss in der Liste der verfügbaren Sprachen sein',
        code: 'custom',
      });
    }

    // Warning: SEO title suffix too long
    if (data.seo.titleSuffix.length > 30) {
      warnings.push({
        path: 'seo.titleSuffix',
        message: 'Title-Suffix ist länger als 30 Zeichen',
        suggestion: 'Kürzere Suffixe verbessern das SEO-Ranking',
      });
    }

    // Warning: No social media links
    const socialLinks = [data.social.linkedin, data.social.youtube, data.social.twitter, data.social.facebook];
    if (socialLinks.every(link => !link)) {
      warnings.push({
        path: 'social',
        message: 'Keine Social-Media-Links konfiguriert',
        suggestion: 'Social-Media-Links verbessern die Online-Präsenz',
      });
    }

    // Warning: Analytics not configured
    if (!data.seo.googleAnalyticsId && !data.seo.googleTagManagerId) {
      warnings.push({
        path: 'seo',
        message: 'Keine Analytics-Integration konfiguriert',
        suggestion: 'Analytics hilft bei der Performance-Messung',
      });
    }

    // Warning: Module dependencies
    if (data.features.modules.contentGapAnalysis && !data.integrations.sistrix.enabled) {
      warnings.push({
        path: 'features.modules.contentGapAnalysis',
        message: 'Content Gap Analysis benötigt Sistrix-Integration',
        suggestion: 'Aktiviere integrations.sistrix.enabled oder deaktiviere Content Gap Analysis',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validiert nur einen Teil der Config
 */
export const validateConfigSection = <T extends keyof typeof siteConfigSchema.shape>(
  section: T,
  data: unknown
): ValidationResult => {
  const schema = siteConfigSchema.shape[section];
  const result = schema.safeParse(data);

  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  if (!result.success) {
    for (const issue of result.error.issues) {
      errors.push({
        path: `${section}.${issue.path.join('.')}`,
        message: issue.message,
        code: issue.code,
      });
    }
  }

  return { valid: errors.length === 0, errors, warnings };
};

// ============================================================================
// MODULE METADATA
// ============================================================================

export interface ModuleInfo {
  key: keyof typeof modulesSchema.shape;
  name: string;
  description: string;
  icon: string;
  dependencies?: string[];
  tier: 'basic' | 'advanced' | 'enterprise';
}

export const MODULE_INFO: ModuleInfo[] = [
  {
    key: 'products',
    name: 'Produkte',
    description: 'Produktkatalog mit Kategorien, Spezifikationen und Galerie',
    icon: 'Package',
    tier: 'basic',
  },
  {
    key: 'news',
    name: 'News',
    description: 'News-Artikel mit Kategorien und Veröffentlichungs-Workflow',
    icon: 'Newspaper',
    tier: 'basic',
  },
  {
    key: 'events',
    name: 'Events',
    description: 'Veranstaltungen mit Registrierung und Kalender-Integration',
    icon: 'Calendar',
    tier: 'basic',
  },
  {
    key: 'downloads',
    name: 'Downloads',
    description: 'Download-Center mit Lead-Erfassung',
    icon: 'Download',
    tier: 'basic',
  },
  {
    key: 'training',
    name: 'Training',
    description: 'Schulungs- und Trainingsangebote',
    icon: 'GraduationCap',
    tier: 'advanced',
  },
  {
    key: 'seoTools',
    name: 'SEO Tools',
    description: 'Erweiterte SEO-Optimierung mit AI-Unterstützung',
    icon: 'Search',
    tier: 'advanced',
  },
  {
    key: 'contentAutomation',
    name: 'Content Automation',
    description: 'Automatischer Content-Import und -Migration',
    icon: 'Bot',
    tier: 'enterprise',
    dependencies: ['firecrawl'],
  },
  {
    key: 'contentGapAnalysis',
    name: 'Content Gap Analysis',
    description: 'Wettbewerber-Analyse und Keyword-Lücken',
    icon: 'TrendingUp',
    dependencies: ['sistrix'],
    tier: 'enterprise',
  },
];

/**
 * Gruppiert Module nach Tier
 */
export const getModulesByTier = () => ({
  basic: MODULE_INFO.filter(m => m.tier === 'basic'),
  advanced: MODULE_INFO.filter(m => m.tier === 'advanced'),
  enterprise: MODULE_INFO.filter(m => m.tier === 'enterprise'),
});
