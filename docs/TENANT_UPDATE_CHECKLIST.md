# Tenant Update Checklist

## Übersicht
Diese Checkliste beschreibt den Prozess zur Synchronisation von Updates zwischen dem Haupt-Spade-CMS und Tenant-Projekten wie `aftermarket-update.de`.

---

## 🔄 Update-Prozess

### Schritt 1: Änderungen identifizieren
- [ ] Welche Ordner wurden im Haupt-Projekt geändert?
- [ ] Sind es Core-Komponenten oder Tenant-spezifische Änderungen?

### Schritt 2: Zu synchronisierende Ordner

| Ordner | Synchronisieren | Anmerkung |
|--------|-----------------|-----------|
| `src/components/` | ✅ JA | Core UI-Komponenten |
| `src/hooks/` | ✅ JA | Shared Hooks |
| `src/lib/` | ✅ JA | Utility-Funktionen |
| `src/pages/` | ⚠️ TEILWEISE | Nur generische Seiten |
| `src/config/siteConfig.ts` | ❌ NEIN | Tenant-spezifisch |
| `src/config/index.ts` | ✅ JA | Export-Struktur |
| `supabase/functions/` | ✅ JA | Edge Functions |
| `supabase/migrations/` | ⚠️ PRÜFEN | Schema-Kompatibilität prüfen |

### Schritt 3: Nicht synchronisieren

Diese Elemente sind **immer Tenant-spezifisch**:
- `src/config/siteConfig.ts` (Branding, Features)
- Datenbank-Inhalte (`page_content`, `news_articles`, etc.)
- Logo-Dateien und Branding-Assets
- `.env` Secrets

---

## 📋 Schnell-Checkliste

```bash
# 1. Core-Komponenten kopieren
src/components/cms/
src/components/ui/
src/components/admin/

# 2. Hooks kopieren
src/hooks/

# 3. Utilities kopieren
src/lib/

# 4. Edge Functions kopieren
supabase/functions/

# 5. Nach dem Kopieren testen
- [ ] Build läuft durch
- [ ] Admin Dashboard funktioniert
- [ ] Frontend-Editing funktioniert
- [ ] Alle Feature-Flags respektiert
```

---

## ⚠️ Wichtige Hinweise

1. **Vor dem Update:** Backup des Tenant-Projekts erstellen
2. **siteConfig.ts:** Niemals überschreiben - enthält Tenant-Konfiguration
3. **Migrationen:** Prüfen ob Schema-Änderungen kompatibel sind
4. **Testen:** Nach jedem Update vollständigen Test durchführen

---

## 🎯 Geplant für v1.8

- Automatisches Update-Script
- Git-basierte Synchronisation mit Upstream-Branch
- Changelog-Generator für Tenant-Updates
