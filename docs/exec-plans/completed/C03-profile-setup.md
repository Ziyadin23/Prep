# C03 - Profile Setup

- Status: `completed`
- Completed: 2026-08-29
- Depends on: C00, C01, and C02 (completed)
- Product source: `docs/product/SPEC.md`, section "C03 - Profile Setup"
- Created: 2026-08-29

## Objective

Require every authenticated user to establish a valid, owned display name
before entering the future chat experience, while allowing an existing profile
to proceed without repeating setup.

## Scope

- Look up the authenticated user's profile after the C02 identity check.
- Present profile setup when the signed-in user has no profile.
- Create a profile with validated, normalized display-name input.
- Allow safe correction of the signed-in user's own display name where useful
  to complete the setup experience.
- Gate the post-authentication application route so a profile-less user cannot
  reach the chat placeholder and an existing profiled user proceeds directly.
- Provide accessible loading, validation, success, and failure feedback for the
  profile flow.
- Add focused automated coverage for validation and routing/data boundaries.

## Non-goals

- Loading, subscribing to, composing, or displaying messages (C04)
- The final chat header, user menu, and responsive visual polish (C05)
- An invitation or profile-administration interface
- Avatars, biographies, roles, presence, or other profile attributes outside
  the product specification
- Changes to C01 database security semantics unless verification exposes a
  correctness issue that must be resolved and documented

## Constraints

- Trusted user identity comes from the C02 request-scoped server client and
  `auth.getClaims()`; client-submitted user IDs are never authoritative.
- Application code uses only the public Supabase configuration. RLS remains the
  final authorization boundary and must prevent creating or changing another
  user's profile.
- Display names are trimmed and contain 2 through 30 characters, matching the
  existing database constraints. User input receives clear validation feedback.
- Profile reads and mutations must not expose one user's private session state
  through shared server state or caching.
- The implementation must preserve C02 invite-only access, callback, session
  refresh, and sign-out behavior.

## Acceptance criteria

The C03 criteria in the product spec are authoritative. Completion requires
evidence that:

- a newly authenticated user without a profile must set a valid display name
  before reaching the chat placeholder;
- an authenticated user with an existing valid profile proceeds directly;
- invalid names are rejected with actionable feedback; and
- one user cannot create or edit another user's profile, with both application
  behavior and the existing RLS boundary verified.

## Verification

Expected automated baseline:

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build -- --webpack
npx --yes supabase@2.116.0 db lint
npx --yes supabase@2.116.0 test db
```

Exercise the full flow against local Supabase with separate cookie jars for a
profile-less user and a profiled user. Record observed routing, validation,
profile persistence, ownership denial, and regression checks for sign-out.

Final automated verification on 2026-08-29:

```text
npm test                         -> 6 files and 36 tests passed
npx tsc --noEmit                 -> passed
npm run lint                     -> passed
npm run build -- --webpack       -> passed
npx --yes supabase@2.116.0 db lint -> no schema errors
npx --yes supabase@2.116.0 test db -> 15 pgTAP tests passed
git diff --check                 -> passed
```

Focused tests cover trimming and Unicode-aware limits, invalid input, expired
claims, provider failure, derivation of ownership from verified claims, a
forged form ID being ignored, profile-less gating, existing-profile pass-through,
and fail-closed lookup errors. The production build compiled, type-checked, and
generated the application routes successfully.

Local end-to-end acceptance used Supabase CLI 2.116.0, two disposable users,
isolated cookie jars, Mailpit-delivered magic links, and the progressive-
enhancement Server Action form:

- the profile-less user was held at display-name setup while a separately
  profiled user reached the chat placeholder directly;
- a one-character name returned the actionable two-character validation error;
- a trimmed valid name persisted and immediately opened the chat gate with a
  success state;
- the same user corrected their own display name successfully;
- an extra forged `id` field naming the other user was ignored, and direct
  database inspection confirmed that the other profile remained unchanged;
- sign-out returned to login and subsequent protected-root access stayed signed
  out; and
- the existing pgTAP suite independently reconfirmed owner-only profile writes.

The two disposable users and cookie jars were deleted after acceptance. No test
credentials or Supabase secret/service-role values were written to the repository.

## Implementation discoveries

- C01 already provides `profiles(id, display_name, created_at)`, a foreign key
  to `auth.users`, trim and 2-to-30-character constraints, least-privilege
  grants, and owner-only insert/update RLS policies.
- C02 leaves authenticated users at a protected root placeholder and exposes
  request-scoped browser/server Supabase client factories. The root route is the
  natural place to establish the profile gate, but the exact component and
  mutation boundaries remain implementation decisions.
- No generated TypeScript database types exist yet. Decide whether C03 benefits
  from adding them after inspecting the current Supabase CLI workflow; do not
  hand-maintain types that can drift from migrations.
- Work is proceeding on `feature/c03-profile-setup`. The installed Next.js 16
  guidance requires each Server Action to authenticate and authorize again,
  even when its form is behind a server-rendered gate. The action will therefore
  derive the profile ID only from verified claims and accept only a display name.
- The current project does not enable Cache Components. Its request-scoped
  Supabase client reads `cookies()`, so the root profile lookup remains a fresh,
  per-request read without introducing a shared profile cache.
- C03 did not add hand-maintained database types. Its narrow profile projection
  is inferred by the Supabase client, while generated schema types can be added
  later when the repository establishes a repeatable generation workflow.
- A single root rendering gate is sufficient for this contract: failed lookups
  fail closed, missing profiles render setup, and valid profiles render the chat
  placeholder. The same action safely handles initial insert and later correction
  through an own-ID upsert protected by application claims and RLS.

## Blockers

None known.

## Handoff / remaining work

C03 is complete. C04 can replace the gated placeholder with persisted realtime
team chat. Preserve the per-request auth/profile checks, derive sender identity
from verified claims, keep RLS authoritative, and reconcile query, insert, and
Realtime delivery by message ID.
