# CLAUDE.md — Shakeel Ahmad Realtor

Project memory for Claude Code. Read this before making changes. Keep it up to date
when architecture, brand facts, or conventions change.

## Project
A production-ready, multi-page **real estate marketing website** for a licensed New York
agent. Goal: premium brand presence, listings showcase, and **seller lead generation**
(the primary conversion goal). Built as a static site (plain HTML + CSS + vanilla JS,
**no frameworks, no build step**) so it loads fast, is easy to host anywhere, and is simple
to maintain. Architected to scale later into a fuller platform (CMS/MLS feed, maps,
booking, CRM) without refactoring the front end.

**Content philosophy (3.0 — lean):** the site was deliberately cut down from an earlier,
much longer version. Think Apple / Airbnb / Compass / SERHANT — clarity and conversion,
not volume. Every section must have a clear purpose (build trust or generate a lead). When
adding anything new, default to leaving it out unless it clearly earns its place. Do not
re-add: testimonials, stat counters, a media/photo gallery, a "portfolio of transactions"
section, long process timelines, or extra duplicate contact forms — these were intentionally
removed. See "HARD RULES" below.

## Tech & conventions
- Plain HTML5 + CSS + vanilla JS. **No frameworks, no bundlers, no dependencies** except Google Fonts.
- One shared stylesheet and shared JS; design tokens live in `:root` CSS variables.
- Data-driven: all listings live in JS objects (single source of truth).
- Clean, commented, reusable code. Descriptive names. No duplicated logic. No dead code —
  if a section is removed from the HTML, remove its renderer/CSS too.
- Mobile-first and fully responsive (desktop / laptop / tablet / mobile). No horizontal scroll at any width.
- Accessibility: semantic HTML, one `<h1>` per page, skip link, alt text, visible `:focus-visible`, large touch targets.
- Ask before writing files; after a task, print a short file tree and the preview command, then wait for review.

## File / folder architecture (do not reorganize without reason)
Lean **4-page** site (3.0): Home, Properties, Property detail template, Contact.
```
/
├── index.html            # Home: hero, 3 services, About, 3 featured listings, FAQ, short lead form
├── properties.html       # All listings + live filters
├── property.html         # Single listing detail (reads ?id=slug) — linked from cards
├── contact.html          # Seller-focused: Home Valuation form (primary lead-gen page)
├── robots.txt  sitemap.xml  README.md
└── assets/
    ├── img/
    │   ├── shakeel-ahmad.jpg              # portrait headshot — About section, agent cards
    │   └── shakeel-hero-clipboard.png     # transparent cutout photo — homepage hero
    ├── css/styles.css          # full design system (one file)
    └── js/
        ├── data.js     # SITE + PROPERTIES (SINGLE SOURCE OF TRUTH)
        ├── main.js     # nav, reveals, featured-properties renderer, properties grid + filters, forms
        └── property.js # renders property.html from ?id=
```
Nav (all pages, minimal, sticky): **Home · Properties · About · Contact**.
`About` is an anchor to `index.html#about` (not a separate page — kept as one concise
section per the content-reduction rules). `Contact` is the dedicated `contact.html` page
(Home Valuation form — the seller lead-gen destination). The homepage also has its own
short, separate lead form at `index.html#contact` (Name/Phone/Email/Message) — that is
intentionally a **different, shorter** form from the Contact page's valuation form; see
"Forms" below for the exact two-forms rule.

**Golden rule:** adding ONE object to `PROPERTIES` in `data.js` must automatically render its
card, work in the filters, generate its detail page (`property.html?id=slug`), and appear in
"related" — with zero other edits. Keep this guarantee intact. Exactly 3 `PROPERTIES` entries
have `featured: true` — that count must stay at 3 (the homepage shows only 3 featured listings
by design; do not add a 4th `featured: true` without also revisiting the homepage layout).

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
- **Primary markets (shown in nav-level content):** New York City, Rochester, Upstate New York
- **Extended markets (mentioned in FAQ / footer detail only, not a dedicated section):**
  Monroe County, Webster, Penfield, Pittsford, Finger Lakes
- **Specialty:** probate & time-sensitive / estate sales (mentioned within the "Real Estate
  Consultation" service copy — does not have its own section)
- **Compliance:** show brokerage name + "Equal Housing Opportunity" in footer (NY advertising rule)

### Profiles — wire into footer social icons and schema `sameAs`
- Facebook:  https://www.facebook.com/ShakeelAhmadRealtor/
- LinkedIn:  https://www.linkedin.com/in/shakeel-ahmad-055b8881/
- Instagram: https://www.instagram.com/shakeelahmadrealtor/
- Zillow:    https://www.zillow.com/profile/Shakeel%20Ahmad
- Google Business Profile: https://share.google/ZrAXRv1uQOXXVJiJa
  *(short redirect — replace with the full Google Maps profile URL once resolved)*
- There is **no dedicated reviews/testimonials section on the site** (removed by design —
  see HARD RULES). The Zillow/Google links live only in the footer social row, labeled
  "reviews" via their `aria-label`. **Never fabricate review counts or quotes.**

## Design system (3.0 — warm editorial, arch motif)
Vibe: warm, personal, premium — cream/sand surfaces, deep espresso dark bands, terracotta
accent, honey-gold luxury accent. Signature shape: the **arch/dome** (used on the hero photo,
the About photo, and the 3 service cards) — inspired by JLV/SERHANT-style boutique realtor
sites, not copied.

**Color tokens (`:root`):**
```
--white:#FFFFFF; --off-white:#FBF6EF; --gray-50:#F6EEE0; --gray-100:#F0E2C8; --line:#E6D3AE;
--charcoal:#3A2A1E (body); --ink:#241811 (headings); --slate:#7A6A5C;
--navy:#2B1B12 (dark bands/primary btn — deep espresso); --blue:#C8752E (terracotta accent); --blue-50:#FBEADA;
--gold:#E0A64E; --gold-light:#F0C78A; --gold-dark:#B67A2E;
```
Token **names** kept stable from earlier iterations (`--navy`, `--blue`, `--gold`) so every
page reskins from `styles.css` alone — only their resolved colors changed meaning (navy =
espresso, blue = terracotta, gold = honey gold). Cream/sand surfaces dominate; the dark
espresso band is used sparingly for the About section and the Contact-form band on the
homepage. Gold is a restrained accent (eyebrow ticks, one CTA per section) — never decorative.

**Typography (Google Fonts):**
- Display headlines: **Space Grotesk**
- Body / UI / eyebrows: **Manrope**

**Components & signature:**
- Sticky glass header; transparent + light text over the hero (`.site-header.on-hero`) →
  frosted white + dark text once scrolled or on interior pages' lighter hero strips.
- Brand seal **"SA"** in an espresso rounded chip.
- Hero: bold warm gradient background (gold → terracotta), Shakeel's real transparent-cutout
  photo (`shakeel-hero-clipboard.png`) floating directly over it — no card frame, no stock art.
- Arch-domed (`.arch-top` / `.arch-frame`) photo treatment — a large px border-radius that
  auto-clamps to a true semicircle regardless of element width.
- 3 service cards (`.category-arch`): Buy a Home / Sell Your Home / Real Estate Consultation.
- Native `<details>/<summary>` FAQ accordion (`.faq-item`) — accessible, zero JS.

**Motion (tasteful, not flashy):** staggered hero fade/rise (`[data-hero]`), fade-in-on-scroll
via IntersectionObserver (`[data-reveal]`), gentle hover micro-interactions, smooth scroll,
sticky mobile Call + "Get Valuation" CTA bar. Always respect `prefers-reduced-motion`.

## Page map (3.0 — lean, 4 pages)
- **Home (`index.html`):** Hero (headline + 2-3 line subhead + exactly 2 CTAs — View
  Properties / Book a Consultation — + the cutout photo; nothing else in the hero); 3
  service cards (Buy / Sell / Consultation, 2-3 sentences each); **About** (id `#about`,
  one section: photo + 4-5 sentence bio + 3 area chips: NYC/Rochester/Upstate NY); exactly
  **3 Featured Properties** (`PROPERTIES` where `featured: true`) + "View All Properties"
  button; **FAQ** (6 questions, 2-3 sentence answers, native accordion); **Contact** (id
  `#contact`, dark band, short lead form: Name/Phone/Email/Message only); footer.
- **Properties:** hero strip + sticky filter toolbar (search + city/type/price/status) that
  live-filters the grid; result count; empty state. Sample listings labeled as such. No
  duplicate bottom CTA band (removed — the filter/empty-state CTAs already cover it).
- **Property detail (`?id=`):** breadcrumb, gallery, price, spec strip, description, features,
  map placeholder, "Schedule a Showing" form, sticky agent contact card, related listings,
  graceful "not found". (This showing-request form is intentionally kept — it is tied to a
  specific listing, not a duplicate marketing form; see HARD RULES.)
- **Contact:** the seller lead-gen page. Home Valuation form — Name, Phone, Email, Property
  Address, City, Property Type, Estimated Selling Timeline, Message — plus a compact
  agent-contact card (phone/email/office). This is the site's primary conversion page.

## SEO requirements (every page)
- Unique `<title>`, meta description, canonical, Open Graph + Twitter card tags.
- Home page: `RealEstateAgent` JSON-LD with real NAP, `areaServed` (NYC/Rochester/Upstate NY),
  `openingHours`, and a `sameAs` array of the Facebook/LinkedIn/Instagram/Zillow/Google URLs above.
- `robots.txt` + `sitemap.xml`. Keep both in sync with the page list (4 pages: `/`,
  `/properties.html`, `/contact.html`, plus `property.html` template — not indexed directly).

## Forms — exactly two marketing forms, sitewide
1. **Homepage** (`index.html#contact`) — short: Name, Phone, Email, Message.
2. **Contact page** (`contact.html`) — Home Valuation: Name, Phone, Email, Property Address,
   City, Property Type, Estimated Selling Timeline, Message.

Do not add a third marketing/lead form (no separate buyer consultation form, appointment
form, or newsletter signup). The **exception** is `property.html`'s "Schedule a Showing"
form — that is a transactional, listing-specific action (request a tour of *this* house),
not a duplicate marketing form, and should stay.

All forms validate client-side, show a success state, `console.log` the payload, and keep a
**clearly commented spot to connect a real endpoint (e.g. Formspree)**. Search
`Connect a real endpoint` in `assets/js/main.js`.

## HARD RULES (non-negotiable)
- **No fake testimonials, no fabricated review counts/quotes, no invented stats or counters,
  no fake "years in business" / "homes sold" numbers, no awards, no team section, no blog,
  no newsletter signup, no market-reports section.** These were removed in 3.0 specifically
  because they weren't real — do not reintroduce them, fabricated or otherwise, without the
  agent supplying real figures.
- Keep the agent's real NAP exactly as above; don't alter phone/email/license.
- Maintain the data-driven "add one object" guarantee for `PROPERTIES`.
- Keep the homepage to exactly 3 featured listings + "View All Properties" — do not duplicate
  the full listings grid on the homepage.
- Keep exactly two marketing lead forms sitewide (see "Forms" above); don't add a third.
- Keep gold as an accent only; keep the type system (Space Grotesk / Manrope) and the arch
  motif intact.
- **Content discipline:** before adding a new homepage section, ask whether it directly builds
  trust or generates a lead. If not, it doesn't belong on the homepage.

## Future-proofing (add later WITHOUT refactoring)
CMS/MLS feed (swap `data.js` for an API response of the same shape), Google Maps (replace
`.map-ph` placeholders), saved properties (heart button is stubbed), appointment booking,
mortgage calculator, CRM/email/SMS automation on the form endpoints. If the agent later wants
a blog, market reports, or a real testimonials section, add them as genuinely new sections
with real content — do not resurrect the old placeholder versions.

## Before launch — confirm
- Replace placeholder listing photos with real MLS photos.
- Swap sample listings for live/MLS data.
- Confirm public email + resolve the Google profile URL.
- Connect the form endpoint(s) and set the real domain in canonical/OG/sitemap URLs.
