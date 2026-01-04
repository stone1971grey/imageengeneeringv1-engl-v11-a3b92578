# Enterprise SEO Feature Roadmap

## Version 2.0 – Dynamische SISTRIX-Integration

Status: **In Planung** | Letzte Aktualisierung: 2026-01-04

---

## 🎯 Priorität 1: Sichtbarkeitsindex-Tracker (SI Widget)

**Status:** Geplant für v2.0

### Beschreibung
Tägliches Tracking des SISTRIX Sichtbarkeitsindex mit visueller Trend-Darstellung im Enterprise SEO Dashboard.

### Technische Umsetzung

| Komponente | Beschreibung |
|------------|--------------|
| **API-Endpoint** | `domain.visibilityindex` |
| **Datenbank** | Neue Tabelle `sistrix_visibility_history` |
| **Cronjob** | Täglich um 06:00 UTC via pg_cron |
| **Credits** | 1 Credit/Tag = ~30/Monat |

### Features
- 📈 Interaktives Liniendiagramm (Recharts)
- 📅 Zeitraumfilter: 7 / 30 / 90 / 365 Tage
- 🔔 Alert bei signifikanter Änderung (>5% Abweichung)
- 📊 Trend-Indikator mit %-Änderung
- 🏷️ Annotationen für wichtige Events (z.B. Relaunch-Datum)

### Integration
- Enterprise SEO Dashboard → Neuer Tab "Visibility Index"
- Optional: Mini-Widget in Admin Dashboard Startseite

### Aufwand
- Geschätzt: **3-4 Stunden**
- Komplexität: Mittel

---

## 🎯 Priorität 2: Automatische Keyword-Position-Updates

**Status:** Implementiert (pausiert)

### Beschreibung
Wöchentlicher Cronjob synchronisiert Keyword-Positionen aus SISTRIX in `relaunch_url_mappings`.

### Technische Umsetzung
- Edge Function: `sistrix-cron-snapshot` ✅
- Cronjob: `sistrix-weekly-snapshot` (derzeit pausiert)
- Deduplizierung nach `domain|old_url|focus_keyword|country`

### Reaktivierung
Kann jederzeit über pg_cron reaktiviert werden.

---

## 🎯 Priorität 3: Keyword-Trend-Vergleich

**Status:** Geplant

### Beschreibung
Vergleich der Keyword-Positionen über Zeit mit visuellem Trend-Indikator.

### Datenquellen
- Aktuelle Position aus `relaunch_url_mappings`
- Historische Snapshots mit `snapshot_date`

### Features
- ↗️ Grüner Pfeil: Verbesserung
- ↘️ Roter Pfeil: Verschlechterung  
- ➡️ Grauer Pfeil: Keine Änderung
- Tooltip: "Pos. 12 → 8 (+4 Plätze)"

---

## 📋 Weitere geplante Features (v2.5+)

### Competitor Keywords / Content Gap Analysis
- **API:** `domain.competitors.seo`
- **Beschreibung:** Keywords, für die Wettbewerber ranken, wir aber nicht
- **Integration:** SEO Editor → Tab "Competitor Analysis"

### Keyword Potential Score
- **Datenquellen:** Search Volume, CPC, Position, Competition
- **Beschreibung:** Kombinierter "Opportunity Score"
- **Integration:** FKW Suggestions mit Score-Anzeige

### Related Keywords / Semantische Erweiterung
- **API:** `keyword.seo`
- **Beschreibung:** Semantisch verwandte Keywords
- **Integration:** FKW Generator Enhancement

### Kannibalisierungs-Check
- **Beschreibung:** Warnung bei mehreren Seiten für gleiches Keyword
- **Integration:** Health Check + Dashboard Alert

---

## ✅ Bereits implementiert

- [x] SISTRIX Keyword-Empfehlung bei Redirects (primär + sekundär)
- [x] Relaunch Dashboard mit URL-Mapping & Approval-Workflow
- [x] Wöchentliche Snapshot-Synchronisation (Edge Function)
- [x] Priority-Score mit Stern-Visualisierung
- [x] Intent-Badges (T/C/N/I) mit Tooltips
- [x] Klickbare Dashboard-Stats als Filter
- [x] SEO-Editor Direktlink aus Relaunch Dashboard
- [x] AI Overview Detection (has_ai_overview)
- [x] Sekundäre Keywords mit H2/H3-Empfehlung

---

## Design-Prinzipien

- **Smart:** KI-gestützte Empfehlungen, automatische Datensammlung
- **Simple:** Ein-Klick-Übernahme, klare Visualisierung
- **Scalable:** Funktioniert für 10 oder 10.000 Seiten
- **Scheduled:** Automatische Updates ohne manuellen Aufwand

---

## API-Kosten-Übersicht

| Feature | Intervall | Credits/Monat |
|---------|-----------|---------------|
| Sichtbarkeitsindex | Täglich | ~30 |
| Keyword-Positionen | Wöchentlich | Variabel (1/Keyword) |
| Keyword-Metriken | Wöchentlich | Variabel (5/Keyword) |

---

## Nächste Schritte

1. ✅ Sekundäre Keywords Feature implementiert
2. ⏳ Sichtbarkeitsindex-Widget entwickeln
3. ⏳ Cronjob für tägliche SI-Abfrage einrichten
4. ⏳ Keyword-Trend-Visualisierung im Relaunch Dashboard
