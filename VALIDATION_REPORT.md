# CMS Validierungsbericht - Hierarchie & tab_order

## 🔴 KRITISCHE PROBLEME

### 1. Hierarchische Struktur-Fehler in page_registry

#### Falscher parent_slug:
- **Page 21 (iq-led)**: parent_slug="illumination" ❌ → sollte "illumination-devices" sein
- **Page 220 (ieee-p2020)**: parent_slug="standards" ❌ → Parent existiert nicht!

#### Flache slugs statt hierarchische:
Die folgenden Seiten haben flache page_slugs, obwohl sie hierarchisch sein sollten:

| Page ID | Aktueller Slug | Parent Slug | Sollte sein |
|---------|---------------|-------------|-------------|
| 9 | photography | your-solution | your-solution/photography |
| 10 | scanners-archiving | your-solution | your-solution/scanners-archiving |
| 11 | medical-endoscopy | your-solution | your-solution/medical-endoscopy |
| 12 | web-camera | your-solution | your-solution/web-camera |
| 13 | machine-vision | your-solution | your-solution/machine-vision |
| 14 | automotive | your-solution | your-solution/automotive |
| 15 | test-charts | products | products/test-charts |
| 16 | illumination-devices | products | products/illumination-devices |
| 17 | le7 | test-charts | products/test-charts/le7 |
| 18 | arcturus | illumination-devices | products/illumination-devices/arcturus |
| 19 | in-cabin-testing | automotive | your-solution/automotive/in-cabin-testing |
| 20 | mobile-phone | your-solution | your-solution/mobile-phone |
| 21 | iq-led | illumination | products/illumination-devices/iq-led |
| 221 | broadcast-video | your-solution | your-solution/broadcast-video |
| 222 | security-surveillance | your-solution | your-solution/security-surveillance |
| 223 | software | products | products/software |
| 224 | bundles-services | products | products/bundles-services |
| 225-228 | test charts | test-charts | products/test-charts/... |
| 229-231 | software products | software | products/software/... |
| 237-239 | automotive subcats | automotive | your-solution/automotive/... |
| 241-243 | broadcast subcats | broadcast-video | your-solution/broadcast-video/... |
| 244-246 | security subcats | security-surveillance | your-solution/security-surveillance/... |
| 247-249 | web-camera subcats | web-camera | your-solution/web-camera/... |

#### Verwaiste/falsche Slugs in page_content:
- **"mobile-phone-vcx-phonecam"** - sollte hierarchisch sein: "your-solution/mobile-phone/vcx-phonecam"
- **"color-calibration"** - sollte "your-solution/mobile-phone/color-calibration" sein
- **"isp-tuning"** - sollte "your-solution/mobile-phone/isp-tuning" sein
- **"timing-measurements"** - Parent unbekannt

### 2. tab_order Synchronisations-Probleme

#### Fehlende Footer in tab_order:
- **machine-vision**: hat footer segment (27) in segment_registry, aber tab_order=["27"] ✅
- **medical-endoscopy**: hat footer (22) in segment_registry, aber tab_order=["209"] ❌ footer fehlt!
- **mobile-phone**: hat footer (54), aber tab_order=[] ❌ footer fehlt!

#### Leere tab_order trotz Segmenten:
- **mobile-phone**: segment_registry hat footer (54), aber tab_order=[] und page_segments=[]

#### Inkorrekte Reihenfolge:
- **multispectral-illumination**: tab_order=["179", "178"], aber footer (178) sollte am Ende sein
- **scanner-dynamic-range**: tab_order=["182", "183"], beide Segmente in tab_order (full-hero + footer)

#### Segmente in page_segments aber nicht in tab_order:
- **mobile-phone/camera-stabilization**: tab_order=["212","213","214"], footer (211) fehlt! ❌

## 🟡 WEITERE INKONSISTENZEN

### segment_registry vs page_content Mismatches:
- Mehrere Seiten haben Segmente in page_segments, die nicht in segment_registry existieren
- Mehrere Seiten haben unterschiedliche page_slugs in segment_registry vs page_content

## ✅ EMPFOHLENE KORREKTUREN

### Sofortige Korrekturen erforderlich:

1. **Alle page_slugs hierarchisch machen** (Breaking Change - erfordert Route-Updates)
2. **tab_order für alle Seiten validieren und auto-korrigieren**
3. **Footer-Segmente in tab_order ergänzen**
4. **Verwaiste page_content Einträge mit falschen page_slugs bereinigen**
5. **parent_slug Korrekturen** (iq-led, ieee-p2020)

### Automatische Korrektur-SQL:

Bereit für Ausführung nach Bestätigung.
