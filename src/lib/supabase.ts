import { createClient } from "@supabase/supabase-js";

const rawUrl = import.meta.env["VITE_SUPABASE_URL"] ?? "";
const rawKey = import.meta.env["VITE_SUPABASE_ANON_KEY"] ?? "";

const valid = /^https?:\/\//.test(rawUrl) && rawKey.length > 0;

/** Cloud sync is optional in the prototype — fall back to a harmless local placeholder. */
export const cloudEnabled = valid;

export const supabase = createClient(
  valid ? rawUrl : "http://localhost:54321",
  valid ? rawKey : "public-anon-key",
);
