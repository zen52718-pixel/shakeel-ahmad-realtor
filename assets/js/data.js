/* ============================================================================
   data.js — SINGLE SOURCE OF TRUTH
   ----------------------------------------------------------------------------
   Everything that renders on the site reads from the objects in this file:
     • SITE          → brand / agent NAP, hours, markets, social profiles, SEO
     • PROPERTIES    → every listing (cards, filters, detail page, related)
     • TRANSACTIONS  → honest "Recent Transactions" on the About page

   GOLDEN RULE
   -----------
   Adding ONE object to PROPERTIES automatically renders:
     • its card on the home (if featured) + properties grid
     • it inside every relevant filter (city / type / price / status)
     • its detail page at  property.html?id=<slug>
     • it inside the "Related Properties" section
   …with zero other edits.

   IMAGES
   ------
   Placeholder images are generated as inline SVG gradient data-URIs by
   svgPlaceholder() below, so the markup always uses real <img loading="lazy">
   tags. To switch to real photos, just set a property's `image` (card) and
   `images[]` (gallery) to photo URLs — nothing else changes.

   FUTURE-PROOFING
   ---------------
   To plug in a CMS / MLS feed later, replace the PROPERTIES / TRANSACTIONS
   arrays with an API response of the SAME SHAPE. No view code needs to change.
   ========================================================================== */


/* ----------------------------------------------------------------------------
   svgPlaceholder() — generate a premium gradient placeholder as a data-URI.
   Returns a string usable directly in <img src="...">.
   @param {Object} opts
     - w, h      dimensions of the SVG canvas
     - from, to  gradient stop colors
     - label     small caption shown on the image (e.g. city or "Gallery 2")
     - tag       optional eyebrow text (e.g. "SAMPLE")
---------------------------------------------------------------------------- */
function svgPlaceholder({ w = 1200, h = 800, from = '#0E2440', to = '#163A6B', label = '', tag = '' } = {}) {
  // A subtle architectural line motif keeps placeholders feeling intentional,
  // not empty. Gold hairlines echo the brand's editorial signature.
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.06"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="url(#sheen)"/>
  <g fill="none" stroke="#B8924E" stroke-opacity="0.28" stroke-width="2">
    <path d="M ${w * 0.12} ${h * 0.7} L ${w * 0.5} ${h * 0.34} L ${w * 0.88} ${h * 0.7}"/>
    <rect x="${w * 0.32}" y="${h * 0.5}" width="${w * 0.36}" height="${h * 0.24}"/>
    <line x1="${w * 0.5}" y1="${h * 0.5}" x2="${w * 0.5}" y2="${h * 0.74}"/>
  </g>
  ${tag ? `<text x="${w * 0.5}" y="${h * 0.46}" fill="#D8BC86" font-family="monospace" font-size="${Math.round(w * 0.022)}" letter-spacing="6" text-anchor="middle">${tag}</text>` : ''}
  ${label ? `<text x="${w * 0.5}" y="${h * 0.86}" fill="#FBF9F5" font-family="Georgia, serif" font-size="${Math.round(w * 0.04)}" text-anchor="middle">${label}</text>` : ''}
</svg>`.trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/* Brand gradient pairs — rotated across listings for visual variety while
   staying strictly on-palette (ink → navy → navy-700 with gold accents). */
const GRADIENTS = [
  { from: '#0B1B2B', to: '#163A6B' },
  { from: '#0E2440', to: '#1F4E86' },
  { from: '#11243A', to: '#2A2118' }, // navy → warm shadow
  { from: '#0B1B2B', to: '#3A2F1C' }, // ink → gold-dark shadow
  { from: '#13314F', to: '#0E2440' },
  { from: '#1A1E26', to: '#163A6B' },
];

/* Build a small gallery of placeholders for a listing. Real photo URLs can
   replace the returned array verbatim. */
function galleryFor(city, idx, count = 4) {
  const g = GRADIENTS[idx % GRADIENTS.length];
  return Array.from({ length: count }, (_, i) =>
    svgPlaceholder({
      from: g.from,
      to: g.to,
      label: city,
      tag: i === 0 ? 'SAMPLE' : `VIEW ${i + 1}`,
    })
  );
}


/* ============================================================================
   SITE — brand, NAP, hours, markets, social profiles, SEO defaults
   (Real agent data — do NOT invent or alter phone / email / license.)
   ========================================================================== */
const SITE = {
  name: 'Shakeel Ahmad',
  role: 'Licensed Real Estate Salesperson',
  monogram: 'SA',
  brokerage: 'Platinum Properties',
  license: 'DRE# 49NE1128162',

  // Contact (NAP)
  cell: '(718) 696-9245',
  cellHref: 'tel:+17186969245',
  office: '(585) 458-4250',
  officeHref: 'tel:+15854584250',
  email: 'shakeelahmad1520@hotmail.com',
  emailHref: 'mailto:shakeelahmad1520@hotmail.com',

  address: {
    street: '2270 Latta Road',
    city: 'Greece',
    state: 'NY',
    zip: '14612',
    full: '2270 Latta Road, Greece, NY 14612',
  },

  hours: 'Mon–Sat, 8:00 AM – 8:00 PM',
  hoursSchema: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], // for JSON-LD openingHours

  specialty: 'Probate & time-sensitive / estate sales',

  // Markets served — also feed schema areaServed
  markets: [
    'Greece', 'Rochester', 'Monroe County', 'Webster', 'Penfield',
    'Pittsford', 'Finger Lakes', 'Upstate NY', 'NYC Relocation',
  ],

  // Canonical site origin (used by JS to build absolute URLs if needed)
  origin: 'https://www.shakeelahmadrealtor.com',

  // Social + review profiles — footer icons, contact page, schema sameAs
  social: {
    facebook: 'https://www.facebook.com/ShakeelAhmadRealtor/',
    linkedin: 'https://www.linkedin.com/in/shakeel-ahmad-055b8881/',
    instagram: 'https://www.instagram.com/shakeelahmadrealtor/',
    zillow: 'https://www.zillow.com/profile/Shakeel%20Ahmad',
    google: 'https://share.google/ZrAXRv1uQOXXVJiJa',
  },

  // Trust CTAs (link out only — never fabricate counts or quotes)
  reviews: {
    zillow: 'https://www.zillow.com/profile/Shakeel%20Ahmad',
    google: 'https://share.google/ZrAXRv1uQOXXVJiJa',
  },

  compliance: 'Equal Housing Opportunity',
};


/* ============================================================================
   PROPERTIES — every listing (single source of truth)
   ----------------------------------------------------------------------------
   Field contract (keep shape stable for CMS/MLS swap):
     id        unique slug → used in property.html?id=<slug>
     title     short marketing name
     status    'For Sale' | 'Pending' | 'Sold'
     price     number (USD)
     address   street line
     city, state, zip
     type      'Single-Family' | 'Condo' | 'Townhouse' | 'Multi-Family' | 'Land'
     beds, baths, sqft, yearBuilt   numbers (use 0 / null where N/A, e.g. land)
     lot       optional lot size string
     featured  boolean → appears in Home "Featured Properties"
     sample    boolean → shows "sample — replace with MLS" note
     short     one-line description for cards
     description  full paragraph(s) for detail page
     features  string[] amenities/highlights
     image     card image (string) — swap for real photo URL
     images    gallery images (string[]) — swap for real photo URLs
   ========================================================================== */
const PROPERTIES = [
  {
    id: 'lakefront-greece-colonial',
    title: 'Lakefront Colonial',
    status: 'For Sale',
    price: 539000,
    address: '184 Edgemere Drive',
    city: 'Greece',
    state: 'NY',
    zip: '14612',
    type: 'Single-Family',
    beds: 4,
    baths: 3,
    sqft: 2840,
    yearBuilt: 2006,
    lot: '0.42 acre',
    featured: true,
    sample: true,
    short: 'Light-filled colonial with lake views, chef’s kitchen and finished walkout.',
    description:
      'A refined four-bedroom colonial moments from Lake Ontario, blending classic millwork with a modern open-concept main floor. The chef’s kitchen opens to a sun-filled great room, while the primary suite offers a spa bath and walk-in closet. A finished walkout lower level and three-season porch extend the living space outdoors.',
    features: [
      'Chef’s kitchen with quartz island',
      'Primary suite with spa bath',
      'Finished walkout lower level',
      'Three-season porch',
      'Hardwood floors throughout',
      'Attached two-car garage',
    ],
    image: svgPlaceholder({ from: '#0B1B2B', to: '#163A6B', label: 'Greece, NY', tag: 'SAMPLE' }),
    images: galleryFor('Greece, NY', 0, 5),
  },
  {
    id: 'park-ave-rochester-condo',
    title: 'Park Avenue Residence',
    status: 'For Sale',
    price: 312000,
    address: '27 Berkeley Street, #3',
    city: 'Rochester',
    state: 'NY',
    zip: '14607',
    type: 'Condo',
    beds: 2,
    baths: 2,
    sqft: 1390,
    yearBuilt: 1915,
    lot: null,
    featured: true,
    sample: true,
    short: 'Restored condo in the heart of the Park Ave district — walkable and turnkey.',
    description:
      'A beautifully restored two-bedroom condominium in Rochester’s coveted Park Avenue neighborhood. Original character — tall windows, period trim — meets a renovated kitchen and baths. Steps from cafés, galleries, and the summer festival, with deeded parking and low-maintenance living.',
    features: [
      'Renovated kitchen and baths',
      'Original windows and trim',
      'Deeded off-street parking',
      'In-unit laundry',
      'Walk Score 92',
      'Low monthly HOA',
    ],
    image: svgPlaceholder({ from: '#0E2440', to: '#1F4E86', label: 'Rochester, NY', tag: 'SAMPLE' }),
    images: galleryFor('Rochester, NY', 1, 4),
  },
  {
    id: 'webster-craftsman-estate',
    title: 'Craftsman Estate',
    status: 'Pending',
    price: 689000,
    address: '912 Holt Road',
    city: 'Webster',
    state: 'NY',
    zip: '14580',
    type: 'Single-Family',
    beds: 5,
    baths: 4,
    sqft: 3620,
    yearBuilt: 2014,
    lot: '0.78 acre',
    featured: true,
    sample: true,
    short: 'Five-bedroom craftsman on nearly an acre with a resort-style backyard.',
    description:
      'A stately craftsman estate set on nearly an acre in sought-after Webster. Soaring ceilings, a two-story stone fireplace, and a gourmet kitchen anchor the main level. The private backyard features a heated pool, outdoor kitchen, and mature landscaping — an entertainer’s retreat minutes from the village and the lake.',
    features: [
      'Two-story stone fireplace',
      'Gourmet kitchen with butler’s pantry',
      'Heated in-ground pool',
      'Outdoor kitchen',
      'First-floor office',
      'Three-car garage',
    ],
    image: svgPlaceholder({ from: '#11243A', to: '#2A2118', label: 'Webster, NY', tag: 'SAMPLE' }),
    images: galleryFor('Webster, NY', 2, 5),
  },
  {
    id: 'penfield-ranch-probate',
    title: 'Penfield Ranch',
    status: 'For Sale',
    price: 274900,
    address: '45 Sweetbriar Lane',
    city: 'Penfield',
    state: 'NY',
    zip: '14526',
    type: 'Single-Family',
    beds: 3,
    baths: 2,
    sqft: 1620,
    yearBuilt: 1978,
    lot: '0.33 acre',
    featured: false,
    sample: true,
    short: 'Well-kept ranch sold as part of an estate — single-level, move-in ready.',
    description:
      'A solid single-level ranch in a quiet Penfield neighborhood, offered as part of a thoughtfully managed estate sale. Three bedrooms, an updated main bath, and a bright living room with a wood-burning fireplace. A practical floor plan and large lot make this an excellent value for first-time buyers or those downsizing.',
    features: [
      'Single-level living',
      'Wood-burning fireplace',
      'Updated main bathroom',
      'Large fenced lot',
      'Newer roof (2019)',
      'Full basement',
    ],
    image: svgPlaceholder({ from: '#0B1B2B', to: '#3A2F1C', label: 'Penfield, NY', tag: 'SAMPLE' }),
    images: galleryFor('Penfield, NY', 3, 4),
  },
  {
    id: 'pittsford-village-townhouse',
    title: 'Village Townhouse',
    status: 'Sold',
    price: 398000,
    address: '8 Stonegate Court',
    city: 'Pittsford',
    state: 'NY',
    zip: '14534',
    type: 'Townhouse',
    beds: 3,
    baths: 3,
    sqft: 2080,
    yearBuilt: 2001,
    lot: null,
    featured: false,
    sample: true,
    short: 'Maintenance-free townhouse in award-winning Pittsford schools — recently sold.',
    description:
      'A maintenance-free townhouse in the heart of Pittsford, within the award-winning Pittsford school district. Three levels of comfortable living, a private patio, and an attached garage. Walkable to the canal path and village shops. This listing recently closed — contact Shakeel for similar opportunities.',
    features: [
      'Pittsford school district',
      'Private rear patio',
      'Attached garage',
      'Open-concept main level',
      'Finished lower level',
      'Steps to the canal path',
    ],
    image: svgPlaceholder({ from: '#13314F', to: '#0E2440', label: 'Pittsford, NY', tag: 'SAMPLE' }),
    images: galleryFor('Pittsford, NY', 4, 4),
  },
  {
    id: 'finger-lakes-vineyard-land',
    title: 'Finger Lakes Vineyard Parcel',
    status: 'For Sale',
    price: 189000,
    address: 'Lot 12 Seneca Ridge Road',
    city: 'Geneva',
    state: 'NY',
    zip: '14456',
    type: 'Land',
    beds: 0,
    baths: 0,
    sqft: 0,
    yearBuilt: null,
    lot: '11.4 acres',
    featured: false,
    sample: true,
    short: 'Gently sloping acreage with lake views — ideal for a vineyard or estate home.',
    description:
      'A rare 11.4-acre parcel in the heart of Finger Lakes wine country, with gentle southern slopes and long views toward Seneca Lake. Soils and exposure well suited to a boutique vineyard, with an obvious building envelope for an estate home. Utilities at the road; survey available. A blank canvas in one of Upstate NY’s most desirable regions.',
    features: [
      '11.4 acres, gentle south slope',
      'Seneca Lake views',
      'Utilities at the road',
      'Survey available',
      'Vineyard-suitable soils',
      'No HOA',
    ],
    image: svgPlaceholder({ from: '#1A1E26', to: '#163A6B', label: 'Geneva, NY', tag: 'SAMPLE' }),
    images: galleryFor('Geneva, NY', 5, 4),
  },
];


/* ============================================================================
   TRANSACTIONS — honest "Recent Transactions" (exactly 5, representative)
   ----------------------------------------------------------------------------
   No fabricated testimonials, prices, or counts. These describe the TYPE of
   work and outcome only. Marked representative in the UI.
   ========================================================================== */
const TRANSACTIONS = [
  { type: 'Single-Family Home', area: 'Greece, NY', role: 'Listing Agent (Seller)', status: 'Sold' },
  { type: 'Probate / Estate Sale', area: 'Rochester, NY', role: 'Listing Agent (Estate)', status: 'Sold' },
  { type: 'Condominium', area: 'Penfield, NY', role: 'Buyer’s Agent', status: 'Sold' },
  { type: 'Multi-Family', area: 'Monroe County, NY', role: 'Listing Agent (Seller)', status: 'Sold' },
  { type: 'Relocation Purchase', area: 'Webster, NY', role: 'Buyer’s Agent', status: 'Sold' },
];


/* Expose to other scripts (plain globals — no module system / build step). */
window.SITE = SITE;
window.PROPERTIES = PROPERTIES;
window.TRANSACTIONS = TRANSACTIONS;
window.svgPlaceholder = svgPlaceholder;
