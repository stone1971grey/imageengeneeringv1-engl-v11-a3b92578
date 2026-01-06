# Navigation Refactoring - TODO Liste

> **Erstellt:** 2026-01-06  
> **Status:** In Arbeit  
> **Priorität:** Mittel (Backend ist bereit, Frontend nutzt noch statische Daten)

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

## 🔜 Nächste Schritte

### Phase 1: Hauptnavigation umstellen (Empfohlen als nächstes)
- [ ] Navigation.tsx: `SimpleDropdown` Trigger-Labels aus DB laden statt aus `t.nav.*`
- [ ] Navigation.tsx: Top-Level Menüpunkte dynamisch aus `useDynamicNavigation` rendern
- [ ] Test: Überprüfen, dass Übersetzungen in allen Sprachen korrekt angezeigt werden

### Phase 2: Flyout-Menüs dynamisch machen
- [ ] Industries-Flyout: Links aus `page_registry` statt hardcoded
- [ ] Products-Flyout: Links aus `page_registry` statt hardcoded
- [ ] Test Services-Flyout: Links aus `page_registry` statt hardcoded
- [ ] Entfernen der statischen `industrySlugMap`, `productSlugMap` etc.

### Phase 3: Übersetzungsdateien ablösen
- [ ] `navigationData.ts` (EN) - Daten in DB migrieren
- [ ] `navigationData.de.ts` - Daten in DB migrieren
- [ ] `navigationData.ja.ts` - Daten in DB migrieren
- [ ] `navigationData.ko.ts` - Daten in DB migrieren
- [ ] `navigationData.zh.ts` - Daten in DB migrieren
- [ ] `useNavigationData` Hook: Fallback auf statische Daten entfernen

### Phase 4: Admin-UI für Navigation
- [ ] Dashboard-Seite zum Verwalten der Navigation erstellen
- [ ] Drag & Drop für Reihenfolge (`nav_position`)
- [ ] Toggle für Sichtbarkeit (`nav_visible`)
- [ ] Inline-Editing für Titel-Übersetzungen
- [ ] Kategorie-Wechsel (main/footer/utility)

## 📝 Hinweise für Redakteure

**Aktueller Stand:**
Die Datenbank ist vorbereitet und enthält bereits die Navigationsdaten. Die Frontend-Navigation zeigt aber noch die alten statischen Übersetzungen an.

**Was funktioniert bereits:**
- Änderungen an `flyout_image_url` und `flyout_description_translations` werden im Frontend angezeigt
- Änderungen an `design_icon` werden im Frontend angezeigt
- Änderungen an `cta_group`, `cta_label`, `cta_icon` werden angezeigt

**Was noch nicht funktioniert:**
- Änderungen an `title_translations` werden noch NICHT im Hauptmenü angezeigt
- Änderungen an `nav_visible` haben noch keine Wirkung
- Änderungen an `nav_position` haben noch keine Wirkung

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
