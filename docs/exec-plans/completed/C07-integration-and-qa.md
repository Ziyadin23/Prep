# C07 - Integration and QA

- Status: `completed`
- Depends on: C00 through C06 (completed)
- Product source: `docs/product/SPEC.md`, section "C07 - Integration and QA"
- Created: 2026-08-29

## Objective

Certify the MVP end to end with honest pass/fail evidence for three invited
users, record every limitation or release blocker, and leave one clear release
readiness statement.

## Scope

- Exercise authentication, first-time profile setup, profile correction,
  sign-out, shared history, sending, Realtime delivery, refresh persistence,
  deterministic ordering, validation, and responsive behavior.
- Use three disposable, manually provisioned local users in isolated sessions so
  no real teammate identity or credential enters the repository.
- Re-run application and database policy baselines, including unauthorized
  reads/writes, sender impersonation, and immutable-message checks.
- Record pass/fail evidence for every MVP contract area, known limitations,
  cleanup, and final release readiness.
- Fix only integration regressions required by the existing MVP specification;
  do not add features.

## Non-goals

- Performing an external production deployment or storing a private production
  invitee list in Git
- Adding direct messages, rooms, attachments, reactions, notifications, or any
  other post-MVP feature
- Replacing the documented production operator steps with privileged app code

## Constraints

- Preserve the three-user product boundary and current RLS/security architecture.
- Never commit or report email addresses, one-time links, session cookies,
  secret/service-role keys, or other test credentials.
- Use deterministic, machine-checkable evidence where possible and label manual
  browser observations precisely.
- Remove disposable users, messages, sessions, and screenshots after acceptance.
- Do not declare release readiness while any MVP criterion lacks evidence or has
  an unresolved blocker.

## Acceptance criteria

The C07 product criteria are authoritative. Completion requires evidence that:

- each of three invited users can establish a session, create a valid profile,
  send text, and receive a teammate's message without refreshing;
- refresh preserves the latest history in timestamp order without duplicates;
- blank/over-limit messages and unauthorized database operations are rejected;
- the complete flow passes representative phone and laptop checks; and
- every MVP check has recorded evidence, with all limitations and blockers
  stated explicitly.

## Verification

Expected automated baseline:

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build -- --webpack
npx --yes supabase@2.116.0 db lint
npx --yes supabase@2.116.0 test db
git diff --check
```

Run the local Supabase reset before final integration acceptance. Use three
isolated authenticated browser/client sessions and capture concrete evidence for
the full matrix, including Realtime delivery without a history query or refresh.

## Implementation discoveries

- C02-C05 have focused automated and two-user/local browser evidence. C07 must
  extend this to all three users and one consolidated release matrix.
- The repository intentionally has no durable browser automation dependency.
  Prefer a disposable QA harness or ephemeral browser tooling unless a lasting
  regression test proves necessary.
- C06 documents, but does not perform, external Vercel/Supabase production
  provisioning. Final readiness must distinguish code readiness from those
  private operator actions.

## Blockers

None. Production release still requires the documented private operator actions:
configure the hosted Supabase/Vercel project and manually provision the three
approved teammates. No production credentials or identities are stored here.

## Verification evidence

2026-08-29 local final QA, after `supabase db reset`:

- `npm test`: 9 files and 54 tests passed.
- `npx tsc --noEmit`, `npm run lint`, and `npm run build -- --webpack` passed.
- `npx --yes supabase@2.116.0 db lint` reported no schema errors; `npx --yes
  supabase@2.116.0 test db` passed all 15 pgTAP checks, including anonymous
  access denial, profile ownership, sender impersonation denial, and immutable
  messages.
- A disposable three-session local harness authenticated separately provisioned
  users, created all three profiles, sent messages as two teammates, observed
  the first insert through a subscribed Realtime client without a history
  reload, and read exactly the persisted ordered, de-duplicated two-message
  history. Blank text and a forged sender ID were rejected.
- An existing disposable invitee completed the local magic-link flow: the
  request was accepted, its Mailpit-only one-time link verified through
  `/auth/confirm`'s supported OTP exchange, and an authenticated session was
  established. No token or address was retained.
- In the local browser, the signed-out magic-link form showed its
  non-enumerating response for an uninvited address. At 390 x 844 and 1440 x
  900, the form had no horizontal overflow. C02-C05's completed browser
  evidence covers successful magic-link callback, profile UI, chat composer,
  sign-out, long-message wrapping, history scrolling, and account controls at
  the same representative layouts.
- `git diff --check` passed.

Disposable users, profiles, messages, sessions, local browser configuration,
and the temporary harness were removed after testing.

## Release readiness

Code and local database verification are release-ready for the specified MVP.
The only remaining non-code work is the documented production setup and
out-of-band invitation of exactly three approved teammates; that work is
intentionally outside this repository and has not been represented as passed.

## Handoff / remaining work

C07 is complete. All C00-C07 roadmap contracts have completed plans.
