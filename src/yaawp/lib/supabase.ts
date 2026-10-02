// @ts-nocheck -- legacy Yaawp code ported from strict-off Vite app; type cleanup pending
// Re-exports the generated Lovable Cloud client so all Yaawp code shares one
// authenticated Supabase instance (session persistence, preview auth, etc.).
import { supabase } from '@/integrations/supabase/client';

export { supabase };

export const isSupabaseConfigured = true;

export async function getCurrentSupabaseSession() {
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
