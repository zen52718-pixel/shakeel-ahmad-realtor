/* ============================================================================
   supabase-config.js — the ONE shared Supabase client for the whole site.
   ----------------------------------------------------------------------------
   This is an ES module (it uses `import`/`export`), so it's loaded one of
   two ways:
     • Directly, via <script type="module" src="assets/js/supabase-config.js">
       — used by admin.html, which is a standalone page.
     • Indirectly, via a dynamic `import('./supabase-config.js')` from a
       plain classic script — used by main.js and property.js, so those
       files don't need to become modules themselves and everything about
       how the rest of the site loads stays exactly as it was.

   SAFE TO EXPOSE IN THE BROWSER
   ------------------------------
   SUPABASE_ANON_KEY below is the *publishable* ("anon") key — never the
   secret/service-role key. On its own it grants no special access. Every
   table and storage bucket is protected by Row Level Security policies
   (see supabase/schema.sql):
     • `properties` table   → anyone can SELECT; only an authenticated
       session (Shakeel, logged in at /admin.html) can INSERT/UPDATE/DELETE.
     • `property-photos` storage bucket → anyone can view; only an
       authenticated session can upload/replace/delete files.
   There is no public sign-up flow anywhere on this site — Shakeel's one
   admin login is created manually in the Supabase dashboard.
   ========================================================================== */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://hbmueggahwvznotlwsva.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_lbxGGXsAmvaQKLV_8Zv3OA_r4HVfB4v';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
