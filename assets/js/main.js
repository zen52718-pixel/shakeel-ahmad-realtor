/* ============================================================================
   main.js — site-wide behavior
   ----------------------------------------------------------------------------
   • Header scroll state + accessible mobile menu + active nav link
   • Scroll reveals (IntersectionObserver, respects reduced motion)
   • Dynamic NAP injection from SITE
   • Featured properties renderer + Properties grid/filters (shared)
   • Forms: validation, success state, payload log, endpoint stub
   Depends on data.js (SITE, PROPERTIES).
   ========================================================================== */

(function () {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const formatPrice = (n) =>
    typeof n === 'number'
      ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
      : n;
  const statusClass = (s) => 'badge--' + String(s).toLowerCase().replace(/[^a-z]+/g, '-');

  /* Inline line icons (no icon font dependency). */
  const ICONS = {
    bed:  '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 18h18M3 18v2M21 18v2M6 10V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3M13 10V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v3"/></svg>',
    bath: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3ZM6 12V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2M7 19l-1 2M18 19l1 2"/></svg>',
    sqft: '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3h18v18H3zM3 9h6M3 15h6M15 3v6M15 15v6"/></svg>',
    lot:  '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7l9-4 9 4-9 4-9-4ZM3 7v10l9 4 9-4V7"/></svg>',
    check:'<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-11"/></svg>',
  };
  window.PROP_ICONS = ICONS;


  /* 1) HEADER ------------------------------------------------------------- */
  function initHeader() {
    const header = $('.site-header');
    if (!header) return;
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const toggle = $('.nav-toggle');
    const nav = $('#primary-nav');
    if (toggle && nav) {
      const setOpen = (open) => {
        nav.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
      };
      toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
      $$('a', nav).forEach((a) => a.addEventListener('click', () => setOpen(false)));
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    }
  }

  /* 2) ACTIVE NAV --------------------------------------------------------- */
  function initActiveNav() {
    const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    $$('.nav__link').forEach((link) => {
      const href = (link.getAttribute('href') || '').toLowerCase();
      const match = href === page || (page === 'property.html' && href === 'properties.html');
      if (match) link.setAttribute('aria-current', 'page');
    });
  }

  /* 3) REVEALS ------------------------------------------------------------ */
  function initReveals() {
    const items = $$('[data-reveal]');
    if (!items.length) return;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach((el) => io.observe(el));
  }

  /* 4) DYNAMIC NAP -------------------------------------------------------- */
  function initSiteData() {
    if (!window.SITE) return;
    const get = (p) => p.split('.').reduce((o, k) => (o ? o[k] : undefined), SITE);
    $$('[data-site]').forEach((el) => { const v = get(el.getAttribute('data-site')); if (v != null) el.textContent = v; });
    $$('[data-site-href]').forEach((el) => {
      const map = { cell: SITE.cellHref, office: SITE.officeHref, email: SITE.emailHref };
      const h = map[el.getAttribute('data-site-href')]; if (h) el.setAttribute('href', h);
    });
    $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));
  }

  /* 5) PROPERTY CARD (shared) -------------------------------------------- */
  function propertyCardHTML(p) {
    const specBits = p.type === 'Land'
      ? `<span class="spec">${ICONS.lot}<strong>${p.lot || '—'}</strong></span>
         <span class="spec">${ICONS.sqft}<strong>Land</strong></span>`
      : `<span class="spec">${ICONS.bed}<strong>${p.beds}</strong>&nbsp;bd</span>
         <span class="spec">${ICONS.bath}<strong>${p.baths}</strong>&nbsp;ba</span>
         <span class="spec">${ICONS.sqft}<strong>${p.sqft.toLocaleString()}</strong>&nbsp;sqft</span>`;
    return `
      <article class="card property-card" data-reveal>
        <a class="property-card__media" href="property.html?id=${encodeURIComponent(p.id)}" aria-label="View ${p.title}, ${p.address}">
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
          <a class="btn btn--outline btn--sm property-card__cta" href="property.html?id=${encodeURIComponent(p.id)}">View Details</a>
        </div>
      </article>`;
  }
  window.propertyCardHTML = propertyCardHTML;

  function initFeatured() {
    const grid = $('#featured-grid');
    if (!grid || !window.PROPERTIES) return;
    grid.innerHTML = PROPERTIES.filter((p) => p.featured).map(propertyCardHTML).join('');
  }

  /* 6) PROPERTIES PAGE: grid + filters ------------------------------------ */
  function initPropertiesPage() {
    const grid = $('#properties-grid');
    if (!grid || !window.PROPERTIES) return;
    const els = {
      search: $('#f-search'), city: $('#f-city'), type: $('#f-type'),
      price: $('#f-price'), status: $('#f-status'), reset: $('#f-reset'),
      count: $('#results-count'), empty: $('#empty-state'),
    };
    const fill = (sel, vals, all) => { if (sel) sel.innerHTML = `<option value="">${all}</option>` + vals.map((v) => `<option value="${v}">${v}</option>`).join(''); };
    fill(els.city, [...new Set(PROPERTIES.map((p) => p.city))].sort(), 'All cities');
    fill(els.type, [...new Set(PROPERTIES.map((p) => p.type))].sort(), 'All types');

    const buckets = {
      '': () => true,
      '0-250000': (p) => p.price < 250000,
      '250000-400000': (p) => p.price >= 250000 && p.price < 400000,
      '400000-600000': (p) => p.price >= 400000 && p.price < 600000,
      '600000+': (p) => p.price >= 600000,
    };

    const params = new URLSearchParams(location.search);
    if (els.city && params.get('city')) els.city.value = params.get('city');
    if (els.type && params.get('type')) els.type.value = params.get('type');
    if (els.status && params.get('status')) els.status.value = params.get('status');
    if (els.search && params.get('q')) els.search.value = params.get('q');

    function apply() {
      const q = (els.search?.value || '').trim().toLowerCase();
      const city = els.city?.value || '', type = els.type?.value || '', status = els.status?.value || '';
      const priceFn = buckets[els.price?.value || ''] || (() => true);
      const filtered = PROPERTIES.filter((p) => {
        const hay = `${p.address} ${p.city} ${p.state} ${p.zip} ${p.title}`.toLowerCase();
        return (!q || hay.includes(q)) && (!city || p.city === city) && (!type || p.type === type) && (!status || p.status === status) && priceFn(p);
      });
      grid.innerHTML = filtered.map(propertyCardHTML).join('');
      if (els.count) els.count.textContent = `${filtered.length} ${filtered.length === 1 ? 'property' : 'properties'}`;
      if (els.empty) els.empty.hidden = filtered.length !== 0;
      grid.hidden = filtered.length === 0;
      initReveals();
    }
    els.search?.addEventListener('input', apply);
    [els.city, els.type, els.price, els.status].forEach((s) => s?.addEventListener('change', apply));
    els.reset?.addEventListener('click', () => { [els.search, els.city, els.type, els.price, els.status].forEach((el) => { if (el) el.value = ''; }); apply(); });
    apply();
  }

  /* 7) FORMS --------------------------------------------------------------- */
  function initForms() {
    $$('form[data-form]').forEach((form) => {
      const successEl = form.querySelector('.form-success');
      const showError = (f, on) => { const g = f.closest('.field-group'); if (g) g.classList.toggle('has-error', on); };
      const validate = (f) => {
        let ok = f.checkValidity();
        if (ok && f.type === 'email' && f.value) ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value);
        showError(f, !ok);
        return ok;
      };
      $$('input, select, textarea', form).forEach((f) =>
        f.addEventListener('input', () => { if (f.closest('.has-error')) validate(f); }));

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fields = $$('input, select, textarea', form).filter((f) => f.willValidate);
        let valid = true, firstInvalid = null;
        fields.forEach((f) => { const ok = validate(f); if (!ok && !firstInvalid) firstInvalid = f; valid = valid && ok; });
        if (!valid) { firstInvalid?.focus(); return; }

        const payload = Object.fromEntries(new FormData(form).entries());
        payload._form = form.getAttribute('data-form') || 'contact';
        payload._submittedAt = new Date().toISOString();
        console.log('[Form submission]', payload);

        /* ----------------------------------------------------------------
           Connect a real endpoint (Formspree, etc.) here later, e.g.:
             fetch('https://formspree.io/f/XXXXXXXX', {
               method: 'POST', headers: { Accept: 'application/json' },
               body: new FormData(form),
             }).then(...).catch(...);
           Until then we show the success state below.
        ---------------------------------------------------------------- */

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

  /* INIT ----------------------------------------------------------------- */
  function init() {
    initHeader();
    initActiveNav();
    initSiteData();
    initFeatured();
    initPropertiesPage();
    initForms();
    initReveals();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
