# Event Confirmation Email Template
**Version:** 1.0  
**Status:** PRODUCTION - Logo URL will be replaced with Base64  
**Created:** 2025-12-01

## Description
This is the standard HTML email template for Event Registration confirmations sent via Mautic. The template uses the same design as the Opt-In template with event-specific content.

## Template Specifications
- **Logo Source:** Supabase Storage (to be replaced with Base64 by user)
- **Logo URL:** `https://afrcagkprhtvvucukubf.supabase.co/storage/v1/object/public/page-images/media/logo_ci/1764577403945-Logo-test-iQ-IE_V7.png`
- **Logo Style:** White (inverted via CSS filter)
- **Primary CTA Color:** #f9dc24 (IE Yellow)
- **Layout:** Single column, max-width 768px, centered
- **Email Client Compatibility:** Inline styles for maximum compatibility

## Complete HTML Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Registration Confirmed</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(to bottom right, #f8fafc, #ffffff, #f8fafc);">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 768px; margin: 80px auto; background: #ffffff; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border-radius: 8px; overflow: hidden;">
    
    <!-- Header with Logo -->
    <tr>
      <td style="background: linear-gradient(to right, #0f172a, #1e293b); padding: 32px; text-align: center;">
        <img src="https://afrcagkprhtvvucukubf.supabase.co/storage/v1/object/public/page-images/media/logo_ci/1764577403945-Logo-test-iQ-IE_V7.png" alt="Image Engineering" style="height: 64px; filter: brightness(0) invert(1);" />
      </td>
    </tr>
    
    <!-- Email Content -->
    <tr>
      <td style="padding: 40px 32px;">
        
        <!-- Title Section -->
        <div style="margin-bottom: 32px;">
          <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: #0f172a; line-height: 1.2;">
            Event Registration Confirmed
          </h1>
          <div style="height: 4px; width: 80px; background-color: #f9dc24; border-radius: 9999px;"></div>
        </div>
        
        <!-- Greeting -->
        <div style="margin-bottom: 32px;">
          <p style="margin: 0 0 16px 0; font-size: 18px; color: #334155;">
            Hello {contactfield=firstname} {contactfield=lastname},
          </p>
          <p style="margin: 0 0 16px 0; font-size: 16px; color: #475569; line-height: 1.6;">
            Thank you for registering for our event. We're excited to confirm your participation!
          </p>
        </div>
        
        <!-- Event Details Section -->
        <div style="background-color: #f3f3f5; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; margin-bottom: 32px;">
          <div style="margin-bottom: 24px;">
            <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600; color: #0f172a;">
              {contactfield=event_title}
            </h2>
            <div style="height: 2px; width: 60px; background-color: #f9dc24; border-radius: 9999px; margin-bottom: 16px;"></div>
          </div>
          
          <!-- Event Info Grid -->
          <div style="margin-bottom: 24px;">
            <table width="100%" cellpadding="8" cellspacing="0">
              <tr>
                <td style="font-size: 14px; font-weight: 600; color: #0f172a; padding: 8px 0;">
                  📅 Date:
                </td>
                <td style="font-size: 14px; color: #475569; padding: 8px 0;">
                  {contactfield=event_date}
                </td>
              </tr>
              <tr>
                <td style="font-size: 14px; font-weight: 600; color: #0f172a; padding: 8px 0;">
                  📍 Location:
                </td>
                <td style="font-size: 14px; color: #475569; padding: 8px 0;">
                  {contactfield=event_location}
                </td>
              </tr>
              <tr>
                <td style="font-size: 14px; font-weight: 600; color: #0f172a; padding: 8px 0;">
                  👤 Registered as:
                </td>
                <td style="font-size: 14px; color: #475569; padding: 8px 0;">
                  {contactfield=firstname} {contactfield=lastname}
                </td>
              </tr>
              <tr>
                <td style="font-size: 14px; font-weight: 600; color: #0f172a; padding: 8px 0;">
                  🏢 Company:
                </td>
                <td style="font-size: 14px; color: #475569; padding: 8px 0;">
                  {contactfield=company}
                </td>
              </tr>
            </table>
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; padding-top: 8px;">
            <a href="https://preview--imageengeneeringv1-engl-v11.lovable.app/events" style="display: inline-block; background-color: #f9dc24; color: #000000; font-weight: 600; padding: 16px 40px; font-size: 16px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); text-decoration: none; border-radius: 8px;">
              View Event Details
            </a>
          </div>
        </div>
        
        <!-- Additional Information -->
        <div style="padding-top: 24px; border-top: 1px solid #e2e8f0; margin-bottom: 24px;">
          <div style="background-color: #f3f3f5; border-left: 4px solid #f9dc24; padding: 16px; border-radius: 0 8px 8px 0;">
            <p style="margin: 0 0 12px 0; font-size: 14px; color: #334155; line-height: 1.6;">
              <span style="font-weight: 600; color: #0f172a;">What's next?</span>
            </p>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #475569; line-height: 1.6;">
              <li style="margin-bottom: 8px;">You will receive a calendar invitation shortly</li>
              <li style="margin-bottom: 8px;">Event details and agenda will be sent 3 days before the event</li>
              <li>If you have any questions, feel free to contact us</li>
            </ul>
          </div>
        </div>
        
        <!-- Closing -->
        <div style="padding-top: 16px;">
          <p style="margin: 0 0 12px 0; font-size: 16px; color: #475569;">
            We're looking forward to seeing you!
          </p>
          <div>
            <p style="margin: 0 0 4px 0; font-size: 18px; font-weight: 600; color: #0f172a;">
              The Image Engineering Team
            </p>
            <p style="margin: 0; font-size: 14px; color: #64748b;">
              Experts in Automotive Imaging Standards
            </p>
          </div>
        </div>
        
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background-color: #0f172a; padding: 24px 32px; text-align: center;">
        <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8;">
          info@image-engineering.de
        </p>
        <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8;">
          © 2024 Image Engineering. All rights reserved.
        </p>
        <p style="margin: 0; font-size: 12px; color: #64748b;">
          Leading provider of automotive camera testing solutions
        </p>
      </td>
    </tr>
    
  </table>
  
</body>
</html>
```

## Mautic Dynamic Fields
The template uses the following Mautic contact fields:
- `{contactfield=firstname}` - Contact's first name
- `{contactfield=lastname}` - Contact's last name
- `{contactfield=company}` - Contact's company
- `{contactfield=event_title}` - Event title
- `{contactfield=event_date}` - Event date
- `{contactfield=event_location}` - Event location

## Critical Logo Line
```html
<img src="https://afrcagkprhtvvucukubf.supabase.co/storage/v1/object/public/page-images/media/logo_ci/1764577403945-Logo-test-iQ-IE_V7.png" alt="Image Engineering" style="height: 64px; filter: brightness(0) invert(1);" />
```

**Note:** User will replace this URL with Base64 data URI manually.

## Usage Instructions
1. Copy the complete HTML template into Mautic Email Editor (HTML mode)
2. Replace the logo `src` URL with Base64 data URI from `/logo-test` page
3. Ensure all Mautic contact fields are properly mapped in your Mautic instance
4. Ensure the CTA button URL points to the correct production domain
5. Test email rendering in multiple email clients before deployment

## Change Log
- **2025-12-01:** Initial version based on Opt-In template design

---
**Next Step:** User will manually replace Supabase URL with Base64 data URI for logo.
