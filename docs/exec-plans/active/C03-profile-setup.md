# C03 - Profile Setup

- Status: `ready`
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

## Blockers

None known.

## Handoff / remaining work

Start by setting this plan to `in_progress`, confirming a clean focused branch,
and reading the installed Next.js guidance relevant to forms, Server Actions,
and request-time rendering. Inspect the current C02 auth boundary and C01 policy
tests before deciding the smallest complete profile flow. Keep progress,
discoveries, verification evidence, and any blocker in this plan.
