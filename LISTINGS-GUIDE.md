# Adding properties without Supabase

## First deployment
1. Back up the existing website files.
2. Extract the supplied ZIP into the website root (`public_html` on Hostinger).
   The ZIP contains the complete static site, with index.html at its root.
3. No installation, build command, database or environment variables are needed.
4. Open `/admin.html` over HTTPS. The initial listing file is empty; no sample
   properties are published. Existing Supabase rows are not migrated automatically.

## Add, change or remove a property
1. Open `/admin.html`. It loads the currently published listing file.
2. Click **Add New Property**, enter details, and select photos. Check **Feature
   on homepage** to show its card on Home. The first photo is the cover.
3. Click **Save Draft**. Repeat for other listings; Edit and Delete change drafts.
4. Click **Download properties.json**. Keep the downloaded file as a backup.
5. In Hostinger File Manager, replace `public_html/assets/data/properties.json`
   with the downloaded file (ensure the name is exactly properties.json).
6. Refresh the website and open the listing to confirm publication. If a hosting
   CDN serves an old copy, clear that cache.

The editor never writes to your server. No login is necessary because it only
creates downloads. Your hosting login controls who can publish. Drafts live only
in the open tab; download before closing it. Import a previously downloaded JSON
file to resume work. Work from the latest published file to avoid overwriting
another editor's changes.

## Photos and scale
New photos are resized to a maximum 1400 pixels and compressed to JPEG inside the
JSON file. This makes publication a single upload but is intended for a small
listing portfolio: all photos are downloaded with the listing file. For a large
catalog, place optimized photos under `assets/img/` and use their relative paths
in `image` and `images`, or move to a server-backed CMS. HTTPS image URLs are also
supported. Never store private information in this public JSON file.

## Preview and key files
Run `python3 -m http.server 8000` from the site folder, then visit
http://localhost:8000/admin.html. Opening HTML directly as file:// is unsupported.

- admin.html: draft editor interface
- assets/js/admin.js: add/edit/delete, image resizing and JSON import/export
- assets/js/listings-store.js: shared file loader and validation
- assets/data/properties.json: published listing data
- assets/js/main.js: cards, filters, shared lead form
- assets/js/property.js: listing detail page

No real listings were supplied, so the shipped data file is an empty array.
The old Supabase schema/config remain as historical references, with no runtime
imports from active pages. Existing CRM behavior has not been changed.
