# Spade CMS Theme Customization Guide

## Quick Start: Changing Your Brand Colors

To customize the CMS for your brand, edit **only** the `src/index.css` file.

### Step 1: Find the Theme Tokens Section

Look for this section in `src/index.css`:

```css
/* ========================================
   THEME TOKENS - TENANT CUSTOMIZABLE
   Replace these values for custom branding
   ======================================== */
```

### Step 2: Change Your Brand Colors

Replace these HSL values with your brand colors:

```css
/* Brand Primary - Main accent color */
--brand-primary: 52 95% 56%;           /* Your primary color (buttons, highlights) */
--brand-primary-foreground: 0 0% 0%;    /* Text on primary color */
--brand-primary-hover: 52 95% 48%;      /* Hover state */

/* Brand Secondary - Supporting color */
--brand-secondary: 211 77% 28%;         /* Secondary accent */
--brand-secondary-foreground: 0 0% 100%; /* Text on secondary */
```

### Step 3: Converting HEX to HSL

Use any online converter, or these examples:

| Brand Color | HEX | HSL Values |
|-------------|-----|------------|
| Spade Yellow | #f9dc24 | 52 95% 56% |
| Corporate Blue | #2563eb | 217 91% 53% |
| Tech Green | #22c55e | 142 71% 45% |
| Startup Purple | #8b5cf6 | 258 90% 66% |

---

## Semantic Token Reference

### Brand Tokens (Tenant-Specific)
| Token | Usage | Default |
|-------|-------|---------|
| `--brand-primary` | CTA buttons, highlights | Yellow |
| `--brand-secondary` | Secondary actions | Blue |
| `--cta-button` | Call-to-action buttons | = brand-primary |
| `--editor-accent` | Admin UI highlights | Blue |

### System Tokens (Usually unchanged)
| Token | Usage |
|-------|-------|
| `--background` | Page background |
| `--foreground` | Main text color |
| `--primary` | System primary (links) |
| `--muted` | Subtle backgrounds |
| `--border` | Borders |

---

## Tailwind Classes

Use these classes in components:

```tsx
// ✅ CORRECT - Uses tokens
<Button className="bg-brand-primary text-brand-primary-foreground">
  Click me
</Button>

// ❌ WRONG - Hardcoded color
<Button className="bg-[#f9dc24] text-black">
  Click me
</Button>
```

### Available Classes

- `bg-brand-primary` / `text-brand-primary`
- `bg-brand-primary-hover` / `hover:bg-brand-primary-hover`
- `bg-brand-secondary` / `text-brand-secondary`
- `bg-cta` / `text-cta-foreground`
- `bg-editor-accent` / `text-editor-accent-foreground`

---

## Migration Checklist

When setting up a new tenant project:

1. [ ] Copy `src/index.css` to new project
2. [ ] Update `--brand-primary` with tenant color
3. [ ] Update `--brand-secondary` if needed
4. [ ] Test buttons, highlights, and editor UI
5. [ ] Verify contrast ratios for accessibility

---

## Example: Corporate Blue Theme

```css
:root {
  /* Brand Primary - Corporate Blue */
  --brand-primary: 217 91% 53%;
  --brand-primary-foreground: 0 0% 100%;
  --brand-primary-hover: 217 91% 45%;
  
  /* Brand Secondary - Navy */
  --brand-secondary: 222 47% 20%;
  --brand-secondary-foreground: 0 0% 100%;
}
```

---

## Version History

- **v1.3.0** - Design Layer Architecture introduced
- Semantic tokens: `--brand-primary`, `--cta-button`, `--editor-accent`
- Tailwind classes: `bg-brand-primary`, `text-cta-foreground`
