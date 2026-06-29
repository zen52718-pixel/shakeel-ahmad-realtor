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
```
/
├── index.html          # Home
├── properties.html     # All listings + live filters
├── property.html       # Single listing detail (reads ?id=slug)
├── about.html          # About + honest Portfolio
├── contact.html        # Contact + form
├── robots.txt  sitemap.xml  README.md
└── assets/
    ├── css/styles.css  # full design system (one file)
    └── js/
        ├── data.js     # SITE + PROPERTIES + TRANSACTIONS  (SINGLE SOURCE OF TRUTH)
        ├── main.js     # nav, mobile menu, reveals, property-card render, grid + filters, forms
        └── property.js # renders property.html from ?id=
```
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

## Design system (premium luxury — keep it custom, not templated)
Vibe: refined modern-luxury US real estate — editorial, lots of whitespace, confident.

**Color tokens (`:root`):**
```
--ink:#0B1B2B; --navy:#0E2440; --navy-700:#163A6B;
--bone:#FBF9F5; --cream:#F6F1E8; --slate:#5A6573; --line:#E7E0D4;
--gold:#B8924E; --gold-light:#D8BC86; --gold-dark:#8F6E33; --white:#FFFFFF;
```
- Dominant dark surfaces (hero, footer, CTA bands) = ink/navy; light sections = bone/cream.
- **Champagne gold is for accents, CTAs, and active states only — never decorative.** No brassy/neon gold. Don't distribute color evenly.

**Typography (Google Fonts):**
- Display headlines: **Fraunces** (elegant high-contrast serif)
- Body / UI: **Manrope**
- Labels / eyebrows / section indices / meta: **Space Mono** (uppercase, letter-spacing .14em)

**Components & signature:**
- Sticky glassmorphism header (transparent over dark hero → frosted on scroll).
- Brand monogram seal **"SA"** in a thin gold ring; gold hairline rules; numbered section
  indices ("01 — Services") as the editorial signature.
- Rounded cards (16–20px), soft shadows, subtle navy/gold gradients, 1px gold/line borders.
- Editorial property cards: status badge, price, beds/baths/sqft icons, hover image-zoom + lift.
- Gold CTAs with hover lift; underline-wipe nav links.

**Motion (tasteful, not flashy):** one orchestrated hero load (staggered fade/rise),
fade-in-on-scroll via IntersectionObserver, gentle hover micro-interactions, smooth scroll,
sticky mobile call/book CTA bar. Always respect `prefers-reduced-motion`.

## Page map
- **Home:** dark hero + glass search card; about preview w/ credibility stats; 3 services
  (Buying / Selling / Probate & Estate); Featured Properties (from data); Areas Served;
  Why Work With Shakeel; Zillow+Google reviews trust strip; final CTA band; footer.
- **Properties:** hero strip + sticky filter toolbar (search + city/type/price/status) that
  live-filters the grid; result count; empty state. Sample listings labeled as such.
- **Property detail (`?id=`):** breadcrumb, gallery, price, spec strip, description, features,
  map placeholder, "Schedule a Showing" form, sticky agent contact card, related listings,
  graceful "not found".
- **About / Portfolio:** bio, experience, mission, values; professional photo placeholder
  (commented `<img>` swap spot); **exactly 5** honest "Recent Transactions" from `TRANSACTIONS`.
- **Contact:** info cards (call/text, office, email, address, hours), socials, map placeholder,
  validated consultation form with success state.
- CTAs sitewide: Book Consultation, Call Now, Schedule Showing, Request Property Info.

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
  transactions exist — keep the portfolio honest and modest.
- Keep the agent's real NAP exactly as above; don't alter phone/email/license.
- Maintain the data-driven "add one object" guarantee.
- Keep gold as an accent only; keep the type system (Fraunces / Manrope / Space Mono) intact.

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
