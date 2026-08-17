/* ============================================================================
   admin.js — private listings dashboard (admin.html)
   ----------------------------------------------------------------------------
   • Supabase Auth (email/password) — no public sign-up anywhere here.
   • Dashboard: list / add / edit / delete properties.
   • Photo upload to the `property-photos` storage bucket (drag-and-drop or
     file picker), with step-count progress ("Uploading 2 of 4…") — the
     Supabase JS client doesn't expose byte-level progress, so we show an
     honest step counter rather than a fabricated percentage bar.
   • Every error shown to Shakeel is plain-language; raw error objects only
     go to console.error() for developer debugging.
   • RLS (see supabase/schema.sql) is the actual security boundary — this
     file just gives Shakeel a UI over it. The publishable key used by
     supabase-config.js can't write anything on its own; only a signed-in
     session can.
   ========================================================================== */
import { supabase } from './supabase-config.js';

const BUCKET = 'property-photos';
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

/* ---------------------------------------------------------------------------
   Small DOM refs
--------------------------------------------------------------------------- */
const loginView = $('#login-view');
const dashboardView = $('#dashboard-view');
const logoutBtn = $('#logout-btn');
const loginForm = $('#login-form');
const loginError = $('#login-error');
const loginSubmit = $('#login-submit');

const propertiesLoading = $('#properties-loading');
const tableWrap = $('#properties-table-wrap');
const tbody = $('#properties-tbody');
const emptyState = $('#properties-empty');

const modalBackdrop = $('#property-modal');
const modalTitle = $('#property-modal-title');
const addBtn = $('#add-property-btn');
const closeBtn = $('#property-modal-close');
const cancelBtn = $('#property-form-cancel');
const form = $('#property-form');
const submitBtn = $('#property-form-submit');

const featureInput = $('#pf-feature-input');
const featureAddBtn = $('#pf-feature-add');
const featureChips = $('#pf-feature-chips');

const dropzone = $('#pf-dropzone');
const fileInput = $('#pf-file-input');
const photoGrid = $('#pf-photo-grid');
const photoError = $('#pf-photo-error');

const toastRoot = $('#toast-root');

/* ---------------------------------------------------------------------------
   Toast helper — friendly, transient success/error messages.
--------------------------------------------------------------------------- */
function toast(message, type = 'success') {
  const el = document.createElement('div');
  el.className = `admin-toast__item admin-toast__item--${type}`;
  const icon = type === 'success'
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5 9-11"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>';
  el.innerHTML = `${icon}<span>${message}</span>`;
  toastRoot.appendChild(el);
  setTimeout(() => el.remove(), 4200);
}

/* ---------------------------------------------------------------------------
   AUTH
--------------------------------------------------------------------------- */
function showLoggedOut() {
  loginView.hidden = false;
  dashboardView.hidden = true;
  logoutBtn.hidden = true;
}
function showLoggedIn() {
  loginView.hidden = true;
  dashboardView.hidden = false;
  logoutBtn.hidden = false;
  loadProperties();
}

async function checkSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) showLoggedIn(); else showLoggedOut();
}

supabase.auth.onAuthStateChange((_event, session) => {
  if (session) showLoggedIn(); else showLoggedOut();
});

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.hidden = true;
  loginSubmit.disabled = true;
  loginSubmit.textContent = 'Signing in…';
  const email = $('#login-email').value.trim();
  const password = $('#login-password').value;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  loginSubmit.disabled = false;
  loginSubmit.textContent = 'Sign In';
  if (error) {
    console.error('[admin login]', error);
    loginError.textContent = 'Incorrect email or password. Please try again.';
    loginError.hidden = false;
    return;
  }
  loginForm.reset();
});

logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  toast('Signed out.', 'success');
});

/* ---------------------------------------------------------------------------
   LOAD + RENDER PROPERTIES TABLE
--------------------------------------------------------------------------- */
const fmtPrice = (n) => typeof n === 'number' ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) : n;
const statusBadgeClass = (s) => 'badge--' + String(s).toLowerCase().replace(/[^a-z]+/g, '-');

let propertiesCache = [];

async function loadProperties() {
  propertiesLoading.hidden = false;
  tableWrap.hidden = true;
  emptyState.hidden = true;
  const { data, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false });
  propertiesLoading.hidden = true;
  if (error) {
    console.error('[load properties]', error);
    toast('Couldn’t load your listings. Please refresh the page.', 'error');
    return;
  }
  propertiesCache = data || [];
  renderTable();
}

function renderTable() {
  if (!propertiesCache.length) {
    emptyState.hidden = false;
    tableWrap.hidden = true;
    return;
  }
  emptyState.hidden = true;
  tableWrap.hidden = false;
  tbody.innerHTML = propertiesCache.map((row) => `
    <tr>
      <td><img class="admin-table__thumb" src="${row.image || ''}" alt="" loading="lazy"></td>
      <td>
        <div class="admin-table__addr">${row.address}</div>
        <div class="admin-table__city">${row.city}, ${row.state} ${row.zip}</div>
      </td>
      <td>${fmtPrice(row.price)}</td>
      <td><span class="badge badge--static ${statusBadgeClass(row.status)}">${row.status}</span></td>
      <td>${row.featured ? 'Yes' : '—'}</td>
      <td>
        <div class="admin-table__actions">
          <button class="btn btn--outline btn--sm" type="button" data-edit="${row.id}">Edit</button>
          <button class="btn btn--outline btn--sm" type="button" data-delete="${row.id}">Delete</button>
        </div>
      </td>
    </tr>`).join('');
}

tbody.addEventListener('click', (e) => {
  const editId = e.target.closest('[data-edit]')?.getAttribute('data-edit');
  const delId = e.target.closest('[data-delete]')?.getAttribute('data-delete');
  if (editId) openModal(propertiesCache.find((r) => r.id === editId));
  if (delId) deleteProperty(delId);
});

/* ---------------------------------------------------------------------------
   MODAL: open / close / reset
--------------------------------------------------------------------------- */
let editingId = null;
let features = [];
let photos = []; // [{ url, isNew, file }] — isNew ones are uploaded on save

function openModal(row) {
  form.reset();
  $$('.field-group', form).forEach((g) => g.classList.remove('has-error'));
  photoError.hidden = true;
  editingId = row ? row.id : null;
  modalTitle.textContent = row ? 'Edit Property' : 'Add New Property';

  $('#pf-id').value = row?.id || '';
  $('#pf-address').value = row?.address || '';
  $('#pf-city').value = row?.city || '';
  $('#pf-state').value = row?.state || 'NY';
  $('#pf-zip').value = row?.zip || '';
  $('#pf-price').value = row?.price ?? '';
  $('#pf-status').value = row?.status || 'For Sale';
  $('#pf-type').value = row?.type || 'Single-Family';
  $('#pf-beds').value = row?.beds ?? '';
  $('#pf-baths').value = row?.baths ?? '';
  $('#pf-sqft').value = row?.sqft ?? '';
  $('#pf-year').value = row?.year_built ?? '';
  $('#pf-featured').checked = !!row?.featured;
  $('#pf-short').value = row?.short_desc || '';
  $('#pf-desc').value = row?.description || '';

  features = Array.isArray(row?.features) ? [...row.features] : [];
  renderChips();

  photos = (Array.isArray(row?.images) && row.images.length)
    ? row.images.map((url) => ({ url, isNew: false }))
    : (row?.image ? [{ url: row.image, isNew: false }] : []);
  renderPhotoGrid();

  modalBackdrop.hidden = false;
}

function closeModal() {
  modalBackdrop.hidden = true;
  editingId = null;
  features = [];
  photos = [];
}
addBtn.addEventListener('click', () => openModal(null));
closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', (e) => { if (e.target === modalBackdrop) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modalBackdrop.hidden) closeModal(); });

/* ---------------------------------------------------------------------------
   FEATURE CHIPS
--------------------------------------------------------------------------- */
function renderChips() {
  featureChips.innerHTML = features.map((f, i) => `
    <span class="chip">${f}<button type="button" data-remove-chip="${i}" aria-label="Remove ${f}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></span>`).join('');
}
function addFeature() {
  const v = featureInput.value.trim();
  if (!v) return;
  features.push(v);
  featureInput.value = '';
  renderChips();
}
featureAddBtn.addEventListener('click', addFeature);
featureInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addFeature(); }
});
featureChips.addEventListener('click', (e) => {
  const idx = e.target.closest('[data-remove-chip]')?.getAttribute('data-remove-chip');
  if (idx != null) { features.splice(Number(idx), 1); renderChips(); }
});

/* ---------------------------------------------------------------------------
   PHOTOS — dropzone, previews, remove
--------------------------------------------------------------------------- */
function renderPhotoGrid() {
  photoGrid.innerHTML = photos.map((p, i) => `
    <div class="photo-thumb">
      <img src="${p.url}" alt="">
      ${i === 0 ? '<span class="photo-thumb__cover">Cover</span>' : ''}
      <button class="photo-thumb__remove" type="button" data-remove-photo="${i}" aria-label="Remove photo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>`).join('');
}
photoGrid.addEventListener('click', (e) => {
  const idx = e.target.closest('[data-remove-photo]')?.getAttribute('data-remove-photo');
  if (idx != null) { photos.splice(Number(idx), 1); renderPhotoGrid(); }
});

function addFiles(fileList) {
  const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'));
  files.forEach((file) => {
    photos.push({ url: URL.createObjectURL(file), isNew: true, file });
  });
  renderPhotoGrid();
  if (photos.length) photoError.hidden = true;
}
dropzone.addEventListener('click', () => fileInput.click());
dropzone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); } });
fileInput.addEventListener('change', () => { addFiles(fileInput.files); fileInput.value = ''; });
['dragenter', 'dragover'].forEach((evt) => dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.add('is-dragover'); }));
['dragleave', 'drop'].forEach((evt) => dropzone.addEventListener(evt, (e) => { e.preventDefault(); dropzone.classList.remove('is-dragover'); }));
dropzone.addEventListener('drop', (e) => addFiles(e.dataTransfer.files));

/* Uploads any pending (isNew) photos, in order, showing step progress on
   the thumbnail itself. Returns the final ordered array of public URLs. */
async function uploadPendingPhotos(propertySlug) {
  const total = photos.filter((p) => p.isNew).length;
  let done = 0;
  const finalUrls = [];
  for (let i = 0; i < photos.length; i++) {
    const p = photos[i];
    if (!p.isNew) { finalUrls.push(p.url); continue; }
    done++;
    const thumbEl = photoGrid.children[i];
    const overlay = document.createElement('div');
    overlay.className = 'photo-thumb__progress';
    overlay.textContent = `Uploading ${done} of ${total}…`;
    thumbEl?.appendChild(overlay);

    const ext = (p.file.name.split('.').pop() || 'jpg').toLowerCase();
    const path = `${propertySlug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, p.file, { cacheControl: '3600', upsert: false });
    if (upErr) {
      console.error('[photo upload]', upErr);
      throw new Error('One of the photos failed to upload.');
    }
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
    finalUrls.push(pub.publicUrl);
  }
  return finalUrls;
}

/* ---------------------------------------------------------------------------
   SLUG for new properties
--------------------------------------------------------------------------- */
function slugify(address) {
  const base = String(address).toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'property';
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

/* ---------------------------------------------------------------------------
   VALIDATION
--------------------------------------------------------------------------- */
function validateForm() {
  let ok = true;
  let firstInvalid = null;
  $$('input[required], select[required]', form).forEach((f) => {
    const group = f.closest('.field-group');
    const valid = f.checkValidity();
    group?.classList.toggle('has-error', !valid);
    if (!valid) { ok = false; if (!firstInvalid) firstInvalid = f; }
  });
  if (!photos.length) {
    photoError.hidden = false;
    ok = false;
    if (!firstInvalid) firstInvalid = dropzone;
  } else {
    photoError.hidden = true;
  }
  firstInvalid?.focus();
  return ok;
}

/* ---------------------------------------------------------------------------
   SAVE (insert or update)
--------------------------------------------------------------------------- */
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving…';

  const id = editingId || slugify($('#pf-address').value);

  try {
    const images = await uploadPendingPhotos(id);
    const payload = {
      id,
      address: $('#pf-address').value.trim(),
      city: $('#pf-city').value.trim(),
      state: $('#pf-state').value.trim().toUpperCase(),
      zip: $('#pf-zip').value.trim(),
      price: Number($('#pf-price').value) || 0,
      status: $('#pf-status').value,
      type: $('#pf-type').value,
      beds: $('#pf-beds').value === '' ? null : Number($('#pf-beds').value),
      baths: $('#pf-baths').value === '' ? null : Number($('#pf-baths').value),
      sqft: $('#pf-sqft').value === '' ? null : Number($('#pf-sqft').value),
      year_built: $('#pf-year').value === '' ? null : Number($('#pf-year').value),
      featured: $('#pf-featured').checked,
      short_desc: $('#pf-short').value.trim(),
      description: $('#pf-desc').value.trim(),
      features,
      image: images[0] || null,
      images,
    };

    const { error } = editingId
      ? await supabase.from('properties').update(payload).eq('id', editingId)
      : await supabase.from('properties').insert(payload);

    if (error) throw error;

    toast(editingId ? 'Property updated.' : 'Property added.', 'success');
    closeModal();
    loadProperties();
  } catch (err) {
    console.error('[save property]', err);
    toast('Something went wrong saving this property. Please check your connection and try again.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Property';
  }
});

/* ---------------------------------------------------------------------------
   DELETE — confirm, remove storage files, remove row
--------------------------------------------------------------------------- */
async function deleteProperty(id) {
  const row = propertiesCache.find((r) => r.id === id);
  if (!row) return;
  const ok = confirm(`Delete "${row.address}"? This cannot be undone.`);
  if (!ok) return;

  try {
    // Best-effort: remove this property's photo files from storage first.
    const { data: files } = await supabase.storage.from(BUCKET).list(id);
    if (files && files.length) {
      await supabase.storage.from(BUCKET).remove(files.map((f) => `${id}/${f.name}`));
    }
  } catch (err) {
    console.error('[delete storage files]', err);
    /* Non-fatal — still proceed to delete the row so it isn't stuck. */
  }

  const { error } = await supabase.from('properties').delete().eq('id', id);
  if (error) {
    console.error('[delete property]', error);
    toast('Couldn’t delete this property. Please try again.', 'error');
    return;
  }
  toast('Property deleted.', 'success');
  loadProperties();
}

/* ---------------------------------------------------------------------------
   INIT
--------------------------------------------------------------------------- */
checkSession();
