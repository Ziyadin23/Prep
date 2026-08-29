import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendMessage } from "./actions";
import { initialChatState } from "./state";

const mocks = vi.hoisted(() => ({
  getClaims: vi.fn(),
  from: vi.fn(),
  profileSelect: vi.fn(),
  profileEq: vi.fn(),
  profileMaybeSingle: vi.fn(),
  insert: vi.fn(),
  messageSelect: vi.fn(),
  messageSingle: vi.fn(),
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

function messageForm(body = "Hello team", forgedSenderId?: string) {
  const formData = new FormData();
  formData.set("body", body);
  if (forgedSenderId) formData.set("sender_id", forgedSenderId);
  return formData;
}

describe("sendMessage", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    Object.values(mocks).forEach((mock) => mock.mockReset());

    mocks.from.mockImplementation((table: string) =>
      table === "profiles"
        ? { select: mocks.profileSelect }
        : { insert: mocks.insert },
    );
    mocks.profileSelect.mockReturnValue({ eq: mocks.profileEq });
    mocks.profileEq.mockReturnValue({ maybeSingle: mocks.profileMaybeSingle });
    mocks.insert.mockReturnValue({ select: mocks.messageSelect });
    mocks.messageSelect.mockReturnValue({ single: mocks.messageSingle });
    mocks.getClaims.mockResolvedValue({
      data: { claims: { sub: "owner-user-id" } },
      error: null,
    });
    mocks.profileMaybeSingle.mockResolvedValue({
      data: { display_name: "Ada" },
      error: null,
    });
    mocks.messageSingle.mockResolvedValue({
      data: {
        id: "message-id",
        sender_id: "owner-user-id",
        body: "Hello team",
        created_at: "2026-08-29T08:00:00.000Z",
      },
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("derives the sender from verified claims and ignores a forged sender ID", async () => {
    const result = await sendMessage(
      initialChatState,
      messageForm("  Hello team  ", "another-user-id"),
    );

    expect(mocks.profileEq).toHaveBeenCalledWith("id", "owner-user-id");
    expect(mocks.insert).toHaveBeenCalledWith({
      sender_id: "owner-user-id",
      body: "Hello team",
    });
    expect(result).toMatchObject({
      status: "success",
      sentMessage: {
        id: "message-id",
        senderId: "owner-user-id",
        senderName: "Ada",
      },
    });
  });

  it("rejects invalid text before creating a Supabase client", async () => {
    const result = await sendMessage(initialChatState, messageForm("   "));

    expect(result).toMatchObject({
      status: "error",
      fieldErrors: { body: "Message cannot be blank." },
    });
    expect(mocks.getClaims).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("rejects a request without verified claims", async () => {
    mocks.getClaims.mockResolvedValue({ data: null, error: { code: "bad_jwt" } });

    const result = await sendMessage(initialChatState, messageForm());

    expect(result).toMatchObject({
      status: "error",
      feedback: expect.stringMatching(/session has expired/i),
    });
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("requires the verified sender to have a profile", async () => {
    mocks.profileMaybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await sendMessage(initialChatState, messageForm());

    expect(result).toEqual({
      status: "error",
      feedback: "Complete your profile before sending a message.",
    });
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("returns an actionable send error when the insert fails", async () => {
    mocks.messageSingle.mockResolvedValue({
      data: null,
      error: { code: "42501" },
    });

    const result = await sendMessage(initialChatState, messageForm());

    expect(result).toEqual({
      status: "error",
      feedback: "We could not send your message. Please try again.",
    });
  });
});
