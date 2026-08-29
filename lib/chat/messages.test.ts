import { describe, expect, it } from "vitest";
import {
  mergeChatMessages,
  parseMessageRecord,
  parseMessageRow,
  type ChatMessage,
} from "./messages";

const first: ChatMessage = {
  id: "a",
  senderId: "user-a",
  senderName: "Ada",
  body: "First",
  createdAt: "2026-08-29T08:00:00.000Z",
};

const second: ChatMessage = {
  id: "b",
  senderId: "user-b",
  senderName: "Grace",
  body: "Second",
  createdAt: "2026-08-29T08:01:00.000Z",
};

describe("mergeChatMessages", () => {
  it("orders messages by timestamp and ID", () => {
    const sameTime = { ...first, id: "c", body: "Same time" };

    expect(mergeChatMessages([second], [sameTime, first]).map(({ id }) => id)).toEqual([
      "a",
      "c",
      "b",
    ]);
  });

  it("reconciles duplicate delivery by message ID", () => {
    const enriched = { ...first, senderName: "Ada Updated" };

    expect(mergeChatMessages([first], [enriched])).toEqual([enriched]);
  });

  it("retains only the latest requested window", () => {
    expect(mergeChatMessages([first], [second], 1)).toEqual([second]);
  });
});

describe("message row parsing", () => {
  it("accepts the persisted message fields from Realtime", () => {
    expect(
      parseMessageRow({
        id: "message-id",
        sender_id: "user-id",
        body: "Hello",
        created_at: "2026-08-29T08:00:00.000Z",
      }),
    ).toEqual({
      id: "message-id",
      sender_id: "user-id",
      body: "Hello",
      created_at: "2026-08-29T08:00:00.000Z",
    });
  });

  it("rejects malformed Realtime payloads", () => {
    expect(parseMessageRow({ id: "missing-fields" })).toBeNull();
  });

  it("maps an embedded sender from a history record", () => {
    expect(
      parseMessageRecord({
        id: "message-id",
        sender_id: "user-id",
        body: "Hello",
        created_at: "2026-08-29T08:00:00.000Z",
        sender: { display_name: "Ada" },
      }),
    ).toMatchObject({ senderName: "Ada", senderId: "user-id" });
  });
});
