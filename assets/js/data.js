/* ============================================================================
   data.js — static site content (brand, stats, portfolio, media)
   ----------------------------------------------------------------------------
     • SITE          → brand / agent NAP, hours, markets, socials, SEO
     • TRANSACTIONS  → honest Portfolio entries (story + service, no numbers)
     • MEDIA         → professional media gallery tiles (placeholders)
     • STATS         → factual animated counters (no invented figures)

   PROPERTY LISTINGS LIVE IN SUPABASE, NOT HERE.
   -----------------------------------------------------------------------
   Listings used to be a static PROPERTIES array in this file. They're now
   rows in the Supabase `properties` table, managed by Shakeel through
   /admin.html (add, edit, delete, upload photos — no code editing needed).
   See supabase/schema.sql for the table shape + RLS policies, and
   assets/js/main.js's fetchProperties()/mapPropertyRow() for how the front
   end reads them. This file no longer has anything to do with listings.

   IMAGES
   ------
   svgPlaceholder() still generates inline SVG gradient data-URIs, used by
   the STATIC content below (MEDIA/portfolio placeholders) that hasn't moved
   to Supabase.
   ========================================================================== */


/* ----------------------------------------------------------------------------
   svgPlaceholder() — premium gradient placeholder as a data-URI.
   Soft, light-friendly architectural motif so empty states feel intentional.
---------------------------------------------------------------------------- */
function svgPlaceholder({ w = 1200, h = 800, from = '#102A4E', to = '#2D5BA8', label = '', tag = '' } = {}) {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.10"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="url(#sheen)"/>
  <g fill="none" stroke="#E4CC8C" stroke-opacity="0.42" stroke-width="2">
    <path d="M ${w * 0.14} ${h * 0.72} L ${w * 0.5} ${h * 0.32} L ${w * 0.86} ${h * 0.72}"/>
    <rect x="${w * 0.33}" y="${h * 0.5} " width="${w * 0.34}" height="${h * 0.24}"/>
    <line x1="${w * 0.5}" y1="${h * 0.5}" x2="${w * 0.5}" y2="${h * 0.74}"/>
  </g>
  ${tag ? `<text x="${w * 0.5}" y="${h * 0.44}" fill="#E4CC8C" font-family="monospace" font-size="${Math.round(w * 0.022)}" letter-spacing="6" text-anchor="middle">${tag}</text>` : ''}
  ${label ? `<text x="${w * 0.5}" y="${h * 0.88}" fill="#FFFFFF" font-family="'Space Grotesk', sans-serif" font-size="${Math.round(w * 0.038)}" text-anchor="middle">${label}</text>` : ''}
</svg>`.trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/* ============================================================================
   SITE — brand, NAP, hours, markets, socials, SEO defaults
   (Real agent data — do NOT invent or alter phone / email / license.)
   ========================================================================== */
const SITE = {
  name: 'Shakeel Ahmad',
  role: 'Licensed Real Estate Salesperson',
  monogram: 'SA',
  brokerage: 'Platinum Properties',
  license: 'NYS License #10401314142',

  cell: '(718) 696-9245',
  cellHref: 'tel:+17186969245',
  office: '(585) 458-4250',
  officeHref: 'tel:+15854584250',
  email: 'info@shakeelahmadrealtor.com',
  emailHref: 'mailto:info@shakeelahmadrealtor.com',

  address: {
    street: '2270 Latta Road',
    city: 'Greece',
    state: 'NY',
    zip: '14612',
    full: '2270 Latta Road, Greece, NY 14612',
  },

  hours: 'Mon–Sat, 8:00 AM – 8:00 PM',
  specialty: 'Probate & time-sensitive / estate sales',

  // Headline markets (hero + areas served)
  marketsPrimary: ['NYC', 'Rochester', 'Upstate NY'],
  markets: [
    'Greece', 'Rochester', 'Monroe County', 'Webster', 'Penfield',
    'Pittsford', 'Finger Lakes', 'Upstate NY', 'NYC Relocation',
  ],

  origin: 'https://www.shakeelahmadrealtor.com',
  headshot: 'assets/img/shakeel-ahmad.jpg',

  social: {
    facebook: 'https://www.facebook.com/ShakeelAhmadRealtor/',
    linkedin: 'https://www.linkedin.com/in/shakeel-ahmad-055b8881/',
    instagram: 'https://www.instagram.com/shakeelahmadrealtor/',
    zillow: 'https://www.zillow.com/profile/Shakeel%20Ahmad',
    google: 'https://share.google/ZrAXRv1uQOXXVJiJa',
  },
  reviews: {
    zillow: 'https://www.zillow.com/profile/Shakeel%20Ahmad',
    google: 'https://share.google/ZrAXRv1uQOXXVJiJa',
  },

  compliance: 'Equal Housing Opportunity',
};


/* ============================================================================
   STATS — factual animated counters (NO invented sales figures)
   value is the count-up target; suffix/label describe it honestly.
   ========================================================================== */
const STATS = [
  { value: 9, suffix: '', label: 'Areas Served Across NY' },
  { value: 6, suffix: '', label: 'Days a Week, 8AM–8PM' },
  { value: 5, suffix: '', label: 'Property Types Handled' },
  { value: 100, suffix: '%', label: 'Client-First Representation' },
];


/* ============================================================================
   TRANSACTIONS — honest Portfolio (representative; story + service, no numbers)
   ========================================================================== */
const TRANSACTIONS = [
  {
    id: 'tx-greece-single-family',
    type: 'Single-Family Home',
    location: 'Greece, NY',
    status: 'Sold',
    service: 'Seller Representation · Listing & Marketing',
    story: 'Helped a local family prepare, price and market their longtime home, guiding them through showings and offers to a smooth closing.',
    image: svgPlaceholder({ from: '#102A4E', to: '#2D5BA8', label: 'Greece, NY', tag: 'SOLD' }),
  },
  {
    id: 'tx-rochester-probate',
    type: 'Probate / Estate Sale',
    location: 'Rochester, NY',
    status: 'Sold',
    service: 'Estate Sale Management · Attorney Coordination',
    story: 'Managed a time-sensitive estate sale with care, coordinating with the family and their attorney from cleanout through a respectful sale.',
    image: svgPlaceholder({ from: '#0B1E3A', to: '#3567B6', label: 'Rochester, NY', tag: 'SOLD' }),
  },
  {
    id: 'tx-penfield-condo',
    type: 'Condominium',
    location: 'Penfield, NY',
    status: 'Sold',
    service: 'Buyer Representation · First-Time Buyer',
    story: 'Guided a first-time buyer through search, financing and negotiation, helping them confidently purchase their first home.',
    image: svgPlaceholder({ from: '#14203A', to: '#27406E', label: 'Penfield, NY', tag: 'SOLD' }),
  },
  {
    id: 'tx-monroe-multifamily',
    type: 'Multi-Family',
    location: 'Monroe County, NY',
    status: 'Sold',
    service: 'Seller Representation · Investment Property',
    story: 'Advised an investor on positioning and pricing a multi-family property, marketing it to qualified buyers through to closing.',
    image: svgPlaceholder({ from: '#1B2C4A', to: '#9B7C34', label: 'Monroe County, NY', tag: 'SOLD' }),
  },
  {
    id: 'tx-webster-relocation',
    type: 'Relocation Purchase',
    location: 'Webster, NY',
    status: 'Sold',
    service: 'Buyer Representation · Relocation',
    story: 'Supported a relocating client moving into the Rochester area, handling remote tours and logistics for an out-of-town purchase.',
    image: svgPlaceholder({ from: '#102A4E', to: '#5A78A8', label: 'Webster, NY', tag: 'SOLD' }),
  },
];


/* ============================================================================
   MEDIA — professional media gallery tiles (placeholders to swap with real)
   type: 'image' | 'video'. Replace `image` with real photo/thumbnail URLs.
   ========================================================================== */
const MEDIA = [
  { label: 'Professional Headshot', tag: 'PORTRAIT', type: 'image', image: 'assets/img/shakeel-ahmad.jpg' },
  { label: 'Property Photography', tag: 'LISTINGS', type: 'image', image: svgPlaceholder({ from: '#102A4E', to: '#2D5BA8', label: 'Property Photos', tag: 'GALLERY' }) },
  { label: 'Community Events', tag: 'LOCAL', type: 'image', image: svgPlaceholder({ from: '#0B1E3A', to: '#3567B6', label: 'Community', tag: 'EVENTS' }) },
  { label: 'Open Houses', tag: 'IN PERSON', type: 'image', image: svgPlaceholder({ from: '#1B2C4A', to: '#9B7C34', label: 'Open Houses', tag: 'TOURS' }) },
  { label: 'Social Media', tag: 'ONLINE', type: 'image', image: svgPlaceholder({ from: '#14203A', to: '#27406E', label: 'Social Content', tag: 'POSTS' }) },
  { label: 'Video Previews', tag: 'WATCH', type: 'video', image: svgPlaceholder({ from: '#102A4E', to: '#5A78A8', label: 'Video Tours', tag: 'VIDEO' }) },
];


/* ============================================================================
   AREAS — flagship markets shown as photo cards on the Home hero-adjacent
   "Areas Served" section. cityFilter must match a listing's `city` value
   (Supabase `properties` table) to deep-link into a filtered properties.html
   view; leave null for regional areas with no single matching listing city
   (falls back to the full grid).
   ========================================================================== */
const AREAS = [
  { name: 'NYC', tag: 'Relocation', blurb: 'Relocation & investment purchases to and from the city.', cityFilter: null, image: svgPlaceholder({ from: '#0B1E3A', to: '#3567B6', label: 'New York City' }) },
  { name: 'Rochester', tag: 'City', blurb: 'Urban neighborhoods, condos and city living.', cityFilter: 'Rochester', image: svgPlaceholder({ from: '#102A4E', to: '#2D5BA8', label: 'Rochester, NY' }) },
  { name: 'Greece', tag: 'Home Base', blurb: 'Lakefront homes and family neighborhoods near Lake Ontario.', cityFilter: 'Greece', image: svgPlaceholder({ from: '#14203A', to: '#27406E', label: 'Greece, NY' }) },
  { name: 'Webster', tag: 'Suburban', blurb: 'Established communities and move-up estates.', cityFilter: 'Webster', image: svgPlaceholder({ from: '#1B2C4A', to: '#9B7C34', label: 'Webster, NY' }) },
  { name: 'Penfield', tag: 'Family', blurb: 'Family-friendly streets and top-rated schools.', cityFilter: 'Penfield', image: svgPlaceholder({ from: '#0E2240', to: '#2D5BA8', label: 'Penfield, NY' }) },
  { name: 'Pittsford', tag: 'Village', blurb: 'Village charm, the canal path and award-winning schools.', cityFilter: 'Pittsford', image: svgPlaceholder({ from: '#102A4E', to: '#5A78A8', label: 'Pittsford, NY' }) },
];


/* Expose to other scripts (plain globals — no module system / build step). */
window.SITE = SITE;
window.STATS = STATS;
window.TRANSACTIONS = TRANSACTIONS;
window.MEDIA = MEDIA;
window.AREAS = AREAS;
window.svgPlaceholder = svgPlaceholder;
