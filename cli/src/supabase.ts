import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { CliConfig } from "./config";

export interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

export function resolveSupabaseCredentials(config?: CliConfig): SupabaseCredentials {
  const url =
    config?.supabase?.url ??
    process.env.MRPROMTH_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const anonKey =
    config?.supabase?.anonKey ??
    process.env.MRPROMTH_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error(
      "Supabase URL is not configured. Set MRPROMTH_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL.",
    );
  }

  if (!anonKey) {
    throw new Error(
      "Supabase anon key is not configured. Set MRPROMTH_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return { url, anonKey };
}

export function createSupabaseClient(config?: CliConfig): SupabaseClient {
  const { url, anonKey } = resolveSupabaseCredentials(config);

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
