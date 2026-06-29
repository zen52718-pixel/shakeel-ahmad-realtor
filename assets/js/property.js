/* ============================================================================
   property.js — renders property.html from ?id=<slug>  (2.0 light theme)
   Breadcrumb, gallery, price/specs, description, features, map placeholder,
   "Schedule a Showing" form, sticky agent card, related listings, 404 state.
   Reuses propertyCardHTML / PROP_ICONS from main.js.
   ========================================================================== */

(function () {
  'use strict';
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const ICONS = window.PROP_ICONS || {};
  const formatPrice = (n) =>
    typeof n === 'number'
      ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
      : n;

  const root = $('#property-root');
  if (!root || !window.PROPERTIES) return;

  const id = new URLSearchParams(location.search).get('id');
  const p = PROPERTIES.find((x) => x.id === id);

  /* NOT FOUND --------------------------------------------------------------*/
  if (!p) {
    document.title = 'Property not found · Shakeel Ahmad Realtor';
    root.innerHTML = `
      <section class="section">
        <div class="container narrow center">
          <p class="eyebrow center">Error 404</p>
          <h1>We couldn’t find that listing</h1>
          <p class="lede mx-auto">It may have sold, or the link may be incomplete. Browse current listings or get in touch and I’ll help you find the right home.</p>
          <div class="cta-band"><div class="btn-row">
            <a class="btn btn--primary" href="properties.html">Browse Listings</a>
            <a class="btn btn--outline" href="index.html#contact">Contact Shakeel</a>
          </div></div>
        </div>
      </section>`;
    return;
  }

  /* <head> -----------------------------------------------------------------*/
  document.title = `${p.address}, ${p.city} ${p.state} · Shakeel Ahmad Realtor`;
  const metaDesc = $('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', `${p.status} — ${formatPrice(p.price)}. ${p.short}`);
  const canon = $('link[rel="canonical"]');
  if (canon) canon.setAttribute('href', `${SITE.origin}/property.html?id=${encodeURIComponent(p.id)}`);

  /* spec strip -------------------------------------------------------------*/
  const specCells = p.type === 'Land'
    ? [{ v: p.lot || '—', k: 'Lot Size' }, { v: p.type, k: 'Type' }, { v: p.status, k: 'Status' }, { v: p.zip, k: 'Zip' }]
    : [{ v: p.beds, k: 'Beds' }, { v: p.baths, k: 'Baths' }, { v: p.sqft.toLocaleString(), k: 'Sq Ft' }, { v: p.yearBuilt || '—', k: 'Year Built' }];

  /* gallery ----------------------------------------------------------------*/
  const images = (p.images && p.images.length) ? p.images : [p.image];
  const thumbsHTML = images.map((src, i) => `
    <button class="gallery__thumb" type="button" data-index="${i}" aria-current="${i === 0}" aria-label="Show photo ${i + 1}">
      <img src="${src}" alt="${p.title} photo ${i + 1}" loading="lazy" width="160" height="160">
    </button>`).join('');

  const featuresHTML = (p.features || []).map((f) => `<li>${f}</li>`).join('');

  /* assemble ---------------------------------------------------------------*/
  root.innerHTML = `
    <section class="page-hero">
      <div class="container">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="index.html">Home</a> <span aria-hidden="true">/</span>
          <a href="properties.html">Properties</a> <span aria-hidden="true">/</span>
          <span aria-current="page">${p.address}</span>
        </nav>
        <p class="eyebrow">${p.city}, ${p.state} · ${p.type}</p>
        <h1>${p.title}</h1>
        ${p.sample ? '<p class="note-italic">Sample listing — replace with live MLS data before launch.</p>' : ''}
      </div>
    </section>

    <section class="section section--tight">
      <div class="container">
        <div class="detail-grid">
          <div>
            <div class="gallery">
              <div class="gallery__main"><img id="gallery-main" src="${images[0]}" alt="${p.title} — ${p.address}" width="1200" height="750"></div>
              ${images.length > 1 ? `<div class="gallery__thumbs">${thumbsHTML}</div>` : ''}
            </div>

            <div style="margin-top:2.5rem">
              <p class="eyebrow">01 — Overview</p>
              <div class="detail-price">${formatPrice(p.price)}</div>
              <div class="detail-addr">${p.address}</div>
              <div class="detail-city">${p.city}, ${p.state} ${p.zip}</div>
              <div class="spec-strip">
                ${specCells.map((c) => `<div class="cell"><div class="v">${c.v}</div><div class="k">${c.k}</div></div>`).join('')}
              </div>
              <p>${p.description}</p>
            </div>

            ${featuresHTML ? `
            <div style="margin-top:2.5rem">
              <p class="eyebrow">02 — Features</p>
              <h2>Highlights &amp; amenities</h2>
              <ul class="features">${featuresHTML}</ul>
            </div>` : ''}

            <div style="margin-top:2.5rem">
              <p class="eyebrow">03 — Location</p>
              <h2>On the map</h2>
              <div class="map-ph" role="img" aria-label="Map location for ${p.address}, ${p.city}, ${p.state}">
                <div>
                  <div class="map-ph__pin" aria-hidden="true"></div>
                  <div class="map-ph__label">${p.address}, ${p.city}, ${p.state} ${p.zip}</div>
                </div>
              </div>
            </div>
          </div>

          <aside>
            <div class="card card-pad agent-card">
              <div class="agent-card__head">
                <img class="agent-card__photo" src="${SITE.headshot}" alt="${SITE.name}" width="56" height="56" loading="lazy">
                <div>
                  <div class="name">${SITE.name}</div>
                  <div class="role">${SITE.role}</div>
                </div>
              </div>
              <div class="contact-list">
                <a href="${SITE.cellHref}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.4 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z"/></svg> Call / text ${SITE.cell}</a>
                <a href="${SITE.officeHref}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-3M9 9h.01M9 13h.01M9 17h.01"/></svg> Office ${SITE.office}</a>
                <a href="${SITE.emailHref}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg> Email</a>
              </div>
              <a class="btn btn--gold btn--block" href="#showing-form">Schedule a Showing</a>
              <p class="lic">${SITE.brokerage} · ${SITE.license}</p>
            </div>

            <div class="card card-pad form-card--accent" style="margin-top:1.2rem" id="showing-form">
              <p class="eyebrow">Request a tour</p>
              <h3 style="margin-bottom:1rem">Schedule a Showing</h3>
              <form class="form" data-form="showing" novalidate>
                <div class="form-body" style="display:grid; gap:1.1rem">
                  <input type="hidden" name="property" value="${p.address}, ${p.city} (${p.id})">
                  <div class="field-group">
                    <label for="sf-name">Full name</label>
                    <input id="sf-name" name="name" type="text" required autocomplete="name" placeholder="Your name">
                    <span class="error-msg">Please enter your name.</span>
                  </div>
                  <div class="field-group">
                    <label for="sf-email">Email</label>
                    <input id="sf-email" name="email" type="email" required autocomplete="email" placeholder="you@email.com">
                    <span class="error-msg">Please enter a valid email.</span>
                  </div>
                  <div class="field-group">
                    <label for="sf-phone">Phone</label>
                    <input id="sf-phone" name="phone" type="tel" required autocomplete="tel" placeholder="(555) 555-5555">
                    <span class="error-msg">Please enter your phone number.</span>
                  </div>
                  <div class="field-group">
                    <label for="sf-msg">Message (optional)</label>
                    <textarea id="sf-msg" name="message" placeholder="Preferred days/times to tour this home…" style="min-height:90px"></textarea>
                  </div>
                  <button class="btn btn--primary btn--block" type="submit">Request Showing</button>
                  <p class="note-italic" style="font-size:.82rem">By submitting you agree to be contacted about this property.</p>
                </div>
                <div class="form-success" role="status" aria-live="polite">
                  <div class="form-success__check" aria-hidden="true">${ICONS.check || ''}</div>
                  <h3>Request received</h3>
                  <p class="text-soft">Thanks — I’ll reach out shortly to confirm a showing time.</p>
                </div>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <div id="related-mount"></div>
  `;

  /* gallery wiring ---------------------------------------------------------*/
  const mainImg = $('#gallery-main', root);
  $$('.gallery__thumb', root).forEach((btn) => {
    btn.addEventListener('click', () => {
      mainImg.src = images[Number(btn.dataset.index)];
      $$('.gallery__thumb', root).forEach((b) => b.setAttribute('aria-current', String(b === btn)));
    });
  });

  /* related (auto) ---------------------------------------------------------*/
  function relatedFor(cur) {
    const pool = PROPERTIES.filter((x) => x.id !== cur.id);
    const score = (x) => (x.city === cur.city ? 2 : 0) + (x.type === cur.type ? 1 : 0);
    return pool.sort((a, b) => score(b) - score(a)).slice(0, 3);
  }
  const related = relatedFor(p);
  if (related.length && window.propertyCardHTML) {
    $('#related-mount').innerHTML = `
      <section class="section section--gray">
        <div class="container">
          <div class="section-head"><p class="eyebrow">Keep exploring</p><h2>Related Properties</h2></div>
          <div class="grid grid-3">${related.map(window.propertyCardHTML).join('')}</div>
        </div>
      </section>`;
  }
})();
