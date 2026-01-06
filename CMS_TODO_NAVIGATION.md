# Navigation Refactoring - TODO Liste

> **Erstellt:** 2026-01-06  
> **Status:** ✅ Desktop Navigation vollständig dynamisch  
> **Priorität:** Niedrig (Kernfunktionalität implementiert)

## ✅ Bereits erledigt

### Datenbank-Schema
- [x] `title_translations` Spalte zu `page_registry` hinzugefügt (JSONB)
- [x] `nav_category` Spalte hinzugefügt (main/footer/utility)
- [x] `nav_visible` Spalte hinzugefügt (boolean)
- [x] `nav_position` Spalte hinzugefügt (integer)
- [x] Daten für Hauptnavigation befüllt (products, test-services, training-events, info-hub, company)
- [x] Daten für Unterseiten befüllt (industries/*, products/*)

### Hooks
- [x] `useDynamicNavigation` Hook erstellt (lädt komplette Navigationsstruktur aus DB)
- [x] `useNavigationChildren` Hook erstellt (lädt Kinder einer Seite)
- [x] `usePageTitles` Hook erstellt (lädt lokalisierte Seitentitel)

### Desktop Navigation (Navigation.tsx)
- [x] `usePageTitles` Hook importiert und integriert
- [x] `getNavTitle` Helper-Funktion erstellt (DB mit Fallback auf statische Übersetzungen)
- [x] Alle 6 Top-Level Dropdown-Trigger dynamisch: industries, products, test-services, training-events, info-hub, company
- [x] Industries-Flyout: 8 Untermenü-Links dynamisch
- [x] Products-Flyout: 5 Untermenü-Links dynamisch

## 🔜 Optionale Verbesserungen (Follow-up)

### Mobile Navigation
- [ ] AccordionTrigger-Labels auf `getNavTitle` umstellen
- [ ] Untermenü-Links in Accordions dynamisch machen

### Weitere Flyouts
- [ ] Test Services-Flyout: Links dynamisch machen
- [ ] Training & Events-Flyout: Links dynamisch machen
- [ ] Info Hub-Flyout: Links dynamisch machen
- [ ] Company-Flyout: Links dynamisch machen

## 📝 Hinweise für Redakteure

**Aktueller Stand: ✅ Desktop Navigation ist dynamisch!**

**Was jetzt funktioniert:**
- ✅ Änderungen an `title_translations` werden in der **Desktop-Navigation** angezeigt
  - Top-Level Menüs (Industries, Products, Test Services, etc.)
  - Industries-Untermenü (Automotive, Security, Mobile Phone, etc.)
  - Products-Untermenü (Test Charts, Illumination, etc.)
- ✅ Änderungen an `flyout_image_url` und `flyout_description_translations`
- ✅ Änderungen an `design_icon`
- ✅ Änderungen an `cta_group`, `cta_label`, `cta_icon`

**Was noch nicht dynamisch ist (Follow-up):**
- Mobile Navigation (Accordion-Menüs)
- `nav_visible` und `nav_position` für Sichtbarkeit/Reihenfolge

## 🏗️ Architektur-Entscheidungen

### Warum Database-First (Ansatz A)?
1. **Multi-Tenancy:** Gleicher Code, unterschiedliche Datenbanken pro Mandant
2. **Editor-Autonomie:** Redakteure können Struktur ändern ohne Deployment
3. **Slug-Propagation:** Änderungen am parent_slug vererben sich automatisch
4. **Keine Übersetzungsdateien:** Alles in einer Tabelle, einfacher zu pflegen

### Datenstruktur
```sql
page_registry:
  - page_slug (PK): z.B. "products/test-charts"
  - parent_slug: z.B. "products"
  - title_translations: {"de": "Testcharts", "en": "Test Charts", ...}
  - nav_category: "main" | "footer" | "utility"
  - nav_visible: true/false
  - nav_position: 1, 2, 3, ...
```

### Hook-Hierarchie
```
useDynamicNavigation
├── Lädt komplette Struktur
├── Baut Hierarchie aus flat records
└── Kategorisiert nach nav_category

useNavigationChildren(parentSlug)
├── Lädt nur Kinder eines Elternelements
└── Für Flyout-Menüs optimiert

usePageTitles
├── Lädt nur Titel
└── Für einfache Titel-Lookups
```

---

*Letzte Aktualisierung: 2026-01-06*
