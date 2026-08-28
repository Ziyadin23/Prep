# Decision 0002 - Supabase SSR authentication boundary

- Status: accepted
- Date: 2026-08-29

## Context

Prep must authenticate only pre-invited users through emailed links, establish a
session that server-rendered Next.js routes can trust, and keep authentication
responses out of shared caches. Supabase's browser session defaults alone do not
provide that server boundary, and the installed Next.js 16 and Supabase SSR APIs
differ from older integration patterns.

## Decision

- Use `@supabase/ssr` with cookie-backed, request-scoped clients.
- Refresh sessions in the Next.js 16 root Proxy and copy every refreshed cookie
  and cache-control header to any redirect response.
- Authorize protected server rendering with `auth.getClaims()`, which validates
  signed claims, rather than trusting `auth.getSession()` cookie contents.
- Exchange only `email` and `invite` token hashes in the application callback;
  callback destinations are derived from the configured application origin and
  callback responses are private and non-cacheable.
- Keep the Supabase Email provider enabled but disable project-wide sign-up and
  set `shouldCreateUser: false` on every public magic-link request. Users are
  provisioned only through Supabase's invitation/admin workflow.
- Return the same public success state for every completed Supabase magic-link
  response, including provider errors whose code may depend on account state.
- Expose only the Supabase project URL, publishable key, and application origin
  to application code. Secret and legacy service-role keys are not required.
- Keep database row-level security as the final authorization boundary after
  authentication.

## Consequences

All server clients must be created within a request; a module-level server
client could leak session state between users. New protected routes must perform
their own trusted identity and, where applicable, profile checks even though the
Proxy provides an early navigation gate. Email templates and hosted redirect
configuration must preserve the tracked token-hash callback shape. Future auth
changes must retain non-enumerating public responses, application-owned
redirects, and non-cacheable session-writing responses.
