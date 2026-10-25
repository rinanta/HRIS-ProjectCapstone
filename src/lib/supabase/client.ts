import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uidonvrgeonuqkpdeeyi.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_BC6AVDkF69voX_VD9Z_OIQ_1ecH11-h';

  return createBrowserClient(url, anonKey);
}
