# CLAUDE.md — Shakeel Ahmad Realtor

Project memory for Claude Code. Read this before making changes. Keep it up to date
when architecture, brand facts, or conventions change.

## Project
A production-ready, multi-page **real estate marketing website** for a licensed New York
agent. Goal: premium brand presence, listings showcase, and lead generation. Front end is
a static site (plain HTML + CSS + vanilla JS, **no frameworks, no build step**) so it loads
fast and is easy to host anywhere. **Listings are the one dynamic piece** — they live in
**Supabase** (Postgres + Auth + Storage) and Shakeel manages them himself through a private
admin panel (`admin.html`), no code editing required. Everything else (brand content, forms)
stays static/client-side.

## Tech & conventions
- Plain HTML5 + CSS + vanilla JS for the front end. **No frameworks, no bundlers** — the one
  dependency beyond Google Fonts is the Supabase JS client, loaded from a CDN as an ES module.
- One shared stylesheet (`styles.css`, incl. the admin panel) and shared JS; design tokens
  live in `:root` CSS variables.
- Listings are data-driven from **Supabase**, not a static array — see "Backend (Supabase)"
  below. Static content (brand, stats, portfolio, media, areas) still lives in `data.js`.
- Clean, commented, reusable code. Descriptive names. No duplicated logic.
- Mobile-first and fully responsive (desktop / laptop / tablet / mobile). No horizontal scroll at any width.
- Accessibility: semantic HTML, one `<h1>` per page, skip link, alt text, visible `:focus-visible`, large touch targets.
- Ask before writing files; after a task, print a short file tree and the preview command, then wait for review.

## File / folder architecture (do not reorganize without reason)
A light, conversion-focused **3-page** site + a detail template + a private admin panel.
```
/
├── index.html            # Home + Portfolio + Media + Contact (single lead form)
├── properties.html       # Live listings (Supabase) + filters
├── property.html         # Single listing detail (reads ?id=slug) — linked from cards
├── buyers-sellers.html   # Buyer/seller paths + the same shared lead form
├── admin.html            # PRIVATE — Shakeel's listings dashboard (Supabase Auth login only)
├── robots.txt  sitemap.xml  README.md  CLAUDE.md
├── supabase/
│   ├── schema.sql          # Run once in Supabase SQL Editor: table + RLS + storage policies
│   └── seed.sql            # Optional: 6 sample listings
└── assets/
    ├── img/                        # real photos (headshot, hero cutout)
    ├── css/styles.css              # full design system, one file (incl. admin panel styles)
    └── js/
        ├── data.js                 # SITE + STATS + TRANSACTIONS + MEDIA + AREAS (static content)
        ├── supabase-config.js      # the ONE Supabase client (ES module, publishable key only)
        ├── main.js                 # nav, reveals, counters, listings fetch/render, filters, the shared form
        ├── property.js             # renders property.html from ?id= (fetches from Supabase)
        └── admin.js                # admin.html's login + CRUD + photo upload logic
```
Nav: Home · Properties · Buyers & Sellers · Contact (button → `index.html#contact`).
`admin.html` is NOT in the nav or sitemap and is `noindex` — reached by typing the URL directly.
(`about.html` / standalone `contact.html` don't exist — folded into Home.)

**Golden rule (now Supabase-backed):** adding ONE property via `/admin.html` must automatically
render its card, work in the filters, generate its detail page (`property.html?id=slug`), and
appear in "related" — with zero code edits. Keep this guarantee intact. `fetchProperties()` +
`mapPropertyRow()` in `main.js` are the bridge — every render function (`propertyCardHTML()`,
filters, `property.js`'s detail template) is unchanged from the old static-array version.

### Images
Listings use `<img loading="lazy">`. Property photos are real files in the Supabase
`property-photos` storage bucket, uploaded via `admin.html`'s drag-and-drop uploader — never
edited by hand. Non-listing placeholder images (Portfolio/Media/Areas Served in `data.js`)
still use the inline SVG gradient generator `svgPlaceholder()`.

## Commands
```bash
# preview locally (static site)
python3 -m http.server 8000      # http://localhost:8000
# or:  npx serve .

# version control
git add -A && git commit -m "message"

# deploy (any one)
npx vercel        # or: npx netlify deploy   # or: GitHub Pages
```

## Brand / agent data — use everywhere, never invent
- **Name:** Shakeel Ahmad — Licensed Real Estate Salesperson
- **Brokerage:** Platinum Properties  ·  **License:** NYS License #10401314142
- **Cell / text:** (718) 696-9245  ·  **Office:** (585) 458-4250
- **Email:** info@shakeelahmadrealtor.com
- **Office:** 2270 Latta Road, Greece, NY 14612
- **Hours:** Mon–Sat, 8:00 AM – 8:00 PM
- **Markets:** Greece, Rochester, Monroe County, Webster, Penfield, Pittsford, Finger Lakes,
  Upstate NY (+ NYC relocation)
- **Specialty:** probate & time-sensitive / estate sales
- **Compliance:** show brokerage name + "Equal Housing Opportunity" in footer (NY advertising rule)

### Profiles — wire into footer social icons, contact page, and schema `sameAs`
- Facebook:  https://www.facebook.com/ShakeelAhmadRealtor/
- LinkedIn:  https://www.linkedin.com/in/shakeel-ahmad-055b8881/
- Instagram: https://www.instagram.com/shakeelahmadrealtor/
- Zillow:    https://www.zillow.com/profile/Shakeel%20Ahmad
- Google Business Profile: https://share.google/ZrAXRv1uQOXXVJiJa
  *(short redirect — replace with the full Google Maps profile URL once resolved)*
- Add "Read my reviews on Zillow" and "Reviews on Google" CTAs linking out. **Never fabricate
  review counts or quotes** — only link to the profiles.

## Design system (warm editorial — premium personal brand)
Vibe: warm, elegant, lots of whitespace, large type — high-end US real-estate brand that
communicates trust within 10 seconds. (Inspired by the UX of HomesWithJLV — not copied.)

**Color tokens (`:root`):** token *names* are historical (`--navy`, `--blue`, `--gold`) but
resolve to a warm espresso/terracotta/honey-gold palette, not the original navy/blue:
```
--white:#FFFFFF; --off-white:#FBF6EF; --gray-50:#F6EEE0; --gray-100:#F0E2C8; --line:#E6D3AE;
--charcoal:#3A2A1E (body); --ink:#241811 (headings); --slate:#7A6A5C;
--navy:#2B1B12 (primary/dark bands); --blue:#C8752E (accent/terracotta); --blue-50:#FBEADA;
--gold:#E0A64E; --gold-light:#F0C78A; --gold-dark:#B67A2E;
```
- Cream/sand surfaces dominate; **navy(espresso) band** only for CTA emphasis (hero gradient,
  About, Contact). Navy = primary buttons/dark bands; blue(terracotta) = links/secondary;
  **gold = restrained luxury accent only** (eyebrow ticks, hairlines, one top CTA per
  section). Don't distribute gold evenly.

**Typography (Google Fonts):**
- Display headlines: **Space Grotesk**
- Body / UI / eyebrows: **Manrope** (eyebrows uppercase, letter-spacing .18em)

**Components & signature:**
- Sticky glass header (transparent over the hero → frosted white on scroll); brand seal
  **"SA"** in a navy rounded chip.
- Hero: warm gradient background with Shakeel's real cutout photo (transparent PNG) in a
  signature arch/dome frame (`--r-arch` token), floating glass trust badge(s). No stock photos.
- Eyebrow "01 — Section" indices; gold hairline tick before eyebrows.
- Rounded cards (16–28px), soft shadows; property cards with hover image-zoom + lift.
- **Animated counters** (factual stats only, from `STATS` in `data.js`). Navy primary CTAs;
  one gold accent CTA per section.
- Admin panel (`admin.html`) reuses the same tokens/fonts but is deliberately plainer/denser
  — no hero motion, no marketing copy, function-first.

**Motion (tasteful, not flashy):** fade-in-on-scroll via IntersectionObserver, gentle hover
micro-interactions, smooth scroll, sticky mobile call/consultation CTA bar. Always respect
`prefers-reduced-motion`.

## Page map
- **Home + Portfolio (`index.html`):** warm-gradient hero with real cutout photo + Buy/Sell
  CTAs; "How I Can Help" (3 service arch-cards); About/bio with headshot + animated stat
  counters (`STATS`) + Areas Served; **Portfolio** of `TRANSACTIONS` cards (image, location,
  type, status, story, service); Featured Listings (from Supabase); **Media gallery** from
  `MEDIA`; Zillow+Google reviews strip; navy **Contact** section with the one shared
  consultation form (`#contact`); footer.
- **Properties:** hero strip + sticky filter toolbar (search + city/type/price/status) that
  live-filters the grid (live Supabase data — no more "sample listing" labels); result count;
  loading skeleton; empty state; error state if the fetch fails.
- **Property detail (`?id=`):** fetched from Supabase by id; breadcrumb, gallery, price, spec
  strip, description, features, map placeholder, "Schedule a Showing" (the shared consultation
  form, prefilled), sticky agent contact card, related listings, graceful "not found" / error states.
- **Buyers & Sellers:** split buyer/seller paths (process steps + benefits + CTA), all CTAs
  pointing at the one shared consultation form.
- **Admin (`admin.html`, private):** Supabase Auth login → dashboard listing every property
  (thumbnail/address/price/status/featured, Edit/Delete) → Add/Edit modal with every schema
  field, feature tag chips, drag-and-drop multi-photo upload to Supabase Storage. See "Backend
  (Supabase)" above.
- CTAs sitewide: Book a Consultation, Call Now, Schedule Showing, View Properties.

## SEO requirements (every page)
- Unique `<title>`, meta description, canonical, Open Graph + Twitter card tags.
- Home page: `RealEstateAgent` JSON-LD with real NAP, `areaServed`, `openingHours`, and a
  `sameAs` array of the Facebook/LinkedIn/Instagram/Zillow/Google URLs above.
- `robots.txt` + `sitemap.xml`. Keep both in sync with the **public** page list —
  `admin.html` is deliberately excluded from both and marked `noindex`.

## Forms
**Exactly one lead-capture form exists sitewide** (Full Name, Phone, Email, "I'm interested
in", optional Message, hidden `source_page`) — one template (`consultationFormHTML()`), one
mount helper, one submit handler, all in `main.js`. Validates client-side, shows a success
state, `console.log`s the payload, and has **one clearly commented spot to connect a real
endpoint (e.g. a GoHighLevel webhook)** — search `Connect a real endpoint`. Do not add a
second form pattern anywhere; if a new page needs lead capture, mount this same form.
(`admin.html`'s property Add/Edit form is a separate CRUD system, not lead capture.)

## Backend (Supabase)
- **Table `properties`** (see `supabase/schema.sql`): id (slug, PK), status, price, address,
  city, state, zip, type, beds, baths, sqft, year_built, short_desc, description, features
  (jsonb array), featured (bool), image, images (jsonb array), created_at.
- **RLS is the only real access control** (the browser only ever holds the Supabase
  *publishable/anon* key — never the secret key, anywhere). Policies: `anon` + `authenticated`
  can `SELECT`; only `authenticated` can `INSERT`/`UPDATE`/`DELETE`. Same pattern on the
  `property-photos` storage bucket (public read, authenticated write).
- **No public sign-up** — Shakeel's one login is created manually in the Supabase dashboard
  (Authentication → Users).
- `assets/js/supabase-config.js` is the one place the client is created. `main.js`'s
  `fetchProperties()` (cached per page load) + `mapPropertyRow()` (snake_case → camelCase)
  are how the front end reads listings; `admin.js` is how Shakeel writes them.
- To (re)provision a Supabase project: run `supabase/schema.sql`, optionally
  `supabase/seed.sql`, then create the admin user.

## HARD RULES (non-negotiable)
- **No fake testimonials. No invented sales numbers. No unrealistic claims.** Only 5 real
  transactions exist — keep the portfolio honest and modest. Counters use factual figures only.
- Keep the agent's real NAP exactly as above; don't alter phone/email/license.
- Maintain the "add one property via `/admin.html`, zero code edits" guarantee.
- **Never use or request the Supabase secret/service-role key anywhere in front-end code** —
  only the publishable/anon key, ever. RLS policies are what actually gate writes.
- Never add a public sign-up flow to `admin.html` or anywhere else.
- Keep gold as an accent only; keep the type system (Space Grotesk / Manrope) intact; keep the
  warm light theme (cream/sand surfaces, espresso + terracotta, gold accent).

## Future-proofing (add later WITHOUT refactoring)
Google Maps (replace `.map-ph` placeholders), saved properties (heart button is stubbed),
appointment booking, mortgage calculator, blog / market reports, newsletter, and CRM/email/SMS
automation on the consultation form endpoint. (Listings CMS/MLS-style management is **done** —
that's `admin.html` + Supabase.)

## Before launch — confirm
- Run `supabase/schema.sql` (+ optionally `seed.sql`) and create Shakeel's admin login.
- Log into `/admin.html` and replace seeded/sample listings with real ones + real photos.
- Swap `MEDIA` placeholder images in `data.js` for real photos and video thumbnails.
- Connect the consultation form to a real endpoint (search `Connect a real endpoint`).
- Confirm public email + resolve the Google profile URL.
- Set the real domain in canonical/OG/sitemap URLs.
