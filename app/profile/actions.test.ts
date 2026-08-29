import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { saveProfile } from "./actions";
import { initialProfileState } from "./state";

const mocks = vi.hoisted(() => ({
  getClaims: vi.fn(),
  upsert: vi.fn(),
  from: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

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

function profileForm(displayName = "Ada Lovelace", forgedId?: string) {
  const formData = new FormData();
  formData.set("displayName", displayName);
  if (forgedId) formData.set("id", forgedId);
  return formData;
}

describe("saveProfile", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.getClaims.mockReset();
    mocks.upsert.mockReset();
    mocks.from.mockReset();
    mocks.redirect.mockReset();
    mocks.from.mockReturnValue({ upsert: mocks.upsert });
    mocks.upsert.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("derives ownership from verified claims and ignores a forged form ID", async () => {
    mocks.getClaims.mockResolvedValue({
      data: { claims: { sub: "owner-user-id" } },
      error: null,
    });

    await saveProfile(
      initialProfileState,
      profileForm("  Ada Lovelace  ", "another-user-id"),
    );

    expect(mocks.from).toHaveBeenCalledWith("profiles");
    expect(mocks.upsert).toHaveBeenCalledWith(
      { id: "owner-user-id", display_name: "Ada Lovelace" },
      { onConflict: "id" },
    );
    expect(mocks.redirect).toHaveBeenCalledWith("/?profile=saved");
  });

  it("rejects invalid input before creating a Supabase client", async () => {
    const result = await saveProfile(initialProfileState, profileForm(" "));

    expect(result).toMatchObject({
      status: "error",
      fieldErrors: { displayName: expect.stringMatching(/at least 2/) },
    });
    expect(mocks.getClaims).not.toHaveBeenCalled();
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it("rejects a request without verified user claims", async () => {
    mocks.getClaims.mockResolvedValue({ data: null, error: { code: "bad_jwt" } });

    const result = await saveProfile(initialProfileState, profileForm());

    expect(result).toMatchObject({
      status: "error",
      message: expect.stringMatching(/session has expired/i),
    });
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it("returns an actionable error when persistence fails", async () => {
    mocks.getClaims.mockResolvedValue({
      data: { claims: { sub: "owner-user-id" } },
      error: null,
    });
    mocks.upsert.mockResolvedValue({ error: { code: "42501" } });

    const result = await saveProfile(initialProfileState, profileForm());

    expect(result).toEqual({
      status: "error",
      message: "We could not save your profile. Please try again.",
    });
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});
