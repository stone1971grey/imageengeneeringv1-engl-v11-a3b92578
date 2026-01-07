# Tenant Onboarding Checkliste

## Übersicht

Diese Checkliste beschreibt alle Schritte, um ein neues CMS-Projekt (Tenant) basierend auf dem Spade-CMS aufzusetzen.

---

## 1. Neues Lovable-Projekt erstellen

- [ ] Neues Projekt auf [lovable.dev](https://lovable.dev) erstellen
- [ ] Projektname vergeben (z.B. `kunde-xyz-cms`)

---

## 2. Zu kopierende Dateien & Ordner

### Kritisch (MUSS kopiert werden)

| Pfad | Beschreibung |
|------|--------------|
| `src/config/siteConfig.ts` | **Haupt-Konfigurationsdatei** - ANPASSEN für neuen Tenant! |
| `src/config/index.ts` | Config-Exports |
| `src/components/` | Alle UI-Komponenten |
| `src/hooks/` | Custom Hooks (CMS, Auth, Navigation) |
| `src/pages/` | Alle Seiten-Komponenten |
| `src/lib/` | Utility-Funktionen |
| `src/types/` | TypeScript Typen |
| `src/contexts/` | React Contexts |

### Styling

| Pfad | Beschreibung |
|------|--------------|
| `src/index.css` | Globale Styles & CSS-Variablen |
| `tailwind.config.ts` | Tailwind-Konfiguration |

### Supabase/Backend

| Pfad | Beschreibung |
|------|--------------|
| `supabase/functions/` | Edge Functions |
| `supabase/migrations/` | DB-Migrationen (als Referenz) |

---

## 3. siteConfig.ts anpassen

Die wichtigste Datei! Öffne `src/config/siteConfig.ts` und passe an:

```typescript
export const siteConfig: SiteConfig = {
  // === TENANT IDENTIFIKATION ===
  tenant: {
    id: 'neuer-tenant-slug',        // Eindeutige ID
    name: 'Neuer Kunde',            // Anzeigename
    legalName: 'Neue Kunde GmbH',   // Rechtlicher Name
    tagline: 'Slogan des Kunden',
  },

  // === BRANDING ===
  branding: {
    logos: {
      primary: '/logo-kunde.svg',
      // ... weitere Logos
    },
    colors: {
      primary: '220 80% 50%',       // HSL-Werte anpassen!
      // ... weitere Farben
    },
    fonts: {
      heading: 'Ihre Schriftart',
      body: 'Ihre Schriftart',
    },
  },

  // === KONTAKT ===
  contact: {
    email: 'info@neuer-kunde.de',
    phone: '+49 123 456789',
    // ... weitere Kontaktdaten
  },

  // === FEATURES ===
  features: {
    modules: {
      news: true,           // Welche Module aktiviert?
      events: false,
      products: true,
      downloads: false,
      // ...
    },
    languages: ['de'],      // Verfügbare Sprachen
  },

  // === INTEGRATIONEN ===
  integrations: {
    mautic: {
      enabled: false,       // Nur wenn benötigt
    },
    // ...
  },
};
```

---

## 4. Datenbank einrichten

### Option A: Migrations ausführen (empfohlen)

Die Migrations aus `supabase/migrations/` enthalten das komplette DB-Schema.

Lovable wird beim Projekt-Start automatisch nach fehlenden Tabellen fragen.

### Option B: Manuell Tabellen erstellen

Benötigte Kern-Tabellen:
- `page_registry` - Seiten-Verwaltung
- `page_content` - Inhalte
- `segment_registry` - Segmente
- `profiles` - Benutzerprofile
- `user_roles` - Rollen-Zuordnung
- `navigation_links` - Navigation (optional, wenn DB-First)

---

## 5. Secrets konfigurieren

In Lovable unter **Settings → Secrets** eintragen:

| Secret | Benötigt für |
|--------|-------------|
| `MAUTIC_BASE_URL` | Mautic-Integration |
| `MAUTIC_USERNAME` | Mautic-Integration |
| `MAUTIC_PASSWORD` | Mautic-Integration |
| `RESEND_API_KEY` | E-Mail-Versand |
| `SISTRIX_API_KEY` | SEO-Tools |
| `FIRECRAWL_API_KEY` | Web-Scraping |

**Hinweis:** Nur Secrets eintragen, die für aktivierte Features benötigt werden!

---

## 6. Storage Buckets erstellen

Falls File-Upload benötigt wird:

```sql
-- In Lovable Cloud ausführen
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cms-media', 'cms-media', true);
```

---

## 7. Admin-User einrichten

1. Ersten User über die App registrieren
2. In der Datenbank Admin-Rolle zuweisen:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_UUID_HIER', 'admin');
```

---

## 8. Erste Inhalte anlegen

1. Als Admin einloggen
2. Erste Seite im CMS anlegen
3. Navigation konfigurieren

---

## 9. Go-Live Checkliste

- [ ] Domain verbinden (Settings → Domains)
- [ ] SSL-Zertifikat aktiv
- [ ] SEO-Defaults in siteConfig geprüft
- [ ] Favicon & OG-Images hochgeladen
- [ ] Impressum & Datenschutz angelegt
- [ ] Cookie-Banner konfiguriert
- [ ] Analytics eingerichtet (wenn gewünscht)

---

## Geschätzte Zeit

| Schritt | Dauer |
|---------|-------|
| Projekt erstellen | 2 Min |
| Dateien kopieren | 10 Min |
| siteConfig anpassen | 15 Min |
| DB einrichten | 5 Min |
| Secrets konfigurieren | 5 Min |
| Admin einrichten | 5 Min |
| **Gesamt** | **~45 Min** |

---

## Hilfe

Bei Fragen: Lovable-Chat nutzen oder Dokumentation unter `docs/` prüfen.
