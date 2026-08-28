import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabasePublicConfig } from "./config";

function copySessionState(source: NextResponse, destination: NextResponse) {
  source.cookies.getAll().forEach((cookie) => destination.cookies.set(cookie));

  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = source.headers.get(header);
    if (value) {
      destination.headers.set(header, value);
    }
  }

  return destination;
}

export async function updateSession(request: NextRequest) {
  const config = getSupabasePublicConfig();
  const pathname = request.nextUrl.pathname;
  const isPublicAuthRoute =
    pathname === "/login" || pathname.startsWith("/auth/");

  if (!config) {
    if (!isPublicAuthRoute) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.search = "?error=configuration";
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  // Create a new client for every request. Sharing it can leak one user's
  // session into another request on warm server instances.
  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([name, value]) => {
          supabaseResponse.headers.set(name, value);
        });
      },
    },
  });

  // getClaims validates the JWT signature. Never replace this server-side
  // authorization check with getSession, which trusts cookie storage.
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims && !isPublicAuthRoute) {
    const loginUrl = new URL("/login", config.siteUrl);
    return copySessionState(
      supabaseResponse,
      NextResponse.redirect(loginUrl),
    );
  }

  if (claims && pathname === "/login") {
    return copySessionState(
      supabaseResponse,
      NextResponse.redirect(new URL("/", config.siteUrl)),
    );
  }

  return supabaseResponse;
}
