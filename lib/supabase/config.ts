export type SupabasePublicConfig = {
  url: string;
  publishableKey: string;
  siteUrl: string;
};

function normalizeHttpUrl(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.username ||
      url.password
    ) {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
}

export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  const url = normalizeHttpUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const siteUrl = normalizeHttpUrl(process.env.NEXT_PUBLIC_SITE_URL);

  if (!url || !publishableKey || !siteUrl) {
    return null;
  }

  return { url, publishableKey, siteUrl };
}

export function requireSupabasePublicConfig() {
  const config = getSupabasePublicConfig();

  if (!config) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  return config;
}
