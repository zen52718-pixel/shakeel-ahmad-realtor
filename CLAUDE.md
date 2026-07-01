# CLAUDE.md — Shakeel Ahmad Realtor

Project memory for Claude Code. Read this before making changes. Keep it up to date
when architecture, brand facts, or conventions change.

## Project
A production-ready, multi-page **real estate marketing website** for a licensed New York
agent. Goal: premium brand presence, listings showcase, and lead generation. Built as a
static site (plain HTML + CSS + vanilla JS, **no frameworks, no build step**) so it loads
fast, is easy to host anywhere, and is simple to maintain. Architected to scale later into
a fuller platform (CMS/MLS feed, maps, booking, CRM) without refactoring the front end.

## Tech & conventions
- Plain HTML5 + CSS + vanilla JS. **No frameworks, no bundlers, no dependencies** except Google Fonts.
- One shared stylesheet and shared JS; design tokens live in `:root` CSS variables.
- Data-driven: all listings/content live in JS objects (single source of truth).
- Clean, commented, reusable code. Descriptive names. No duplicated logic.
- Mobile-first and fully responsive (desktop / laptop / tablet / mobile). No horizontal scroll at any width.
- Accessibility: semantic HTML, one `<h1>` per page, skip link, alt text, visible `:focus-visible`, large touch targets.
- Ask before writing files; after a task, print a short file tree and the preview command, then wait for review.

## File / folder architecture (do not reorganize without reason)
Redesigned (2.0) as a light, conversion-focused **3-page** site + a detail template.
```
/
├── index.html            # Home + Portfolio + Media + Contact (short lead form)
├── properties.html       # All listings + live filters
├── property.html         # Single listing detail (reads ?id=slug) — linked from cards
├── buyers-sellers.html   # Lead-gen: buyer & seller paths + detailed forms
├── robots.txt  sitemap.xml  README.md
└── assets/
    ├── img/shakeel-ahmad.jpg   # real headshot
    ├── css/styles.css          # full light design system (one file)
    └── js/
        ├── data.js     # SITE + STATS + PROPERTIES + TRANSACTIONS + MEDIA (SINGLE SOURCE OF TRUTH)
        ├── main.js     # nav, reveals, counters, renderers (featured/portfolio/media), grid + filters, forms
        └── property.js # renders property.html from ?id=
```
Nav: Home · Properties · Buyers & Sellers · Contact (button → `index.html#contact`).
(`about.html` / `contact.html` were removed in 2.0 — folded into Home.)
**Golden rule:** adding ONE object to `PROPERTIES` in `data.js` must automatically render its
card, work in the filters, generate its detail page (`property.html?id=slug`), and appear in
"related" — with zero other edits. Keep this guarantee intact.

### Images
Listings use `<img loading="lazy">`. Placeholder images are generated as inline SVG gradients
in `data.js` so the markup uses real `<img>` tags. To use real photos, set each property's
`image` (card) and `images[]` (gallery) to photo URLs — no other changes needed.

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

## Design system (2.0 — light, modern, premium personal brand)
Vibe: very light, elegant, lots of whitespace, large type — high-end US real-estate brand
that communicates trust within 10 seconds. (Inspired by the UX of HomesWithJLV — not copied.)

**Color tokens (`:root`) — light theme:**
```
--white:#FFFFFF; --off-white:#FAFBFC; --gray-50:#F5F7FA; --gray-100:#EEF2F7; --line:#E2E8F1;
--charcoal:#16202E (body); --ink:#0B1422 (headings); --slate:#5C6878;
--navy:#102A4E (primary); --blue:#2D5BA8 (accent); --blue-50:#EAF1FB;
--gold:#C2A053; --gold-light:#E4CC8C; --gold-dark:#9B7C34;
```
- White / gray surfaces dominate; **navy band** only for CTA emphasis (hero art card, contact,
  appointment). Navy = primary buttons; blue = links/secondary; **gold = restrained luxury
  accent only** (eyebrow ticks, hairlines, the single top CTA per section). Don't distribute gold evenly.

**Typography (Google Fonts):**
- Display headlines: **Space Grotesk**
- Body / UI / eyebrows: **Manrope** (eyebrows uppercase, letter-spacing .18em)

**Components & signature:**
- Sticky glass header (transparent → frosted white on scroll); brand seal **"SA"** in a navy rounded chip.
- Custom **animated isometric architecture SVG** hero (no stock photos) with floating glass trust badges.
- Eyebrow "01 — Section" indices; gold hairline tick before eyebrows.
- Rounded cards (16–28px), soft shadows, glass cards; property + portfolio cards with hover image-zoom + lift.
- **Animated counters** (factual stats only). Navy primary CTAs; one gold accent CTA per section.

**Motion (tasteful, not flashy):** one orchestrated hero load (staggered fade/rise),
fade-in-on-scroll via IntersectionObserver, gentle hover micro-interactions, smooth scroll,
sticky mobile call/book CTA bar. Always respect `prefers-reduced-motion`.

## Page map (2.0 — 3 main pages)
- **Home + Portfolio (`index.html`):** light hero with animated isometric architecture SVG +
  floating trust badges + CTAs (Schedule Consultation / View Properties / Contact Me);
  animated stat counters; about/bio with headshot + Areas Served; Experience (3 services);
  **Portfolio** of `TRANSACTIONS` cards (image, location, type, status, story, service);
  Featured Listings; **Media gallery** from `MEDIA`; Zillow+Google reviews strip; navy
  **Contact** section with short lead form (`#contact`); footer.
- **Properties:** hero strip + sticky filter toolbar (search + city/type/price/status) that
  live-filters the grid; result count; empty state. Sample listings labeled as such.
- **Property detail (`?id=`):** breadcrumb, gallery, price, spec strip, description, features,
  map placeholder, "Schedule a Showing" form, sticky agent contact card, related listings,
  graceful "not found".
- **Buyers & Sellers:** split buyer/seller paths (process steps + benefits + CTA); detailed
  forms — Buyer Consultation, Seller Consultation + Home Valuation, Appointment Request —
  each capturing name, phone, email, preferred contact method, message, buying/selling,
  budget, timeline, city.
- CTAs sitewide: Schedule Consultation, Call Now, Schedule Showing, Home Valuation,
  Buyer/Seller Consultation, Request Appointment.

## SEO requirements (every page)
- Unique `<title>`, meta description, canonical, Open Graph + Twitter card tags.
- Home page: `RealEstateAgent` JSON-LD with real NAP, `areaServed`, `openingHours`, and a
  `sameAs` array of the Facebook/LinkedIn/Instagram/Zillow/Google URLs above.
- `robots.txt` + `sitemap.xml`. Keep both in sync with the page list.

## Forms
Validate client-side, show a success state, `console.log` the payload, and keep a **clearly
commented spot to connect a real endpoint (e.g. Formspree)**. Search `Connect a real endpoint`.

## HARD RULES (non-negotiable)
- **No fake testimonials. No invented sales numbers. No unrealistic claims.** Only 5 real
  transactions exist — keep the portfolio honest and modest. Counters use factual figures only.
- Keep the agent's real NAP exactly as above; don't alter phone/email/license.
- Maintain the data-driven "add one object" guarantee.
- Keep gold as an accent only; keep the type system (Space Grotesk / Manrope) intact; keep the
  light theme (white/gray surfaces, navy + blue, gold accent).

## Future-proofing (add later WITHOUT refactoring)
CMS/MLS feed (swap `data.js` for an API response of the same shape), Google Maps (replace
`.map-ph` placeholders), saved properties (heart button is stubbed), appointment booking,
mortgage calculator, blog / market reports, newsletter, and CRM/email/SMS automation on the
form endpoints.

## Before launch — confirm
- Replace placeholder photos with real listing + headshot images.
- Swap sample listings for live/MLS data.
- Confirm public email + resolve the Google profile URL.
- Connect the form endpoint and set the real domain in canonical/OG/sitemap URLs.
