import { afterEach, describe, expect, it } from "vitest";
import { getSupabasePublicConfig } from "./config";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("getSupabasePublicConfig", () => {
  it("returns normalized public configuration", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co/path";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
    process.env.NEXT_PUBLIC_SITE_URL = "https://prep.example/path";

    expect(getSupabasePublicConfig()).toEqual({
      url: "https://project.supabase.co",
      publishableKey: "sb_publishable_test",
      siteUrl: "https://prep.example",
    });
  });

  it("fails closed when required public configuration is absent", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    delete process.env.NEXT_PUBLIC_SITE_URL;

    expect(getSupabasePublicConfig()).toBeNull();
  });

  it("rejects non-http and credential-bearing URLs", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "file:///tmp/project";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
    process.env.NEXT_PUBLIC_SITE_URL = "https://user:password@prep.example";

    expect(getSupabasePublicConfig()).toBeNull();
  });
});
