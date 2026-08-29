import { isValidElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Home from "./page";

const mocks = vi.hoisted(() => ({
  getClaims: vi.fn(),
  from: vi.fn(),
  profileSelect: vi.fn(),
  profileEq: vi.fn(),
  profileMaybeSingle: vi.fn(),
  messageSelect: vi.fn(),
  order: vi.fn(),
  limit: vi.fn(),
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
    mocks.profileSelect.mockReset();
    mocks.profileEq.mockReset();
    mocks.profileMaybeSingle.mockReset();
    mocks.messageSelect.mockReset();
    mocks.order.mockReset();
    mocks.limit.mockReset();
    mocks.redirect.mockReset();
    mocks.from.mockImplementation((table: string) =>
      table === "profiles"
        ? { select: mocks.profileSelect }
        : { select: mocks.messageSelect },
    );
    mocks.profileSelect.mockReturnValue({ eq: mocks.profileEq });
    mocks.profileEq.mockReturnValue({ maybeSingle: mocks.profileMaybeSingle });
    mocks.messageSelect.mockReturnValue({ order: mocks.order });
    mocks.order.mockReturnValue({ order: mocks.order, limit: mocks.limit });
    mocks.limit.mockResolvedValue({ data: [], error: null });
    mocks.getClaims.mockResolvedValue({
      data: { claims: { sub: "owner-user-id", email: "owner@example.com" } },
      error: null,
    });
  });

  it("keeps a profile-less user in setup", async () => {
    mocks.profileMaybeSingle.mockResolvedValue({ data: null, error: null });

    const page = await Home({ searchParams: Promise.resolve({}) });

    expect(textContent(page)).toMatch(/Choose your display name/);
    expect(textContent(page)).not.toMatch(/chat gate is open/);
    expect(mocks.profileEq).toHaveBeenCalledWith("id", "owner-user-id");
    expect(mocks.messageSelect).not.toHaveBeenCalled();
  });

  it("lets an existing profiled user proceed to chat", async () => {
    mocks.profileMaybeSingle.mockResolvedValue({
      data: { display_name: "Ada" },
      error: null,
    });

    const page = await Home({ searchParams: Promise.resolve({}) });

    expect(textContent(page)).toMatch(/Welcome, Ada/);
    expect(textContent(page)).toMatch(/private team space/);
    expect(textContent(page)).not.toMatch(/Choose your display name/);
    expect(mocks.order).toHaveBeenNthCalledWith(1, "created_at", {
      ascending: false,
    });
    expect(mocks.order).toHaveBeenNthCalledWith(2, "id", { ascending: false });
    expect(mocks.limit).toHaveBeenCalledWith(100);
  });

  it("fails closed when the profile lookup cannot be verified", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.profileMaybeSingle.mockResolvedValue({
      data: null,
      error: { code: "network_error" },
    });

    const page = await Home({ searchParams: Promise.resolve({}) });

    expect(textContent(page)).toMatch(/couldn't load your profile/);
    expect(textContent(page)).toMatch(/chat remains locked/);
  });

  it("shows an actionable error when message history cannot load", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.profileMaybeSingle.mockResolvedValue({
      data: { display_name: "Ada" },
      error: null,
    });
    mocks.limit.mockResolvedValue({
      data: null,
      error: { code: "network_error" },
    });

    const page = await Home({ searchParams: Promise.resolve({}) });

    expect(textContent(page)).toMatch(/couldn't load your messages/);
    expect(textContent(page)).toMatch(/refresh this page/);
  });
});
