import { createClient } from "@supabase/supabase-js";

// Safe loading from import.meta.env (Vite frontend)
const getEnvVar = (key: string): string => {
  try {
    const metaKey = `VITE_${key}`;
    const meta = import.meta as any;
    if (typeof import.meta !== "undefined" && meta?.env && meta.env[metaKey]) {
      return meta.env[metaKey] as string;
    }
  } catch (e) {}

  try {
    const meta = import.meta as any;
    if (typeof import.meta !== "undefined" && meta?.env && meta.env[key]) {
      return meta.env[key] as string;
    }
  } catch (e) {}

  return "";
};

const supabaseUrl = getEnvVar("SUPABASE_URL") || "https://lrrmhcrvjfpdjadiblbi.supabase.co";
const supabaseAnonKey = getEnvVar("SUPABASE_ANON_KEY") || "sb_publishable_5Xv3m0jRfqE_flz6gJoQng_rlYpyEQm";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Critical: Supabase environment variables are missing! " +
    "Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY exist in .env / .env.example"
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
