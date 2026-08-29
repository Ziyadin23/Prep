"use server";

import { toChatMessage } from "@/lib/chat/messages";
import { validateMessageBody } from "@/lib/chat/validation";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { ChatActionState } from "./state";

export async function sendMessage(
  _previousState: ChatActionState,
  formData: FormData,
): Promise<ChatActionState> {
  const validatedBody = validateMessageBody(formData.get("body"));

  if ("error" in validatedBody) {
    return {
      status: "error",
      feedback: "Check the highlighted message.",
      fieldErrors: { body: validatedBody.error },
    };
  }

  if (!getSupabasePublicConfig()) {
    return {
      status: "error",
      feedback: "Messaging is not configured. Contact the project owner.",
    };
  }

  try {
    const supabase = await createClient();
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims();
    const userId = claimsData?.claims?.sub;

    if (claimsError || typeof userId !== "string") {
      return {
        status: "error",
        feedback: "Your session has expired. Refresh the page and sign in again.",
      };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      if (profileError) {
        console.error("Supabase sender profile lookup failed", {
          code: profileError.code,
        });
      }
      return {
        status: "error",
        feedback: "Complete your profile before sending a message.",
      };
    }

    const { data: message, error: messageError } = await supabase
      .from("messages")
      .insert({ sender_id: userId, body: validatedBody.body })
      .select("id, sender_id, body, created_at")
      .single();

    if (messageError || !message) {
      if (messageError) {
        console.error("Supabase message insert failed", { code: messageError.code });
      }
      return {
        status: "error",
        feedback: "We could not send your message. Please try again.",
      };
    }

    return {
      status: "success",
      feedback: "Message sent.",
      sentMessage: toChatMessage(message, profile.display_name),
    };
  } catch (error) {
    console.error("Message send failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return {
      status: "error",
      feedback: "We could not reach the message service. Check your connection and try again.",
    };
  }
}
