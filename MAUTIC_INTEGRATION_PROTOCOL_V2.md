# Mautic Integration Protocol V2
**Image Engineering CMS Platform**  
**Last Updated:** 2025-11-26  
**Status:** Production-Ready

---

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Mautic Configuration](#mautic-configuration)
4. [Event Registration Workflow](#event-registration-workflow)
5. [Download Request Workflow](#download-request-workflow)
6. [Tag Management & Segment Preservation](#tag-management--segment-preservation)
7. [Database Schema](#database-schema)
8. [Edge Functions Implementation](#edge-functions-implementation)
9. [Known Issues & Future Improvements](#known-issues--future-improvements)
10. [Change Log](#change-log)

---

## Overview

This protocol documents the complete Mautic integration for the Image Engineering CMS platform. The integration handles:

- **Event Registrations**: Users register for events → stored locally + synced to Mautic
- **Download Requests**: Users request whitepapers/videos/conference papers → stored locally + synced to Mautic
- **Pageview Tracking**: Automatic pageview tracking for marketing analytics
- **Contact Management**: Bidirectional consistency between local database and Mautic
- **Segment Preservation**: Existing Mautic segments and tags are NEVER removed, only added

### Critical Principle: ADDITIVE ONLY
**All Mautic updates are strictly additive.** Existing tags, segments, and opt-in status are preserved. New data is added, never replaced.

---

## Architecture

### Components

1. **Supabase Edge Functions**:
   - `register-event`: Handles event registrations
   - `send-download-email`: Handles download requests
   - `track-mautic-pageview`: Tracks page views

2. **Local Database Tables**:
   - `event_registrations`: Stores all event registrations
   - `download_requests`: Stores all download requests

3. **Mautic API Integration**:
   - Basic Auth using `MAUTIC_USERNAME` and `MAUTIC_PASSWORD`
   - Base URL: `MAUTIC_BASE_URL`

---

## Mautic Configuration

### Required Environment Variables (Supabase Secrets)

```
MAUTIC_BASE_URL=https://your-mautic-instance.com
MAUTIC_USERNAME=your-api-username
MAUTIC_PASSWORD=your-api-password
```

### Required Custom Fields in Mautic

**Event-Related Fields:**
- `event_title` (Text) - Event name
- `event_date` (Date) - Event date
- `event_location` (Text) - Event location
- `evt_image_url` (URL) - Event hero image URL
- `industry` (Text) - User's industry
- `current_test_systems` (Text) - Current test systems used
- `automotive_interests` (Multiselect) - Automotive testing interests

**Download-Related Fields:**
- `dl_type` (Text) - Download type: "whitepaper", "conference-paper", "video"
- `dl_title` (Text) - Specific document/video title
- `dl_url` (URL) - Direct URL to the asset

**Marketing Opt-In:**
- `marketing_optin` (Text) - Values: "pending", "confirmed"

### Tag System

**Event Tags:**
- `evt` - General event participant tag
- `evt:{event-slug}` - Specific event tag (e.g., `evt:automotive-testing-conference-2026`)

**Download Tags:**
- `dl:whitepaper` - Downloaded a whitepaper
- `dl:conference-paper` - Downloaded a conference paper
- `dl:video` - Downloaded a video

### Segment Configuration in Mautic

For each event, create a segment with filter:
```
Tag = evt:{event-slug}
```

This automatically adds contacts to event segments when they register.

---

## Event Registration Workflow

### User Flow

1. User fills out event registration form on frontend
2. Form submits to Supabase Edge Function `register-event`
3. Edge Function:
   - Checks for duplicate registration (same email + event)
   - Stores registration in local `event_registrations` table
   - Checks if contact exists in Mautic (by email)
   - Creates new contact (POST) OR updates existing contact (PATCH)
   - Returns success with `isExistingContact` flag

4. Frontend redirects based on `isExistingContact`:
   - **New contact** → `/event-registration-success` (Opt-in confirmation required)
   - **Existing contact** → `/event-detail-registration-confirmation` (Direct confirmation)

### Critical: Tag Management for Existing Contacts

**IMPORTANT FIX (2025-11-26):**

When updating an existing contact with a new event registration, tags must be combined additively:

```typescript
// 1. Fetch existing contact to get current tags
const contactResponse = await fetch(`${mauticBaseUrl}/api/contacts/${mauticContactId}`, {
  method: "GET",
  headers: {
    "Authorization": `Basic ${basicAuth}`,
    "Content-Type": "application/json",
  },
});

let existingTags: string[] = [];
if (contactResponse.ok) {
  const contactData = await contactResponse.json();
  if (contactData.contact && contactData.contact.tags) {
    existingTags = contactData.contact.tags.map((tag: any) => tag.tag || tag);
  }
}

// 2. Add new event tags to existing tags (avoid duplicates)
const newEventTag = `evt:${data.eventSlug}`;
const allTags = [...new Set([...existingTags, "evt", newEventTag])];

// 3. Update contact with combined tags
const updateData = {
  // ... other fields ...
  tags: allTags, // Combined tags array
};
```

**Why This Matters:**
- Contacts can register for multiple events
- Each event has its own segment in Mautic (`evt:{event-slug}`)
- Without tag combination, only the LATEST event segment would be assigned
- With tag combination, contacts appear in ALL event segments they registered for

---

## Download Request Workflow

### User Flow

1. User fills out download form on frontend
2. Form submits to Supabase Edge Function `send-download-email`
3. Edge Function:
   - Stores request in local `download_requests` table
   - Checks if contact exists in Mautic (by email)
   - Creates new contact (POST) OR updates existing contact (PATCH)
   - Returns success with `isExistingContact` flag

4. Frontend redirects based on `isExistingContact`:
   - **New contact** → `/download-registration-success` (Opt-in confirmation required)
   - **Existing contact** → `/download-confirmation` (Direct download link)

### Download-Specific Tags

Based on `download_type` field:
- `"whitepaper"` → Tag: `dl:whitepaper`
- `"conference-paper"` → Tag: `dl:conference-paper`
- `"video"` → Tag: `dl:video`

---

## Tag Management & Segment Preservation

### Bidirectional Consistency

The integration ensures contacts maintain their Mautic segments regardless of interaction order:

**Scenario 1: Event → Download**
1. User registers for event → gets `evt` and `evt:{slug}` tags
2. User later downloads whitepaper → system fetches existing tags, adds `dl:whitepaper`
3. Result: Contact has ALL tags (`evt`, `evt:{slug}`, `dl:whitepaper`)

**Scenario 2: Download → Event**
1. User downloads whitepaper → gets `dl:whitepaper` tag
2. User later registers for event → system fetches existing tags, adds `evt` and `evt:{slug}`
3. Result: Contact has ALL tags (`dl:whitepaper`, `evt`, `evt:{slug}`)

### Critical Rules

1. **NEVER remove existing tags** - Always fetch and combine
2. **NEVER overwrite segments** - Segments are derived from tags automatically
3. **NEVER change marketing_optin if already confirmed** - Use POST for new, PATCH for existing
4. **ALWAYS use Set to avoid duplicate tags** - `[...new Set([...existingTags, ...newTags])]`

---

## Database Schema

### event_registrations Table

```sql
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  phone TEXT,
  event_slug TEXT NOT NULL,
  event_title TEXT NOT NULL,
  event_date TEXT NOT NULL,
  event_location TEXT NOT NULL,
  evt_image_url TEXT,
  industry TEXT,
  current_test_systems TEXT,
  automotive_interests TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### download_requests Table

```sql
CREATE TABLE download_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  download_type TEXT NOT NULL, -- 'whitepaper', 'conference-paper', 'video'
  item_id TEXT NOT NULL,
  item_title TEXT NOT NULL,
  dl_type TEXT,
  dl_title TEXT,
  dl_url TEXT,
  title_tag TEXT,
  category_tag TEXT,
  consent BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Edge Functions Implementation

### register-event

**Location:** `supabase/functions/register-event/index.ts`

**Key Logic:**

1. **Duplicate Check:**
   ```typescript
   const { data: existing } = await supabase
     .from("event_registrations")
     .select("id")
     .eq("email", data.email)
     .eq("event_slug", data.eventSlug)
     .single();
   
   if (existing) {
     return new Response(JSON.stringify({ 
       error: "already_registered",
       message: "You are already registered for this event" 
     }), { status: 409 });
   }
   ```

2. **Check Existing Mautic Contact:**
   ```typescript
   const searchResponse = await fetch(
     `${mauticBaseUrl}/api/contacts?search=email:${encodeURIComponent(data.email)}`,
     { headers: { "Authorization": `Basic ${basicAuth}` } }
   );
   ```

3. **Create New Contact (POST):**
   ```typescript
   const newContactData = {
     email: data.email,
     firstname: data.firstName,
     lastname: data.lastName,
     company: data.company,
     position: data.position,
     marketing_optin: "pending",
     tags: ["evt", `evt:${data.eventSlug}`],
     // ... event-specific fields
   };
   
   await fetch(`${mauticBaseUrl}/api/contacts/new`, {
     method: "POST",
     headers: { "Authorization": `Basic ${basicAuth}` },
     body: JSON.stringify(newContactData)
   });
   ```

4. **Update Existing Contact (PATCH) with Tag Combination:**
   ```typescript
   // Fetch existing tags first
   const contactResponse = await fetch(`${mauticBaseUrl}/api/contacts/${mauticContactId}`);
   const existingTags = contactData.contact.tags.map(tag => tag.tag || tag);
   
   // Combine with new tags
   const newEventTag = `evt:${data.eventSlug}`;
   const allTags = [...new Set([...existingTags, "evt", newEventTag])];
   
   // Update with combined tags
   const updateData = {
     // ... updated fields
     tags: allTags
   };
   
   await fetch(`${mauticBaseUrl}/api/contacts/${mauticContactId}/edit`, {
     method: "PATCH",
     body: JSON.stringify(updateData)
   });
   ```

### send-download-email

**Location:** `supabase/functions/send-download-email/index.ts`

**Similar logic to register-event:**
- Check existing contact
- POST for new contacts with `marketing_optin: "pending"`
- PATCH for existing contacts (preserve marketing_optin and existing tags)
- Add download-specific tags based on `download_type`

### track-mautic-pageview

**Location:** `supabase/functions/track-mautic-pageview/index.ts`

**Tracks pageviews for marketing analytics:**
- Requires email from localStorage (`mautic_email`)
- Sends pageview data to Mautic API

---

## Known Issues & Future Improvements

### Current Known Issues

1. **Email Templates - Images Not Displaying:**
   - **Issue:** Logos and images in Mautic email templates are not displaying correctly
   - **Cause:** Likely external image URL references in Mautic v5
   - **Solution Required:** Images must be uploaded to Mautic Assets/Media and referenced via Mautic-generated URLs
   - **Status:** Documented for future fix - DO NOT CHANGE WORKFLOW

2. **Email Design:**
   - Current email templates are functional but not visually polished
   - Requires design iteration in Mautic email builder
   - Status: Deferred for future improvement

### Future Enhancements

- Implement email template improvements with proper logo/image handling
- Add more sophisticated segment rules in Mautic
- Consider webhook integration for real-time sync (optional)

---

## Change Log

### Version 2.0 (2025-11-26)
- **CRITICAL FIX:** Implemented tag combination logic for existing contacts in `register-event`
- **Behavior:** Contacts registering for multiple events now appear in ALL event segments
- **Previous Bug:** Only the latest event segment was assigned, overwriting previous event tags
- **Implementation:** Added GET request to fetch existing tags before PATCH update
- **Result:** Multi-event registrations now work correctly with full segment preservation

### Version 1.0 (Initial Implementation)
- Basic event registration and download request workflows
- Contact creation and update logic
- Tag system implementation
- Database schema setup
- Edge Functions deployment

---

## Support & Maintenance

**Important Notes for Developers:**

1. **DO NOT modify the Mautic workflow without documentation update**
2. **ALWAYS test with multiple registrations from the same email**
3. **ALWAYS verify tag combination in Mautic after changes**
4. **Edge Functions auto-deploy** - changes are live immediately
5. **Monitor Edge Function logs** for Mautic API errors

**Testing Checklist:**
- [ ] New contact event registration (should create contact in Mautic)
- [ ] Existing contact event registration (should preserve existing tags)
- [ ] Multi-event registration (same contact, different events)
- [ ] Download request from new contact
- [ ] Download request from existing event registrant
- [ ] Verify segments in Mautic after each test

---

**End of Protocol**
