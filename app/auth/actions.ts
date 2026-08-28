"use server";

import { redirect } from "next/navigation";
import {
  getAuthCallbackUrl,
  validateEmailInput,
} from "@/lib/auth/validation";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { AuthActionState } from "./state";

const GENERIC_SUCCESS_MESSAGE =
  "If this address is invited, a sign-in link is on its way. Check your inbox.";
const GENERIC_ERROR_MESSAGE =
  "We could not send a sign-in link right now. Please wait a moment and try again.";

export async function requestMagicLink(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const validatedEmail = validateEmailInput(formData.get("email"));

  if ("error" in validatedEmail) {
    return {
      status: "error",
      message: "Check the highlighted field.",
      fieldErrors: { email: validatedEmail.error },
    };
  }

  const config = getSupabasePublicConfig();

  if (!config) {
    return {
      status: "error",
      message: "Sign-in is not configured. Contact the project owner.",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: validatedEmail.email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: getAuthCallbackUrl(config.siteUrl),
      },
    });

    if (error) {
      console.error("Supabase magic-link request failed", {
        code: error.code,
        status: error.status,
      });

      // Provider errors can depend on whether an account exists, including
      // per-address rate limits. Expose one outcome for every provider response
      // so the public form cannot enumerate team membership.
      return { status: "success", message: GENERIC_SUCCESS_MESSAGE };
    }

    return { status: "success", message: GENERIC_SUCCESS_MESSAGE };
  } catch (error) {
    console.error("Magic-link request failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return { status: "error", message: GENERIC_ERROR_MESSAGE };
  }
}

export async function signOut() {
  const config = getSupabasePublicConfig();

  if (!config) {
    redirect("/login?error=configuration");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Supabase sign-out failed", {
      code: error.code,
      status: error.status,
    });
  }

  redirect("/login");
}
