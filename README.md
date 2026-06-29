# Shakeel Ahmad Realtor — Website (2.0)

A light, modern, conversion-focused real estate personal-brand website for
**Shakeel Ahmad**, Licensed New York Real Estate Salesperson with **Platinum Properties**.

Static site — plain **HTML5 + CSS + vanilla JavaScript**. **No frameworks, no build step,
no dependencies** beyond Google Fonts. Fast, hostable anywhere, easy to maintain.

---

## Quick start (preview locally)

```bash
python3 -m http.server 8000     # → http://localhost:8000
# or
npx serve .
```

> Use a local server (not `file://`) so the property page can read `?id=` params.

---

## Pages (3 main + 1 detail template)

```
/
├── index.html            # Home + Portfolio + Media + Contact (short lead form)
├── properties.html       # Listings: search, filters, grid
├── property.html         # Single listing detail (reads ?id=slug) — linked from cards
├── buyers-sellers.html   # Lead-gen: buyer & seller paths + detailed forms
├── robots.txt  sitemap.xml  README.md
└── assets/
    ├── img/shakeel-ahmad.jpg
    ├── css/styles.css     # Full light design system (one file)
    └── js/
        ├── data.js        # SITE + STATS + PROPERTIES + TRANSACTIONS + MEDIA (SINGLE SOURCE OF TRUTH)
        ├── main.js        # Nav, reveals, counters, renderers, filters, forms
        └── property.js    # Renders property.html from ?id=
```

Navigation: **Home · Properties · Buyers & Sellers · Contact** (Contact = button to the
homepage `#contact` form). Sticky header; sticky mobile Call + Consultation bar.

---

## Data-driven "add one object" rule

All listings live in `assets/js/data.js`. **Adding one object to `PROPERTIES`** automatically
renders its card (grid + Home featured if `featured: true`), includes it in every filter,
generates its detail page at `property.html?id=<slug>`, and lists it under **Related
Properties** — with zero other edits.

Portfolio entries (`TRANSACTIONS`), media tiles (`MEDIA`) and stats (`STATS`) are rendered
the same way. To plug in a CMS/MLS feed later, replace these arrays with an API response of
the **same shape** — no view code changes.

---

## Design system

**Palette (HEX):**

| Token | Value | Use |
|---|---|---|
| White | `#FFFFFF` | base background |
| Off-white | `#FAFBFC` | subtle surfaces |
| Light gray | `#F5F7FA` / `#EEF2F7` | section backgrounds |
| Charcoal | `#16202E` | body text |
| Ink | `#0B1422` | headings |
| Navy (primary) | `#102A4E` | primary buttons, brand, dark bands |
| Blue (accent) | `#2D5BA8` | links, secondary actions, icons |
| Gold (luxury accent) | `#C2A053` (light `#E4CC8C`, dark `#9B7C34`) | accents, top CTA per section |

Navy + blue do the heavy lifting; **gold is a restrained luxury accent** (eyebrow ticks,
hairlines, the single most important CTA per section).

**Typography (Google Fonts):** **Space Grotesk** (display/headlines) + **Manrope** (body/UI).

**Components:** glass hero card with a custom **animated isometric architecture SVG**,
floating trust badges, rounded cards (16–28px), soft shadows, **animated counters**,
fade-in-on-scroll, hover lift, sticky glass header, sticky mobile CTA bar. All motion
respects `prefers-reduced-motion`.

---

## Forms (lead capture)

- **Home:** short consultation lead form (`#contact`).
- **Buyers & Sellers:** Buyer Consultation, Seller Consultation + Home Valuation, and an
  Appointment Request — each capturing name, phone, email, preferred contact method,
  message, buying/selling, budget, timeline and city.
- **Property detail:** Schedule a Showing.

All forms validate client-side, show a success state, and `console.log` the payload.
**To deliver leads, connect a real endpoint** (Formspree etc.) — search
`Connect a real endpoint` in `assets/js/main.js`.

---

## SEO

- Unique title/description/canonical + Open Graph + Twitter tags per page.
- `RealEstateAgent` (Local Business) JSON-LD on the Home page with real NAP, `areaServed`,
  `openingHours`, and a `sameAs` array of all social/review profiles.
- Semantic HTML, one `<h1>` per page, skip link, visible focus, lazy images.
- `robots.txt` + `sitemap.xml` (kept in sync with the page list).

---

## Brand / agent data (single source in `data.js` — do not invent)

| Field | Value |
|---|---|
| Name | Shakeel Ahmad — Licensed Real Estate Salesperson |
| Brokerage | Platinum Properties |
| License | NYS License #10401314142 |
| Cell/text | (718) 696-9245 |
| Office | (585) 458-4250 |
| Email | info@shakeelahmadrealtor.com |
| Address | 2270 Latta Road, Greece, NY 14612 |
| Hours | Mon–Sat, 8:00 AM – 8:00 PM |
| Specialty | Probate & time-sensitive / estate sales |

Footer shows the brokerage name and **Equal Housing Opportunity** (NY advertising rule).

---

## Before launch — checklist

- [ ] Replace sample listings in `data.js` with live/MLS data and real photos.
- [ ] Swap media-gallery placeholders for real photos and video thumbnails.
- [ ] Connect the form endpoint (Formspree/Netlify) → `info@shakeelahmadrealtor.com`.
- [ ] Confirm `info@shakeelahmadrealtor.com` mailbox/forwarding is live.
- [ ] Resolve the full Google Business Profile URL (replace the `share.google` short link).
- [ ] (Optional) Dedicated 1200×630 social share image (OG currently uses the headshot).
- [ ] Confirm brokerage display name vs. license ("Platinum Properties and Asset Management of Rochester").
- [ ] Point `www.shakeelahmadrealtor.com` DNS at the host; submit sitemap to Search Console.

---

© Shakeel Ahmad · Platinum Properties · NYS License #10401314142 · Equal Housing Opportunity
