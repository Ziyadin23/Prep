# C02 - Authentication Flow

- Status: `ready`
- Depends on: C00 and C01 (completed)
- Product source: `docs/product/SPEC.md`, section "C02 - Authentication Flow"
- Last updated: 2026-08-28

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

## Acceptance criteria

The C02 criteria in the product spec are authoritative. Completion requires
evidence that:

- an invited user can request a magic link and establish a session;
- an uninvited user cannot register or access the private application; and
- a signed-in user can sign out and returns to the signed-out experience.

Also require lint and production build to pass, no secret values to be committed,
and authentication failure/loading states to be exercised.

## Verification

Expected automated baseline:

```bash
npm run lint
npm run build
```

Add focused automated checks when the chosen auth boundary makes them valuable.
Record manual Supabase email/invite checks with the local setup used, expected
result, and observed result. Verify both invited and uninvited cases rather than
inferring invite-only behavior from UI controls.

## Implementation notes discovered so far

- No Supabase JavaScript dependency or client integration exists yet.
- The application UI is still the generated Next.js landing page.
- `.env.example` already names `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` without values.
- Local Supabase Auth has global and email sign-up disabled, anonymous sign-in
  disabled, a local site URL, and a local redirect allow-list entry.
- Before changing framework code, read the relevant installed guidance under
  `node_modules/next/dist/docs/` as required by `AGENTS.md`.
- Decide the session boundary from current Next.js and Supabase guidance during
  implementation; do not rely on remembered APIs.
- Baseline validation after the documentation restructure: `npm run lint`
  passed. The default Turbopack build was denied permission to bind its internal
  worker port on this host; `npm run build -- --webpack` compiled, type-checked,
  and generated all routes successfully. Re-run relevant checks after C02 code.

## Progress

No C02 application implementation has started.

## Blockers

No product blocker is currently known. The host-level Turbopack port restriction
described above may require the webpack build fallback. Manual email delivery
may require a running local Supabase stack or a configured hosted project; record
any resulting limitation here.

## Handoff / remaining work

1. Set status to `in_progress` and record the branch/baseline before code changes.
2. Read current installed Next.js guidance and current primary Supabase auth
   guidance relevant to the selected session design.
3. Inspect the existing scaffold and implement the smallest complete C02 flow.
4. Run automated checks and invited/uninvited manual acceptance checks.
5. Record files changed, decisions, commands, results, blockers, and exact next
   step in this plan throughout the work.
6. When every acceptance criterion is evidenced, set status to `completed`, move
   this file to `docs/exec-plans/completed/`, and create the active C03 plan.
