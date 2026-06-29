/* ============================================================================
   main.js — site-wide behavior
   ----------------------------------------------------------------------------
   • Header scroll state (transparent → frosted glass)
   • Mobile menu toggle (accessible)
   • Active nav link by current page
   • Scroll reveals via IntersectionObserver (respects reduced motion)
   • Property card renderer (shared by home + properties grid)
   • Properties grid + live filters (search / city / type / price / status)
   • Footer year + dynamic NAP injection
   • Form validation + success state (console.logs payload; endpoint stub)

   Depends on data.js (SITE, PROPERTIES) loaded first.
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------ utils */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const formatPrice = (n) =>
    typeof n === 'number'
      ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
      : n;

  const statusClass = (status) =>
    'badge--' + String(status).toLowerCase().replace(/[^a-z]+/g, '-');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ------------------------------------------------------- inline SVG icons */
  // Small reusable line icons (no icon font / dependency).
  const ICONS = {
    bed:  '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 18h18M3 18v2M21 18v2M6 10V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3M13 10V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3"/></svg>',
    bath: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3ZM6 12V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2M7 19l-1 2M18 19l1 2"/></svg>',
    sqft: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3h18v18H3zM3 9h6M3 15h6M15 3v6M15 15v6"/></svg>',
    year: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>',
    lot:  '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7l9-4 9 4-9 4-9-4ZM3 7v10l9 4 9-4V7"/></svg>',
  };


  /* =====================================================================
     1) HEADER — scroll state + mobile menu
     ===================================================================== */
  function initHeader() {
    const header = $('.site-header');
    if (!header) return;

    // Frost the header once the user scrolls past the hero threshold.
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Mobile menu
    const toggle = $('.nav-toggle');
    const nav = $('#primary-nav');
    if (toggle && nav) {
      const setOpen = (open) => {
        nav.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
      };
      toggle.addEventListener('click', () =>
        setOpen(toggle.getAttribute('aria-expanded') !== 'true')
      );
      // Close after navigating or pressing Escape
      $$('a', nav).forEach((a) => a.addEventListener('click', () => setOpen(false)));
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    }
  }


  /* =====================================================================
     2) ACTIVE NAV LINK — mark current page
     ===================================================================== */
  function initActiveNav() {
    const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    $$('.nav__link').forEach((link) => {
      const href = (link.getAttribute('href') || '').toLowerCase();
      // property.html highlights the Properties tab
      const match = href === page || (page === 'property.html' && href === 'properties.html');
      if (match) link.setAttribute('aria-current', 'page');
    });
  }


  /* =====================================================================
     3) SCROLL REVEALS — IntersectionObserver
     ===================================================================== */
  function initReveals() {
    const items = $$('[data-reveal]');
    if (!items.length) return;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    items.forEach((el) => io.observe(el));
  }


  /* =====================================================================
     4) DYNAMIC NAP — fill brand/contact placeholders from SITE
     Any element with data-site="path.to.value" gets its text from SITE.
     Any <a data-site-href="cell|office|email"> gets the right tel:/mailto:.
     ===================================================================== */
  function initSiteData() {
    if (!window.SITE) return;
    const get = (path) => path.split('.').reduce((o, k) => (o ? o[k] : undefined), SITE);

    $$('[data-site]').forEach((el) => {
      const val = get(el.getAttribute('data-site'));
      if (val != null) el.textContent = val;
    });
    $$('[data-site-href]').forEach((el) => {
      const map = { cell: SITE.cellHref, office: SITE.officeHref, email: SITE.emailHref };
      const href = map[el.getAttribute('data-site-href')];
      if (href) el.setAttribute('href', href);
    });

    // Current year (footer)
    $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
  }


  /* =====================================================================
     5) PROPERTY CARD — shared renderer
     Returns an HTML string for one listing. Used on home + properties.
     ===================================================================== */
  function propertyCardHTML(p) {
    // Land has no beds/baths; show lot size instead.
    const specBits =
      p.type === 'Land'
        ? `<span class="spec">${ICONS.lot}<strong>${p.lot || '—'}</strong></span>
           <span class="spec">${ICONS.sqft}<strong>${p.lot ? 'Lot' : '—'}</strong></span>`
        : `<span class="spec">${ICONS.bed}<strong>${p.beds}</strong>&nbsp;bd</span>
           <span class="spec">${ICONS.bath}<strong>${p.baths}</strong>&nbsp;ba</span>
           <span class="spec">${ICONS.sqft}<strong>${p.sqft.toLocaleString()}</strong>&nbsp;sqft</span>`;

    return `
      <article class="card property-card" data-reveal>
        <a class="property-card__media" href="property.html?id=${encodeURIComponent(p.id)}"
           aria-label="View details for ${p.title}, ${p.address}">
          <img class="property-card__img" src="${p.image}" alt="${p.title} — ${p.address}, ${p.city}, ${p.state}" loading="lazy" width="600" height="400">
          <span class="badge ${statusClass(p.status)}">${p.status}</span>
          ${p.sample ? '<span class="sample-tag">Sample — replace with MLS</span>' : ''}
        </a>
        <div class="property-card__body">
          <div class="property-card__price">${formatPrice(p.price)}</div>
          <div class="property-card__addr">${p.address}</div>
          <div class="property-card__city">${p.city}, ${p.state} ${p.zip}</div>
          <p class="property-card__desc">${p.short}</p>
          <div class="specs">${specBits}</div>
          <a class="btn btn--outline btn--sm property-card__cta" href="property.html?id=${encodeURIComponent(p.id)}">
            View Details
          </a>
        </div>
      </article>`;
  }
  // Expose so property.js can reuse it for "Related Properties".
  window.propertyCardHTML = propertyCardHTML;
  window.PROP_ICONS = ICONS;


  /* =====================================================================
     6) FEATURED GRID (home) — render featured listings
     ===================================================================== */
  function initFeatured() {
    const grid = $('#featured-grid');
    if (!grid || !window.PROPERTIES) return;
    const featured = PROPERTIES.filter((p) => p.featured);
    grid.innerHTML = featured.map(propertyCardHTML).join('');
  }


  /* =====================================================================
     7) PROPERTIES PAGE — grid + live filters
     ===================================================================== */
  function initPropertiesPage() {
    const grid = $('#properties-grid');
    if (!grid || !window.PROPERTIES) return;

    const els = {
      search: $('#f-search'),
      city: $('#f-city'),
      type: $('#f-type'),
      price: $('#f-price'),
      status: $('#f-status'),
      reset: $('#f-reset'),
      count: $('#results-count'),
      empty: $('#empty-state'),
    };

    // Populate City + Type selects from the data (no hardcoding).
    const fillSelect = (sel, values, allLabel) => {
      if (!sel) return;
      sel.innerHTML =
        `<option value="">${allLabel}</option>` +
        values.map((v) => `<option value="${v}">${v}</option>`).join('');
    };
    fillSelect(els.city, [...new Set(PROPERTIES.map((p) => p.city))].sort(), 'All cities');
    fillSelect(els.type, [...new Set(PROPERTIES.map((p) => p.type))].sort(), 'All types');

    // Price brackets (label → predicate)
    const priceBuckets = {
      '': () => true,
      '0-250000': (p) => p.price < 250000,
      '250000-400000': (p) => p.price >= 250000 && p.price < 400000,
      '400000-600000': (p) => p.price >= 400000 && p.price < 600000,
      '600000+': (p) => p.price >= 600000,
    };

    // Pre-fill from URL params (e.g. home search card links here).
    const params = new URLSearchParams(location.search);
    if (els.city && params.get('city')) els.city.value = params.get('city');
    if (els.type && params.get('type')) els.type.value = params.get('type');
    if (els.status && params.get('status')) els.status.value = params.get('status');
    if (els.search && params.get('q')) els.search.value = params.get('q');

    function apply() {
      const q = (els.search?.value || '').trim().toLowerCase();
      const city = els.city?.value || '';
      const type = els.type?.value || '';
      const status = els.status?.value || '';
      const priceFn = priceBuckets[els.price?.value || ''] || (() => true);

      const filtered = PROPERTIES.filter((p) => {
        const haystack = `${p.address} ${p.city} ${p.state} ${p.zip} ${p.title}`.toLowerCase();
        return (
          (!q || haystack.includes(q)) &&
          (!city || p.city === city) &&
          (!type || p.type === type) &&
          (!status || p.status === status) &&
          priceFn(p)
        );
      });

      grid.innerHTML = filtered.map(propertyCardHTML).join('');
      if (els.count) {
        els.count.textContent =
          `${filtered.length} ${filtered.length === 1 ? 'property' : 'properties'}`;
      }
      if (els.empty) els.empty.hidden = filtered.length !== 0;
      grid.hidden = filtered.length === 0;

      // Re-run reveals for freshly inserted cards.
      initReveals();
    }

    // Live filtering — input for typing, change for selects.
    els.search?.addEventListener('input', apply);
    [els.city, els.type, els.price, els.status].forEach((s) =>
      s?.addEventListener('change', apply)
    );
    els.reset?.addEventListener('click', () => {
      [els.search, els.city, els.type, els.price, els.status].forEach((el) => {
        if (el) el.value = '';
      });
      apply();
    });

    apply();
  }


  /* =====================================================================
     7b) ABOUT PAGE — render honest "Recent Transactions" from TRANSACTIONS
     ===================================================================== */
  function initTransactions() {
    const mount = $('#transactions-body');
    if (!mount || !window.TRANSACTIONS) return;
    mount.innerHTML = TRANSACTIONS.map(
      (t, i) => `
      <tr data-reveal data-reveal-delay="${Math.min(i, 4)}">
        <td><span class="tx-num">${String(i + 1).padStart(2, '0')}</span></td>
        <td>${t.type}</td>
        <td>${t.area}</td>
        <td>${t.role}</td>
        <td><span class="badge badge--sold tx-badge">${t.status}</span></td>
      </tr>`
    ).join('');
  }


  /* =====================================================================
     8) HOME SEARCH CARD — route selections to the properties page
     ===================================================================== */
  function initHomeSearch() {
    const form = $('#home-search');
    if (!form) return;

    // Populate city/type selects from data.
    const citySel = $('#hs-city', form);
    const typeSel = $('#hs-type', form);
    if (citySel) {
      citySel.innerHTML =
        '<option value="">Any city</option>' +
        [...new Set(PROPERTIES.map((p) => p.city))].sort()
          .map((c) => `<option value="${c}">${c}</option>`).join('');
    }
    if (typeSel) {
      typeSel.innerHTML =
        '<option value="">Any type</option>' +
        [...new Set(PROPERTIES.map((p) => p.type))].sort()
          .map((t) => `<option value="${t}">${t}</option>`).join('');
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const params = new URLSearchParams();
      const q = $('#hs-q', form)?.value.trim();
      if (q) params.set('q', q);
      if (citySel?.value) params.set('city', citySel.value);
      if (typeSel?.value) params.set('type', typeSel.value);
      const status = $('#hs-status', form)?.value;
      if (status) params.set('status', status);
      location.href = 'properties.html' + (params.toString() ? `?${params}` : '');
    });
  }


  /* =====================================================================
     9) FORMS — validation, success state, payload log, endpoint stub
     Works for any <form data-form> (contact, home consultation, showing).
     ===================================================================== */
  function initForms() {
    $$('form[data-form]').forEach((form) => {
      const successEl = form.querySelector('.form-success');

      const showError = (field, on) => {
        const group = field.closest('.field-group');
        if (group) group.classList.toggle('has-error', on);
      };

      const validateField = (field) => {
        let ok = field.checkValidity();
        // Extra email sanity check (native + simple regex)
        if (ok && field.type === 'email' && field.value) {
          ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
        }
        showError(field, !ok);
        return ok;
      };

      // Live-clear errors as the user fixes them.
      $$('input, select, textarea', form).forEach((f) =>
        f.addEventListener('input', () => { if (f.closest('.has-error')) validateField(f); })
      );

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fields = $$('input, select, textarea', form).filter((f) => f.willValidate);
        let valid = true;
        let firstInvalid = null;
        fields.forEach((f) => {
          const ok = validateField(f);
          if (!ok && !firstInvalid) firstInvalid = f;
          valid = valid && ok;
        });

        if (!valid) {
          firstInvalid?.focus();
          return;
        }

        // Build payload from named fields.
        const payload = Object.fromEntries(new FormData(form).entries());
        payload._form = form.getAttribute('data-form') || 'contact';
        payload._submittedAt = new Date().toISOString();

        // For demo/local use: log the payload so it's verifiable.
        console.log('[Form submission]', payload);

        /* ----------------------------------------------------------------
           Connect a real endpoint (Formspree, etc.) here later, e.g.:

           fetch('https://formspree.io/f/XXXXXXXX', {
             method: 'POST',
             headers: { 'Accept': 'application/json' },
             body: new FormData(form),
           }).then(...).catch(...);

           Until then we just show the success state below.
        ---------------------------------------------------------------- */

        // Success state
        if (successEl) {
          form.querySelectorAll('.form-body').forEach((el) => (el.hidden = true));
          successEl.classList.add('is-visible');
          successEl.setAttribute('tabindex', '-1');
          successEl.focus();
          successEl.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
        } else {
          form.reset();
        }
      });
    });
  }


  /* =====================================================================
     INIT
     ===================================================================== */
  function init() {
    initHeader();
    initActiveNav();
    initSiteData();
    initFeatured();
    initTransactions();
    initHomeSearch();
    initPropertiesPage();
    initForms();
    initReveals(); // last, after dynamic content is in the DOM
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
