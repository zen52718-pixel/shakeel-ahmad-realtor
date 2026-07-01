# Shakeel Ahmad Realtor — Website (3.0)

A lean, premium, conversion-focused real estate personal-brand website for
**Shakeel Ahmad**, Licensed New York Real Estate Salesperson with **Platinum Properties**.

Static site — plain **HTML5 + CSS + vanilla JavaScript**. **No frameworks, no build step,
no dependencies** beyond Google Fonts. Fast, hostable anywhere, easy to maintain.

Content is deliberately minimal — every section on the homepage exists to build trust or
generate a lead. No testimonials, stat counters, media gallery, portfolio section, or long
process timelines. See `CLAUDE.md` for the full content-discipline rules.

---

## Quick start (preview locally)

```bash
python3 -m http.server 8000     # → http://localhost:8000
# or
npx serve .
```

> Use a local server (not `file://`) so the property page can read `?id=` params.

---

## Pages (4)

```
/
├── index.html       # Home: hero, 3 services, About, 3 featured listings, FAQ, short lead form
├── properties.html   # Listings: search, filters, grid
├── property.html      # Single listing detail (reads ?id=slug) — linked from cards
├── contact.html        # Seller-focused Home Valuation form (primary lead-gen page)
├── robots.txt  sitemap.xml  README.md
└── assets/
    ├── img/
    │   ├── shakeel-ahmad.jpg              # portrait headshot
    │   └── shakeel-hero-clipboard.png     # transparent cutout photo, homepage hero
    ├── css/styles.css     # Full design system (one file)
    └── js/
        ├── data.js        # SITE + PROPERTIES (SINGLE SOURCE OF TRUTH)
        ├── main.js        # Nav, reveals, featured-properties renderer, filters, forms
        └── property.js    # Renders property.html from ?id=
```

Navigation: **Home · Properties · About · Contact** — sticky on every page. `About` is an
anchor to `index.html#about` (kept as one concise homepage section, not a separate page).
`Contact` is the dedicated `contact.html` page with the Home Valuation form.

---

## Data-driven "add one object" rule

All listings live in `assets/js/data.js`. **Adding one object to `PROPERTIES`** automatically
renders its card (grid + Home featured, if `featured: true`), includes it in every filter,
generates its detail page at `property.html?id=<slug>`, and lists it under **Related
Properties** — with zero other edits. To plug in a CMS/MLS feed later, replace the array
with an API response of the **same shape** — no view code changes.

Exactly **3** `PROPERTIES` entries are `featured: true` — the homepage always shows exactly
3 featured listings + a "View All Properties" button, by design.

---

## Design system

**Palette (HEX):**

| Token | Value | Use |
|---|---|---|
| White | `#FFFFFF` | base background |
| Off-white | `#FBF6EF` | subtle surfaces |
| Sand | `#F6EEE0` / `#F0E2C8` | section backgrounds |
| Charcoal | `#3A2A1E` | body text |
| Ink | `#241811` | headings |
| Espresso (primary) | `#2B1B12` | primary buttons, dark bands |
| Terracotta (accent) | `#C8752E` | links, secondary actions, icons |
| Honey gold (luxury accent) | `#E0A64E` (light `#F0C78A`, dark `#B67A2E`) | accents, one CTA per section |

Cream/sand surfaces dominate; the dark espresso band is used sparingly (About section,
Contact-form band). Gold is a restrained accent — never decorative or evenly distributed.

**Typography (Google Fonts):** **Space Grotesk** (display/headlines) + **Manrope** (body/UI).

**Components:** bold warm-gradient hero with Shakeel's real transparent-cutout photo (no
stock art, no card frame); the signature **arch/dome** motif (`.arch-top` / `.arch-frame`)
on the hero, About, and service cards; native `<details>/<summary>` FAQ accordion; sticky
glass header; sticky mobile Call + "Get Valuation" CTA bar. All motion respects
`prefers-reduced-motion`.

---

## Forms (lead capture) — exactly two, sitewide

- **Home** (`index.html#contact`) — short: Name, Phone, Email, Message.
- **Contact page** (`contact.html`) — Home Valuation: Name, Phone, Email, Property Address,
  City, Property Type, Estimated Selling Timeline, Message.
- *(Exception, not a marketing form)* **Property detail** — "Schedule a Showing," tied to a
  specific listing.

All forms validate client-side, show a success state, and `console.log` the payload.
**To deliver leads, connect a real endpoint** (Formspree etc.) — search
`Connect a real endpoint` in `assets/js/main.js`.

---

## SEO

- Unique title/description/canonical + Open Graph + Twitter tags per page.
- `RealEstateAgent` (Local Business) JSON-LD on the Home page with real NAP, `areaServed`
  (NYC, Rochester, Upstate New York), `openingHours`, and a `sameAs` array of social profiles.
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
| Primary markets | New York City, Rochester, Upstate New York |

Footer shows the brokerage name and **Equal Housing Opportunity** (NY advertising rule).

---

## Before launch — checklist

- [ ] Replace sample listings in `data.js` with live/MLS data and real photos.
- [ ] Connect the form endpoint (Formspree/Netlify) → `info@shakeelahmadrealtor.com`.
- [ ] Confirm `info@shakeelahmadrealtor.com` mailbox/forwarding is live.
- [ ] Resolve the full Google Business Profile URL (replace the `share.google` short link).
- [ ] (Optional) Dedicated 1200×630 social share image (OG currently uses the headshot).
- [ ] Confirm brokerage display name vs. license ("Platinum Properties and Asset Management of Rochester").
- [ ] Point `www.shakeelahmadrealtor.com` DNS at the host; submit sitemap to Search Console.

---

© Shakeel Ahmad · Platinum Properties · NYS License #10401314142 · Equal Housing Opportunity
