# C02 - Authentication Flow

- Status: `completed`
- Depends on: C00 and C01 (completed)
- Product source: `docs/product/SPEC.md`, section "C02 - Authentication Flow"
- Last updated: 2026-08-29

## Objective

Implement private, session-aware email magic-link authentication for invited
users, including clear user feedback, sign-out, and reproducible redirect setup.

## Scope

- Supabase browser/server integration needed for authentication
- Signed-out email entry and magic-link request experience
- Auth callback/session establishment appropriate to the installed Next.js version
- Private-application access gate and sign-out
- Loading, success, and failure states
- Local configuration and documentation necessary to verify invite-only access

## Non-goals

- Profile creation or display-name UI (C03)
- Message queries, Realtime subscriptions, or composer behavior (C04)
- Final visual polish beyond an accessible, usable auth flow (C05)
- Complete production deployment instructions (C06), except recording redirect
  requirements discovered while implementing authentication
- Public registration or an in-app invitation/admin interface

## Constraints

- Application code may use only the public Supabase URL and publishable key;
  admin, secret, and service-role keys are forbidden.
- The server must validate signed-in identity with `auth.getClaims()` rather
  than trusting cookie contents or `auth.getSession()`.
- Supabase clients and user-specific state must be created per request on the
  server and must not be shared through module-level mutable state.
- Magic-link requests must set `shouldCreateUser: false`; project-wide sign-up
  remains disabled while the Email provider stays enabled for invited users, so
  the login form can authenticate existing accounts but cannot create users.
- Session-writing responses must not be publicly cached.
- Callback inputs and redirect destinations are untrusted. Accept only the OTP
  types needed by this product and redirect only to application-owned paths.
- C01 row-level security remains the final data authorization boundary.

## Acceptance criteria

The C02 criteria in the product spec are authoritative. Completion requires
evidence that:

- an invited user can request a magic link and establish a session;
- an uninvited user cannot register or access the private application; and
- a signed-in user can sign out and returns to the signed-out experience.

Also require lint and production build to pass, no secret values to be committed,
and authentication failure/loading states to be exercised.

## Verification

Final automated verification on 2026-08-29:

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build -- --webpack
npx --yes npm@10 ci --ignore-scripts --dry-run
npx --yes supabase@2.116.0 db reset
npx --yes supabase@2.116.0 db lint
npx --yes supabase@2.116.0 test db
git diff --check
```

- Vitest: 3 files and 22 tests passed, including email/callback validation,
  public configuration, `shouldCreateUser: false`, and uniform public outcomes
  for multiple Supabase provider error codes.
- TypeScript, ESLint, webpack production compilation, clean-install lockfile
  validation, and whitespace validation passed.
- The webpack build compiled, type-checked, and generated `/`, `/login`, and
  `/auth/confirm`. An independent build with representative public environment
  values confirmed all three application routes are dynamic.
- The local database reset applied the C01 migration; database lint reported no
  schema errors and all 15 pgTAP policy tests passed.

Local end-to-end acceptance used Supabase CLI 2.116.0, the Next.js development
server with only the tracked public environment shape, isolated `curl` cookie
jars, and the local Admin and Mailpit HTTP APIs for test-user provisioning and
email inspection. No local keys or token values were recorded:

- An existing invited user requested a magic link. Mailpit received the tracked
  magic-link template, `/auth/confirm` returned a private/no-store redirect, and
  the resulting cookie jar rendered the protected root with the expected user.
- A separately admin-invited user followed the tracked `invite` template and
  established the same protected application session.
- An uninvited address received the same public success state, caused no Mailpit
  delivery, established no session, and was redirected from `/` to `/login`.
- Submitting invalid email showed field feedback; an invalid callback token
  returned the safe expired-link error without a session.
- Signing out returned a redirect to `/login`, cleared access, and a subsequent
  protected-root request redirected to the signed-out experience.

## Implementation notes and history

- At the start of C02, no Supabase JavaScript dependency or client integration
  existed and the application still showed the generated Next.js landing page.
- The initial `.env.example` named `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` without values.
- At the start of C02, local Supabase Auth had both global and email sign-up
  disabled, anonymous sign-in disabled, a local site URL, and a local redirect
  allow-list entry. Acceptance testing showed that the email-level setting also
  disables email authentication for existing users, so it was corrected while
  retaining global sign-up denial.
- Before changing framework code, read the relevant installed guidance under
  `node_modules/next/dist/docs/` as required by `AGENTS.md`.
- Selected boundary: `@supabase/ssr` cookie storage, a request-scoped server
  client, a browser client for later interactive use, Next.js 16 `proxy.ts` for
  token refresh and optimistic routing, and secure page-level `getClaims()`
  verification.
- Magic-link requests run in a validated Server Action with account creation
  disabled. A no-store Route Handler verifies only `email` or `invite` token
  hashes and establishes the cookie-backed session.
- All completed Supabase magic-link responses have the same public success
  state. Provider error codes remain non-sensitive server diagnostics because
  some errors and rate limits may otherwise disclose account existence.
- Primary guidance reviewed on 2026-08-29: installed Next.js 16.3.3
  authentication, Server Action, route-handler, proxy, cookie, form, and
  server/client-boundary documentation; current Supabase SSR client, PKCE,
  passwordless email, redirect URL, email template, and user invitation guides.
- Baseline validation after the documentation restructure: `npm run lint`
  passed. The default Turbopack build was denied permission to bind its internal
  worker port on this host; `npm run build -- --webpack` compiled, type-checked,
  and generated all routes successfully. Re-run relevant checks after C02 code.

## Progress

- Branch `feature/c02-authentication` created from clean `main` at `538c9e9`.
- Repository and documentation audit completed.
- Authentication architecture and security constraints established; application
  implementation and local end-to-end acceptance checks are complete.
- Local acceptance found that disabling `[auth.email].enable_signup` disables
  email authentication entirely, including existing invited users. C02 keeps
  the Email provider enabled while retaining project-wide signup denial and
  `shouldCreateUser: false`; this preserves invite-only access.
- The signed-out form, loading/success/error feedback, token-hash callback,
  cookie session refresh, protected route, and sign-out path are implemented.
- Authentication setup and hosted/local redirect requirements are documented,
  with local PKCE-compatible magic-link and invitation templates tracked.
- A read-only Terra security review found no critical or high-severity issue.
  Its documentation-evidence request and low-risk enumeration hardening were
  both incorporated before completion.

## Blockers

No product blocker remains. The host-level Turbopack port restriction described
above requires the verified webpack build fallback in this environment; it is an
environment limitation, not an application failure.

## Handoff / remaining work

C02 is complete. Continue with the single active C03 profile-setup plan. Preserve
the request-scoped authentication boundary and require both trusted identity and
a valid owned profile before allowing entry to chat.
