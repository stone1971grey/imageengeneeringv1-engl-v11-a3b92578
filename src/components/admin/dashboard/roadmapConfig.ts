// ============================================
// SpadeCMS Roadmap Configuration
// ============================================
// Central source of truth for version info and roadmap.
// Update this file to change versions across the entire CMS.
// ============================================

export type FeatureStatus = 'done' | 'planned';
export type VersionStatus = 'released' | 'current' | 'planned' | 'complete';

export interface RoadmapFeature {
  label: string;
  status: FeatureStatus;
}

export interface RoadmapVersion {
  key: string;
  label: string;
  status: VersionStatus;
  features: RoadmapFeature[];
  isAdminOnly?: boolean;
}

// ============================================
// CURRENT VERSION
// ============================================
export const CMS_VERSION = '1.1.0';

// ============================================
// ROADMAP VERSIONS
// ============================================
export const ROADMAP_VERSIONS: RoadmapVersion[] = [
  // Released Versions
  {
    key: 'v0.5',
    label: 'v0.5 – Foundation',
    status: 'released',
    features: [
      { label: 'Modular Segments', status: 'done' },
      { label: 'Multi-Language', status: 'done' },
      { label: 'Hierarchical Pages', status: 'done' },
    ]
  },
  {
    key: 'v0.6',
    label: 'v0.6 – Translation & SEO',
    status: 'released',
    features: [
      { label: 'Translation Glossary', status: 'done' },
      { label: 'Auto Translation', status: 'done' },
      { label: 'SEO Suite', status: 'done' },
    ]
  },
  {
    key: 'v0.7',
    label: 'v0.7 – Content Types',
    status: 'released',
    features: [
      { label: 'News Management', status: 'done' },
      { label: 'Event Management', status: 'done' },
      { label: 'Media Management', status: 'done' },
      { label: 'CMS-Managed Navigation', status: 'done' },
    ]
  },
  {
    key: 'v0.8',
    label: 'v0.8 – Extended Content',
    status: 'released',
    features: [
      { label: 'Product Management', status: 'done' },
      { label: 'Download Management', status: 'done' },
    ]
  },
  {
    key: 'v0.9',
    label: 'v0.9 – Advanced Features',
    status: 'released',
    features: [
      { label: 'User Management', status: 'done' },
      { label: 'Versionsmanagement', status: 'done' },
      { label: 'Smart Search', status: 'done' },
    ]
  },
  {
    key: 'v1.0',
    label: '🍾 v1.0.0 – Release',
    status: 'released',
    features: [
      { label: 'Draft/Publish Workflow', status: 'done' },
      { label: 'Latest Edit', status: 'done' },
      { label: 'Copy Page', status: 'done' },
      { label: 'Version History', status: 'done' },
      { label: 'Segment-Registry', status: 'done' },
    ]
  },
  
  // Current Version
  {
    key: 'v1.1',
    label: '🍾 v1.1 – Advanced AI SEO Suite',
    status: 'current',
    features: [
      { label: 'Smart Focus Keyword', status: 'done' },
      { label: 'Smart Title Generator', status: 'done' },
      { label: 'Smart Description Generator', status: 'done' },
      { label: 'Smart H1 Generator', status: 'done' },
      { label: 'Smart H2/H3 Generators', status: 'done' },
      { label: 'Smart Content Optimizer', status: 'done' },
      { label: 'FKW Content Score', status: 'done' },
      { label: 'Readability Analysis', status: 'done' },
      { label: 'Smart Internal Links', status: 'done' },
      { label: 'Smart External Links', status: 'done' },
      { label: 'Cascading Slug Inheritance', status: 'done' },
      { label: 'Multi-Segment Asset Badges', status: 'done' },
      { label: 'Segment Type Validation', status: 'done' },
      { label: 'Language Switch Stability', status: 'done' },
    ]
  },
  
  // Roadmap Versions (Admin Only)
  {
    key: 'v1.2',
    label: 'v1.2 – Frontend Editing',
    status: 'planned',
    isAdminOnly: true,
    features: [
      { label: 'Frontend Editing', status: 'planned' },
    ]
  },
  {
    key: 'v1.3',
    label: 'v1.3 – Content Automation',
    status: 'planned',
    isAdminOnly: true,
    features: [
      { label: 'Content Automation', status: 'planned' },
    ]
  },
  {
    key: 'v1.4',
    label: 'v1.4 – Enterprise SEO',
    status: 'planned',
    isAdminOnly: true,
    features: [
      { label: 'SISTRIX Integration', status: 'done' },
      { label: 'Relaunch Dashboard', status: 'done' },
      { label: 'Visibility Tracking', status: 'done' },
      { label: 'Content Gap Analysis', status: 'planned' },
      { label: 'Link Analysis Dashboard', status: 'planned' },
      { label: 'Ranking Alerts', status: 'planned' },
      { label: 'Competitor Analysis', status: 'planned' },
    ]
  },
  {
    key: 'v1.5',
    label: 'v1.5 – Template System',
    status: 'planned',
    isAdminOnly: true,
    features: [
      { label: 'Template/Boilerplate System', status: 'planned' },
    ]
  },
  {
    key: 'v1.6',
    label: 'v1.6 – Configuration Layer',
    status: 'planned',
    isAdminOnly: true,
    features: [
      { label: 'Tenant Configuration Layer', status: 'planned' },
    ]
  },
  {
    key: 'v1.7',
    label: 'v1.7 – Data Isolation',
    status: 'planned',
    isAdminOnly: true,
    features: [
      { label: 'Multi-Tenant Data Isolation', status: 'planned' },
    ]
  },
  {
    key: 'v1.8',
    label: 'v1.8 – Tenant Onboarding',
    status: 'planned',
    isAdminOnly: true,
    features: [
      { label: 'Tenant Onboarding Pipeline', status: 'planned' },
    ]
  },
  {
    key: 'v1.9',
    label: 'v1.9 – Mautic Vision',
    status: 'planned',
    isAdminOnly: true,
    features: [
      { label: 'Marketing Automation KPIs', status: 'planned' },
    ]
  },
  {
    key: 'v2.0',
    label: 'v2.0 – Plugin-Architektur',
    status: 'planned',
    isAdminOnly: true,
    features: [
      { label: 'Plugin-Architektur', status: 'planned' },
    ]
  },
];

// Helper: Get released versions only
export const getReleasedVersions = () => 
  ROADMAP_VERSIONS.filter(v => v.status === 'released' || v.status === 'current');

// Helper: Get roadmap versions (planned/future)
export const getRoadmapVersions = () => 
  ROADMAP_VERSIONS.filter(v => v.status === 'planned' && v.isAdminOnly);

// Helper: Get current version info
export const getCurrentVersion = () => 
  ROADMAP_VERSIONS.find(v => v.status === 'current');
