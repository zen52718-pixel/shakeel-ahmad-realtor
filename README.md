# Shakeel Ahmad Realtor — Website

A production-ready, multi-page real estate marketing website for **Shakeel Ahmad**,
Licensed Real Estate Salesperson with **Platinum Properties** (Greece, NY).

Built as a **static site** — plain HTML5, CSS, and vanilla JavaScript. **No frameworks,
no build step, no dependencies** beyond Google Fonts. It loads fast, hosts anywhere, and
is easy to maintain.

---

## Quick start (preview locally)

From this folder, start any static server:

```bash
# Python (built in on most systems)
python3 -m http.server 8000
# then open http://localhost:8000

# …or Node
npx serve .
```

> Open the site through a local server (not by double-clicking the files), so the
> JavaScript can read `?id=` query params on the property page.

---

## File structure

```
/
├── index.html          # Home
├── properties.html     # All listings + live filters
├── property.html       # Single listing detail (reads ?id=slug)
├── about.html          # About + honest Portfolio (Recent Transactions)
├── contact.html        # Contact info + validated consultation form
├── robots.txt          # Crawler rules
├── sitemap.xml         # Sitemap (keep in sync with the page list)
├── README.md           # This file
└── assets/
    ├── css/
    │   └── styles.css  # Full design system (one shared stylesheet)
    └── js/
        ├── data.js     # SITE + PROPERTIES + TRANSACTIONS  (SINGLE SOURCE OF TRUTH)
        ├── main.js     # Nav, mobile menu, reveals, cards, grid + filters, forms
        └── property.js # Renders property.html from ?id=
```

---

## The "add one object" rule (data-driven)

All listings live in `assets/js/data.js`. **Adding one object to the `PROPERTIES`
array automatically:**

- renders its card on the Properties grid (and Home, if `featured: true`),
- includes it in every filter (city / type / price / status),
- generates its detail page at `property.html?id=<slug>`,
- and lists it under **Related Properties** on other listings.

…with **zero other edits**. Keep this guarantee intact.

### Property object shape

```js
{
  id: 'unique-slug',          // → property.html?id=unique-slug
  title: 'Lakefront Colonial',
  status: 'For Sale',         // 'For Sale' | 'Pending' | 'Sold'
  price: 539000,              // number (USD)
  address: '184 Edgemere Drive',
  city: 'Greece', state: 'NY', zip: '14612',
  type: 'Single-Family',      // Single-Family | Condo | Townhouse | Multi-Family | Land
  beds: 4, baths: 3, sqft: 2840, yearBuilt: 2006,
  lot: '0.42 acre',           // optional
  featured: true,             // show on Home
  sample: true,               // shows "sample — replace with MLS" tag
  short: 'One-line card description.',
  description: 'Full paragraph for the detail page.',
  features: ['Feature A', 'Feature B'],
  image: '…',                 // card image (see Images below)
  images: ['…', '…'],         // gallery images
}
```

---

## Images

Placeholder images are generated as **inline SVG gradient data-URIs** by
`svgPlaceholder()` in `data.js`, so the markup always uses real
`<img loading="lazy">` tags.

**To use real photos:** set each property's `image` (card) and `images[]` (gallery)
to photo URLs (or local paths like `assets/img/...`). Nothing else needs to change.

The About page headshot has a clearly commented swap spot in `about.html` (search
for `SWAP SPOT`). Replace the inline placeholder `<img>` with the real headshot.

---

## Forms

Both forms (Contact consultation + property "Schedule a Showing") validate client-side,
show a success state, and `console.log` the payload.

**To connect a real endpoint** (e.g. Formspree), search the codebase for
`Connect a real endpoint` in `assets/js/main.js` and follow the commented example.

---

## SEO

- Unique `<title>`, meta description, canonical, Open Graph + Twitter tags per page.
- `RealEstateAgent` JSON-LD on the Home page with real NAP, `areaServed`,
  `openingHours`, and a `sameAs` array of all social/review profiles.
- `robots.txt` + `sitemap.xml` (keep the sitemap in sync with the page list).
- Open Graph / Twitter share images currently point to the headshot
  (`assets/img/shakeel-ahmad.jpg`). Optionally swap in a dedicated 1200×630 image later.

---

## Brand / agent data (do not invent — single source in `data.js`)

| Field      | Value |
|------------|-------|
| Name       | Shakeel Ahmad — Licensed Real Estate Salesperson |
| Brokerage  | Platinum Properties |
| License    | NYS License #10401314142 |
| Cell/text  | (718) 696-9245 |
| Office     | (585) 458-4250 |
| Email      | info@shakeelahmadrealtor.com |
| Address    | 2270 Latta Road, Greece, NY 14612 |
| Hours      | Mon–Sat, 8:00 AM – 8:00 PM |
| Specialty  | Probate & time-sensitive / estate sales |

Footer shows the brokerage name and **Equal Housing Opportunity** (NY advertising rule).

---

## Before launch — checklist

- [ ] Replace sample listings in `data.js` with live/MLS data.
- [ ] Add real listing photos (the professional headshot is already in `assets/img/shakeel-ahmad.jpg`).
- [ ] (Optional) Add a dedicated 1200×630 social share image; OG/Twitter tags currently
      use the headshot, which social platforms will center-crop.
- [ ] Connect the form endpoint (Formspree or similar).
- [ ] Confirm the public email and resolve the full Google Business Profile URL.
- [ ] Verify the domain in canonical / Open Graph / sitemap URLs
      (`https://www.shakeelahmadrealtor.com/`).

---

## Future-proofing (add later without refactoring)

- **CMS / MLS feed** — replace the `PROPERTIES` array with an API response of the same shape.
- **Google Maps** — replace the styled `.map-ph` placeholders with map embeds.
- **Saved properties** — the heart/save action can hook into the existing card render.
- **Booking, mortgage calculator, blog / market reports, CRM/email/SMS** — drop into the
  existing sections and form endpoints.

---

## Tech & conventions

- Plain HTML5 + CSS + vanilla JS. Design tokens live in `:root` CSS variables.
- Mobile-first, fully responsive (desktop / laptop / tablet / mobile); no horizontal scroll.
- Accessible: semantic HTML, one `<h1>` per page, skip link, alt text, visible
  `:focus-visible`, large touch targets, and `prefers-reduced-motion` support.
- Typography: **Fraunces** (display), **Manrope** (body), **Space Mono** (labels/meta).

---

© Shakeel Ahmad · Platinum Properties · NYS License #10401314142 · Equal Housing Opportunity
