# CMS Development Rules - KRITISCH

**Datum:** 2025-12-19  
**Anlass:** Schwerwiegende Bugfixing-Session (3+ Stunden) durch Missachtung des bestehenden Systems

---

## GOLDENE REGELN - NIEMALS BRECHEN

### 1. KEINE SONDERLÖSUNGEN

❌ **VERBOTEN:**
- Dateien in `public/` hardcoden, die vom CMS verwaltet werden
- Code schreiben, der CMS-Daten umgeht
- Workarounds bauen statt das System zu verstehen

✅ **KORREKT:**
- Immer das bestehende CMS-System nutzen
- Bei Problemen: CMS-Daten prüfen, nicht Code hacken

---

### 2. DATENMODELL VERSTEHEN VOR CODE-ÄNDERUNGEN

Das CMS speichert Segment-Daten auf zwei Arten:

**Primär (VORRANG):**
```
page_content.section_key = "page_segments"
→ Enthält vollständige Segment-Daten als JSON-Array
→ Hier werden Bilder, Titel, Beschreibungen gespeichert
```

**Legacy/Fallback (NUR wenn page_segments leer):**
```
page_content.section_key = "{segmentId}_{fieldName}"
z.B. "497_backgroundImage", "497_title"
→ Alte Speicherstruktur, wird von Editoren nicht mehr aktiv genutzt
```

**KRITISCH:** `page_segments` Daten haben IMMER Vorrang über `{id}_{field}` Keys!

---

### 3. VOR JEDER CMS-ÄNDERUNG PRÜFEN

1. **Datenbank-Konsistenz:**
   ```sql
   -- Gelöschte Segmente in tab_order?
   SELECT * FROM segment_registry WHERE page_slug = 'X' AND deleted = true;
   
   -- tab_order prüfen
   SELECT section_key, content_value FROM page_content 
   WHERE page_slug = 'X' AND section_key = 'tab_order';
   ```

2. **Datenquellen verstehen:**
   ```sql
   -- Wo kommen die Daten her?
   SELECT section_key, content_type, content_value 
   FROM page_content WHERE page_slug = 'X' ORDER BY updated_at DESC;
   ```

3. **Nie annehmen - immer prüfen!**

---

### 4. FEHLERANALYSE-PROTOKOLL

**Was am 2025-12-19 schiefgelaufen ist:**

| Fehler | Ursache | Richtige Lösung |
|--------|---------|-----------------|
| Bild in public/ kopiert | CMS-System nicht verstanden | CMS-Editor nutzen |
| Legacy-Keys überschreiben page_segments | Falsche Priorität im Code | page_segments hat VORRANG |
| Gelöschtes Segment 499 in tab_order | Keine DB-Konsistenzprüfung | Erst DB prüfen |

**Zeitverlust:** 3+ Stunden  
**Vertrauensverlust:** Erheblich

---

## CHECKLISTE VOR CMS-CODE-ÄNDERUNGEN

- [ ] Habe ich das Datenmodell vollständig verstanden?
- [ ] Habe ich die DB-Daten geprüft (page_segments, tab_order, segment_registry)?
- [ ] Gibt es gelöschte Segmente, die noch referenziert werden?
- [ ] Nutze ich das bestehende CMS-System oder baue ich einen Workaround?
- [ ] Habe ich die Priorität der Datenquellen richtig verstanden?

**Wenn eine Frage mit NEIN beantwortet wird → STOPP und analysieren!**

---

## FAZIT

> Das CMS ist ein stabiles, gut programmiertes System (v0.9.1).  
> Probleme entstehen durch Missachtung des Systems, nicht durch das System selbst.  
> **Respektiere das System. Keine Sonderlösungen. Erst verstehen, dann handeln.**
