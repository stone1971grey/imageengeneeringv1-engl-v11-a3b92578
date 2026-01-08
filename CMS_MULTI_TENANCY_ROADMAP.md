# CMS Multi-Tenancy Roadmap

**Version:** Draft 2.0  
**Erstellt:** 2026-01-01  
**Aktualisiert:** 2026-01-06  
**Ziel:** Lovable CMS als mandantenfähige Lösung für externe Lovable-Projekte

---

## Executive Summary

Dieses Dokument beschreibt die technische Roadmap, um das aktuelle CMS (v1.0) in eine mandantenfähige Lösung zu transformieren, die für andere Lovable-Projekte ausrollbar ist.

**Status Update (2026-01-06):** Database-First Navigation implementiert.

---

## 0. Database-First Navigation (IMPLEMENTIERT ✅)

### Architektur-Entscheidung

Wir haben uns für **Ansatz A (Database-First)** entschieden, um maximale Flexibilität für Multi-Tenancy zu gewährleisten.

### Kernprinzipien

1. **`page_registry` ist die einzige Wahrheitsquelle** für Navigation
2. **Keine statischen Übersetzungsdateien** für Navigation (navigationData.ts wird obsolet)
3. **Hierarchie via `parent_slug`** - Slug-Änderungen propagieren automatisch
4. **Mehrsprachige Titel via `title_translations` JSONB**

### Neue Schema-Spalten in `page_registry`

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `title_translations` | jsonb | Mehrsprachige Titel: `{"de": "Industrien", "ja": "産業"}` |
| `nav_category` | text | Navigation-Zugehörigkeit: 'main', 'footer', 'utility', 'none' |
| `nav_visible` | boolean | Sichtbar in Navigation? |
| `nav_position` | integer | Sortierung innerhalb Navigation |

### Neuer Hook: `useDynamicNavigation`

```typescript
import { useDynamicNavigation } from '@/hooks/useDynamicNavigation';

function Navigation() {
  const { navigation, getTitle, getPath, isLoading } = useDynamicNavigation();
  
  return (
    <nav>
      {navigation.mainNav.map(page => (
        <Link to={getPath(page)} key={page.slug}>
          {getTitle(page)}
          {page.children?.map(child => (
            <Link to={getPath(child)}>{getTitle(child)}</Link>
          ))}
        </Link>
      ))}
    </nav>
  );
}
```

### Vorteile für Multi-Tenancy

- **Gleicher Code, verschiedene Datenbanken** - keine Code-Anpassungen pro Mandant
- **Redakteurs-Autonomie** - Struktur ändern ohne Deployment
- **Automatische Slug-Vererbung** - Parent-Slug-Änderungen propagieren zu Kindern
- **Kein Hardcoding** - Kategorien, Icons, Beschreibungen alle in DB

### Migration bestehender Daten

Titel-Übersetzungen wurden für alle Haupt-Navigationspunkte in `title_translations` hinterlegt:
- Top-Level: industries, products, test-lab, training-events, info-hub, company
- Sub-Level: Alle Industry-Pages, Product-Categories, etc.

---

## 1. Template-/Boilerplate-System

### Ziel
CMS als reproduzierbare Vorlage, die per Remix oder GitHub-Clone für neue Mandanten instanziiert werden kann.

### Anforderungen

| Komponente | Beschreibung | Priorität |
|------------|--------------|-----------|
| **Core Package** | Separierung von CMS-Core vs. kundenspezifischem Content | Hoch |
| **Clean Slate Setup** | Leere Datenbank-Struktur ohne Demo-Content | Hoch |
| **Setup Wizard** | Initiale Konfiguration (Branding, Sprachen, Admin-User) | Mittel |
| **Dokumentation** | Schritt-für-Schritt-Anleitung für neue Instanzen | Hoch |

### Technische Umsetzung

```
cms-template/
├── src/                      # CMS Core (unverändert pro Mandant)
│   ├── components/
│   │   ├── admin/            # Admin Dashboard
│   │   ├── segments/         # Segment-Renderer
│   │   └── ui/               # Shadcn Components
│   └── pages/
├── supabase/
│   ├── migrations/           # Basis-Schema (leer, ohne Content)
│   └── functions/            # Edge Functions
├── config/
│   └── tenant.config.ts      # Mandanten-Konfiguration (nur Branding)
└── README.md                 # Setup-Anleitung
```

### Migrations-Strategie

1. **Basis-Migration** erstellen mit:
   - Alle Tabellen (page_registry, page_content, segment_registry, etc.)
   - RLS Policies
   - Funktionen (has_role, get_next_page_id, etc.)
   - **Navigation-Schema** (title_translations, nav_category, nav_visible, nav_position)
   - Leere Daten (keine Demo-Seiten)

2. **Optional: Starter-Content-Migration**
   - Beispiel-Seiten für schnellen Start
   - Kann übersprungen werden

---

## 2. Konfigurations-Layer

### Ziel
Tenant-spezifische Einstellungen ohne Code-Änderungen.

### Konfigurierbare Elemente

```typescript
// config/tenant.config.ts
export const tenantConfig = {
  // Branding
  branding: {
    name: "Kunde XYZ",
    logo: "/logo.png",
    primaryColor: "#f9dc24",
    favicon: "/favicon.ico"
  },
  
  // Sprachen
  languages: {
    available: ["en", "de"],
    default: "en",
    fallback: "en"
  },
  
  // Features
  features: {
    multiLanguage: true,
    frontendEditing: false,
    contentAutomation: false,
    seoSuite: true,
    newsManagement: true,
    eventsManagement: true,
    productManagement: false,
    downloadManagement: true
  },
  
  // Navigation
  navigation: {
    maxDepth: 3,
    showBreadcrumbs: true
  },
  
  // SEO
  seo: {
    defaultTitle: "Kunde XYZ",
    titleSeparator: " | ",
    defaultDescription: ""
  },
  
  // Integrations
  integrations: {
    mautic: false,
    analytics: null
  }
};
```

### Implementierung

1. **Config-Loader** erstellt, der `tenant.config.ts` beim Start lädt
2. **Context Provider** für globalen Zugriff auf Config
3. **Conditional Rendering** für Feature-Flags
4. **Dynamisches Theming** basierend auf Branding-Config

---

## 3. Daten-Isolation

### Ziel
Vollständige Trennung der Mandanten-Daten.

### Strategie: Separate Supabase-Projekte

| Aspekt | Beschreibung |
|--------|--------------|
| **Isolation** | Jeder Mandant = eigenes Supabase-Projekt |
| **Sicherheit** | Keine Möglichkeit für Cross-Tenant-Zugriff |
| **Skalierung** | Unabhängige Ressourcen pro Mandant |
| **Kosten** | Pro Mandant (Supabase Free/Pro Plan) |

### Alternative: Schema-Level-Isolation (nicht empfohlen)

Theoretisch möglich mit PostgreSQL-Schemas, aber:
- Komplexere RLS-Policies
- Höheres Fehlerrisiko
- Lovable Cloud unterstützt keine Custom-Schemas

### Empfehlung

**Separate Projekte** – jeder Mandant hat:
- Eigenes Lovable-Projekt (Remix vom Template)
- Eigene Supabase-Instanz (via Lovable Cloud)
- Eigene Domain/Subdomain
- Eigene Admin-User

---

## 4. Deployment-Pipeline

### Ziel
Automatisiertes/semi-automatisiertes Setup neuer Mandanten-Instanzen.

### Workflow: Neuer Mandant

```
┌─────────────────────────────────────────────────────────────┐
│  1. PROJEKT ERSTELLEN                                       │
│     - Lovable Remix vom CMS-Template                        │
│     - Automatisch: Neues Supabase-Projekt                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. KONFIGURATION                                           │
│     - tenant.config.ts anpassen                             │
│     - Logo/Branding hochladen                               │
│     - Sprachen aktivieren                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. DATENBANK-SETUP                                         │
│     - Migrations ausführen (automatisch via Lovable)        │
│     - Admin-User anlegen                                    │
│     - Optional: Starter-Content importieren                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  4. SECRETS KONFIGURIEREN                                   │
│     - MAUTIC_* (falls Integration)                          │
│     - RESEND_API_KEY (für E-Mails)                          │
│     - Weitere API-Keys nach Bedarf                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  5. DOMAIN/GO-LIVE                                          │
│     - Custom Domain verbinden                               │
│     - SSL automatisch via Lovable                           │
│     - Publish                                               │
└─────────────────────────────────────────────────────────────┘
```

### Zeitaufwand pro Mandant (geschätzt)

| Schritt | Dauer | Automatisierbar |
|---------|-------|-----------------|
| Projekt Remix | 2 min | ✅ Vollständig |
| Konfiguration | 15-30 min | ⚠️ Teilweise |
| Datenbank-Setup | 5 min | ✅ Vollständig |
| Secrets | 10 min | ❌ Manuell |
| Domain-Setup | 10-30 min | ⚠️ DNS-abhängig |
| **Gesamt** | **45-90 min** | - |

---

## 5. Plugin-Architektur (v2.0)

### Ziel
Kundenspezifische Segment-Typen ohne Core-Modifikation.

### Interface-Definition

```typescript
// plugins/types.ts
interface SegmentPlugin {
  type: string;                    // z.B. 'custom-gallery'
  code: string;                    // z.B. 'X'
  name: string;                    // z.B. 'Custom Gallery'
  icon: LucideIcon;
  color: string;
  
  // Komponenten
  Editor: React.ComponentType<EditorProps>;
  Renderer: React.ComponentType<RendererProps>;
  
  // Schema
  defaultData: () => Record<string, unknown>;
  validate?: (data: unknown) => boolean;
}
```

### Registration

```typescript
// plugins/index.ts
import { registerSegment } from '@/cms/plugin-system';
import { CustomGalleryPlugin } from './custom-gallery';

// Plugins registrieren
registerSegment(CustomGalleryPlugin);
```

### Vorteile für Mandantenfähigkeit

- Mandant A kann Plugin X haben, Mandant B nicht
- Core-Updates beeinflussen keine Custom-Plugins
- Plugins können pro Mandant aktiviert/deaktiviert werden

---

## Roadmap-Zeitleiste

```
Q1 2026
├── Template-Extraktion
│   ├── Core-Code identifizieren
│   ├── Demo-Content entfernen
│   └── Clean Slate Migration erstellen
│
├── Konfigurations-Layer
│   ├── tenant.config.ts Schema definieren
│   ├── Config-Loader implementieren
│   └── Feature-Flags einbauen
│
Q2 2026
├── Erster Pilot-Mandant
│   ├── Remix-Workflow testen
│   ├── Setup-Dokumentation
│   └── Feedback sammeln
│
├── Plugin-Architektur (Basis)
│   ├── Interface definieren
│   ├── Registration-System
│   └── DynamicSegmentRenderer refactoren
│
Q3 2026
├── Skalierung
│   ├── Weitere Mandanten onboarden
│   ├── Setup-Prozess optimieren
│   └── Support-Dokumentation
```

---

## Nächste Schritte

1. **Sofort:** 
   - Template-Extraktion starten
   - tenant.config.ts Schema definieren
   
2. **Kurzfristig (1-2 Wochen):**
   - Clean Slate Migration erstellen
   - Config-Loader implementieren
   
3. **Mittelfristig (1 Monat):**
   - Pilot-Mandant aufsetzen
   - Dokumentation vervollständigen

---

## Offene Fragen

- [ ] Lizenzmodell für Mandanten?
- [ ] Support-Level pro Mandant?
- [ ] Update-Strategie für bestehende Mandanten?
- [ ] Welche Features sind Core vs. Premium?

---

*Dokument erstellt als Grundlage für die Multi-Tenancy-Entwicklung.*
