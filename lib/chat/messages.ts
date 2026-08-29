export const MESSAGE_MAX_LENGTH = 2_000;

export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
};

export type MessageRow = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

type MessageRecord = MessageRow & {
  sender?: { display_name?: unknown } | { display_name?: unknown }[] | null;
};

export function compareChatMessages(left: ChatMessage, right: ChatMessage) {
  const timestampOrder = left.createdAt.localeCompare(right.createdAt);
  return timestampOrder || left.id.localeCompare(right.id);
}

export function mergeChatMessages(
  current: ChatMessage[],
  incoming: ChatMessage[],
  limit = 100,
) {
  const byId = new Map(current.map((message) => [message.id, message]));

  for (const message of incoming) {
    byId.set(message.id, { ...byId.get(message.id), ...message });
  }

  return [...byId.values()].sort(compareChatMessages).slice(-limit);
}

export function parseMessageRow(value: unknown): MessageRow | null {
  if (!value || typeof value !== "object") return null;

  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.sender_id !== "string" ||
    typeof row.body !== "string" ||
    typeof row.created_at !== "string"
  ) {
    return null;
  }

  return {
    id: row.id,
    sender_id: row.sender_id,
    body: row.body,
    created_at: row.created_at,
  };
}

export function toChatMessage(row: MessageRow, senderName: string): ChatMessage {
  return {
    id: row.id,
    senderId: row.sender_id,
    senderName,
    body: row.body,
    createdAt: row.created_at,
  };
}

export function parseMessageRecord(value: unknown): ChatMessage | null {
  const row = parseMessageRow(value);
  if (!row) return null;

  const record = value as MessageRecord;
  const sender = Array.isArray(record.sender) ? record.sender[0] : record.sender;
  if (!sender || typeof sender.display_name !== "string") return null;

  return toChatMessage(row, sender.display_name);
}
