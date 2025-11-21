# 🔴 ERINNERUNG: Kritische Hierarchie-Fixes noch ausstehend

## ✅ ERLEDIGT (heute):
- tab_order Synchronisation für alle 10 CMS-Seiten korrigiert
- Footer-Segmente in allen tab_orders ergänzt
- Segment-Key Formatierung korrigiert

---

## ⚠️ NOCH ZU TUN (Breaking Changes):

### 1. Hierarchische page_slugs für ~50 Seiten
**Problem:** Fast alle Seiten haben flache slugs statt hierarchische

**Beispiele:**
- `photography` → sollte `your-solution/photography` sein
- `automotive` → sollte `your-solution/automotive` sein  
- `le7` → sollte `products/test-charts/le7` sein
- `arcturus` → sollte `products/illumination-devices/arcturus` sein

**Betroffene Tabellen:**
- `page_registry` (page_slug Spalte)
- `segment_registry` (page_slug Spalte)
- `page_content` (page_slug Spalte)

**Impact:**
- 🔴 Breaking Change - erfordert Route-Updates in App.tsx
- 🔴 Navigation-Links müssen in allen 5 Sprachversionen aktualisiert werden
- 🔴 Admin-Dashboard Preview-URLs müssen aktualisiert werden

---

### 2. Verwaiste/falsche page_content Einträge bereinigen

**Fehlerhafte Slugs:**
- `mobile-phone-vcx-phonecam` → sollte `your-solution/mobile-phone/vcx-phonecam` sein
- `color-calibration` → sollte `your-solution/mobile-phone/color-calibration` sein
- `isp-tuning` → sollte `your-solution/mobile-phone/isp-tuning` sein
- `timing-measurements` → Parent unbekannt, muss geklärt werden

---

### 3. Falsche parent_slug Werte korrigieren

**Fehler in page_registry:**
- **Page 21 (iq-led)**: parent_slug="illumination" ❌  
  → sollte "illumination-devices" sein
  
- **Page 220 (ieee-p2020)**: parent_slug="standards" ❌  
  → Parent existiert nicht! Muss geklärt werden

---

## 📋 Vorgeschlagener Ablauf:

1. **Backup erstellen** (wichtig vor Breaking Changes!)
2. **SQL-Skript vorbereiten** für alle Korrekturen
3. **Routes in App.tsx aktualisieren** (catch-all routes anpassen)
4. **Navigation-Links in allen 5 Sprachen aktualisieren**
5. **Admin-Dashboard Preview-URLs anpassen**
6. **Gründlich testen** (alle Seiten erreichbar?)

---

## 💡 Alternative Ansätze:

### Option A: Alles auf einmal (schnell aber riskant)
- Alle Slugs in einem Rutsch korrigieren
- Alle Code-Änderungen parallel
- ⚠️ Risiko: Wenn etwas schief geht, große Impact

### Option B: Schrittweise (sicher aber langsam)
- Erst eine Kategorie (z.B. "Your Solution")
- Testen, dann nächste Kategorie
- ✅ Vorteil: Probleme früh erkennbar

### Option C: Redirect-Strategie (SEO-freundlich)
- Alte Slugs bleiben in DB
- Redirects von alt zu neu
- SEO-Links bleiben funktional
- ✅ Empfohlen für Produktions-System

---

## ⏰ WANN ANGEHEN?

**ENTSCHEIDUNG:** In 1 Woche (ca. 28.11.2025)

**Zeitaufwand geschätzt:** 2-4 Stunden für vollständige Korrektur

**Plan:**
1. Backup aller betroffenen Tabellen erstellen
2. SQL-Skript für alle ~50 Seiten vorbereiten
3. Routes, Navigation (5 Sprachen) und Admin-Dashboard parallel aktualisieren
4. Gründliches Testing aller Seiten

**Empfohlener Ansatz:** Option A (alles auf einmal) - da wir noch nicht live sind

---

**Erstellt:** 2025-11-21  
**Geplant für:** ~28.11.2025 (in 1 Woche)
**Status:** ⏰ Geplant - Wartet auf Ausführung
