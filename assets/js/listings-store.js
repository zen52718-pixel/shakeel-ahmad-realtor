// Static data source shared by the website and the draft editor.
export function validateListings(rows) {
  if (!Array.isArray(rows)) throw new Error('Listings must be an array.');
  const ids = new Set();
  const textFields = ['address', 'city', 'state', 'zip', 'short_desc', 'description'];
  const photoOK = (value) => typeof value === 'string' && (
    /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value) ||
    /^https:\/\/[^\s"'<>]+$/.test(value) || /^assets\/img\/[a-zA-Z0-9_./-]+$/.test(value));
  for (const row of rows) {
    if (!row || !/^[a-z0-9][a-z0-9-]*$/.test(row.id) || ids.has(row.id)) throw new Error('Invalid or duplicate listing ID.');
    ids.add(row.id);
    if (textFields.some((key) => typeof row[key] !== 'string')) throw new Error('Invalid text fields.');
    if (!row.address.trim() || !row.city.trim() || !Number.isFinite(row.price) || row.price < 0) throw new Error('Address, city and price required.');
    if (!['For Sale','Pending','Sold'].includes(row.status) || !['Single-Family','Condo','Townhouse','Multi-Family','Land'].includes(row.type)) throw new Error('Invalid status or type.');
    if (typeof row.featured !== 'boolean') throw new Error('Invalid featured value.');
    for (const key of ['beds','baths','sqft','year_built']) {
      if (row[key] != null && (!Number.isFinite(row[key]) || row[key] < 0)) throw new Error('Invalid property number.');
    }
    if (!Array.isArray(row.features) || row.features.some((value) => typeof value !== 'string')) throw new Error('Invalid features.');
    if (!Array.isArray(row.images) || !row.images.length || row.images.some((value) => !photoOK(value)) || !photoOK(row.image)) throw new Error('Invalid photo.');
  }
  return rows;
}
export function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
}
export async function readListings() {
  const response = await fetch(new URL('../data/properties.json', import.meta.url), {cache: 'no-store'});
  if (!response.ok) throw new Error(`Listings request failed (${response.status}).`);
  return validateListings(await response.json());
}
