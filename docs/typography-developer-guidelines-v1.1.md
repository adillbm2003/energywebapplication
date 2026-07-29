# Typography Developer Guidelines

**Version 1.1 — June 2026**
Applies to all code-based applications (web frontends and internal tools). Every screen must follow these rules. No exceptions without design-lead approval.

---

## 1. Font Types & When to Use Them

| Font Type | Characteristics | Where We Use It |
|---|---|---|
| **Sans-serif** | Clean, no decorative strokes — best on screens | All UI: headings, body, buttons, forms, tables |
| **Monospace** | Fixed-width characters | Code blocks, IDs, logs, technical values |
| **Serif** | Decorative strokes, print-style | ❌ Not used in our applications |
| **Display / decorative** | Stylized, attention-grabbing | ❌ Not used — marketing assets only, with approval |

**Rule:** UI text is always sans-serif. Monospace only for code/technical content. Nothing else ships.

### Font File Formats
- Use **WOFF2** for all self-hosted web fonts (best compression, universal browser support).
- Load with `font-display: swap` to avoid invisible text while loading.
- Limit to the 3 weight files actually used (400, 600, 700) — do not load the full family.

---

## 2. Approved Fonts

| Usage | Font Type | Primary Font | Fallback Stack |
|---|---|---|---|
| All UI text (headings, body, labels, buttons) | Sans-serif | Inter | `Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` |
| Code, logs, technical values | Monospace | JetBrains Mono | `"JetBrains Mono", Consolas, "Courier New", monospace` |
| Exported documents (Word, PDF) | Sans-serif | Calibri | Arial |

**Rules:**
- Maximum **2 font families** per product (one primary + one monospace).
- Never install or reference fonts outside this list.
- Always include the full fallback stack — never a single font name.
- Self-host web fonts or use a licensed CDN; do not hotlink random font files.

---

## 3. Type Scale (px / rem)

Base size: **16px = 1rem**. Use rem in CSS, never hardcoded px for text.

| Token | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| `display` | 40px / 2.5rem | 1.2 | 700 | Hero/landing headlines only |
| `h1` | 32px / 2rem | 1.25 | 700 | Page title (one per page) |
| `h2` | 24px / 1.5rem | 1.3 | 600 | Section headings |
| `h3` | 20px / 1.25rem | 1.4 | 600 | Sub-sections, card titles |
| `h4` | 18px / 1.125rem | 1.4 | 600 | Minor headings |
| `body` | 16px / 1rem | 1.5 | 400 | Default paragraph text |
| `body-small` | 14px / 0.875rem | 1.5 | 400 | Secondary text, table cells |
| `caption` | 12px / 0.75rem | 1.4 | 400 | Labels, helper text, timestamps |

**Hard limits:**
- **Never below 12px** for any visible text (accessibility).
- Body text on mobile must stay **16px** — smaller triggers zoom on iOS inputs.
- Line length: 50–75 characters per line for readable paragraphs.

---

## 4. Font Weights

Use only: **400 (Regular), 600 (Semibold), 700 (Bold)**.

- Do not use 100–300 (too thin, fails contrast on most screens).
- Do not fake bold with `<b>` on already-bold fonts.
- Emphasis inside body text: semibold (600), not italic, not ALL CAPS.

---

## 5. Implementation Standard (CSS)

All sizes must come from design tokens — no magic numbers in components.

```css
/* Self-hosted font loading (WOFF2 only, swap to avoid blank text) */
@font-face {
  font-family: "Inter";
  src: url("/fonts/inter-400.woff2") format("woff2");
  font-weight: 400;
  font-display: swap;
}

:root {
  --font-primary: Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --font-mono: "JetBrains Mono", Consolas, monospace;

  --text-display: 2.5rem;
  --text-h1: 2rem;
  --text-h2: 1.5rem;
  --text-h3: 1.25rem;
  --text-h4: 1.125rem;
  --text-body: 1rem;
  --text-small: 0.875rem;
  --text-caption: 0.75rem;

  --leading-tight: 1.25;
  --leading-normal: 1.5;
}

body {
  font-family: var(--font-primary);
  font-size: var(--text-body);
  line-height: var(--leading-normal);
}
```

❌ `font-size: 17px;`
✅ `font-size: var(--text-body);`

---

## 6. Accessibility (WCAG 2.2 — Mandatory)

- Contrast ratio: **4.5:1 minimum** for body text, 3:1 for text ≥ 24px or ≥ 19px bold.
- Text must scale to **200% zoom** without loss of content or function.
- Never convey meaning with font style alone (e.g., red text = error must also have an icon/label).
- Respect user font-size settings — this is why we use `rem`, not `px`.

---

## 7. Do / Don't Summary

| ✅ Do | ❌ Don't |
|---|---|
| Use tokens/variables for all sizes | Hardcode pixel values in components |
| Stick to the 8 sizes in the scale | Invent in-between sizes (15px, 17px, 19px) |
| One h1 per page, in order (h1→h2→h3) | Skip heading levels for visual effect |
| Use 400/600/700 weights only | Use thin or italic weights for UI text |
| Keep body text ≥ 16px on web | Ship any text under 12px |

---

## 8. Code Review Checklist

Before approving any PR, reviewers confirm:

- [ ] No hardcoded font sizes — tokens/variables only
- [ ] Font family matches the approved stack with fallbacks
- [ ] Correct font type used (sans-serif for UI, monospace for code only)
- [ ] No text below 12px
- [ ] Fonts loaded as WOFF2 with `font-display: swap`
- [ ] Heading hierarchy is semantic and in order
- [ ] Contrast checked for new text colors
- [ ] Mobile body text is 16px

---

## 9. Exceptions

Any deviation requires written sign-off from the design lead and must be documented in the project README with a reason and expiry date.
