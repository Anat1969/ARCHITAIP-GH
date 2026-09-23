import { createClient } from '@supabase/supabase-js';

// Both values are public by design — the publishable key only ever reaches
// tables that RLS already opens to anonymous readers. They are defaulted here
// rather than left to the build environment alone: when the deploy workflow's
// repository variables went stale, the published site pointed at a project that
// no longer existed and the book would not open at all.
const DEFAULT_URL = 'https://ktqmwpbzcnzkhjskqisy.supabase.co';
const DEFAULT_KEY = 'sb_publishable_IkreG7naPa1h-d4kGp1gpA_sLU4tg5q';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || DEFAULT_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
