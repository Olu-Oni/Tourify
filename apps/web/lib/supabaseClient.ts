// NOTE: replace these with real values when auth teammate provides them
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";


// lazy import/creation to avoid server-side errors in Next.js
import { createClient, SupabaseClient } from "@supabase/supabase-js";


let _supabase: SupabaseClient | null = null;
export function getSupabase() {
if (!_supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
_supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
realtime: { params: { eventsPerSecond: 10 } },
});
}
return _supabase;
}