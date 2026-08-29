import { isValidElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "./page";

const mocks = vi.hoisted(() => ({
  getClaims: vi.fn(),
  from: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  maybeSingle: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/app/auth/actions", () => ({ signOut: vi.fn() }));
vi.mock("@/lib/supabase/config", () => ({
  getSupabasePublicConfig: () => ({
    url: "https://project.supabase.co",
    publishableKey: "sb_publishable_test",
    siteUrl: "https://prep.example",
  }),
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getClaims: mocks.getClaims },
    from: mocks.from,
  }),
}));

function textContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textContent).join("");
  if (!isValidElement<{ children?: ReactNode }>(node)) return "";
  return textContent(node.props.children);
}

describe("the root profile gate", () => {
  beforeEach(() => {
    mocks.getClaims.mockReset();
    mocks.from.mockReset();
    mocks.select.mockReset();
    mocks.eq.mockReset();
    mocks.maybeSingle.mockReset();
    mocks.redirect.mockReset();
    mocks.from.mockReturnValue({ select: mocks.select });
    mocks.select.mockReturnValue({ eq: mocks.eq });
    mocks.eq.mockReturnValue({ maybeSingle: mocks.maybeSingle });
    mocks.getClaims.mockResolvedValue({
      data: { claims: { sub: "owner-user-id", email: "owner@example.com" } },
      error: null,
    });
  });

  it("keeps a profile-less user in setup", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: null, error: null });

    const page = await Home({ searchParams: Promise.resolve({}) });

    expect(textContent(page)).toMatch(/Choose your display name/);
    expect(textContent(page)).not.toMatch(/chat gate is open/);
    expect(mocks.eq).toHaveBeenCalledWith("id", "owner-user-id");
  });

  it("lets an existing profiled user proceed to the chat placeholder", async () => {
    mocks.maybeSingle.mockResolvedValue({
      data: { display_name: "Ada" },
      error: null,
    });

    const page = await Home({ searchParams: Promise.resolve({}) });

    expect(textContent(page)).toMatch(/Welcome, Ada/);
    expect(textContent(page)).toMatch(/chat gate is open/);
    expect(textContent(page)).not.toMatch(/Choose your display name/);
  });

  it("fails closed when the profile lookup cannot be verified", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.maybeSingle.mockResolvedValue({
      data: null,
      error: { code: "network_error" },
    });

    const page = await Home({ searchParams: Promise.resolve({}) });

    expect(textContent(page)).toMatch(/couldn't load your profile/);
    expect(textContent(page)).toMatch(/chat remains locked/);
  });
});
