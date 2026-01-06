# CMS Roadmap Protocol

> Dokumentation der geplanten CMS-Versionen und Features
> Stand: 2026-01-06

---

## Übersicht

| Version | Name | Status | Ziel |
|---------|------|--------|------|
| v1.0.8 | Release | ✅ Fertig | Produktionsreifer CMS-Kern |
| v1.1 | Advanced AI SEO Suite | ✅ Fertig | KI-gestützte SEO-Optimierung |
| v1.2 | Frontend Editing | ✅ Fertig | Inline-Bearbeitung im Frontend |
| v1.3 | Content Automation | ✅ Fertig | Automatisierter Content-Import |
| v1.4 | Template System | 🔜 Geplant | CMS als Boilerplate |
| v1.5 | Configuration Layer | 🔜 Geplant | Mandanten-Konfiguration |
| v1.6 | Data Isolation | 🔜 Geplant | Datentrennung pro Mandant |
| v1.7 | Tenant Onboarding | 🔜 Geplant | Automatisierte Mandanten-Einrichtung |
| v1.8 | Mautic Vision | 🔜 Geplant | Marketing Automation KPIs |
| v2.0 | Plugin-Architektur | 🔮 Zukunft | Modulare Segment-Erweiterung |

---

## v1.0.8 – Release ✅

**Status:** Fertiggestellt (2026-01-06)

### Features
- **Draft/Publish Workflow**: Entwurf-/Veröffentlichungs-System mit Berechtigungen
- **Latest Edit**: Schnellzugriff auf zuletzt bearbeitete Seiten
- **Copy Page**: Vollständige Seitenduplizierung inkl. aller Segmente
- **Version History**: Versionierung mit Rollback-Funktion
- **Segment-Registry**: Dynamische Segment-Verwaltung
- 🟢 **Cascading Slug Inheritance**: Umbenennung von Parent-Slugs aktualisiert automatisch alle Child-Seiten (page_slug, parent_slug, Registry, Navigation)
- 🟢 **Multi-Segment Asset Badges**: Assets in Media Management zeigen Badges für alle zugewiesenen Segmente (1-2: individuelle IDs, 3+: "X Segments" Badge)
- 🟢 **Segment Type Validation**: Automatische Typ-Korrektur gegen segment_registry beim Laden und Speichern
- 🟢 **Language Switch Stability**: Robuster englischer Fallback für Segmente ohne Daten in Zielsprache

---

## v1.1 – Advanced AI SEO Suite ✅

**Status:** Fertiggestellt

### Features
- 🟢 KI-generierte Meta-Titles und Descriptions
- 🟢 Automatische H1-Headline-Vorschläge
- 🟢 Focus Keyword Analyse mit SISTRIX-Integration
- 🟢 Internal Linking Suggestions
- 🟢 SEO Score Dashboard
- 🟢 Relaunch Dashboard mit Priority-Scoring
- 🟢 Smart Content Creator

---

## v1.2 – Frontend Editing ✅

**Status:** Fertiggestellt

### Features
- 🟢 Inline-Text-Bearbeitung direkt im Frontend
- 🟢 Bild-Austausch per Klick (Upload + Media Management)
- 🟢 Segment-spezifische Editoren (Hero, Intro, Tiles, Banner, etc.)
- 🟢 Approval-Workflow für importierte Segmente (pending → approved)
- 🟢 Edit-Mode Toggle mit Berechtigungsprüfung
- 🟢 Layout-Stabilität (absolute Tooltips, keine Größenänderungen)

---

## v1.3 – Content Automation ✅

**Status:** Fertiggestellt

### Features
- 🟢 Automatischer Content-Import von externen URLs via Firecrawl
- 🟢 Media Management First Protocol
- 🟢 One Asset, One Segment Mapping
- 🟢 Automatische Segment-Erstellung (Hero, Intro, Image-Text, Tiles, FAQ, Table)
- 🟢 Redirect-Integration (301-Redirects bei Import)
- 🟢 Language-specific Source URLs
- 🟢 Frontend Approval Workflow für importierte Inhalte

---

## v1.4 – Template System 🔜

**Status:** Geplant  
**Kategorie:** Multi-Tenancy Foundation (1/4)

### Ziel
Das CMS als reproduzierbares Template/Boilerplate bereitstellen.

### Features
- CMS-Core als Lovable-Template
- Dokumentierte Verzeichnisstruktur
- Segment-Bibliothek als Basis
- Setup-Dokumentation für neue Projekte

### Technische Details
```
cms-template/
├── src/
│   ├── components/
│   │   ├── segments/        # Wiederverwendbare Segmente
│   │   ├── admin/           # Admin-Dashboard Komponenten
│   │   └── ui/              # shadcn/ui Komponenten
│   ├── pages/
│   │   ├── AdminDashboard.tsx
│   │   └── DynamicCMSPage.tsx
│   └── hooks/               # Wiederverwendbare Hooks
├── supabase/
│   ├── migrations/          # Basis-Migrationen
│   └── functions/           # Edge Functions
└── tenant.config.template.ts
```

---

## v1.5 – Configuration Layer 🔜

**Status:** Geplant  
**Kategorie:** Multi-Tenancy Foundation (2/4)

### Ziel
Mandanten-spezifische Einstellungen zentral verwalten.

### Features
- `tenant.config.ts` als zentrale Konfigurationsdatei
- Branding-Einstellungen (Logo, Farben, Fonts)
- Feature-Toggles pro Mandant
- Segment-Whitelist (welche Segmente verfügbar)
- Sprach-Konfiguration

### Technische Details
```typescript
// tenant.config.ts
export const tenantConfig = {
  // Identifikation
  tenantId: 'client-abc',
  tenantName: 'Client ABC GmbH',
  
  // Branding
  branding: {
    logoUrl: '/assets/logo.png',
    primaryColor: '#f9dc24',
    fontFamily: 'Inter',
  },
  
  // Features
  features: {
    multiLanguage: true,
    contentAutomation: false,
    frontendEditing: true,
  },
  
  // Verfügbare Segmente
  enabledSegments: [
    'intro', 'tiles', 'image-text', 'faq', 'product-hero'
  ],
  
  // Sprachen
  languages: ['en', 'de'],
  defaultLanguage: 'en',
};
```

---

## v1.6 – Data Isolation 🔜

**Status:** Geplant  
**Kategorie:** Multi-Tenancy Foundation (3/4)

### Ziel
Vollständige Datentrennung zwischen Mandanten.

### Features
- Separate Lovable Cloud / Supabase Instanz pro Mandant
- Keine geteilten Datenbanken
- Mandanten-spezifische Storage Buckets
- Isolierte Edge Functions

### Architektur
```
Mandant A                    Mandant B
    │                            │
    ▼                            ▼
┌─────────────────┐      ┌─────────────────┐
│ Lovable Cloud A │      │ Lovable Cloud B │
│ (Supabase)      │      │ (Supabase)      │
├─────────────────┤      ├─────────────────┤
│ • page_content  │      │ • page_content  │
│ • page_registry │      │ • page_registry │
│ • products      │      │ • products      │
│ • events        │      │ • events        │
│ • Storage       │      │ • Storage       │
└─────────────────┘      └─────────────────┘
```

### Vorteile
- Keine Risiko von Daten-Leaks
- Unabhängige Backups
- Individuelle Skalierung
- Compliance-konform (DSGVO)

---

## v1.7 – Tenant Onboarding Pipeline 🔜

**Status:** Geplant  
**Kategorie:** Multi-Tenancy Foundation (4/4)

### Ziel
Automatisierte Einrichtung neuer Mandanten in <30 Minuten.

### ⚠️ WICHTIGE UNTERSCHEIDUNG

| CI/CD Pipeline (existiert bereits) | Tenant Onboarding Pipeline (v1.7) |
|-----------------------------------|-----------------------------------|
| GitHub → Server Deployment | Neuer Mandant → Produktionsbereit |
| Automatisch bei jedem Push | Einmalig pro neuem Kunden |
| Deployt Code-Änderungen | Erstellt komplette Infrastruktur |
| Static HTML Output | Neue Lovable Cloud Instanz |

### Workflow: Neuer Mandant

```
1. Template klonen
   └─► Lovable-Projekt aus CMS-Boilerplate erstellen
   
2. Lovable Cloud einrichten
   └─► Automatisch neue Supabase-Instanz provisionieren
   
3. Konfiguration anwenden
   └─► tenant.config.ts mit Branding/Settings befüllen
   
4. Initiale Datenstruktur
   └─► Seed-Migrations für Tabellen, Basis-Seiten
   
5. DNS/Domain (optional)
   └─► Subdomain-Routing oder Custom Domain
```

### Checkliste für Onboarding
- [ ] Template-Projekt klonen
- [ ] Lovable Cloud aktivieren
- [ ] tenant.config.ts anpassen
- [ ] Logo und Branding hochladen
- [ ] Admin-Benutzer anlegen
- [ ] Erste Seiten erstellen
- [ ] Domain konfigurieren
- [ ] Go-Live

### Geschätzter Zeitaufwand
| Schritt | Zeit |
|---------|------|
| Template klonen | 2 min |
| Cloud-Setup | 5 min |
| Konfiguration | 10 min |
| Branding | 10 min |
| Admin-Setup | 5 min |
| **Gesamt** | **~30 min** |

---

## v1.8 – Mautic Vision 🔜

**Status:** Geplant

### Ziel
Marketing Automation KPIs aus Mautic im CMS visualisieren.

### Features
- Dashboard für Mautic-Kampagnen-Performance
- Lead-Scoring Übersicht
- E-Mail-Öffnungsraten pro Seite/Segment
- Conversion-Tracking
- Contact Timeline Integration

### Geplante KPIs
- Page Views (korreliert mit CMS-Seiten)
- Form Submissions
- E-Mail Opens/Clicks
- Lead Score Entwicklung
- Campaign Performance

### Technische Integration
```typescript
// Mautic API → Edge Function → CMS Dashboard
supabase.functions.invoke('mautic-kpi-sync', {
  body: { 
    metrics: ['pageviews', 'forms', 'emails'],
    dateRange: 'last_30_days'
  }
});
```

---

## v2.0 – Plugin-Architektur 🔮

**Status:** Zukunftsvision

### Ziel
Modulare Erweiterbarkeit ohne Core-Änderungen.

### Features
- Dynamisches Segment-Registrierungssystem
- Plugin-Interface für neue Segment-Typen
- Hot-Loading von Custom Segments
- Plugin Marketplace (langfristig)

### Plugin-Interface
```typescript
interface SegmentPlugin {
  id: string;
  name: string;
  version: string;
  
  // Komponenten
  Editor: React.FC<EditorProps>;
  Frontend: React.FC<FrontendProps>;
  
  // Schema
  defaultContent: Record<string, any>;
  
  // Lifecycle
  onInstall?: () => void;
  onUninstall?: () => void;
}
```

### Vorteile
- Mandanten-spezifische Segmente ohne Fork
- Community-Erweiterungen
- Saubere Trennung Core vs. Extensions
- Einfachere Wartung

---

## Änderungshistorie

| Datum | Version | Änderung |
|-------|---------|----------|
| 2026-01-01 | 1.0 | Initiales Roadmap-Protokoll erstellt |
| 2026-01-01 | 1.0 | v1.7 umbenannt: "Deployment Pipeline" → "Tenant Onboarding Pipeline" |
| 2026-01-01 | 1.0 | Multi-Tenancy auf v1.4–v1.7 aufgeteilt |
| 2026-01-01 | 1.0 | v1.8 "Mautic Vision" hinzugefügt |

---

## Hinweise

### Für Admins
Die Roadmap ist nur für Admins im Admin Dashboard sichtbar. Editoren sehen nur die bestehenden Features bis v1.0.

### Unterscheidung CI/CD vs. Tenant Onboarding
Die bestehende GitHub → Server Pipeline (CI/CD) ist **nicht** identisch mit der Tenant Onboarding Pipeline (v1.7). CI/CD deployt Code-Änderungen, Tenant Onboarding erstellt neue Mandanten-Infrastruktur.
