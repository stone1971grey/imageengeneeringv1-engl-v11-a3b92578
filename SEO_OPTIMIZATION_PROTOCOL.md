# SEO Optimization Protocol

## Datum: 2025-12-27

## Kontext
Bei der Entwicklung des "Refine Content with AI" Dialogs wurden verschiedene AI Enhancement-Optionen evaluiert. Da bereits eine separate SEO-Suite existiert, wurde entschieden, SEO-bezogene Funktionen nicht im Refine-Dialog zu duplizieren, sondern für die SEO-Suite vorzumerken.

---

## Aktuelle AI Enhancements im Refine Dialog

1. **Suggest New Segments** - AI schlägt neue Content-Segmente basierend auf Seitenkontext vor
2. **Expand Existing Texts** - Bestehende Texte werden durch AI erweitert und verbessert
3. **Generate FAQs** - AI generiert FAQ-Segmente basierend auf Seiteninhalt

---

## Vorschläge für SEO-Suite Erweiterungen

### 1. Optimize SEO (ursprünglich für Refine Dialog geplant)
- **Beschreibung:** AI analysiert Seiteninhalte und optimiert für Suchmaschinen
- **Features:**
  - Keyword-Dichte-Analyse
  - Meta-Description-Optimierung
  - Heading-Struktur-Verbesserung
  - Alt-Text-Vorschläge
- **Priorität:** Hoch
- **Status:** Für SEO-Suite vorgemerkt

### 2. Generate Alt Texts
- **Beschreibung:** AI generiert automatisch SEO-optimierte Alt-Texte für alle Bilder auf einer Seite
- **Features:**
  - Bildanalyse mittels Vision-Modellen
  - Keyword-Integration in Alt-Texte
  - Mehrsprachige Alt-Text-Generierung
  - Batch-Verarbeitung für alle Seitenbilder
- **Priorität:** Mittel
- **Status:** Vorschlag

### 3. Translate Content
- **Beschreibung:** Automatische Übersetzung von Seiteninhalten in andere Sprachen
- **Features:**
  - Kontextbewusste Übersetzung
  - SEO-relevante Begriffe werden beibehalten
  - Glossar-Integration für konsistente Terminologie
  - Batch-Übersetzung ganzer Seiten
- **Priorität:** Mittel
- **Status:** Vorschlag

### 4. Improve Readability
- **Beschreibung:** AI verbessert die Lesbarkeit von Texten für besseres User Engagement (indirekter SEO-Faktor)
- **Features:**
  - Flesch-Reading-Score-Optimierung
  - Satzstruktur-Vereinfachung
  - Absatz-Formatierung
  - Aktive Sprache fördern
- **Priorität:** Niedrig
- **Status:** Vorschlag

### 5. Suggest Internal Links
- **Beschreibung:** AI analysiert Inhalte und schlägt relevante interne Verlinkungen vor
- **Features:**
  - Semantische Analyse des Contents
  - Matching mit existierenden Seiten
  - Link-Anchor-Text-Vorschläge
  - Vermeidung von Link-Kannibalisierung
- **Priorität:** Hoch
- **Status:** Vorschlag (bereits als Edge Function `suggest-content-links` vorhanden)

### 6. Generate Summary / Meta Description
- **Beschreibung:** AI erstellt prägnante Zusammenfassungen für Meta-Descriptions
- **Features:**
  - Automatische Keyword-Integration
  - Zeichenlimit-Optimierung (160 Zeichen)
  - Call-to-Action-Integration
  - A/B-Test-Varianten
- **Priorität:** Hoch
- **Status:** Teilweise implementiert (generate-seo-description Edge Function)

---

## Bestehende SEO Edge Functions

| Function | Status | Beschreibung |
|----------|--------|--------------|
| `generate-seo-description` | ✅ Aktiv | Generiert SEO Meta-Descriptions |
| `generate-seo-title` | ✅ Aktiv | Generiert SEO-optimierte Titel |
| `generate-focus-keyword` | ✅ Aktiv | Schlägt Focus Keywords vor |
| `generate-h1-headline` | ✅ Aktiv | Generiert H1-Überschriften |
| `suggest-content-links` | ✅ Aktiv | Schlägt interne Links vor |
| `generate-internal-links` | ✅ Aktiv | Generiert interne Verlinkungen |
| `generate-external-links` | ✅ Aktiv | Generiert externe Verlinkungen zu neutralen Quellen |

---

## ⚠️ KRITISCHE SICHERHEITSREGEL: Externe Links

### Verbotene Ziele für externe Links

**NIEMALS** dürfen externe Links auf folgende Seiten verweisen:

1. **Wettbewerber/Marktbegleiter**
   - Keine Links zu Unternehmen, die ähnliche Produkte oder Dienstleistungen anbieten
   - Keine Links zu Kameratestgeräte-Herstellern
   - Keine Links zu Bildqualitätstestunternehmen
   - Keine Links zu optischen Messgeräteanbietern
   - Keine Links zu Testchartherstellern

2. **Kommerzielle Alternativanbieter**
   - Keine Links zu E-Commerce-Plattformen (Amazon, eBay, Alibaba)
   - Keine Links zu Produktseiten anderer Anbieter
   - Keine Links zu Unternehmensblogs von Mitbewerbern

3. **Blockierte Domains (Beispiele)**
   - imatest.com, dxomark.com, basler.com, flir.com
   - teledyne.com, ximea.com, stemmer-imaging.com
   - edmund.com, thorlabs.com, radiantvision.com

### Erlaubte Quellen für externe Links

**NUR** folgende Quelltypen sind zulässig:

1. **Akademisch/Forschung**
   - Universitäten (.edu Domains)
   - Forschungseinrichtungen
   - Wissenschaftliche Journale (ieee.org, acm.org)

2. **Standards-Organisationen**
   - ISO, IEC, DIN, NIST
   - Offizielle Normungsgremien

3. **Wissensdatenbanken**
   - Wikipedia, Scholarpedia
   - Bildungsbezogene .edu-Seiten

4. **Regierungs-/Institutionsseiten**
   - .gov Domains
   - Nationale Institute

5. **Technische Dokumentation**
   - W3C Spezifikationen
   - IETF RFCs
   - Open-Source-Dokumentation

### Implementierung

Die Sicherheitsregel ist in der Edge Function `generate-external-links` implementiert:
- AI-Prompt enthält explizite Ausschlussliste
- Validierung blockiert bekannte kommerzielle Domains
- Niedrige Temperatur (0.3) für konservative Vorschläge
- Maximum 3 Vorschläge pro Seite

---

## Empfehlungen für nächste Schritte

1. **Kurzfristig:** "Generate Alt Texts" in SEO-Suite integrieren
2. **Mittelfristig:** "Suggest Internal Links" UI in SEO-Suite einbauen (Backend existiert)
3. **Langfristig:** "Translate Content" als eigenständiges Feature entwickeln

---

## Notizen

- Vermeidung von Feature-Kannibalisierung zwischen Refine Dialog und SEO-Suite
- SEO-Suite sollte als zentraler Ort für alle SEO-bezogenen AI-Features dienen
- Refine Dialog fokussiert auf Content-Erstellung und -Erweiterung
- **KRITISCH:** Externe Links dürfen niemals auf Wettbewerber oder kommerzielle Alternativanbieter verweisen
