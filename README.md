# Shakeel Ahmad Realtor — Website (2.1)

A warm, modern, conversion-focused real estate personal-brand website for
**Shakeel Ahmad**, Licensed New York Real Estate Salesperson with **Platinum Properties**.

Static front end — plain **HTML5 + CSS + vanilla JavaScript**, no frameworks, no build
step. The one dynamic piece is **listings**, which live in **Supabase** (Postgres + Auth +
Storage) and are managed by Shakeel himself through a private admin panel — no code
editing required to add, edit, or remove a property.

---

## Quick start (preview locally)

```bash
python3 -m http.server 8000     # → http://localhost:8000
# or
npx serve .
```

> Use a local server (not `file://`) — the property page reads `?id=` params, and
> `admin.html` / listing pages load Supabase as an ES module.

---

## Pages

```
/
├── index.html            # Home + Portfolio + Media + Contact (single lead form)
├── properties.html       # Live listings from Supabase: search, filters, grid
├── property.html         # Single listing detail (reads ?id=slug) — linked from cards
├── buyers-sellers.html   # Buyer/seller paths + the same shared lead form
├── admin.html            # PRIVATE — Shakeel's listings dashboard (Supabase Auth login)
├── robots.txt  sitemap.xml  README.md  CLAUDE.md
├── supabase/
│   ├── schema.sql         # Run once in the Supabase SQL Editor: table + RLS + storage policies
│   └── seed.sql            # Optional: 6 sample listings so the site isn't empty at first
└── assets/
    ├── img/                        # real photos (headshot, hero cutout)
    ├── css/styles.css              # Full design system (one file, incl. the admin panel)
    └── js/
        ├── data.js                 # SITE + STATS + TRANSACTIONS + MEDIA + AREAS (static content only)
        ├── supabase-config.js      # The ONE Supabase client (ES module, publishable key)
        ├── main.js                 # Nav, reveals, counters, listings fetch/render, filters, the shared form
        ├── property.js             # Renders property.html from ?id= (fetches from Supabase)
        └── admin.js                # admin.html's login + CRUD + photo upload logic
```

Navigation: **Home · Properties · Buyers & Sellers · Contact** (Contact = button to the
homepage `#contact` form). `admin.html` is intentionally not in the nav or sitemap —
it's reached by typing the URL directly, and is blocked from search indexing
(`noindex` + `robots.txt`).

---

## Listings: Supabase, managed via /admin.html

Listings used to be a static array in `data.js`. **They are now rows in Supabase**, and
the only supported way to add, edit, or delete one is:

1. Go to `yourdomain.com/admin.html`.
2. Log in with Shakeel's Supabase Auth credentials (created manually in the Supabase
   dashboard — there is no public sign-up anywhere).
3. **Add New Property** / **Edit** / **Delete**. Photos upload by drag-and-drop or file
   picker directly to Supabase Storage; the resulting URLs are saved automatically.

The change appears on `index.html` (if "Featured"), `properties.html`, and its own
`property.html?id=<slug>` page **immediately** — no deploy, no code change.

### Architecture

- **Table:** `properties` (see `supabase/schema.sql` for the full column list — address,
  city, state, zip, price, status, type, beds, baths, sqft, year built, descriptions,
  features, featured flag, photo URLs).
- **Row Level Security is the actual access control.** The browser only ever holds the
  Supabase *publishable* (anon) key — safe to expose, because RLS policies say:
  anyone can `SELECT`; only an **authenticated** session can `INSERT` / `UPDATE` /
  `DELETE`. The public site and `admin.html` use the identical key; the difference is
  purely whether the visitor is logged in.
- **Storage bucket:** `property-photos` (public read; authenticated-only write), same
  RLS pattern.
- **Front end:** `assets/js/main.js` exposes `fetchProperties()` (fetches + caches all
  rows once per page load) and `mapPropertyRow()` (adapts Supabase's snake_case columns
  — `year_built`, `short_desc` — into the camelCase shape the render functions expect —
  `yearBuilt`, `short`). `propertyCardHTML()`, the properties-page filters, and
  `property.js`'s detail renderer are otherwise **unchanged** from the old static-array
  version; only where the data comes from is different.
- **To reset your local Supabase project:** run `supabase/schema.sql`, then optionally
  `supabase/seed.sql`, in the Supabase SQL Editor.

`SITE`, `STATS`, `TRANSACTIONS`, `MEDIA`, and `AREAS` remain static in `data.js` — only
listings moved to Supabase.

---

## Design system

**Palette (HEX) — warm editorial, not the original navy/blue:**

| Token | Value | Use |
|---|---|---|
| White / off-white | `#FFFFFF` / `#FBF6EF` | base background |
| Sand / gray | `#F6EEE0` / `#F0E2C8` | section backgrounds |
| Charcoal | `#3A2A1E` | body text |
| Ink | `#241811` | headings |
| Navy token → espresso | `#2B1B12` (`--navy`) | primary buttons, dark bands (hero gradient, About, Contact) |
| Blue token → terracotta | `#C8752E` (`--blue`) | links, secondary actions, filter focus rings |
| Gold token → honey-gold | `#E0A64E` (`--gold`, light `#F0C78A`, dark `#B67A2E`) | luxury accent CTA per section |

(Token *names* in `styles.css` — `--navy`, `--blue`, `--gold` — are historical; only the
resolved colors changed to this warmer palette. Every page reskins from that one file.)

**Typography (Google Fonts):** **Space Grotesk** (display/headlines) + **Manrope** (body/UI).

**Components:** warm gradient hero with a real cutout photo in a signature arch/dome
frame, floating trust badges, rounded cards, soft shadows, animated stat counters,
fade-in-on-scroll, hover lift, sticky glass header, sticky mobile CTA bar. All motion
respects `prefers-reduced-motion`.

---

## Forms (lead capture)

**Exactly one form exists, used everywhere** — Full Name, Phone, Email, "I'm interested
in" (Buying / Selling / Probate or estate sale / Just exploring), optional Message, and
a hidden `source_page` auto-filled per context (e.g. "Home", or the specific property
address on `property.html`).

- One HTML template (`consultationFormHTML()` in `main.js`), one mount helper
  (`mountConsultationForm()`), one submit handler (`initForms()`) — every page calls the
  same functions, nothing is copy-pasted.
- Validates client-side, shows a success state, and `console.log`s the payload.
- **To connect a real endpoint** (e.g. a GoHighLevel webhook): search
  `Connect a real endpoint` in `assets/js/main.js` — it's the one place in the whole
  codebase that sends form data anywhere.

The admin panel (`admin.html`) is a **separate, unrelated form system** (property
CRUD, not lead capture) — see `assets/js/admin.js`.

---

## SEO

- Unique title/description/canonical + Open Graph + Twitter tags per page.
- `RealEstateAgent` (Local Business) JSON-LD on the Home page with real NAP, `areaServed`,
  `openingHours`, and a `sameAs` array of all social/review profiles.
- Semantic HTML, one `<h1>` per page, skip link, visible focus, lazy images.
- `robots.txt` + `sitemap.xml` (kept in sync with the public page list — `admin.html` is
  deliberately excluded from both).

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

- [ ] Run `supabase/schema.sql` (and optionally `supabase/seed.sql`) in the Supabase SQL Editor.
- [ ] Create Shakeel's one Supabase Auth login (Authentication → Users) — email + password.
- [ ] Log into `/admin.html` and replace the seeded sample listings with real ones + real photos.
- [ ] Swap media-gallery placeholders (`MEDIA` in `data.js`) for real photos and video thumbnails.
- [ ] Connect the consultation form to a real endpoint (search `Connect a real endpoint` in `main.js`).
- [ ] Confirm `info@shakeelahmadrealtor.com` mailbox/forwarding is live.
- [ ] Resolve the full Google Business Profile URL (replace the `share.google` short link).
- [ ] Point `www.shakeelahmadrealtor.com` DNS at the host; submit sitemap to Search Console.

---

© Shakeel Ahmad · Platinum Properties · NYS License #10401314142 · Equal Housing Opportunity
