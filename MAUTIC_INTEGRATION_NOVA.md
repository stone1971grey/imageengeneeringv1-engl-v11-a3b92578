# MAUTIC INTEGRATION PROTOCOL - NOVA

**Projekt:** Image Engineering CMS Platform  
**Dokumentationsversion:** 1.0  
**Letzte Aktualisierung:** 2025-11-17  
**Status:** Production Ready

---

## 1. ÜBERSICHT

Die Mautic-Integration (Codename: NOVA) verbindet die Image Engineering CMS-Plattform mit dem Mautic Marketing Automation System. Die Integration ermöglicht automatisches Contact-Management, Event-Tracking, Download-Tracking und Pageview-Monitoring.

### 1.1 Hauptfunktionen

- **Event-Registrierungen**: Automatische Synchronisation von Event-Anmeldungen nach Mautic
- **Download-Tracking**: Erfassung von Whitepaper-, Conference Paper- und Video-Downloads
- **Pageview-Tracking**: Monitoring von Seitenbesuchen authentifizierter Benutzer
- **Bidirektionale Konsistenz**: Erhalt bestehender Segmente und Opt-In-Status

---

## 2. ARCHITEKTUR

### 2.1 Edge Functions

Die Integration verwendet drei Supabase Edge Functions:

#### A) `register-event`
- **Zweck**: Event-Registrierungen verarbeiten und nach Mautic synchronisieren
- **Pfad**: `supabase/functions/register-event/index.ts`
- **Trigger**: POST-Request von Event-Registrierungsformularen
- **Ausgabe**: Kontakterstellung/-aktualisierung in Mautic mit Event-Daten

#### B) `send-download-email`
- **Zweck**: Download-Anfragen verarbeiten und nach Mautic synchronisieren
- **Pfad**: `supabase/functions/send-download-email/index.ts`
- **Trigger**: POST-Request von Download-Formularen
- **Ausgabe**: Kontakterstellung/-aktualisierung in Mautic mit Download-Daten

#### C) `track-mautic-pageview`
- **Zweck**: Pageviews von authentifizierten Benutzern tracken
- **Pfad**: `supabase/functions/track-mautic-pageview/index.ts`
- **Trigger**: Client-seitiger Hook `useMauticTracking`
- **Ausgabe**: Pageview-Events in Mautic

### 2.2 Client-Integration

#### Hook: `useMauticTracking`
```typescript
// src/hooks/useMauticTracking.ts
// Automatisches Pageview-Tracking auf allen Seiten
// Verwendet E-Mail aus localStorage (getMauticEmail)
```

#### Library: `mauticTracking`
```typescript
// src/lib/mauticTracking.ts
// Helper-Funktionen für E-Mail-Speicherung/Abruf
```

---

## 3. MAUTIC KONFIGURATION

### 3.1 Secrets (Environment Variables)

Die folgenden Secrets müssen in Supabase konfiguriert sein:

| Secret Name | Beschreibung | Beispiel |
|------------|--------------|----------|
| `MAUTIC_BASE_URL` | Basis-URL der Mautic-Instanz | `https://mautic.example.com` |
| `MAUTIC_USERNAME` | API-Benutzer (Basic Auth) | `api_user` |
| `MAUTIC_PASSWORD` | API-Passwort (Basic Auth) | `secret_password` |

**Kompatibilität**: Edge Functions unterstützen beide Varianten:
- `MAUTIC_USER` oder `MAUTIC_USERNAME`
- `MAUTIC_PASS` oder `MAUTIC_PASSWORD`

### 3.2 Custom Fields in Mautic

Die folgenden Custom Fields müssen in Mautic angelegt sein:

#### Event-Felder
| Field Alias | Label | Typ | Beschreibung |
|------------|-------|-----|--------------|
| `event_title` | Event Title | Text | Name der Veranstaltung |
| `event_date` | Event Date | Text | Datum der Veranstaltung (YYYY-MM-DD) |
| `event_location` | Event Location | Text | Ort/Stadt der Veranstaltung |
| `evt_image_url` | Event Image URL | Text | Vollständige URL zum Event-Bild |
| `phone` | Phone | Tel | Telefonnummer (optional) |
| `industry` | Industry | Text | Branche (optional) |
| `current_test_systems` | Current Test Systems | Text | Aktuelle Testsysteme (optional) |
| `automotive_interests` | Automotive Interests | Text | Comma-separated Liste (optional) |

#### Download-Felder
| Field Alias | Label | Typ | Beschreibung |
|------------|-------|-----|--------------|
| `download_type` | Download Type | Text | "whitepaper", "conference-paper", "video" |
| `item_id` | Item ID | Text | Eindeutige ID des Downloads |
| `item_title` | Item Title | Text | Titel des Downloads |
| `dl_type` | DL Type | Text | Download-Kategorie |
| `dl_title` | DL Title | Text | Spezifischer Titel |
| `dl_url` | DL URL | Text | URL zum Asset |

#### Marketing-Felder
| Field Alias | Label | Typ | Beschreibung |
|------------|-------|-----|--------------|
| `marketing_optin` | Marketing Opt-In | Text | "pending", "yes", "no" |
| `optin_confirmed` | Opt-In Confirmed | Text | Bestätigungsstatus |

### 3.3 Tag-System

#### Event-Tags
- **Basis-Tag**: `evt` (für alle Event-Registrierungen)
- **Event-spezifisch**: `evt:{event-slug}` (z.B. `evt:advanced-camera-testing-workshop`)

#### Download-Tags
- **Whitepaper**: `dl:whitepaper`
- **Conference Paper**: `dl:conference-paper`
- **Video**: `dl:video`

**Wichtig**: Tags werden IMMER additiv hinzugefügt, niemals entfernt!

---

## 4. WORKFLOW-LOGIK

### 4.1 Neue vs. Existierende Kontakte

#### Schritt 1: Kontaktprüfung
```typescript
// Suche nach existierendem Kontakt via E-Mail
GET /api/contacts?search=email:{email}
```

#### Schritt 2A: Neuer Kontakt (Nicht gefunden)
```typescript
POST /api/contacts/new
{
  firstname, lastname, email, company, position,
  // Event- oder Download-spezifische Felder
  marketing_optin: "pending",
  tags: ["evt", "evt:{slug}"] // oder ["dl:whitepaper"]
}
```

#### Schritt 2B: Existierender Kontakt (Gefunden)
```typescript
PATCH /api/contacts/{id}/edit
{
  firstname, lastname, company, position, // IMMER aktualisieren
  // Neue Event-/Download-Daten
  tags: ["evt", "evt:{slug}"] // Tags ADDITIV hinzufügen
}
```

**KRITISCH**: Bei PATCH werden bestehende Segmente und `marketing_optin` NICHT überschrieben!

### 4.2 Bidirektionale Konsistenz

Die Integration funktioniert in beide Richtungen:

**Szenario 1: Event → Download**
1. User registriert sich für Event (marketing_optin = "pending")
2. User bestätigt Opt-In (marketing_optin = "yes")
3. User lädt Whitepaper herunter → PATCH behält marketing_optin = "yes"

**Szenario 2: Download → Event**
1. User lädt Whitepaper herunter (marketing_optin = "pending")
2. User bestätigt Opt-In (marketing_optin = "yes")
3. User registriert sich für Event → PATCH behält marketing_optin = "yes"

### 4.3 Segment-Preservation

**Fundamentale Regel**: Bestehende Segmente werden NIEMALS entfernt!

- Ein Kontakt im "Segment whitepaper" bleibt dort, auch wenn er sich für ein Event anmeldet
- Neue Segmente (z.B. "evt:workshop") werden ADDITIV hinzugefügt
- Mautic-Segmente basieren auf Tags und Custom Field-Werten

---

## 5. DATENBANK-SCHEMA

### 5.1 Tabelle: `event_registrations`

```sql
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  event_title TEXT NOT NULL,
  event_slug TEXT NOT NULL,
  event_date TEXT NOT NULL,
  event_location TEXT NOT NULL,
  evt_image_url TEXT,
  phone TEXT,
  industry TEXT,
  current_test_systems TEXT,
  automotive_interests TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 5.2 Tabelle: `download_requests`

```sql
CREATE TABLE download_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  download_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item_title TEXT NOT NULL,
  dl_type TEXT,
  dl_title TEXT,
  dl_url TEXT,
  category_tag TEXT,
  title_tag TEXT,
  consent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 6. ERROR HANDLING

### 6.1 Bereits registriert (409 Conflict)

**Event-Registrierung**: Wenn ein User bereits für das gleiche Event registriert ist:

```json
{
  "error": "already_registered",
  "message": "This email is already registered for this event",
  "registrationData": {
    "eventTitle": "...",
    "eventDate": "...",
    "eventTime": "...",
    "eventImageUrl": "...",
    "registrationDate": "..."
  }
}
```

Frontend leitet um nach: `/event-already-registered`

### 6.2 Mautic API Fehler

Edge Functions loggen Mautic-Fehler, schlagen aber NICHT fehl:

```typescript
if (mauticError) {
  console.error("Error sending to Mautic:", mauticError);
  // Registrierung in DB bleibt erfolgreich!
}
```

**Grund**: Lokale DB-Speicherung hat Priorität; Mautic-Sync ist sekundär.

### 6.3 Fehlende Credentials

Wenn Mautic-Credentials nicht konfiguriert sind:

```typescript
console.log("Mautic credentials not configured, skipping Mautic sync");
```

Die Edge Functions funktionieren weiterhin (nur ohne Mautic-Sync).

---

## 7. FRONTEND-INTEGRATION

### 7.1 Event-Registrierung

**Komponente**: `src/pages/Events.tsx`

```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/register-event`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  },
  body: JSON.stringify({
    firstName, lastName, email, company, position,
    eventName, eventSlug, eventDate, eventLocation, eventImage,
    // Optional: phone, industry, currentTestSystems, automotiveInterests
  })
});
```

**Routing nach Erfolg**:
- Neue Kontakte (isExistingContact = false): `/event-registration-success`
- Existierende Kontakte (isExistingContact = true): `/event-detail-registration-confirmation`

### 7.2 Download-Anfrage

**Komponenten**: WhitePaper-, ConferencePaper-, Video-Download-Formulare

```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/send-download-email`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  },
  body: JSON.stringify({
    firstName, lastName, email, company, position,
    downloadType: 'whitepaper', // oder 'conference-paper', 'video'
    itemId, itemTitle, 
    // Optional: dlType, dlTitle, dlUrl, categoryTag, titleTag
  })
});
```

**Routing nach Erfolg**:
- Neue Kontakte: `/download-registration-success`
- Existierende Kontakte: `/download-confirmation`

### 7.3 Pageview-Tracking

**Automatisch aktiviert** auf allen Seiten mit dem Hook:

```typescript
import { useMauticTracking } from '@/hooks/useMauticTracking';

function MyPage() {
  useMauticTracking({ enabled: true });
  // ...
}
```

**E-Mail-Speicherung**:
```typescript
import { setMauticEmail } from '@/lib/mauticTracking';

// Nach erfolgreicher Registrierung/Download
setMauticEmail(email);
```

---

## 8. TESTING & DEBUGGING

### 8.1 Edge Function Logs prüfen

```bash
# In Lovable Cloud UI: Cloud Tab → Edge Functions → register-event → Logs
# Oder via Supabase Dashboard
```

Wichtige Log-Meldungen:
```
"Processing registration for: {email} Event: {slug}"
"Found existing Mautic contact with ID: {id}"
"Updating existing Mautic contact - updating all fields"
"Successfully sent to Mautic: {response}"
```

### 8.2 Mautic Contact prüfen

1. In Mautic: Contacts → Search by Email
2. Überprüfe Custom Fields: event_title, event_date, dl_type, etc.
3. Überprüfe Tags: evt, evt:{slug}, dl:whitepaper, etc.
4. Überprüfe Segments: Kontakt sollte in korrekten Segmenten erscheinen

### 8.3 Test-Szenarien

#### Test 1: Neue Event-Registrierung
1. Registriere mit neuer E-Mail
2. Prüfe: Kontakt in Mautic mit marketing_optin = "pending"
3. Prüfe: Tags "evt" und "evt:{slug}" vorhanden
4. Prüfe: Alle Event-Felder korrekt gefüllt

#### Test 2: Existierende Kontakt Event-Registrierung
1. Registriere mit bestehender E-Mail (die bereits Opt-In hat)
2. Prüfe: marketing_optin bleibt "yes"
3. Prüfe: Neue Event-Tags additiv hinzugefügt
4. Prüfe: Name/Company/Position aktualisiert

#### Test 3: Download nach Event
1. Registriere für Event (neue E-Mail)
2. Lade Whitepaper herunter (gleiche E-Mail)
3. Prüfe: Kontakt hat BEIDE Tags (evt:{slug} UND dl:whitepaper)
4. Prüfe: Kontakt in beiden Segmenten

---

## 9. SICHERHEIT & COMPLIANCE

### 9.1 DSGVO-Konformität

- **Opt-In**: Kontakte haben initial marketing_optin = "pending"
- **Bestätigung**: Double-Opt-In via Mautic E-Mail-Workflow erforderlich
- **Transparenz**: Download/Event-Bestätigungsseiten informieren über Datennutzung

### 9.2 API-Authentifizierung

- **Basic Auth**: Mautic-Credentials werden verschlüsselt als Supabase Secrets gespeichert
- **Edge Functions**: Nur serverseitige Calls, keine Client-Exposition
- **CORS**: Aktiviert für Web-App-Zugriff

### 9.3 Datensparsamkeit

Nur explizit benötigte Felder werden übertragen:
- Event: firstName, lastName, email, company, position + Event-Daten
- Download: firstName, lastName, email, company, position + Download-Daten
- Pageview: email, pageUrl, pageTitle

---

## 10. WARTUNG & UPDATES

### 10.1 Neue Custom Fields hinzufügen

1. **In Mautic**: Custom Field anlegen
2. **In Edge Function**: Field in Request-Payload ergänzen
3. **Im Frontend**: Field in Formular-Daten übergeben
4. **Dokumentation aktualisieren**: Dieses Dokument

### 10.2 Neue Event-Typen

1. Neues Event-Formular erstellen
2. Event-Slug definieren
3. Event-Daten an register-event Edge Function senden
4. Neuen Tag evt:{slug} wird automatisch erstellt

### 10.3 Monitoring

**Prüfen bei Problemen**:
- [ ] Mautic-Credentials korrekt in Supabase Secrets?
- [ ] Edge Functions deployed?
- [ ] Custom Fields in Mautic vorhanden?
- [ ] Frontend sendet vollständige Daten?
- [ ] Edge Function Logs zeigen Fehler?

---

## 11. BEKANNTE LIMITIERUNGEN

### 11.1 Tag-Limit
Mautic hat keine praktische Begrenzung für Tags pro Kontakt, aber extrem viele Tags (>100) können Performance beeinträchtigen.

### 11.2 API-Rate-Limits
Mautic Basic Auth hat keine expliziten Rate Limits, aber bei sehr hohem Traffic (>1000 Requests/Minute) können Timeouts auftreten.

### 11.3 Async-Verarbeitung
Mautic-Sync ist asynchron. Bei Mautic-Ausfall bleibt die lokale DB-Registrierung erfolgreich, aber Sync muss manuell nachgeholt werden.

---

## 12. ÄNDERUNGSPROTOKOLL

| Datum | Version | Änderung | Autor |
|-------|---------|----------|-------|
| 2025-11-17 | 1.0 | Initiale Dokumentation NOVA-Protokoll | AI Assistant |
| 2025-11-17 | 1.0 | Fix: Name/Company/Position bei existierenden Kontakten | AI Assistant |

---

## 13. SUPPORT & KONTAKT

**Bei technischen Problemen**:
1. Edge Function Logs prüfen (Cloud Tab → Edge Functions)
2. Mautic API-Verbindung testen
3. Dieses Dokument konsultieren

**Weiterführende Dokumentation**:
- Mautic API Docs: https://developer.mautic.org/
- Supabase Edge Functions: https://supabase.com/docs/guides/functions

---

*Dieses Dokument ist Teil der Image Engineering CMS-Plattform und beschreibt die vollständige Mautic-Integration.*
