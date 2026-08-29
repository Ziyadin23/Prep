import type { ChatMessage } from "@/lib/chat/messages";

export type ChatActionState = {
  status: "idle" | "error" | "success";
  feedback?: string;
  fieldErrors?: {
    body?: string;
  };
  sentMessage?: ChatMessage;
};

export const initialChatState: ChatActionState = { status: "idle" };
