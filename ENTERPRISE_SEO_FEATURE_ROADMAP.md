# Enterprise SEO Feature Roadmap

## SISTRIX API Integration Features (Priorität: Hoch)

Status: **Geplant** | Letzte Aktualisierung: 2026-01-03

---

### 1. Competitor Keywords / Content Gap Analysis
- **API:** `domain.competitors.seo`
- **Beschreibung:** Zeigt Keywords, für die Wettbewerber ranken, wir aber nicht
- **Nutzen:** Identifikation von Content-Lücken und neuen Themenfeldern
- **Integration:** SEO Editor → Neuer Tab "Competitor Analysis"

### 2. Keyword Potential Score
- **Datenquellen:** Search Volume, CPC, Current Position, Competition
- **Beschreibung:** Kombinierter "Opportunity Score" für Keyword-Priorisierung
- **Nutzen:** Datengestützte Entscheidung, welche Keywords zuerst optimiert werden
- **Integration:** SEO Editor → FKW Suggestions mit Score-Anzeige

### 3. Visibility Index Widget
- **API:** `domain.sichtbarkeitsindex`
- **Beschreibung:** SI-Trend-Chart im Dashboard mit Alerts bei signifikanten Änderungen
- **Nutzen:** Frühwarnsystem für Ranking-Verluste oder -Gewinne
- **Integration:** Admin Dashboard → Neues Widget "SEO Visibility"

### 4. Related Keywords / Semantische Erweiterung
- **API:** `keyword.seo`
- **Beschreibung:** Semantisch verwandte Keywords als Smart Suggestions
- **Nutzen:** Bessere Keyword-Abdeckung und Content-Tiefe
- **Integration:** SEO Editor → FKW Generator Enhancement

### 5. Bulk Keyword Import
- **Beschreibung:** Automatisches Mapping von SISTRIX-Rankings zu bestehenden Page Slugs
- **Nutzen:** Schnelle Übernahme aller relevanten Keywords für alle Seiten
- **Integration:** Enterprise SEO → Neues Tool "Bulk Import"

### 6. Kannibalisierungs-Check
- **Beschreibung:** Warnung wenn mehrere Seiten für dasselbe Keyword ranken
- **Nutzen:** Vermeidung von internem Wettbewerb und Ranking-Verlusten
- **Integration:** SEO Editor → Health Check Erweiterung + Dashboard Alert

---

## Bereits implementiert ✅

- [x] SISTRIX Keyword-Empfehlung bei Redirects (SEO Editor)
- [x] Relaunch Dashboard mit URL-Mapping
- [x] Wöchentliche Snapshot-Synchronisation

---

## Design-Prinzipien

- **Smart:** KI-gestützte Empfehlungen, keine manuelle Dateneingabe
- **Simple:** Ein-Klick-Übernahme, klare Visualisierung
- **Scalable:** Funktioniert für 10 oder 10.000 Seiten

---

## Nächste Schritte

1. Priorisierung der Features durch Stakeholder
2. API-Verfügbarkeit und Rate Limits prüfen
3. MVP für Top-Feature entwickeln
