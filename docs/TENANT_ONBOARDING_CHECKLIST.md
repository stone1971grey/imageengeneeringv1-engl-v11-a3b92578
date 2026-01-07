# Tenant Onboarding Checklist

## Spade CMS – Multi-Tenancy Setup Guide (v1.1.2)

Diese Checkliste beschreibt alle Schritte, um ein neues Tenant-Projekt (z.B. aftermarket-update.de) basierend auf dem Spade CMS Core aufzusetzen.

---

## Phase 1: Lovable Projekt erstellen

- [ ] Neues Lovable-Projekt erstellen auf [lovable.dev](https://lovable.dev)
- [ ] Lovable Cloud aktivieren (Supabase-Backend)
- [ ] Projekt-URL notieren: `https://preview--[PROJECT_NAME].lovable.app`

---

## Phase 2: Konfigurationsdateien hochladen

Diese 5 Dateien aus dem Download-Hub (`/aftermarket-update`) in das neue Projekt hochladen:

| Datei | Zielort | Beschreibung |
|-------|---------|--------------|
| `siteConfig.ts` | `src/config/siteConfig.ts` | Tenant-spezifische Konfiguration |
| `Auth.tsx` | `src/pages/Auth.tsx` | Login-Seite mit Tenant-Branding |
| `config.toml` | `supabase/config.toml` | Edge Function Konfiguration |
| `index.ts` | `src/config/index.ts` | Config-Export |
| `LoginOverlay.tsx` | `src/components/LoginOverlay.tsx` | Login-Overlay Komponente |

---

## Phase 3: Core-Ordner kopieren (1:1)

Diese Ordner müssen **komplett** vom Haupt-Projekt kopiert werden:

### Pflicht-Ordner

```
src/components/          → Alle UI-Komponenten inkl. Segment-Editoren
src/hooks/               → Alle Custom Hooks
src/lib/                 → Utility-Funktionen
src/assets/              → Icons, Bilder (außer tenant-spezifische Logos)
src/types/               → TypeScript Typen
src/contexts/            → React Contexts
supabase/functions/      → Alle Edge Functions
```

### Styling-Dateien

```
src/index.css            → Design Tokens (CSS Variables)
tailwind.config.ts       → Tailwind-Konfiguration
```

### Teilweise kopieren (mit Anpassungen)

```
src/pages/               → Nur benötigte Seiten (je nach aktivierten Modulen)
src/App.tsx              → Routing-Anpassungen
src/main.tsx             → Entry Point
```

---

## Phase 4: Datenbank-Migration ausführen

Die SQL-Migration `docs/tenant-database-migration.sql` im neuen Projekt ausführen.

**Reihenfolge:**
1. Enum-Typen erstellen
2. Hilfsfunktionen erstellen (`has_role`, `get_next_page_id`)
3. Core-Tabellen erstellen
4. RLS aktivieren
5. RLS-Policies erstellen
6. Storage Buckets erstellen
7. Trigger für Profile-Erstellung

**Benötigte Kern-Tabellen:**
- `profiles` - Benutzerprofile
- `user_roles` - Rollen-Zuordnung
- `user_seo_permissions` - SEO-Berechtigungen
- `editor_page_access` - Editor-Zugriffsrechte
- `page_id_sequence` - ID-Generator
- `page_registry` - Seiten-Verwaltung
- `segment_registry` - Segmente
- `page_content` - Inhalte
- `page_content_backups` - Backup-System
- `media_folders` - Medien-Ordner
- `file_segment_mappings` - Datei-Segment-Zuordnungen
- `navigation_links` - Navigation (Legacy)
- `glossary` - Übersetzungs-Glossar
- `redirects` - URL-Weiterleitungen

**Content-Module (je nach Feature-Flags):**
- `news_articles` - News-Modul
- `events` + `event_registrations` - Events-Modul
- `products` - Produkte-Modul
- `downloads` + `download_requests` - Downloads-Modul
- `newsletter_subscriptions` - Newsletter-Modul
- `contact_submissions` - Kontaktformular
- `backlog_tasks` - Backlog/Tasks

---

## Phase 5: Konfiguration anpassen

### siteConfig.ts anpassen

```typescript
// Tenant-spezifische Werte
tenant: {
  id: 'aftermarket-update',
  name: 'Aftermarket Update',
  legalName: 'Aftermarket Update Media GmbH',
  tagline: 'Das Fachportal für den freien Kfz-Teilehandel',
  // ...
}

// Feature-Flags aktivieren/deaktivieren
features: {
  enabledModules: ['news', 'newsletter', 'events'], // Keine 'products'
  // ...
}

// Branding
branding: {
  logos: {
    primary: '/logos/aftermarket-update-logo.svg',
    // ...
  },
  colors: {
    primary: '220 14% 28%',  // Newspaper-Look (HSL!)
    accent: '43 96% 56%',    // Gelb-Akzent
    // ...
  },
  fonts: {
    heading: 'Playfair Display',
    body: 'Source Sans Pro',
  }
}
```

### Logos hochladen

```
public/logos/aftermarket-update-logo.svg
public/logos/aftermarket-update-logo-dark.svg
public/favicon.ico
```

---

## Phase 6: Edge Functions konfigurieren

### config.toml anpassen

```toml
project_id = "NEUE_SUPABASE_PROJECT_ID"

[functions.lookup-username]
verify_jwt = false

[functions.admin-create-user]
verify_jwt = false

[functions.upload-image]
verify_jwt = false

[functions.generate-og-image]
verify_jwt = false

# ... weitere Functions nach Bedarf
```

### Secrets konfigurieren (in Lovable Settings → Secrets)

| Secret | Benötigt für | Pflicht? |
|--------|-------------|----------|
| `MAUTIC_BASE_URL` | Mautic-Integration | Nein |
| `MAUTIC_USER` | Mautic-Integration | Nein |
| `MAUTIC_PASS` | Mautic-Integration | Nein |
| `RESEND_API_KEY` | E-Mail-Versand | Nein |
| `SISTRIX_API_KEY` | SEO-Tools | Nein |
| `FIRECRAWL_API_KEY` | Web-Scraping | Nein |

**Hinweis:** Nur Secrets eintragen, die für aktivierte Integrationen benötigt werden!

---

## Phase 7: Storage Buckets erstellen

In Lovable Cloud → Storage:

| Bucket | Public? | Beschreibung |
|--------|---------|--------------|
| `page-images` | Ja | Seiten-Bilder |
| `cms-media` | Ja | CMS-Medien |
| `user-uploads` | Nein | Private Uploads |

---

## Phase 8: Ersten Admin-User anlegen

1. Registrierung über `/auth` durchführen
2. User-UUID aus der `auth.users` Tabelle kopieren
3. Admin-Rolle zuweisen:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('USER_UUID_HIER', 'admin');
```

---

## Phase 9: Initiale Seiten anlegen

Mindestens diese Einträge in `page_registry`:

```sql
INSERT INTO page_registry (page_id, page_slug, page_title, status, nav_visible)
VALUES 
  (1, 'home', 'Startseite', 'published', true),
  (2, 'news', 'News', 'published', true),
  (3, 'contact', 'Kontakt', 'published', true);
```

---

## Phase 10: Verifizierung

- [ ] Login als Admin funktioniert
- [ ] Dashboard ist erreichbar (`/admin`)
- [ ] Seiten-Editor funktioniert
- [ ] Segment-Erstellung funktioniert
- [ ] Frontend-Editing (`?edit=true`) funktioniert
- [ ] Branding (Logo, Farben) korrekt angezeigt
- [ ] Feature-Flags werden respektiert (keine deaktivierten Module sichtbar)
- [ ] Navigation zeigt korrekte Seiten

---

## Phase 11: Go-Live Checkliste

- [ ] Domain verbinden (Settings → Domains)
- [ ] SSL-Zertifikat aktiv
- [ ] SEO-Defaults in siteConfig geprüft
- [ ] Favicon & OG-Images hochgeladen
- [ ] Impressum & Datenschutz angelegt
- [ ] Cookie-Banner konfiguriert (wenn benötigt)
- [ ] Analytics eingerichtet (wenn gewünscht)
- [ ] Produktiv-Publish durchführen

---

## NIEMALS synchronisieren

Diese Dateien/Ordner sind **tenant-spezifisch** und dürfen NIE vom Haupt-Projekt überschrieben werden:

| Datei/Ordner | Grund |
|--------------|-------|
| `src/config/siteConfig.ts` | Tenant-Branding & Feature-Flags |
| `supabase/migrations/` | Eigene Datenbank-Struktur |
| `.env` | Eigene Secrets |
| `public/logos/` | Tenant-Logos |
| `supabase/config.toml` (project_id) | Eigene Supabase-Instanz |
| Datenbank-Inhalte | Tenant-Content |

---

## Geschätzte Zeit

| Phase | Dauer |
|-------|-------|
| Projekt erstellen | 2 Min |
| Config-Dateien hochladen | 5 Min |
| Core-Ordner kopieren | 15 Min |
| DB-Migration ausführen | 10 Min |
| Konfiguration anpassen | 15 Min |
| Edge Functions & Secrets | 10 Min |
| Admin einrichten | 5 Min |
| Initiale Seiten | 10 Min |
| Verifizierung | 10 Min |
| **Gesamt** | **~80 Min** |

---

## Wartung & Updates

Siehe `TENANT_UPDATE_CHECKLIST.md` für das Protokoll bei Core-Updates.

Bei Updates des Haupt-Projekts:
1. Changelog prüfen
2. Core-Ordner aktualisieren (components, hooks, lib)
3. Neue Migrations separat ausführen
4. Kompatibilität testen

---

## Hilfe

Bei Fragen: Lovable-Chat nutzen oder Dokumentation unter `docs/` prüfen.
