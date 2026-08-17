-- ============================================================================
-- schema.sql — Shakeel Ahmad Realtor: property management backend
-- ----------------------------------------------------------------------------
-- Run this ONCE in the Supabase SQL Editor (Project → SQL Editor → New query
-- → paste this whole file → Run). It creates the `properties` table, enables
-- Row Level Security, and adds the policies that are the ONLY real access
-- control for this site (the browser only ever holds the publishable/anon
-- key — see assets/js/supabase-config.js).
--
-- Safe to re-run: every statement is idempotent (IF NOT EXISTS / DROP POLICY
-- IF EXISTS first), so running it twice won't error or duplicate anything.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. TABLE
-- ----------------------------------------------------------------------------
create table if not exists public.properties (
  id          text primary key,              -- slug, e.g. "greece-classic-colonial"
  status      text not null default 'For Sale',   -- 'For Sale' | 'Pending' | 'Sold'
  price       numeric not null default 0,
  address     text not null,
  city        text not null,
  state       text not null default 'NY',
  zip         text not null,
  type        text not null,                 -- 'Single-Family' | 'Condo' | 'Townhouse' | 'Multi-Family' | 'Land'
  beds        numeric,
  baths       numeric,
  sqft        numeric,
  year_built  numeric,
  short_desc  text not null,                 -- one-line card description
  description text,                          -- full paragraph for the detail page
  features    jsonb not null default '[]'::jsonb,   -- array of strings
  featured    boolean not null default false,
  image       text,                          -- primary photo URL (card)
  images      jsonb not null default '[]'::jsonb,   -- array of photo URLs (gallery)
  created_at  timestamptz not null default now()
);

comment on table public.properties is
  'Live listings, managed by Shakeel via /admin.html. Public can read; writes require an authenticated session (see RLS policies below).';


-- ----------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
-- This is the ONLY access control on this table — the front end and the
-- admin panel both connect with the same publishable (anon) key, so RLS is
-- what actually decides who can do what.
alter table public.properties enable row level security;

-- Anyone (including logged-out visitors) can read listings — the site is a
-- public marketing site, listings must stay publicly visible.
drop policy if exists "Public can view properties" on public.properties;
create policy "Public can view properties"
  on public.properties
  for select
  to anon, authenticated
  using (true);

-- Only a signed-in user (Shakeel, via admin.html) can create listings.
drop policy if exists "Authenticated can insert properties" on public.properties;
create policy "Authenticated can insert properties"
  on public.properties
  for insert
  to authenticated
  with check (true);

-- Only a signed-in user can edit listings.
drop policy if exists "Authenticated can update properties" on public.properties;
create policy "Authenticated can update properties"
  on public.properties
  for update
  to authenticated
  using (true)
  with check (true);

-- Only a signed-in user can delete listings.
drop policy if exists "Authenticated can delete properties" on public.properties;
create policy "Authenticated can delete properties"
  on public.properties
  for delete
  to authenticated
  using (true);


-- ----------------------------------------------------------------------------
-- 3. STORAGE POLICIES — bucket `property-photos`
-- ----------------------------------------------------------------------------
-- The bucket itself already exists (created manually, marked public) — this
-- only adds the access-control policies on storage.objects, scoped to that
-- one bucket so it doesn't affect any other bucket you may add later.

-- Anyone can view/download photos (the bucket is public, but RLS on
-- storage.objects still gates direct API/SDK reads — this makes that explicit).
drop policy if exists "Public can view property photos" on storage.objects;
create policy "Public can view property photos"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'property-photos');

-- Only a signed-in user can upload new photos.
drop policy if exists "Authenticated can upload property photos" on storage.objects;
create policy "Authenticated can upload property photos"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'property-photos');

-- Only a signed-in user can replace/rename photos.
drop policy if exists "Authenticated can update property photos" on storage.objects;
create policy "Authenticated can update property photos"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'property-photos')
  with check (bucket_id = 'property-photos');

-- Only a signed-in user can delete photos.
drop policy if exists "Authenticated can delete property photos" on storage.objects;
create policy "Authenticated can delete property photos"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'property-photos');


-- ----------------------------------------------------------------------------
-- 4. HELPFUL INDEXES (optional but cheap — the site filters/sorts by these)
-- ----------------------------------------------------------------------------
create index if not exists properties_featured_idx on public.properties (featured);
create index if not exists properties_city_idx on public.properties (city);
create index if not exists properties_created_at_idx on public.properties (created_at desc);


-- ============================================================================
-- Next steps:
--   1. Run this file in the SQL Editor.
--   2. Run supabase/seed.sql (optional) to pre-populate the 6 sample listings
--      so the site isn't empty on first load.
--   3. In Authentication → Users, manually create Shakeel's one login
--      (email + password). No public sign-up exists anywhere on this site.
-- ============================================================================
