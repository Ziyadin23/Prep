import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { isAcceptedOtpType } from "@/lib/auth/validation";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

function noStoreRedirect(url: URL) {
  const response = NextResponse.redirect(url);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export async function GET(request: NextRequest) {
  const config = getSupabasePublicConfig();

  if (!config) {
    return noStoreRedirect(
      new URL("/login?error=configuration", request.nextUrl.origin),
    );
  }

  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");

  if (tokenHash && isAcceptedOtpType(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });

    if (!error) {
      return noStoreRedirect(new URL("/", config.siteUrl));
    }

    console.error("Supabase email token verification failed", {
      code: error.code,
      status: error.status,
    });
  }

  return noStoreRedirect(
    new URL("/login?error=invalid_or_expired", config.siteUrl),
  );
}
