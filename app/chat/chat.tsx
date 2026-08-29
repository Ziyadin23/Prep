"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import {
  MESSAGE_MAX_LENGTH,
  mergeChatMessages,
  parseMessageRecord,
  parseMessageRow,
  toChatMessage,
  type ChatMessage,
} from "@/lib/chat/messages";
import { createClient } from "@/lib/supabase/client";
import { sendMessage } from "./actions";
import { initialChatState, type ChatActionState } from "./state";

type ConnectionState = "connecting" | "connected" | "error";

type ChatProps = {
  currentUserId: string;
  initialMessages: ChatMessage[];
};

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

type MessageComposerProps = {
  onSentMessage: (message: ChatMessage) => void;
};

function MessageComposer({ onSentMessage }: MessageComposerProps) {
  const [state, formAction, pending] = useActionState<ChatActionState, FormData>(
    sendMessage,
    initialChatState,
  );
  const [draft, setDraft] = useState("");
  const deliveredMessageId = useRef<string | null>(null);
  const bodyError = state.fieldErrors?.body;
  const characterCount = Array.from(draft.trim()).length;
  const invalidDraft = characterCount === 0 || characterCount > MESSAGE_MAX_LENGTH;

  useEffect(() => {
    const sentMessage = state.sentMessage;
    if (!sentMessage || deliveredMessageId.current === sentMessage.id) return;

    deliveredMessageId.current = sentMessage.id;
    onSentMessage(sentMessage);
    setDraft("");
  }, [onSentMessage, state.sentMessage]);

  return (
    <form action={formAction} className="border-t border-stone-200 p-4 sm:p-5">
      <label className="sr-only" htmlFor="message-body">
        Message
      </label>
      <textarea
        aria-describedby={bodyError ? "message-count message-error" : "message-count"}
        aria-invalid={Boolean(bodyError) || characterCount > MESSAGE_MAX_LENGTH}
        className="block min-h-24 w-full resize-y rounded-xl border border-stone-300 bg-white px-3.5 py-3 text-base text-stone-950 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-teal-700 focus:ring-4 focus:ring-teal-700/15 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500"
        disabled={pending}
        id="message-body"
        name="body"
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Write a message to your team"
        required
        value={draft}
      />
      <div className="mt-2 flex min-h-6 items-start justify-between gap-4">
        <div aria-atomic="true" aria-live="polite">
          {pending ? (
            <p className="text-sm text-stone-600">Sending…</p>
          ) : state.status === "error" && state.feedback ? (
            <p className="text-sm text-red-700" id="message-error" role="alert">
              {bodyError ?? state.feedback}
            </p>
          ) : state.status === "success" ? (
            <p className="text-sm text-emerald-800">Message sent.</p>
          ) : null}
        </div>
        <p
          className={`shrink-0 text-sm ${
            characterCount > MESSAGE_MAX_LENGTH ? "text-red-700" : "text-stone-500"
          }`}
          id="message-count"
        >
          {characterCount.toLocaleString("en-US")} / 2,000
        </p>
      </div>
      <button
        className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 disabled:cursor-not-allowed disabled:bg-stone-400"
        disabled={pending || invalidDraft}
        type="submit"
      >
        {pending ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}

export function Chat({ currentUserId, initialMessages }: ChatProps) {
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState(() =>
    mergeChatMessages([], initialMessages),
  );
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connecting");
  const listEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listEnd.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  useEffect(() => {
    let active = true;

    async function addRealtimeMessage(value: unknown) {
      const row = parseMessageRow(value);
      if (!row) return;

      const { data: sender, error } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", row.sender_id)
        .maybeSingle();

      if (!active) return;
      if (error || !sender) {
        setConnectionState("error");
        return;
      }

      setMessages((current) =>
        mergeChatMessages(current, [toChatMessage(row, sender.display_name)]),
      );
    }

    async function catchUpHistory() {
      const { data, error } = await supabase
        .from("messages")
        .select(
          "id, sender_id, body, created_at, sender:profiles!messages_sender_id_fkey(display_name)",
        )
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(100);

      if (!active) return;
      if (error) {
        setConnectionState("error");
        return;
      }

      const catchUpMessages = (data ?? [])
        .map(parseMessageRecord)
        .filter((message): message is ChatMessage => Boolean(message));
      setMessages((current) => mergeChatMessages(current, catchUpMessages));
    }

    const channel = supabase
      .channel("team-chat-messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          select: ["id", "sender_id", "body", "created_at"],
        },
        (payload) => {
          void addRealtimeMessage(payload.new);
        },
      )
      .subscribe((status) => {
        if (!active) return;

        if (status === "SUBSCRIBED") {
          setConnectionState("connected");
          void catchUpHistory();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setConnectionState("error");
        }
      });

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [supabase]);

  const addSentMessage = useMemo(
    () => (message: ChatMessage) => {
      setMessages((current) => mergeChatMessages(current, [message]));
    },
    [],
  );

  return (
    <section
      aria-labelledby="chat-heading"
      className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white"
    >
      <div className="flex items-center justify-between gap-4 border-b border-stone-200 px-4 py-3 sm:px-5">
        <div>
          <h2 className="font-semibold text-stone-950" id="chat-heading">
            Team chat
          </h2>
          <p className="text-sm text-stone-600">One shared conversation</p>
        </div>
        <p
          aria-live="polite"
          className={`text-sm ${
            connectionState === "error" ? "text-red-700" : "text-stone-500"
          }`}
        >
          {connectionState === "connected"
            ? "Live"
            : connectionState === "error"
              ? "Live updates disconnected — refresh to retry"
              : "Connecting…"}
        </p>
      </div>

      <div className="max-h-[55dvh] min-h-72 overflow-y-auto px-4 py-5 sm:px-5">
        {messages.length === 0 ? (
          <div className="flex min-h-56 items-center justify-center text-center">
            <div>
              <p className="font-medium text-stone-800">No messages yet</p>
              <p className="mt-1 text-sm text-stone-600">
                Start the conversation with your teammates.
              </p>
            </div>
          </div>
        ) : (
          <ol className="space-y-4">
            {messages.map((message) => {
              const ownMessage = message.senderId === currentUserId;
              return (
                <li
                  className={`flex ${ownMessage ? "justify-end" : "justify-start"}`}
                  key={message.id}
                >
                  <article
                    className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${
                      ownMessage
                        ? "bg-teal-800 text-white"
                        : "bg-stone-100 text-stone-950"
                    }`}
                  >
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <p className="text-sm font-semibold">
                        {ownMessage ? "You" : message.senderName}
                      </p>
                      <time
                        className={`text-xs ${
                          ownMessage ? "text-teal-100" : "text-stone-500"
                        }`}
                        dateTime={message.createdAt}
                      >
                        {formatTimestamp(message.createdAt)} UTC
                      </time>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">
                      {message.body}
                    </p>
                  </article>
                </li>
              );
            })}
          </ol>
        )}
        <div ref={listEnd} />
      </div>

      <MessageComposer onSentMessage={addSentMessage} />
    </section>
  );
}
