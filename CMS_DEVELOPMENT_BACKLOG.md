# CMS Development Backlog & Optimierungsprotokoll

**Erstellt:** 2025-12-19  
**Status:** Analyse abgeschlossen  
**Projekt:** Image Engineering CMS

---

## Übersicht

Dieses Dokument dokumentiert die technische Analyse des CMS-Systems und identifiziert Optimierungspotenziale für zukünftige Entwicklung.

---

## 1. AdminDashboard.tsx - Monolithische Struktur

### Problem
Die Datei `AdminDashboard.tsx` enthält ~5000+ Zeilen Code mit:
- Sämtliche Editor-Logik
- State-Management für alle Segment-Typen
- UI-Rendering für Admin-Oberfläche
- Authentifizierung und Autorisierung

### Aktuelle Struktur
```
AdminDashboard.tsx (Monolith)
├── Auth-Logik
├── State-Management (useState, useEffect)
├── CRUD-Operationen für alle Entities
├── Editor-Rendering (switch/case)
├── Segment-Management
└── UI-Komponenten
```

### Ziel-Struktur (Modularisiert)
```
AdminDashboard.tsx (nur Router/Layout)
├── hooks/
│   ├── useAdminAuth.ts
│   ├── useSegmentCRUD.ts
│   ├── usePageContent.ts
│   └── useAdminState.ts
├── editors/
│   ├── ActionHeroEditor.tsx ✓ (bereits extrahiert)
│   ├── IntroEditor.tsx ✓
│   ├── FAQEditor.tsx ✓
│   └── ... (weitere Editoren)
└── components/
    ├── AdminSidebar.tsx
    ├── EditorPanel.tsx
    └── SegmentList.tsx
```

### Aufwandsschätzung
| Schritt | Aufwand | Risiko |
|---------|---------|--------|
| Editors extrahieren (teilweise done) | Medium | Niedrig |
| Shared Hooks erstellen | Medium | Niedrig |
| State-Management entkoppeln | Hoch | Mittel |
| AdminDashboard auf Router reduzieren | Hoch | Hoch |
| **Gesamt** | **15-25 Iterationen** | |

---

## 2. Hardcodierte Segment-Typen

### Problem
Neue Segment-Typen erfordern Änderungen in mehreren Dateien:
- `AdminDashboard.tsx` - Switch-Case für Editor
- `DynamicCMSPage.tsx` - Switch-Case für Renderer
- `CreateCMSPageDialog.tsx` - Dropdown-Optionen
- Neue `*Editor.tsx` Datei erstellen

### Aktuelle Implementierung
```typescript
// AdminDashboard.tsx - Hardcodiert
switch (segment.segment_type) {
  case 'action_hero': return <ActionHeroEditor {...props} />;
  case 'intro': return <IntroEditor {...props} />;
  case 'faq': return <FAQEditor {...props} />;
  // ... 15+ weitere Cases
}
```

### Lösungsvorschlag: Plugin-Registry

```typescript
// lib/segmentPlugins.ts
export interface SegmentPlugin {
  type: string;
  label: string;
  icon: LucideIcon;
  editor: React.ComponentType<EditorProps>;
  renderer: React.ComponentType<RendererProps>;
  defaultContent: Record<string, unknown>;
  contentSchema?: ZodSchema;
}

export const segmentPlugins: Record<string, SegmentPlugin> = {
  action_hero: {
    type: 'action_hero',
    label: 'Action Hero',
    icon: Layout,
    editor: ActionHeroEditor,
    renderer: ActionHeroSegment,
    defaultContent: { title: '', subtitle: '' }
  },
  // ... weitere Plugins
};
```

### Vorteile
- Neue Segmente: 1 Datei erstellen + Registry-Eintrag
- Zentrale Konfiguration
- Einfachere Tests
- Potenzial für DB-basierte Plugin-Definition

### Aufwandsschätzung
| Schritt | Aufwand | Risiko |
|---------|---------|--------|
| Plugin-Registry erstellen | 2-3 Iterationen | Niedrig |
| Admin-Dashboard umstellen | 3-4 Iterationen | Mittel |
| DynamicCMSPage umstellen | 2-3 Iterationen | Mittel |
| CreateDialog umstellen | 1-2 Iterationen | Niedrig |
| **Gesamt** | **8-12 Iterationen** | |

---

## 3. Projektspezifische Business-Logik

### Problem
Bestimmte Funktionalitäten sind spezifisch für Image Engineering:

#### Events-System
- Felder: `automotive_interests`, `current_test_systems`
- Mautic-Integration für Marketing-Automation
- Spezifische Registrierungsformulare

#### Downloads-System
- Kategorien: Whitepaper, Datenblätter, Software
- Gated Content Workflow mit E-Mail-Bestätigung
- Mautic-Tagging für Lead-Scoring

#### Produkte-System
- Felder: `chart_sizes`, `measurement_focus`, `format_fov`
- Branchenspezifische Kategorisierung
- Technische Spezifikationen-Schema

### Aktueller Workflow (Beispiel: Download)
```
1. User füllt Formular aus
2. Daten → download_requests Tabelle
3. Edge Function: send-download-email
4. Mautic-Kontakt erstellen/taggen
5. E-Mail mit Download-Link senden
6. Tracking in Supabase
```

### Generalisierungsansatz

```typescript
// Theoretisches Content-Type-System
interface ContentTypeDefinition {
  id: string;
  name: string;
  table_name: string;
  custom_fields: FieldSchema[];
  workflow_hooks: {
    onCreate?: string;    // Edge Function Name
    onUpdate?: string;
    onDelete?: string;
  };
  ui_config: {
    listColumns: string[];
    filterFields: string[];
    searchFields: string[];
  };
}
```

### Empfehlung
**Nicht vollständig generalisieren!**

- Aufwand: ~40-60 Iterationen (fast Neuentwicklung)
- Risiko: Hoch (komplexe Migration)
- ROI: Fragwürdig für einzelnes Projekt

**Stattdessen:**
1. CMS-Kern als Template dokumentieren
2. Bei neuem Projekt: Template kopieren
3. Business-Logik projektspezifisch neu aufbauen

---

## 4. Priorisierte Roadmap

### Phase 1: Quick Wins (Niedrig-hängend)
- [ ] Plugin-Registry für Segment-Typen erstellen
- [ ] `useAdminAuth` Hook extrahieren
- [ ] Dokumentation des CMS-Kerns

### Phase 2: Modularisierung (Medium)
- [ ] Weitere Hooks extrahieren
- [ ] AdminDashboard State aufteilen
- [ ] Editor-Komponenten standardisieren

### Phase 3: Architektur (Langfristig)
- [ ] AdminDashboard als reiner Router
- [ ] Vollständige Plugin-Architektur
- [ ] CMS-Template für neue Projekte

---

## 5. Bestehende Stärken

Das CMS hat bereits gute Ansätze:
- ✅ Editoren teilweise in separate Dateien extrahiert
- ✅ Segment-Registry in Datenbank
- ✅ Mehrsprachigkeit implementiert
- ✅ Autosave-Hook vorhanden (`useAdminAutosave`)
- ✅ RLS-Policies für Sicherheit
- ✅ Hierarchische Seitenstruktur

---

## Anhang: Betroffene Dateien

### Kern-Dateien
- `src/pages/AdminDashboard.tsx` (~5000+ Zeilen)
- `src/pages/DynamicCMSPage.tsx`
- `src/components/admin/CreateCMSPageDialog.tsx`

### Editor-Komponenten
- `src/components/admin/*Editor.tsx` (20+ Dateien)

### Segment-Renderer
- `src/components/segments/*.tsx` (15+ Dateien)

### Hooks
- `src/hooks/useAdminAutosave.ts`
- `src/hooks/useNavigationData.ts`
- `src/hooks/useEditorLanguageAccess.ts`

---

*Dieses Dokument dient als Referenz für zukünftige Entwicklungsentscheidungen.*
