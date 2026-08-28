import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { requestMagicLink } from "./actions";
import { initialAuthState } from "./state";

const mocks = vi.hoisted(() => ({
  signInWithOtp: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
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
    auth: { signInWithOtp: mocks.signInWithOtp },
  }),
}));

function magicLinkForm(email = "invited@example.com") {
  const formData = new FormData();
  formData.set("email", email);
  return formData;
}

describe("requestMagicLink", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.signInWithOtp.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("disables account creation and uses the application callback", async () => {
    mocks.signInWithOtp.mockResolvedValue({ error: null });

    const result = await requestMagicLink(initialAuthState, magicLinkForm());

    expect(result.status).toBe("success");
    expect(mocks.signInWithOtp).toHaveBeenCalledWith({
      email: "invited@example.com",
      options: {
        shouldCreateUser: false,
        emailRedirectTo: "https://prep.example/auth/confirm",
      },
    });
  });

  it.each(["otp_disabled", "over_email_send_rate_limit", "unexpected_failure"])(
    "returns the non-enumerating success state for provider error %s",
    async (code) => {
      mocks.signInWithOtp.mockResolvedValue({ error: { code, status: 400 } });

      const result = await requestMagicLink(initialAuthState, magicLinkForm());

      expect(result.status).toBe("success");
      expect(result.message).toMatch(/sign-in link/i);
    },
  );

  it("retains actionable validation errors without calling Supabase", async () => {
    const result = await requestMagicLink(
      initialAuthState,
      magicLinkForm("not-an-email"),
    );

    expect(result).toMatchObject({
      status: "error",
      fieldErrors: { email: "Enter a valid email address." },
    });
    expect(mocks.signInWithOtp).not.toHaveBeenCalled();
  });
});
