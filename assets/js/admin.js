/* File-based listing editor. Drafts are never published from the browser. */
import { readListings, validateListings, escapeHTML } from './listings-store.js';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

/* ---------------------------------------------------------------------------
   Small DOM refs
--------------------------------------------------------------------------- */
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
   LOAD + RENDER PROPERTIES TABLE
--------------------------------------------------------------------------- */
const fmtPrice = (n) => typeof n === 'number' ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) : n;
const statusBadgeClass = (s) => 'badge--' + String(s).toLowerCase().replace(/[^a-z]+/g, '-');

let propertiesCache = [];

async function loadProperties() {
  propertiesLoading.hidden = false;
  tableWrap.hidden = true;
  emptyState.hidden = true;
  try {
    propertiesCache = await readListings();
    $('#export-listings').disabled = false;
    addBtn.disabled = false;
    $('#draft-status').textContent = 'Published listings loaded. Edits remain in this tab until downloaded.';
  } catch (error) {
    propertiesLoading.hidden = true;
    $('#draft-status').textContent = 'Could not load published listings. Refresh or import a backup JSON file before editing.';
    return;
  }
  propertiesLoading.hidden = true;
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
  tbody.innerHTML = propertiesCache.map((raw) => { const row = Object.fromEntries(Object.entries(raw).map(([key,value]) => [key, typeof value === "string" ? escapeHTML(value) : value])); return `
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
    </tr>`; }).join('');
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
let photos = []; // [{ url, isNew, file }] — isNew ones are compressed on save

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
    <span class="chip">${escapeHTML(f)}<button type="button" data-remove-chip="${i}" aria-label="Remove ${escapeHTML(f)}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></span>`).join('');
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

/* Resize new photos and embed JPEG data in the exported JSON. */
async function uploadPendingPhotos() {
  const urls = [];
  for (const photo of photos) {
    if (!photo.isNew) { urls.push(photo.url); continue; }
    const bitmap = await createImageBitmap(photo.file);
    const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    urls.push(canvas.toDataURL('image/jpeg', 0.78));
  }
  return urls;
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

    validateListings([payload]);
    const index = propertiesCache.findIndex((row) => row.id === id);
    if (index >= 0) propertiesCache[index] = payload;
    else propertiesCache.unshift(payload);
    markDirty();
    toast('Draft saved. Download and upload the JSON file to publish.', 'success');
    closeModal();
    renderTable();
  } catch (err) {
    console.error('[save property]', err);
    toast('Something went wrong saving this property. Please check the fields and photos, then try again.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Draft';
  }
});

/* ---------------------------------------------------------------------------
   DELETE — remove a draft row
--------------------------------------------------------------------------- */
async function deleteProperty(id) {
  const row = propertiesCache.find((r) => r.id === id);
  if (!row) return;
  const ok = confirm(`Delete "${row.address}"? This cannot be undone.`);
  if (!ok) return;

  propertiesCache = propertiesCache.filter((item) => item.id !== id);
  markDirty();
  renderTable();
  toast('Removed from draft. Download and upload to publish.');
}

let dirty = false;
function markDirty() {
  dirty = true;
  $('#draft-status').textContent = 'Unexported changes. Download properties.json, then upload it to your hosting to publish.';
}
window.addEventListener('beforeunload', (event) => {
  if (dirty) { event.preventDefault(); event.returnValue = ''; }
});
$('#export-listings').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(validateListings(propertiesCache), null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'properties.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  dirty = false;
  $('#draft-status').textContent = 'Download requested. Upload properties.json to assets/data/ on your hosting to publish.';
});
$('#import-listings').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  if (dirty && !confirm('Replace unexported drafts with this file?')) { event.target.value = ''; return; }
  try {
    const imported = validateListings(JSON.parse(await file.text()));
    propertiesCache = imported;
    propertiesLoading.hidden = true;
    $('#export-listings').disabled = false;
    addBtn.disabled = false;
    markDirty();
    renderTable();
  } catch (error) { toast('Invalid listings file. Existing drafts were kept.', 'error'); }
  event.target.value = '';
});
loadProperties();
