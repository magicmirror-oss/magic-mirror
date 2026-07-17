import { createClient } from '@supabase/supabase-js';

// Values injected at build time via vite.config.ts `define`
declare const __SUPABASE_URL__: string;
declare const __SUPABASE_ANON_KEY__: string;

const supabaseUrl: string =
  (typeof __SUPABASE_URL__ !== 'undefined' ? __SUPABASE_URL__ : '') ||
  (import.meta.env.VITE_SUPABASE_URL as string) || '';

const supabaseAnonKey: string =
  (typeof __SUPABASE_ANON_KEY__ !== 'undefined' ? __SUPABASE_ANON_KEY__ : '') ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
