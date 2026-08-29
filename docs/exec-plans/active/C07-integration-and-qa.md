# C07 - Integration and QA

- Status: `ready`
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

None known.

## Handoff / remaining work

After C06 is committed, create a focused C07 branch, set this plan to
`in_progress`, reset the local database, execute the complete three-user matrix,
fix any in-scope regression, and record the final release decision.
