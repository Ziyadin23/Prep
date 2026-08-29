"use server";

import { redirect } from "next/navigation";
import { validateDisplayName } from "@/lib/profile/validation";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { ProfileActionState } from "./state";

export async function saveProfile(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const validatedName = validateDisplayName(formData.get("displayName"));

  if ("error" in validatedName) {
    return {
      status: "error",
      message: "Check the highlighted field.",
      fieldErrors: { displayName: validatedName.error },
    };
  }

  if (!getSupabasePublicConfig()) {
    return {
      status: "error",
      message: "Profile setup is not configured. Contact the project owner.",
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
        message: "Your session has expired. Refresh the page and sign in again.",
      };
    }

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: userId,
        display_name: validatedName.displayName,
      },
      { onConflict: "id" },
    );

    if (profileError) {
      console.error("Supabase profile save failed", {
        code: profileError.code,
      });
      return {
        status: "error",
        message: "We could not save your profile. Please try again.",
      };
    }
  } catch (error) {
    console.error("Profile save failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return {
      status: "error",
      message: "We could not reach the profile service. Check your connection and try again.",
    };
  }

  redirect("/?profile=saved");
}
