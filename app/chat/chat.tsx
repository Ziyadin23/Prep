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

type MessageGroup = {
  senderId: string;
  senderName: string;
  messages: ChatMessage[];
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
        className="block min-h-24 w-full resize-y rounded-xl border border-stone-300 bg-white px-3.5 py-3 text-base text-stone-950 shadow-sm outline-none transition [overflow-wrap:anywhere] placeholder:text-stone-400 focus:border-teal-700 focus:ring-4 focus:ring-teal-700/15 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500"
        disabled={pending}
        id="message-body"
        name="body"
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Write a message to your team"
        required
        value={draft}
      />
      <div className="mt-2 flex min-h-6 flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <div aria-atomic="true" aria-live="polite" className="min-w-0">
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

  const messageGroups = messages.reduce<MessageGroup[]>((groups, message) => {
    const previous = groups.at(-1);

    if (previous?.senderId === message.senderId) {
      previous.messages.push(message);
    } else {
      groups.push({
        senderId: message.senderId,
        senderName: message.senderName,
        messages: [message],
      });
    }

    return groups;
  }, []);

  return (
    <section
      aria-labelledby="chat-heading"
      className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white"
    >
      <div className="flex flex-col gap-3 border-b border-stone-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          <h2 className="font-semibold text-stone-950" id="chat-heading">
            Team chat
          </h2>
          <p className="text-sm text-stone-600">One shared conversation</p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:justify-end">
          <p
            aria-live="polite"
            className={`text-sm ${
              connectionState === "error" ? "text-red-700" : "text-stone-500"
            }`}
          >
            {connectionState === "connected"
              ? "Live"
              : connectionState === "error"
                ? "Live updates disconnected"
                : "Connecting…"}
          </p>
          {connectionState === "error" ? (
            <button
              className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-800 transition hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800"
              onClick={() => window.location.reload()}
              type="button"
            >
              Refresh to retry
            </button>
          ) : null}
        </div>
      </div>

      <div className="max-h-[min(55dvh,38rem)] min-h-[min(16rem,45dvh)] overflow-y-auto px-4 py-5 sm:min-h-72 sm:px-5">
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
          <ol className="space-y-5" aria-label="Messages">
            {messageGroups.map((group) => {
              const ownMessages = group.senderId === currentUserId;
              return (
                <li key={`${group.senderId}-${group.messages[0].id}`}>
                  <p
                    className={`mb-2 text-sm font-semibold ${
                      ownMessages ? "text-right text-teal-900" : "text-stone-800"
                    }`}
                  >
                    {ownMessages ? "You" : group.senderName}
                  </p>
                  <ol className="space-y-2">
                    {group.messages.map((message) => (
                      <li
                        className={`flex ${ownMessages ? "justify-end" : "justify-start"}`}
                        key={message.id}
                      >
                        <article
                          className={`min-w-0 max-w-[88%] rounded-2xl px-4 py-3 sm:max-w-[75%] ${
                            ownMessages
                              ? "bg-teal-800 text-white"
                              : "bg-stone-100 text-stone-950"
                          }`}
                        >
                          <time
                            className={`block text-xs ${
                              ownMessages ? "text-teal-100" : "text-stone-500"
                            }`}
                            dateTime={message.createdAt}
                          >
                            {formatTimestamp(message.createdAt)} UTC
                          </time>
                          <p className="mt-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-sm leading-6">
                            {message.body}
                          </p>
                        </article>
                      </li>
                    ))}
                  </ol>
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
