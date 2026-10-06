// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
// Standalone Supabase client for YAAWP's own Supabase project.
// Reads public config from VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
// No Lovable Cloud / generated-integration dependency.
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// YAAWP's own Supabase project (public values, safe to ship in the browser).
// Env vars take precedence when set; otherwise these defaults are used.
const YAAWP_SUPABASE_URL = 'https://yphdzqflcjdvkjtlbecl.supabase.co';
const YAAWP_SUPABASE_ANON_KEY = 'sb_publishable_vVEew5g5lf-803gk54MfgQ_d9rEdboN';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || YAAWP_SUPABASE_URL;
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || YAAWP_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://xyzcompany.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

// Fallback dummy URL and anon key to prevent crash if not yet configured
const safeUrl = isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co';
const safeKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export async function getCurrentSupabaseSession() {
  if (!isSupabaseConfigured) {
    return null;
  }
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('Supabase auth session check returned error:', error.message);
      return null;
    }
    return session;
  } catch (err) {
    console.warn('Error fetching Supabase session:', err);
    return null;
  }
}
