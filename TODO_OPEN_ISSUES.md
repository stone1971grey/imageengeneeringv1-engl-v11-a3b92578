# Offene Aufgaben - Stand 2025-12-23

## 🔴 Kritisch: Tab-Persistierung im AdminDashboard

**Problem:** Wenn ein Benutzer im AdminDashboard einen Tab (z.B. "Gallery") auswählt, dann zu einer anderen Seite navigiert und zurückkommt, springt der Tab auf den ersten Tab zurück statt beim ausgewählten zu bleiben.

**Betroffene Datei:** `src/pages/AdminDashboard.tsx`

**Bisherige Lösungsversuche:**
1. localStorage-Speicherung des aktiven Tabs pro Seite
2. useEffect mit selectedPage-Dependency
3. restoredTabRef zum Verfolgen des früh wiederhergestellten Tabs
4. Initial State aus localStorage beim Component-Mount
5. lastLoadedPageRef zum Erkennen von Seitenwechseln

**Vermutete Ursache:** Race-Condition zwischen mehreren useEffect-Hooks und dem Content-Loading-Prozess. Der Tab wird korrekt aus localStorage geladen, aber dann von loadPageContent überschrieben.

**Nächste Schritte:**
- Console-Logs im Browser prüfen um die genaue Reihenfolge der Aufrufe zu verstehen
- Möglicherweise den Content-Loading-Flow umstrukturieren
- Oder: Tab-State in URL-Parameter verschieben statt localStorage

---

## ✅ Erledigte Aufgaben (Session 2025-12-23)

1. **Product Gallery G - Auto-Remove Background Button:** Von Checkbox zu Button geändert, individuell pro Bild in der Gallery
2. **Product Gallery G - Beschreibungstext:** Deutsche Beschreibung auf Englisch übersetzt
3. **Product Gallery G - Multi-Language Badge:** Redundantes Badge aus Sprachversionen entfernt
4. **Product Gallery G - Doppelte Mülltonne:** Redundante Trash-Icon aus Gallery-Items entfernt
